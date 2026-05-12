import { EventSubscriptionNotFoundError } from '../types/errors';
import type { EventBus, PublishedEvent } from './eventBus';
import { randomUUID } from 'crypto';

type Subscription = {
    id: string;
    channel: string;
    messages: PublishedEvent[];
    unsubscribe: () => Promise<void>;
};

export function createEventSubscriptionService(deps: { eventBus: EventBus; maxBufferSize?: number }) {
    const { eventBus, maxBufferSize = 200 } = deps;
    const subscriptions = new Map<string, Subscription>();

    return {
        async createSubscription(channel: string) {
            const id = randomUUID();
            const messages: PublishedEvent[] = [];
            const unsubscribe = await eventBus.subscribe(channel, (message) => {
                messages.push(message);
                if (messages.length > maxBufferSize) {
                    messages.splice(0, messages.length - maxBufferSize);
                }
            });

            subscriptions.set(id, { id, channel, messages, unsubscribe });
            return { id, channel };
        },
        getMessages(subscriptionId: string) {
            const subscription = subscriptions.get(subscriptionId);
            if (!subscription) {
                throw new EventSubscriptionNotFoundError();
            }

            const messages = [...subscription.messages];
            subscription.messages.length = 0;
            return messages;
        },
        async deleteSubscription(subscriptionId: string) {
            const subscription = subscriptions.get(subscriptionId);
            if (!subscription) {
                throw new EventSubscriptionNotFoundError();
            }

            await subscription.unsubscribe();
            subscriptions.delete(subscriptionId);
            return { id: subscriptionId, deleted: true };
        }
    };
}
