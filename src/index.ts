import 'dotenv/config';
import { createApp } from './app';
import { logger } from './lib/logger';

const app = createApp();
const port = Number(process.env.PORT ?? 3000);

if (require.main === module) {
    app.listen(port, () => {
        logger.info({ port }, 'CIS backend listening');
    });
}

export { app };
