import { ConfigScope, ConfigValueType, PrismaClient, RoleScope, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const refs = {} as Record<string, any>;

    const orgGroup = await prisma.orgGroup.upsert({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Harvesters',
            description: 'Canonical Harvesters org group',
            country: 'Nigeria',
            isActive: true
        }
    });
    refs.orgGroup = orgGroup;

    const campuses = [
        { id: '00000000-0000-0000-0000-000000000101', name: 'Gbagada', description: 'Main campus', country: 'Nigeria' },
        { id: '00000000-0000-0000-0000-000000000102', name: 'Lekki', description: 'Secondary campus', country: 'Nigeria' }
    ];

    for (const campus of campuses) {
        await prisma.campus.upsert({
            where: { id: campus.id },
            update: {},
            create: {
                ...campus,
                orgGroupId: orgGroup.id,
                isActive: true
            }
        });
    }

    const users = [
        { id: '00000000-0000-0000-0000-000000001001', email: 'admin@harvesters.local', firstName: 'Admin', lastName: 'User', status: UserStatus.ACTIVE },
        { id: '00000000-0000-0000-0000-000000001002', email: 'leader@harvesters.local', firstName: 'Group', lastName: 'Leader', status: UserStatus.ACTIVE },
        { id: '00000000-0000-0000-0000-000000001003', email: 'member1@harvesters.local', firstName: 'Member', lastName: 'One', status: UserStatus.ACTIVE },
        { id: '00000000-0000-0000-0000-000000001004', email: 'member2@harvesters.local', firstName: 'Member', lastName: 'Two', status: UserStatus.ACTIVE },
        { id: '00000000-0000-0000-0000-000000001005', email: 'member3@harvesters.local', firstName: 'Member', lastName: 'Three', status: UserStatus.ACTIVE }
    ];

    for (const user of users) {
        await prisma.canonicalUser.upsert({
            where: { id: user.id },
            update: {},
            create: {
                ...user,
                phoneNumber: null,
                whatsappNumber: null,
                profileImageUrl: null,
                metadata: {},
                isDeleted: false
            }
        });
    }

    const roles = [
        { platformId: 'cis', roleKey: 'SUPERADMIN', displayName: 'Super Admin', scope: RoleScope.GLOBAL },
        { platformId: 'cis', roleKey: 'CAMPUS_ADMIN', displayName: 'Campus Admin', scope: RoleScope.CAMPUS },
        { platformId: 'cis', roleKey: 'DEPARTMENT_LEADER', displayName: 'Department Leader', scope: RoleScope.ORG_GROUP },
        { platformId: 'cis', roleKey: 'DATA_ENTRY', displayName: 'Data Entry', scope: RoleScope.CAMPUS },
        { platformId: 'cis', roleKey: 'MEMBER', displayName: 'Member', scope: RoleScope.GLOBAL }
    ];

    const createdRoles = [] as any[];
    for (const role of roles) {
        const createdRole = await prisma.canonicalRole.upsert({
            where: { platformId_roleKey: { platformId: role.platformId, roleKey: role.roleKey } },
            update: {},
            create: {
                ...role,
                inherits: [],
                permissions: []
            }
        });
        createdRoles.push(createdRole);
    }

    const roleAssignments = [
        { userId: users[0].id, roleId: createdRoles[0].id, scopeId: orgGroup.id },
        { userId: users[1].id, roleId: createdRoles[1].id, scopeId: orgGroup.id },
        { userId: users[2].id, roleId: createdRoles[4].id, scopeId: orgGroup.id },
        { userId: users[3].id, roleId: createdRoles[4].id, scopeId: orgGroup.id },
        { userId: users[4].id, roleId: createdRoles[4].id, scopeId: orgGroup.id }
    ];

    for (const assignment of roleAssignments) {
        await prisma.userRole.upsert({
            where: {
                userId_roleId_scopeId: {
                    userId: assignment.userId,
                    roleId: assignment.roleId,
                    scopeId: assignment.scopeId
                }
            },
            update: {},
            create: {
                ...assignment,
            }
        });
    }

    await prisma.configEntry.upsert({
        where: { namespace_key_version: { namespace: 'platform:cis', key: 'bootstrap', version: 1 } },
        update: {},
        create: {
            namespace: 'platform:cis',
            key: 'bootstrap',
            value: { seeded: true },
            version: 1,
            scope: ConfigScope.GLOBAL,
            valueType: ConfigValueType.JSON,
            isFallback: false
        }
    });
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
