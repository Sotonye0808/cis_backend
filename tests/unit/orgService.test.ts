import { createOrgService } from '../../src/services/orgService';

describe('orgService', () => {
    const orgRepository = {
        findOrgGroupById: jest.fn(),
        listOrgGroups: jest.fn(),
        findCampusById: jest.fn(),
        listCampusesByOrgGroup: jest.fn(),
        createCampus: jest.fn(),
        createOrgGroup: jest.fn()
    };

    const service = createOrgService({ orgRepository });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('creates a campus when the org group exists', async () => {
        orgRepository.findOrgGroupById.mockResolvedValue({ id: 'group-1' });
        orgRepository.createCampus.mockResolvedValue({ id: 'campus-1', name: 'Gbagada' });

        const result = await service.createCampus({
            orgGroupId: 'group-1',
            name: 'Gbagada',
            country: 'Nigeria'
        });

        expect(result.name).toBe('Gbagada');
    });
});
