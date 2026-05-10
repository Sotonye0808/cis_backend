import { z } from 'zod';

const emailSchema = z.string().trim().email().max(320);

export const userStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']);
export const roleScopeSchema = z.enum(['GLOBAL', 'ORG_GROUP', 'CAMPUS', 'PLATFORM']);

export const createUserSchema = z.object({
    email: emailSchema,
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    phoneNumber: z.string().trim().min(3).max(30).optional(),
    whatsappNumber: z.string().trim().min(3).max(30).optional(),
    profileImageUrl: z.string().url().optional(),
    status: userStatusSchema.optional(),
    metadata: z.record(z.any()).optional()
});

export const updateUserSchema = z
    .object({
        firstName: z.string().trim().min(1).max(100).optional(),
        lastName: z.string().trim().min(1).max(100).optional(),
        phoneNumber: z.string().trim().min(3).max(30).optional(),
        whatsappNumber: z.string().trim().min(3).max(30).optional(),
        profileImageUrl: z.string().url().optional(),
        status: userStatusSchema.optional(),
        metadata: z.record(z.any()).optional()
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: 'At least one field must be provided'
    });

export const createRoleSchema = z.object({
    platformId: z.string().trim().min(1).max(100),
    roleKey: z.string().trim().min(1).max(100),
    displayName: z.string().trim().min(1).max(150),
    scope: roleScopeSchema,
    inherits: z.array(z.string().trim().min(1)).optional().default([]),
    permissions: z.array(z.string().trim().min(1)).optional().default([])
});

export const assignRoleSchema = z.object({
    userId: z.string().trim().min(1),
    roleId: z.string().trim().min(1),
    scopeId: z.string().trim().min(1).optional(),
    expiresAt: z.coerce.date().optional()
});

export const createCampusSchema = z.object({
    orgGroupId: z.string().trim().min(1),
    name: z.string().trim().min(1).max(150),
    description: z.string().trim().max(500).optional(),
    country: z.string().trim().min(1).max(100),
    adminId: z.string().trim().min(1).optional()
});

export const createOrgGroupSchema = z.object({
    name: z.string().trim().min(1).max(150),
    description: z.string().trim().max(500).optional(),
    country: z.string().trim().min(1).max(100),
    leaderId: z.string().trim().min(1).optional()
});

export const issueTokenSchema = z.object({
    userId: z.string().trim().min(1)
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().trim().min(1)
});

export const permissionCheckSchema = z.object({
    permissionKey: z.string().trim().min(1),
    userId: z.string().trim().min(1).optional(),
    scopeId: z.string().trim().min(1).optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type CreateCampusInput = z.infer<typeof createCampusSchema>;
export type CreateOrgGroupInput = z.infer<typeof createOrgGroupSchema>;
export type IssueTokenInput = z.infer<typeof issueTokenSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type PermissionCheckInput = z.infer<typeof permissionCheckSchema>;
