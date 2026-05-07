import { createRoleSchema, createUserSchema, updateUserSchema } from '../../src/types/schemas';

describe('schemas', () => {
    it('parses a valid create user payload', () => {
        const result = createUserSchema.parse({
            email: 'member@example.com',
            firstName: 'Test',
            lastName: 'User'
        });

        expect(result.email).toBe('member@example.com');
    });

    it('rejects an empty update payload', () => {
        expect(() => updateUserSchema.parse({})).toThrow();
    });

    it('parses a valid role payload', () => {
        const result = createRoleSchema.parse({
            platformId: 'cis',
            roleKey: 'MEMBER',
            displayName: 'Member',
            scope: 'GLOBAL'
        });

        expect(result.roleKey).toBe('MEMBER');
    });
});
