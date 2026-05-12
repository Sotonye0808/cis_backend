import jwt from 'jsonwebtoken';
import { InvalidTokenError, UserNotFoundError } from '../types/errors';

type UserRepository = {
    findById(id: string): Promise<any | null>;
};

type TokenPayload = {
    sub: string;
    type: 'access' | 'refresh';
};

export function createAuthService(deps: {
    userRepository: UserRepository;
    jwtSecret?: string;
    accessTokenTtl?: jwt.SignOptions['expiresIn'];
    refreshTokenTtl?: jwt.SignOptions['expiresIn'];
}) {
    const {
        userRepository,
        jwtSecret = process.env.JWT_SECRET ?? 'dev-only-jwt-secret',
        accessTokenTtl = (process.env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn']) ?? '15m',
        refreshTokenTtl = (process.env.JWT_REFRESH_TTL as jwt.SignOptions['expiresIn']) ?? '7d'
    } = deps;

    const signToken = (payload: TokenPayload, expiresIn: jwt.SignOptions['expiresIn']) =>
        jwt.sign(payload, jwtSecret, { expiresIn });

    return {
        async issueTokensForUser(userId: string) {
            const user = await userRepository.findById(userId);
            if (!user) {
                throw new UserNotFoundError();
            }

            const accessToken = signToken({ sub: userId, type: 'access' }, accessTokenTtl);
            const refreshToken = signToken({ sub: userId, type: 'refresh' }, refreshTokenTtl);
            return { accessToken, refreshToken, tokenType: 'Bearer' };
        },
        verifyAccessToken(token: string) {
            try {
                const payload = jwt.verify(token, jwtSecret) as TokenPayload;
                if (!payload || payload.type !== 'access' || typeof payload.sub !== 'string') {
                    throw new InvalidTokenError();
                }
                return payload;
            } catch {
                throw new InvalidTokenError();
            }
        },
        async refreshTokens(refreshToken: string) {
            try {
                const payload = jwt.verify(refreshToken, jwtSecret) as TokenPayload;
                if (!payload || payload.type !== 'refresh' || typeof payload.sub !== 'string') {
                    throw new InvalidTokenError();
                }
                return this.issueTokensForUser(payload.sub);
            } catch {
                throw new InvalidTokenError();
            }
        }
    };
}
