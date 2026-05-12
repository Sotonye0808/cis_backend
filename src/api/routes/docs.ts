import { Router } from 'express';
import { openApiSpec } from '../docs/openapi';

export function createDocsRouter() {
    const router = Router();
    const enabled = String(process.env.SWAGGER_ENABLED ?? 'true') !== 'false';

    if (!enabled) {
        router.get('/', (_req, res) => {
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Documentation is disabled' } });
        });

        router.get('/openapi.json', (_req, res) => {
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Documentation is disabled' } });
        });

        return router;
    }

    router.get('/', (_req, res) => {
        res.json({ data: openApiSpec });
    });

    router.get('/openapi.json', (_req, res) => {
        res.json(openApiSpec);
    });

    return router;
}
