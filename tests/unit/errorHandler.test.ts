import { errorHandler } from '../../src/api/middleware/errorHandler';
import { Prisma } from '@prisma/client';
import { AppError } from '../../src/types/errors';

function createResponse() {
    const response: any = {};
    response.statusCode = 200;
    response.status = jest.fn((code: number) => {
        response.statusCode = code;
        return response;
    });
    response.json = jest.fn(() => response);
    return response;
}

describe('errorHandler', () => {
    it('serializes application errors', () => {
        const response = createResponse();

        errorHandler(new AppError(404, 'NOT_FOUND', 'Missing'), {} as any, response, jest.fn());

        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({
            error: { code: 'NOT_FOUND', message: 'Missing', details: undefined }
        });
    });

    it('maps Prisma unique errors', () => {
        const response = createResponse();

        const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: 'test-version',
            meta: { target: ['email'] }
        });

        errorHandler(prismaError, {} as any, response, jest.fn());

        expect(response.status).toHaveBeenCalledWith(409);
    });

    it('returns a generic 500 response for unknown errors', () => {
        const response = createResponse();

        errorHandler(new Error('boom'), {} as any, response, jest.fn());

        expect(response.status).toHaveBeenCalledWith(500);
    });
});
