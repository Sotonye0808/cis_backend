/**
 * types/global.ts
 *
 * Single runtime module for all domain enums, constants, AND global interface
 * declarations. Bundlers (Turbopack/webpack) can import enum values from this
 * file. The declare global {} block augments the global TypeScript scope for
 * all files that transitively import this module.
 */

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export enum UserRole {
    SUPERADMIN = "SUPERADMIN",
    SPO = "SPO",
    CEO = "CEO",
    OFFICE_OF_CEO = "OFFICE_OF_CEO",
    CHURCH_MINISTRY = "CHURCH_MINISTRY",
    GROUP_PASTOR = "GROUP_PASTOR",
    GROUP_ADMIN = "GROUP_ADMIN",
    CAMPUS_PASTOR = "CAMPUS_PASTOR",
    CAMPUS_ADMIN = "CAMPUS_ADMIN",
    DATA_ENTRY = "DATA_ENTRY",
    USHER = "USHER",
    MEMBER = "MEMBER",
}

export enum ReportStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    REQUIRES_EDITS = "REQUIRES_EDITS",
    APPROVED = "APPROVED",
    REVIEWED = "REVIEWED",
    LOCKED = "LOCKED",
}

export enum ReportEventType {
    CREATED = "CREATED",
    SUBMITTED = "SUBMITTED",
    EDIT_REQUESTED = "EDIT_REQUESTED",
    EDIT_SUBMITTED = "EDIT_SUBMITTED",
    EDIT_APPROVED = "EDIT_APPROVED",
    EDIT_REJECTED = "EDIT_REJECTED",
    EDIT_APPLIED = "EDIT_APPLIED",
    UNLOCKED = "UNLOCKED",
    APPROVED = "APPROVED",
    REVIEWED = "REVIEWED",
    LOCKED = "LOCKED",
    DEADLINE_PASSED = "DEADLINE_PASSED",
    UPDATE_REQUESTED = "UPDATE_REQUESTED",
    UPDATE_APPROVED = "UPDATE_APPROVED",
    UPDATE_REJECTED = "UPDATE_REJECTED",
    DATA_ENTRY_CREATED = "DATA_ENTRY_CREATED",
    TEMPLATE_VERSION_NOTE = "TEMPLATE_VERSION_NOTE",
    AUTO_APPROVED = "AUTO_APPROVED",
}

export enum ReportPeriodType {
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
}

export enum ReportDeadlinePolicy {
    PERIOD_START = "PERIOD_START",
    PERIOD_MIDDLE = "PERIOD_MIDDLE",
    PERIOD_END = "PERIOD_END",
    AFTER_PERIOD_HOURS = "AFTER_PERIOD_HOURS",
}

export enum MetricFieldType {
    NUMBER = "NUMBER",
    PERCENTAGE = "PERCENTAGE",
    TEXT = "TEXT",
    CURRENCY = "CURRENCY",
}

export enum ReportEditStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export enum ReportUpdateRequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export enum NotificationType {
    REPORT_SUBMITTED = "REPORT_SUBMITTED",
    REPORT_EDIT_REQUESTED = "REPORT_EDIT_REQUESTED",
    REPORT_APPROVED = "REPORT_APPROVED",
    REPORT_REVIEWED = "REPORT_REVIEWED",
    REPORT_LOCKED = "REPORT_LOCKED",
    REPORT_UNLOCKED = "REPORT_UNLOCKED",
    REPORT_EDIT_SUBMITTED = "REPORT_EDIT_SUBMITTED",
    REPORT_EDIT_APPROVED = "REPORT_EDIT_APPROVED",
    REPORT_EDIT_REJECTED = "REPORT_EDIT_REJECTED",
    REPORT_UPDATE_REQUESTED = "REPORT_UPDATE_REQUESTED",
    REPORT_UPDATE_APPROVED = "REPORT_UPDATE_APPROVED",
    REPORT_UPDATE_REJECTED = "REPORT_UPDATE_REJECTED",
    REPORT_DEADLINE_REMINDER = "REPORT_DEADLINE_REMINDER",
    GOAL_UNLOCK_REQUESTED = "GOAL_UNLOCK_REQUESTED",
    GOAL_UNLOCK_APPROVED = "GOAL_UNLOCK_APPROVED",
    GOAL_UNLOCK_REJECTED = "GOAL_UNLOCK_REJECTED",
    EMAIL_VERIFICATION_REQUIRED = "EMAIL_VERIFICATION_REQUIRED",
    EMAIL_VERIFIED = "EMAIL_VERIFIED",
    EMAIL_CHANGE_REQUESTED = "EMAIL_CHANGE_REQUESTED",
    EMAIL_CHANGED = "EMAIL_CHANGED",
}

