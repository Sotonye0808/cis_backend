import request from 'supertest';
import { createApp } from '../../src/app';

describe('app routes', () => {
    const identityService = {
        createUser: jest.fn().mockResolvedValue({ id: 'user-1', email: 'member@example.com' }),
        getUserById: jest.fn().mockResolvedValue({ id: 'user-1', email: 'member@example.com' }),
        getUserByEmail: jest.fn().mockResolvedValue({ id: 'user-1', email: 'member@example.com' }),
        listUsers: jest.fn().mockResolvedValue([{ id: 'user-1' }]),
        updateUser: jest.fn().mockResolvedValue({ id: 'user-1', email: 'member@example.com' }),
        deactivateUser: jest.fn().mockResolvedValue({ id: 'user-1', isDeleted: true }),
        deleteUser: jest.fn().mockResolvedValue({ id: 'user-1', isDeleted: true })
    };

    const roleService = {
        listRoles: jest.fn().mockResolvedValue([{ id: 'role-1' }]),
        getRoleById: jest.fn().mockResolvedValue({ id: 'role-1' }),
        createRole: jest.fn().mockResolvedValue({ id: 'role-1', roleKey: 'MEMBER' }),
        assignRoleToUser: jest.fn().mockResolvedValue({ id: 'assignment-1' }),
        revokeRoleFromUser: jest.fn().mockResolvedValue({ count: 1 }),
        getRolesForUser: jest.fn().mockResolvedValue([{ id: 'assignment-1' }])
    };

    const orgService = {
        listOrgGroups: jest.fn().mockResolvedValue([{ id: 'group-1' }]),
        getOrgGroup: jest.fn().mockResolvedValue({ id: 'group-1' }),
        getCampus: jest.fn().mockResolvedValue({ id: 'campus-1' }),
        listCampuses: jest.fn().mockResolvedValue([{ id: 'campus-1' }]),
        createCampus: jest.fn().mockResolvedValue({ id: 'campus-1' }),
        createOrgGroup: jest.fn().mockResolvedValue({ id: 'group-1' })
    };

    const authService = {
        issueTokensForUser: jest.fn().mockResolvedValue({
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            tokenType: 'Bearer'
        }),
        refreshTokens: jest.fn().mockResolvedValue({
            accessToken: 'next-access-token',
            refreshToken: 'next-refresh-token',
            tokenType: 'Bearer'
        }),
        verifyAccessToken: jest.fn().mockReturnValue({ sub: 'user-1' })
    };

    const permissionService = {
        userHasPermission: jest.fn().mockResolvedValue(true)
    };

    const outboxProcessorService = {
        processPending: jest.fn().mockResolvedValue({ picked: 1, processed: 1, failed: 0 })
    };

    const eventSubscriptionService = {
        createSubscription: jest.fn().mockResolvedValue({ id: 'sub-1', channel: 'identity:*' }),
        getMessages: jest.fn().mockReturnValue([{ eventType: 'USER_CREATED' }]),
        deleteSubscription: jest.fn().mockResolvedValue({ id: 'sub-1', deleted: true })
    };

    const app = createApp({
        identityService,
        roleService,
        orgService,
        authService: authService as any,
        permissionService: permissionService as any,
        outboxProcessorService: outboxProcessorService as any,
        eventSubscriptionService: eventSubscriptionService as any
    });

    it('responds to health checks', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
    });

    it('creates a user through the API', async () => {
        const response = await request(app)
            .post('/api/v1/users')
            .send({ email: 'member@example.com', firstName: 'Test', lastName: 'User' });

        expect(response.status).toBe(201);
        expect(response.body.data.email).toBe('member@example.com');
        expect(identityService.createUser).toHaveBeenCalled();
    });

    it('covers the full user route surface', async () => {
        await request(app).get('/api/v1/users');
        await request(app).get('/api/v1/users/by-email/member@example.com');
        await request(app).get('/api/v1/users/user-1');
        await request(app).patch('/api/v1/users/user-1').send({ firstName: 'Updated' });
        await request(app).post('/api/v1/users/user-1/deactivate');
        await request(app).delete('/api/v1/users/user-1');

        expect(identityService.listUsers).toHaveBeenCalled();
        expect(identityService.getUserByEmail).toHaveBeenCalledWith('member@example.com');
        expect(identityService.getUserById).toHaveBeenCalledWith('user-1');
        expect(identityService.updateUser).toHaveBeenCalled();
        expect(identityService.deactivateUser).toHaveBeenCalledWith('user-1');
        expect(identityService.deleteUser).toHaveBeenCalledWith('user-1');
    });

    it('covers the full role route surface', async () => {
        await request(app).get('/api/v1/roles');
        await request(app).post('/api/v1/roles').send({
            platformId: 'cis',
            roleKey: 'MEMBER',
            displayName: 'Member',
            scope: 'GLOBAL'
        });
        await request(app).get('/api/v1/roles/role-1');
        await request(app).get('/api/v1/roles/users/user-1/roles');
        await request(app).post('/api/v1/roles/users/user-1/roles/role-1').send({});
        await request(app).delete('/api/v1/roles/users/user-1/roles/role-1');

        expect(roleService.listRoles).toHaveBeenCalled();
        expect(roleService.createRole).toHaveBeenCalled();
        expect(roleService.getRoleById).toHaveBeenCalledWith('role-1');
        expect(roleService.getRolesForUser).toHaveBeenCalledWith('user-1');
        expect(roleService.assignRoleToUser).toHaveBeenCalled();
        expect(roleService.revokeRoleFromUser).toHaveBeenCalledWith('user-1', 'role-1', undefined);
    });

    it('covers the full org route surface', async () => {
        await request(app).get('/api/v1/org/groups');
        await request(app).post('/api/v1/org/groups').send({
            name: 'Harvesters',
            country: 'Nigeria'
        });
        await request(app).get('/api/v1/org/groups/group-1');
        await request(app).get('/api/v1/org/groups/group-1/campuses');
        await request(app).get('/api/v1/org/campuses/campus-1');
        await request(app).post('/api/v1/org/campuses').send({
            orgGroupId: 'group-1',
            name: 'Gbagada',
            country: 'Nigeria'
        });

        expect(orgService.listOrgGroups).toHaveBeenCalled();
        expect(orgService.createOrgGroup).toHaveBeenCalled();
        expect(orgService.getOrgGroup).toHaveBeenCalledWith('group-1');
        expect(orgService.listCampuses).toHaveBeenCalledWith('group-1');
        expect(orgService.getCampus).toHaveBeenCalledWith('campus-1');
        expect(orgService.createCampus).toHaveBeenCalled();
    });

    it('rejects invalid user payloads and missing routes', async () => {
        const invalidUserResponse = await request(app).post('/api/v1/users').send({});
        const missingRouteResponse = await request(app).get('/api/v1/does-not-exist');

        expect(invalidUserResponse.status).toBe(400);
        expect(missingRouteResponse.status).toBe(404);
    });

    it('covers auth and permission route surface', async () => {
        const issueResponse = await request(app).post('/api/v1/auth/token').send({ userId: 'user-1' });
        const refreshResponse = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: 'refresh-token' });
        const permissionResponse = await request(app)
            .post('/api/v1/permissions/check')
            .set('Authorization', 'Bearer access-token')
            .send({ permissionKey: 'users.read' });

        expect(issueResponse.status).toBe(201);
        expect(refreshResponse.status).toBe(200);
        expect(permissionResponse.status).toBe(200);
        expect(authService.issueTokensForUser).toHaveBeenCalledWith('user-1');
        expect(authService.refreshTokens).toHaveBeenCalledWith('refresh-token');
        expect(permissionService.userHasPermission).toHaveBeenCalledWith('user-1', 'users.read', undefined);
    });

    it('covers event route surface', async () => {
        const subscriptionResponse = await request(app)
            .post('/api/v1/events/subscriptions')
            .send({ channel: 'identity:*' });
        const messagesResponse = await request(app).get('/api/v1/events/subscriptions/sub-1/messages');
        const processResponse = await request(app)
            .post('/api/v1/events/outbox/process')
            .send({ limit: 10 });
        const deleteResponse = await request(app).delete('/api/v1/events/subscriptions/sub-1');

        expect(subscriptionResponse.status).toBe(201);
        expect(messagesResponse.status).toBe(200);
        expect(processResponse.status).toBe(200);
        expect(deleteResponse.status).toBe(200);
        expect(eventSubscriptionService.createSubscription).toHaveBeenCalledWith('identity:*');
        expect(eventSubscriptionService.getMessages).toHaveBeenCalledWith('sub-1');
        expect(outboxProcessorService.processPending).toHaveBeenCalledWith(10);
        expect(eventSubscriptionService.deleteSubscription).toHaveBeenCalledWith('sub-1');
    });
});
