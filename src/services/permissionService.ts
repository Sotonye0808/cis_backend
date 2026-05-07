type PermissionRepository = {
    findPermissionsByRole(roleId: string): Promise<Array<{ permissionKey: string; metadata?: unknown }>>;
    addPermissionToRole(data: any): Promise<any>;
    removePermissionFromRole(roleId: string, permissionKey: string): Promise<any>;
};

export function createPermissionService(deps: { permissionRepository: PermissionRepository }) {
    const { permissionRepository } = deps;

    return {
        getPermissionsByRole(roleId: string) {
            return permissionRepository.findPermissionsByRole(roleId);
        },
        addPermissionToRole(roleId: string, permissionKey: string, metadata?: unknown) {
            return permissionRepository.addPermissionToRole({
                role: { connect: { id: roleId } },
                permissionKey,
                metadata
            });
        },
        removePermissionFromRole(roleId: string, permissionKey: string) {
            return permissionRepository.removePermissionFromRole(roleId, permissionKey);
        },
        async hasPermission(roleId: string, permissionKey: string) {
            const permissions = await permissionRepository.findPermissionsByRole(roleId);
            return permissions.some((permission) => permission.permissionKey === permissionKey);
        }
    };
}