export enum EmailActionType {
    VERIFY_PRIMARY_EMAIL = "VERIFY_PRIMARY_EMAIL",
    CONFIRM_PENDING_EMAIL = "CONFIRM_PENDING_EMAIL",
}

export enum MetricCalculationType {
    SUM = "SUM",
    AVERAGE = "AVERAGE",
    SNAPSHOT = "SNAPSHOT",
}

export enum GoalMode {
    ANNUAL = "ANNUAL",
    MONTHLY = "MONTHLY",
    CAMPUS_OVERRIDE = "CAMPUS_OVERRIDE",
}

export enum GoalEditRequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

export enum InviteLinkType {
    CAMPUS = "CAMPUS",
    GROUP = "GROUP",
    DIRECT = "DIRECT",
}

export enum BugReportStatus {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED",
}

export enum BugReportCategory {
    UI_DISPLAY = "UI_DISPLAY",
    NAVIGATION = "NAVIGATION",
    DATA_ISSUE = "DATA_ISSUE",
    PERFORMANCE = "PERFORMANCE",
    AUTHENTICATION = "AUTHENTICATION",
    REPORT_SUBMISSION = "REPORT_SUBMISSION",
    NOTIFICATION = "NOTIFICATION",
    OTHER = "OTHER",
}

export enum AssetDomain {
    BUG_REPORT_SCREENSHOT = "BUG_REPORT_SCREENSHOT",
}

export enum AssetProvider {
    CLOUDINARY = "CLOUDINARY",
    LEGACY_URL = "LEGACY_URL",
}

export enum AssetState {
    TEMP = "TEMP",
    READY = "READY",
    DISCARDED = "DISCARDED",
    DELETE_PENDING = "DELETE_PENDING",
    DELETED = "DELETED",
    FAILED = "FAILED",
}

export enum AssetUploadMode {
    DEFERRED_SUBMIT = "DEFERRED_SUBMIT",
    PREUPLOAD_DRAFT = "PREUPLOAD_DRAFT",
}

export enum AssetSessionState {
    OPEN = "OPEN",
    TEMP_UPLOADED = "TEMP_UPLOADED",
    FINALIZED = "FINALIZED",
    DISCARDED = "DISCARDED",
    EXPIRED = "EXPIRED",
}

export enum AssetLifecycleEventType {
    SESSION_CREATED = "SESSION_CREATED",
    TEMP_UPLOADED = "TEMP_UPLOADED",
    FINALIZED = "FINALIZED",
    DISCARDED = "DISCARDED",
    CLEANUP_DELETED = "CLEANUP_DELETED",
    CLEANUP_FAILED = "CLEANUP_FAILED",
    COMPENSATION_DELETED = "COMPENSATION_DELETED",
    COMPENSATION_FAILED = "COMPENSATION_FAILED",
}

// ─────────────────────────────────────────────────────────────────────────────
// RUNTIME CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const HIERARCHY_ORDER: Record<UserRole, number> = {
    [UserRole.SUPERADMIN]: 0,
    [UserRole.SPO]: 1,
    [UserRole.CEO]: 2,
    [UserRole.OFFICE_OF_CEO]: 3,
    [UserRole.CHURCH_MINISTRY]: 4,
    [UserRole.GROUP_PASTOR]: 5,
    [UserRole.GROUP_ADMIN]: 6,
    [UserRole.CAMPUS_PASTOR]: 7,
    [UserRole.CAMPUS_ADMIN]: 8,
    [UserRole.DATA_ENTRY]: 9,
    [UserRole.USHER]: 10,
    [UserRole.MEMBER]: 11,
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL INTERFACE DECLARATIONS
// declare global {} augments the global TypeScript namespace. Because this file
// is a module (has exports), declare global is a module augmentation and is
// activated for all files that import this module directly or transitively.
// ─────────────────────────────────────────────────────────────────────────────

