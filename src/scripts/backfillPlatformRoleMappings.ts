import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { createConfigRepository } from '../repositories/configRepository';
import { createPlatformRoleMappingService } from '../services/platformRoleMappingService';
import { createPlatformRoleMappingBackfillService } from '../services/platformRoleMappingBackfillService';

async function main() {
    const platformId = process.argv[2] === '--platform' ? process.argv[3] : undefined;

    const configRepository = createConfigRepository(prisma);
    const platformRoleMappingService = createPlatformRoleMappingService({ configRepository });
    const backfillService = createPlatformRoleMappingBackfillService({ platformRoleMappingService });

    const result = await backfillService.backfill(platformId);
    console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});