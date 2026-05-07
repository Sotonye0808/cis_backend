import type { Prisma, PrismaClient } from '@prisma/client';

export function createOrgRepository(prisma: PrismaClient) {
    return {
        findOrgGroupById(id: string) {
            return prisma.orgGroup.findUnique({
                where: { id },
                include: { campuses: true, leader: true }
            });
        },
        listOrgGroups() {
            return prisma.orgGroup.findMany({
                orderBy: { createdAt: 'desc' },
                include: { campuses: true, leader: true }
            });
        },
        findCampusById(id: string) {
            return prisma.campus.findUnique({
                where: { id },
                include: { orgGroup: true, admin: true }
            });
        },
        listCampusesByOrgGroup(orgGroupId: string) {
            return prisma.campus.findMany({
                where: { orgGroupId },
                orderBy: { name: 'asc' },
                include: { admin: true }
            });
        },
        createCampus(data: Prisma.CampusCreateInput) {
            return prisma.campus.create({ data });
        },
        createOrgGroup(data: Prisma.OrgGroupCreateInput) {
            return prisma.orgGroup.create({ data });
        }
    };
}
