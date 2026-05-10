import { createAuthService } from '../../src/services/authService';
import { InvalidTokenError, UserNotFoundError } from '../../src/types/errors';

describe('authService', () => {
    const userRepository = {
        findById: jest.fn()
    };

    const service = createAuthService({
        userRepository,
        jwtSecret: 'test-secret',
        accessTokenTtl: '15m',
        refreshTokenTtl: '7d'
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('issues, verifies, and refreshes tokens', async () => {
        userRepository.findById.mockResolvedValue({ id: 'user-1' });

        const tokens = await service.issueTokensForUser('user-1');
        const payload = service.verifyAccessToken(tokens.accessToken);
        const refreshed = await service.refreshTokens(tokens.refreshToken);

        expect(tokens.tokenType).toBe('Bearer');
        expect(payload.sub).toBe('user-1');
        expect(refreshed.accessToken).toBeTruthy();
        expect(refreshed.refreshToken).toBeTruthy();
    });

    it('throws for missing user or invalid token', async () => {
        userRepository.findById.mockResolvedValue(null);
        await expect(service.issueTokensForUser('missing')).rejects.toBeInstanceOf(UserNotFoundError);
        expect(() => service.verifyAccessToken('bad-token')).toThrow(InvalidTokenError);
    });
});