declare global {
    interface AuthUser {
        id: string;
        email: string;
        pendingEmail?: string;
        /** Effective role: equals `actualRole` unless impersonating. */
        role: UserRole;
        /** The user's real role; equals `role` unless an impersonation session is active. */
        actualRole?: UserRole;
        /** Optional FK into the runtime Role table. Substrate-aware capability
         *  checks (`hasCapabilityForUser`) read this first before falling back
         *  to the legacy `role` enum overlay. */
        roleId?: string | null;
        campusId?: string;
        orgGroupId?: string;
        /** Optional polymorphic OrgUnit id; populated post-reconcile. */
        unitId?: string | null;
        firstName: string;
        lastName: string;
        avatar?: string;
        isEmailVerified?: boolean;
        emailVerifiedAt?: string;
        emailServiceReady?: boolean;
        /** Active impersonation session, if any. SUPERADMIN-only. */
        impersonation?: {
            sessionId: string;
            impersonatedRole: UserRole;
            impersonatedUserId?: string;
            mode: "READ_ONLY" | "MUTATE";
            expiresAt: string;
        };
    }

    interface AuthContextValue {
        user: AuthUser | null;
        isLoading: boolean;
        login: (email: string, password: string, rememberMe?: boolean, redirectTo?: string) => Promise<void>;
        logout: () => Promise<void>;
        refreshToken: () => Promise<void>;
        startImpersonation: (input: {
            impersonatedRole: UserRole;
            impersonatedUserId?: string;
            mode?: "READ_ONLY" | "MUTATE";
        }) => Promise<void>;
        stopImpersonation: () => Promise<void>;
        switchImpersonationMode: (mode: "READ_ONLY" | "MUTATE") => Promise<void>;
    }

    interface UserProfile {
        id: string;
        organisationId?: string;
        email: string;
        pendingEmail?: string;
        emailVerifiedAt?: string;
        emailVerificationSentAt?: string;
        pendingEmailRequestedAt?: string;
        pendingEmailSentAt?: string;
        firstName: string;
        lastName: string;
        phone?: string;
        gender?: Gender;
        role: UserRole;
        campusId?: string;
        groupId?: string;
        orgGroupId?: string;
        avatar?: string;
        avatarUrl?: string;
        passwordHash?: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }

    interface CreateUserInput {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        campusId?: string;
        orgGroupId?: string;
        phone?: string;
        gender?: Gender;
    }

    interface UpdateUserInput {
        firstName?: string;
        lastName?: string;
        phone?: string;
        gender?: Gender;
        avatar?: string;
        campusId?: string;
        orgGroupId?: string;
    }

    interface ChangePasswordInput {
        currentPassword: string;
        newPassword: string;
    }

    interface OrgUnitBase {
        id: string;
        name: string;
        description?: string;
        orgLevel: "GROUP" | "CAMPUS";
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        leaderId?: string;
        adminId?: string;
        country?: string;
        location?: string;
        address?: string;
        phone?: string;
        memberCount?: number;
        inviteCode?: string;
    }

    interface OrgGroup extends OrgUnitBase {
        orgLevel: "GROUP";
        country: string;
        leaderId: string;
    }

    interface Campus extends OrgUnitBase {
        orgLevel: "CAMPUS";
        parentId: string;
        adminId?: string;
        country: string;
        location: string;
    }

    interface OrgGroupWithDetails extends OrgGroup {
        campuses: Campus[];
        leader?: UserProfile;
    }

    interface CampusWithDetails extends Campus {
        orgGroup?: OrgGroup;
        admin?: UserProfile;
    }

    interface CreateOrgGroupInput {
        name: string;
        description?: string;
        country: string;
        leaderId?: string;
    }

    interface CreateCampusInput {
        name: string;
        description?: string;
        parentId: string;
        country: string;
        location: string;
        adminId?: string;
        phone?: string;
        address?: string;
    }

    interface ReportTemplate {
        id: string;
        organisationId: string;
        name: string;
        description?: string;
        version: number;
        sections: ReportTemplateSection[];
        isActive: boolean;
        isDefault: boolean;
        deadlinePolicy?: ReportDeadlinePolicy;
        deadlineOffsetHours?: number;
        recurrenceFrequency?: ReportPeriodType | null;
        recurrenceDays?: number[];
        autoFillTitleTemplate?: string | null;
        createdById: string;
        campusId?: string;
        orgGroupId?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface ReportTemplateSection {
        id: string;
        templateId: string;
        name: string;
        description?: string;
        order: number;
        isRequired: boolean;
        correlationGroup?: string | null;
        metrics: ReportTemplateMetric[];
    }

    interface ReportTemplateMetric {
        id: string;
        sectionId: string;
        name: string;
        description?: string;
        fieldType: MetricFieldType;
        calculationType: MetricCalculationType;
        isRequired: boolean;
        minValue?: number;
        maxValue?: number;
        order: number;
        capturesGoal: boolean;
        capturesAchieved: boolean;
        capturesYoY: boolean;
        capturesWoW?: boolean;
        correlationGroup?: string | null;
        isAutoTotal?: boolean;
        autoTotalSourceMetricIds?: string[];
        autoTotalScope?: "SECTION" | "TEMPLATE" | null;
    }

    interface ReportTemplateVersion {
        id: string;
        templateId: string;
        versionNumber: number;
        snapshot: ReportTemplate;
        createdAt: string;
        createdById: string;
    }

    interface CreateReportTemplateInput {
        name: string;
        description?: string;
        sections: CreateTemplateSectionInput[];
        campusId?: string;
        orgGroupId?: string;
        deadlinePolicy?: ReportDeadlinePolicy;
        deadlineOffsetHours?: number;
    }

    interface CreateTemplateSectionInput {
        name: string;
        description?: string;
        order: number;
        isRequired: boolean;
        metrics: CreateTemplateMetricInput[];
    }

    interface CreateTemplateMetricInput {
        name: string;
        description?: string;
        fieldType: MetricFieldType;
        calculationType: MetricCalculationType;
        isRequired: boolean;
        minValue?: number;
        maxValue?: number;
        order: number;
        capturesGoal: boolean;
        capturesAchieved: boolean;
        capturesYoY: boolean;
    }

    interface Report {
        id: string;
        organisationId?: string;
        title?: string;
        templateId: string;
        templateVersionId: string;
        aggregationSource?: "ROLLUP";
        aggregatedFrom?: string[];
        campusId: string;
        orgGroupId: string;
        period?: string;
        periodType: ReportPeriodType;
        periodYear: number;
        periodMonth?: number;
        periodWeek?: number;
        status: ReportStatus;
        createdById?: string;
        submittedById?: string;
        reviewedById?: string;
        approvedById?: string;
        deadline?: string | null;
        lockedAt?: string;
        isDataEntry: boolean;
        dataEntryById?: string;
        dataEntryDate?: string;
        notes?: string;
        sections?: unknown[];
        createdAt: string;
        updatedAt: string;
    }

    interface ReportSection {
        id: string;
        reportId: string;
        templateSectionId: string;
        sectionName: string;
        metrics: ReportMetric[];
    }

    interface ReportMetric {
        id: string;
        reportSectionId: string;
        templateMetricId: string;
        metricName: string;
        calculationType: MetricCalculationType;
        monthlyGoal?: number;
        monthlyAchieved?: number;
        yoyGoal?: number;
        wowGoal?: number;
        wowAchieved?: number;
        computedPercentage?: number;
        isLocked: boolean;
        lockedAt?: string;
        lockedById?: string;
        comment?: string;
    }

    interface FormAssignmentRule {
        id: string;
        ownerId: string;
        templateId: string;
        role?: UserRole | null;
        assigneeId?: string | null;
        /** @deprecated Prefer `campusIds`. Kept for legacy rows. */
        campusId?: string | null;
        /** @deprecated Prefer `orgGroupIds`. Kept for legacy rows. */
        orgGroupId?: string | null;
        /** Empty array = applies to all campuses. */
        campusIds?: string[];
        /** Empty array = applies to all groups. */
        orgGroupIds?: string[];
        metricIds: string[];
        cadenceOverride?: Record<string, unknown> | null;
        notes?: string | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }

    interface ReportWithDetails extends Report {
        template?: ReportTemplate;
        sections: ReportSectionWithMetrics[];
        campus?: Campus;
        orgGroup?: OrgGroup;
        submittedBy?: UserProfile;
        reviewedBy?: UserProfile;
        approvedBy?: UserProfile;
    }

    interface ReportSectionWithMetrics extends ReportSection {
        metrics: ReportMetric[];
    }

    interface ReportFilters {
        campusId?: string;
        orgGroupId?: string;
        periodType?: ReportPeriodType;
        periodYear?: number;
        periodMonth?: number;
        status?: ReportStatus;
        templateId?: string;
        isDataEntry?: boolean;
        search?: string;
        page?: number;
        pageSize?: number;
    }

    interface ReportFormValues {
        sections: ReportSectionFormValues[];
        notes?: string;
    }

    interface ReportSectionFormValues {
        templateSectionId: string;
        metrics: ReportMetricFormValues[];
    }

    interface ReportMetricFormValues {
        templateMetricId: string;
        monthlyGoal?: number;
        monthlyAchieved?: number;
        yoyGoal?: number;
        comment?: string;
    }

    interface ReportEdit {
        id: string;
        reportId: string;
        submittedById: string;
        status: ReportEditStatus;
        reason: string;
        sections: ReportEditSection[];
        reviewedById?: string;
        reviewNotes?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface ReportEditSection {
        id: string;
        editId: string;
        templateSectionId: string;
        metrics: ReportEditMetric[];
    }

    interface ReportEditMetric {
        id: string;
        editSectionId: string;
        templateMetricId: string;
        monthlyGoal?: number;
        monthlyAchieved?: number;
        yoyGoal?: number;
        comment?: string;
    }

    interface ReportUpdateRequest {
        id: string;
        reportId: string;
        requestedById: string;
        reason: string;
        sections: ReportUpdateSection[];
        status: ReportUpdateRequestStatus;
        reviewedById?: string;
        reviewNotes?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface ReportUpdateSection {
        templateSectionId: string;
        metrics: ReportEditMetric[];
    }

    interface ReportEvent {
        id: string;
        reportId: string;
        eventType: ReportEventType;
        actorId: string;
        timestamp: string;
        details?: string;
        previousStatus?: ReportStatus;
        newStatus?: ReportStatus;
        snapshotId?: string;
    }

    interface ReportVersion {
        id: string;
        reportId: string;
        versionNumber: number;
        snapshot: ReportWithDetails;
        createdAt: string;
        createdById: string;
        reason?: string;
    }

    interface Goal {
        id: string;
        campusId: string;
        templateMetricId: string;
        metricName: string;
        mode: GoalMode;
        year: number;
        month?: number;
        targetValue: number;
        isLocked: boolean;
        lockedAt?: string;
        lockedById?: string;
        createdById: string;
        createdAt: string;
        updatedAt: string;
    }

    interface GoalEditRequest {
        id: string;
        goalId: string;
        requestedById: string;
        reason: string;
        proposedValue: number;
        status: GoalEditRequestStatus;
        reviewedById?: string;
        reviewNotes?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface MetricEntry {
        id: string;
        reportMetricId: string;
        templateMetricId: string;
        campusId: string;
        year: number;
        month: number;
        goalValue?: number;
        achievedValue?: number;
        comment?: string;
        computedPercentage?: number;
        createdAt: string;
    }

    interface ReportAnalytics {
        campusId?: string;
        orgGroupId?: string;
        period: string;
        totalReports: number;
        submittedOnTime: number;
        submittedLate: number;
        pendingReview: number;
        approved: number;
        complianceRate: number;
    }

    interface KpiCardConfig {
        id: string;
        title: string;
        value: string | number;
        trend?: string;
        trendDirection?: "up" | "down" | "neutral";
        icon?: string;
        colorClass?: string;
        allowedRoles: UserRole[];
    }

    interface AppNotification {
        id: string;
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        relatedId?: string;
        reportId?: string;
        read: boolean;
        isRead?: boolean;
        readAt?: string;
        createdAt: string;
    }

    /** Per-role recurring cadence: drives auto-fill of report period + title and recurring assignment expansion. */
    interface RoleCadence {
        /** Period type for reports this role fills. */
        frequency: ReportPeriodType | "TWICE_WEEKLY" | "ANY";
        /** Days of week (0=Sun … 6=Sat) the role is expected to enter. Empty = no constraint. */
        expectedDays: number[];
        /** Hours after the period boundary by which entry is expected. */
        deadlineHours: number;
        /** Optional title template e.g. "Weekly Report — {campus} — {period}". Allowlisted placeholders only. */
        autoFillTitleTemplate?: string;
    }

    interface RoleConfig {
        role: UserRole;
        label: string;
        hierarchyOrder: number;
        dashboardRoute: string;
        dashboardMode:
            | "report-fill"
            | "report-review"
            | "report-reviewed"
            | "analytics"
            | "system"
            | "scope-overview"
            | "quick-form";
        canCreateReports: boolean;
        canFillReports: boolean;
        canSubmitReports: boolean;
        canRequestEdits: boolean;
        canApproveReports: boolean;
        canMarkReviewed: boolean;
        canLockReports: boolean;
        canManageTemplates: boolean;
        canDataEntry: boolean;
        canManageUsers: boolean;
        canManageOrg: boolean;
        canSetGoals: boolean;
        canApproveGoalUnlock: boolean;
        canQuickFormFill?: boolean;
        canManageAdminConfig?: boolean;
        canImportSpreadsheets?: boolean;
        canBulkInvite?: boolean;
        canViewScopeOverview?: boolean;
        cadence?: RoleCadence;
        reportVisibilityScope: "own" | "campus" | "group" | "all";
    }

    /* ── Admin Config + Form Assignment + Imports + PWA + Bulk Invite ───────── */

    type AdminConfigNamespace =
        | "roles"
        | "hierarchy"
        | "dashboardLayout"
        | "templatesMapping"
        | "imports"
        | "pwaInstall"
        | "bulkInvites"
        | "analytics";

    interface AdminConfigEntry {
        id: string;
        namespace: AdminConfigNamespace | string;
        version: number;
        payload: Record<string, unknown>;
        isFallback: boolean;
        actorId: string;
        createdAt: string;
    }

    interface FormAssignment {
        id: string;
        reportId: string;
        assigneeId: string;
        assignedById: string;
        metricIds: string[];
        dueAt?: string;
        completedAt?: string;
        cancelledAt?: string;
        notes?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface ImportJob {
        id: string;
        ownerId: string;
        templateId?: string;
        status:
            | "DRAFT"
            | "FILE_UPLOADED"
            | "MAPPED"
            | "VALIDATED"
            | "COMMITTED"
            | "FAILED"
            | "CANCELLED";
        fileName?: string;
        fileMime?: string;
        fileBytes?: number;
        mappingProfileId?: string;
        mapping?: Record<string, unknown>;
        validationSummary?: Record<string, unknown>;
        commitSummary?: Record<string, unknown>;
        createdAt: string;
        updatedAt: string;
    }

    interface ImportJobItem {
        id: string;
        jobId: string;
        rowIndex: number;
        rawValues: Record<string, unknown>;
        normalizedValues?: Record<string, unknown>;
        outcome: "OK" | "WARNING" | "ERROR" | "COMMITTED";
        errors?: string[];
    }

    interface ImportMappingProfile {
        id: string;
        ownerId: string;
        templateId?: string;
        name: string;
        mapping: Record<string, unknown>;
        createdAt: string;
        updatedAt: string;
    }

    interface BulkInviteBatch {
        id: string;
        createdById: string;
        kind: "INVITE_LINK" | "PRE_REGISTER";
        sharedAttrs?: Record<string, unknown>;
        totalEntries: number;
        successCount: number;
        skippedCount: number;
        failedCount: number;
        createdAt: string;
    }

    interface PwaPromptDismissal {
        id: string;
        userId: string;
        kind: "INSTALL" | "PUSH";
        platform: "IOS" | "ANDROID" | "DESKTOP";
        mode: "snooze" | "never";
        nextEligibleAt?: string;
        createdAt: string;
    }

    interface UserActivationToken {
        id: string;
        userId: string;
        tokenHash: string;
        expiresAt: string;
        usedAt?: string;
        createdAt: string;
    }

    interface OrgLevelConfig {
        level: "GROUP" | "CAMPUS";
        label: string;
        parentLevel?: "GROUP";
        childLevel?: "CAMPUS";
        leaderRole: UserRole;
        adminRole?: UserRole;
    }

    interface NavItem {
        key: string;
        label: string;
        href: string;
        icon?: React.ComponentType;
        allowedRoles: UserRole[];
        badge?: number;
    }

    interface InviteLink {
        id: string;
        token: string;
        type: InviteLinkType;
        targetId?: string;
        role?: UserRole;
        targetRole?: UserRole;
        campusId?: string;
        groupId?: string;
        note?: string;
        createdById: string;
        usedAt?: string;
        expiresAt?: string;
        isActive: boolean;
        createdAt: string;
    }

    interface BugReport {
        id: string;
        category: BugReportCategory;
        description: string;
        screenshotUrl?: string;
        screenshotAssetId?: string;
        contactEmail: string;
        status: BugReportStatus;
        adminNotes?: string;
        createdById: string;
        createdBy?: UserProfile;
        createdAt: string;
        updatedAt: string;
    }

    interface MediaAsset {
        id: string;
        ownerId: string;
        domain: AssetDomain;
        provider: AssetProvider;
        state: AssetState;
        publicId?: string;
        secureUrl?: string;
        format?: string;
        bytes?: number;
        width?: number;
        height?: number;
        mimeType?: string;
        originalFileName?: string;
        folder?: string;
        createdAt: string;
        updatedAt: string;
        finalizedAt?: string;
        discardedAt?: string;
        expiresAt?: string;
    }

    interface AssetUploadSession {
        id: string;
        ownerId: string;
        domain: AssetDomain;
        mode: AssetUploadMode;
        state: AssetSessionState;
        activeAssetId?: string;
        activeAsset?: MediaAsset;
        createdAt: string;
        updatedAt: string;
        finalizedAt?: string;
        discardedAt?: string;
        expiresAt?: string;
    }

    type ApiResponse<T> =
        | { success: true; data: T }
        | { success: false; error: string; code: number };

    interface PaginatedResponse<T> {
        data: T[];
        total: number;
        page: number;
        pageSize: number;
    }

    interface AppContent {
        nav: Record<string, string>;
        auth: Record<string, unknown>;
        reports: Record<string, unknown>;
        templates: Record<string, unknown>;
        goals: Record<string, unknown>;
        dashboard: Record<string, unknown>;
        users: Record<string, unknown>;
        org: Record<string, unknown>;
        analytics: Record<string, unknown>;
        notifications: Record<string, unknown>;
        profile: Record<string, unknown>;
        invites: Record<string, unknown>;
        settings: Record<string, unknown>;
        bugReports: Record<string, unknown>;
        errors: Record<string, unknown>;
        common: Record<string, unknown>;
        footer: Record<string, unknown>;
        offline: Record<string, unknown>;
        usersList: Record<string, unknown>;
        reportsQuickViews: Record<string, unknown>;
        impersonation: Record<string, unknown>;
        landing: Record<string, unknown>;
        howItWorks: Record<string, unknown>;
        aboutPage: Record<string, unknown>;
        privacyPage: Record<string, unknown>;
        termsPage: Record<string, unknown>;
        helpAnchors: Record<string, string>;
        helpLinkLabel: string;
        helpLinkAria: string;
        adminConfig: Record<string, unknown>;
        imports: Record<string, unknown>;
        quickForm: Record<string, unknown>;
        pwaInstall: Record<string, unknown>;
        bulkInvites: Record<string, unknown>;
        preregister: Record<string, unknown>;
        activation: Record<string, unknown>;
        seo: Record<string, string>;
    }
}
