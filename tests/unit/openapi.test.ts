import { openApiSpec } from '../../src/api/docs/openapi';

describe('openApiSpec', () => {
    it('documents the implemented CIS API surface', () => {
        expect(openApiSpec.openapi).toBe('3.0.3');
        expect(openApiSpec.paths['/auth/token']).toBeDefined();
        expect(openApiSpec.paths['/integrations/validation/three-platform-sync']).toBeDefined();
        expect(openApiSpec.components.securitySchemes.bearerAuth).toBeDefined();
    });
});
