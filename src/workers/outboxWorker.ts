import { logger } from '../lib/logger';

type OutboxProcessor = {
    processPending(limit?: number): Promise<{ picked: number; processed: number; failed: number }>;
};

export function startOutboxWorker(deps: { outboxProcessor: OutboxProcessor; intervalMs?: number; batchSize?: number }) {
    const { outboxProcessor, intervalMs = 500, batchSize = 50 } = deps;
    let running = false;

    const timer = setInterval(async () => {
        if (running) {
            return;
        }

        running = true;
        try {
            const result = await outboxProcessor.processPending(batchSize);
            if (result.picked > 0) {
                logger.info({ result }, 'Processed identity event outbox batch');
            }
        } catch (error) {
            logger.error({ error }, 'Outbox worker iteration failed');
        } finally {
            running = false;
        }
    }, intervalMs);

    return () => {
        clearInterval(timer);
    };
}
