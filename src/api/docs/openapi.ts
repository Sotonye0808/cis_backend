export const openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Canonical Identity Service API',
        version: '1.0.0',
        description: 'OpenAPI reference for the CIS backend routes implemented in this repository.'
    },
    servers: [{ url: '/api/v1', description: 'Primary CIS API' }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    paths: {
        '/health': {
            get: {
                tags: ['Health'],
                responses: {
                    200: { description: 'Health check response' }
                }
            }
        },
        '/auth/token': {
            post: {
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { userId: { type: 'string' } },
                                required: ['userId']
                            }
                        }
                    }
                },
                responses: { 201: { description: 'Issued tokens' } }
            }
        },
        '/auth/refresh': {
            post: {
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { refreshToken: { type: 'string' } },
                                required: ['refreshToken']
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Refreshed tokens' } }
            }
        },
        '/users': {
            get: { tags: ['Users'], security: [{ bearerAuth: [] }], responses: { 200: { description: 'List users' } } },
            post: { tags: ['Users'], security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created user' } } }
        },
        '/users/{id}': {
            get: { tags: ['Users'], security: [{ bearerAuth: [] }], responses: { 200: { description: 'Get user' } } },
            patch: { tags: ['Users'], security: [{ bearerAuth: [] }], responses: { 200: { description: 'Update user' } } },
            delete: { tags: ['Users'], security: [{ bearerAuth: [] }], responses: { 200: { description: 'Delete user' } } }
        },
        '/roles': {
            get: { tags: ['Roles'], security: [{ bearerAuth: [] }], responses: { 200: { description: 'List roles' } } },
            post: { tags: ['Roles'], security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created role' } } }
        },
        '/org/groups': {
            get: { tags: ['Org'], security: [{ bearerAuth: [] }], responses: { 200: { description: 'List org groups' } } },
            post: { tags: ['Org'], security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created org group' } } }
        },
        '/permissions/check': {
            post: { tags: ['Permissions'], security: [{ bearerAuth: [] }], responses: { 200: { description: 'Permission check result' } } }
        },
        '/events/subscriptions': {
            post: { tags: ['Events'], security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created subscription' } } }
        },
        '/integrations/reporting/sync': {
            post: { tags: ['Integrations'], security: [{ bearerAuth: [] }], responses: { 201: { description: 'Reporting sync result' } } }
        },
        '/integrations/faith-hub/sync': {
            post: { tags: ['Integrations'], security: [{ bearerAuth: [] }], responses: { 201: { description: 'Faith Hub sync result' } } }
        },
        '/integrations/role-mappings': {
            get: { tags: ['Integrations'], security: [{ bearerAuth: [] }], responses: { 200: { description: 'List role mappings' } } },
            post: { tags: ['Integrations'], security: [{ bearerAuth: [] }], responses: { 201: { description: 'Upsert role mapping' } } }
        },
        '/integrations/role-mappings/backfill': {
            post: { tags: ['Integrations'], security: [{ bearerAuth: [] }], responses: { 201: { description: 'Backfill result' } } }
        },
        '/integrations/validation/three-platform-sync': {
            post: { tags: ['Integrations'], security: [{ bearerAuth: [] }], responses: { 200: { description: 'Three-platform validation result' } } }
        }
    }
} as const;
