import { Router } from 'express';
import { eventSubscriptionSchema, processOutboxSchema } from '../../types/schemas';
import { validateBody } from '../middleware/validateRequest';
import { handleAsync } from '../../utils/handleAsync';

type EventSubscriptionService = {
    createSubscription(channel: string): Promise<{ id: string; channel: string }>;
    getMessages(subscriptionId: string): any[];
    deleteSubscription(subscriptionId: string): Promise<{ id: string; deleted: boolean }>;
};

type OutboxProcessorService = {
    processPending(limit?: number): Promise<{ picked: number; processed: number; failed: number }>;
};

export function createEventRouter(
    eventSubscriptionService: EventSubscriptionService,
    outboxProcessorService: OutboxProcessorService
) {
    const router = Router();

    router.post(
        '/subscriptions',
        validateBody(eventSubscriptionSchema),
        handleAsync(async (req, res) => {
            const result = await eventSubscriptionService.createSubscription(req.body.channel);
            res.status(201).json({ data: result });
        })
    );

    router.get(
        '/subscriptions/:id/messages',
        handleAsync(async (req, res) => {
            const messages = eventSubscriptionService.getMessages(String(req.params.id));
            res.json({ data: messages });
        })
    );

    router.delete(
        '/subscriptions/:id',
        handleAsync(async (req, res) => {
            const result = await eventSubscriptionService.deleteSubscription(String(req.params.id));
            res.json({ data: result });
        })
    );

    router.post(
        '/outbox/process',
        validateBody(processOutboxSchema),
        handleAsync(async (req, res) => {
            const result = await outboxProcessorService.processPending(req.body.limit);
            res.json({ data: result });
        })
    );

    return router;
}
