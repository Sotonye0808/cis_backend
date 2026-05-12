import 'dotenv/config';
import { createApp } from './app';
import { logger } from './lib/logger';
import { createEventBusFromEnv } from './services/eventBus';
import { createEventRepository } from './repositories/eventRepository';
import { createOutboxProcessorService } from './services/outboxProcessorService';
import { startOutboxWorker } from './workers/outboxWorker';
import { prisma } from './lib/prisma';

const app = createApp();
const port = Number(process.env.PORT ?? 3000);

if (require.main === module) {
    const eventBus = createEventBusFromEnv();
    const eventRepository = createEventRepository(prisma);
    const outboxProcessor = createOutboxProcessorService({
        eventRepository,
        eventBus
    });
    const stopWorker = startOutboxWorker({
        outboxProcessor,
        intervalMs: Number(process.env.OUTBOX_WORKER_INTERVAL_MS ?? 500),
        batchSize: Number(process.env.OUTBOX_WORKER_BATCH_SIZE ?? 50)
    });

    const handleShutdown = async () => {
        stopWorker();
        await eventBus.disconnect?.();
        process.exit(0);
    };

    process.once('SIGTERM', handleShutdown);
    process.once('SIGINT', handleShutdown);

    app.listen(port, () => {
        logger.info({ port }, 'CIS backend listening');
    });
}

export { app };
