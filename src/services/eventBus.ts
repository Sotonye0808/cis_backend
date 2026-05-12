import { createClient, type RedisClientType } from 'redis';
import { logger } from '../lib/logger';

export type PublishedEvent = {
    eventId: string;
    eventType: string;
    aggregateId: string;
    aggregateType: string;
    data: unknown;
    metadata?: unknown;
    actorId?: string | null;
    createdAt: string;
};

type EventHandler = (event: PublishedEvent) => void | Promise<void>;

export type EventBus = {
    publish(channel: string, event: PublishedEvent): Promise<void>;
    subscribe(channel: string, handler: EventHandler): Promise<() => Promise<void>>;
    disconnect?(): Promise<void>;
};

export function createInMemoryEventBus(): EventBus {
    const listeners = new Map<string, Set<EventHandler>>();

    return {
        async publish(channel: string, event: PublishedEvent) {
            const channelListeners = listeners.get(channel);
            if (!channelListeners) {
                return;
            }
            await Promise.all(Array.from(channelListeners).map((listener) => Promise.resolve(listener(event))));
        },
        async subscribe(channel: string, handler: EventHandler) {
            const existing = listeners.get(channel) ?? new Set<EventHandler>();
            existing.add(handler);
            listeners.set(channel, existing);

            return async () => {
                const current = listeners.get(channel);
                if (!current) {
                    return;
                }
                current.delete(handler);
                if (current.size === 0) {
                    listeners.delete(channel);
                }
            };
        }
    };
}

export function createRedisEventBus(redisUrl: string): EventBus {
    const publisher = createClient({ url: redisUrl });
    const subscriber = publisher.duplicate();
    let connected = false;

    const ensureConnected = async () => {
        if (connected) {
            return;
        }
        await publisher.connect();
        await subscriber.connect();
        connected = true;
    };

    return {
        async publish(channel: string, event: PublishedEvent) {
            await ensureConnected();
            await publisher.publish(channel, JSON.stringify(event));
        },
        async subscribe(channel: string, handler: EventHandler) {
            await ensureConnected();
            const listener = async (message: string) => {
                const parsed = JSON.parse(message) as PublishedEvent;
                await handler(parsed);
            };
            await subscriber.subscribe(channel, listener);

            return async () => {
                await subscriber.unsubscribe(channel, listener);
            };
        },
        async disconnect() {
            if (!connected) {
                return;
            }
            await Promise.allSettled([publisher.quit(), subscriber.quit()]);
            connected = false;
        }
    };
}

export function createEventBusFromEnv(): EventBus {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        return createInMemoryEventBus();
    }

    logger.info({ redisUrlDefined: true }, 'Using Redis event bus');
    return createRedisEventBus(redisUrl);
}
