import type { CreateCampusInput, CreateOrgGroupInput } from '../types/schemas';
import { CampusNotFoundError, OrgGroupNotFoundError } from '../types/errors';

type OrgRepository = {
    findOrgGroupById(id: string): Promise<any | null>;
    listOrgGroups(): Promise<any[]>;
    findCampusById(id: string): Promise<any | null>;
    listCampusesByOrgGroup(orgGroupId: string): Promise<any[]>;
    createCampus(data: any): Promise<any>;
    createOrgGroup(data: any): Promise<any>;
};

export function createOrgService(deps: { orgRepository: OrgRepository }) {
    const { orgRepository } = deps;

    return {
        listOrgGroups() {
            return orgRepository.listOrgGroups();
        },
        async getOrgGroup(id: string) {
            const group = await orgRepository.findOrgGroupById(id);

            if (!group) {
                throw new OrgGroupNotFoundError();
            }

            return group;
        },
        async getCampus(id: string) {
            const campus = await orgRepository.findCampusById(id);

            if (!campus) {
                throw new CampusNotFoundError();
            }

            return campus;
        },
        listCampuses(orgGroupId: string) {
            return orgRepository.listCampusesByOrgGroup(orgGroupId);
        },
        async createCampus(input: CreateCampusInput) {
            const group = await orgRepository.findOrgGroupById(input.orgGroupId);

            if (!group) {
                throw new OrgGroupNotFoundError();
            }

            return orgRepository.createCampus({
                orgGroup: { connect: { id: input.orgGroupId } },
                name: input.name,
                description: input.description,
                country: input.country,
                ...(input.adminId ? { admin: { connect: { id: input.adminId } } } : {})
            });
        },
        createOrgGroup(input: CreateOrgGroupInput) {
            return orgRepository.createOrgGroup({
                name: input.name,
                description: input.description,
                country: input.country,
                ...(input.leaderId ? { leader: { connect: { id: input.leaderId } } } : {})
            });
        }
    };
}
