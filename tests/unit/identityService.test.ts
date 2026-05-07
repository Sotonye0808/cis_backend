import { createIdentityService } from '../../src/services/identityService';

describe('identityService', () => {
    const userRepository = {
        findById: jest.fn(),
        findByEmail: jest.fn(),
        list: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn()
    };

    const service = createIdentityService({ userRepository });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('creates a user when the email is unique', async () => {
        userRepository.findByEmail.mockResolvedValue(null);
        userRepository.create.mockResolvedValue({ id: 'user-1', email: 'member@example.com' });

        const result = await service.createUser({ email: 'member@example.com' });

        expect(result.email).toBe('member@example.com');
        expect(userRepository.create).toHaveBeenCalled();
    });

    it('throws when the user is missing', async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(service.getUserById('missing')).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
    });
});
