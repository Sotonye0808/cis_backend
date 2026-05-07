export { };

declare global {
    // ─── Enums ──────────────────────────────────────────────────────────────────
    const enum UserRole {
        USER = "USER",
        TEAM_LEAD = "TEAM_LEAD",
        ADMIN = "ADMIN",
        SUPER_ADMIN = "SUPER_ADMIN",
    }

    const enum CampaignStatus {
        DRAFT = "DRAFT",
        ACTIVE = "ACTIVE",
        PAUSED = "PAUSED",
        COMPLETED = "COMPLETED",
        ARCHIVED = "ARCHIVED",
    }

    const enum CampaignMediaType {
        IMAGE = "IMAGE",
        VIDEO = "VIDEO",
        LINK = "LINK",
        TEXT = "TEXT",
    }

    const enum GoalType {
        SHARES = "SHARES",
        CLICKS = "CLICKS",
        REFERRALS = "REFERRALS",
        DONATIONS = "DONATIONS",
        PARTICIPANTS = "PARTICIPANTS",
    }

    const enum LinkEventType {
        VIEW = "VIEW",
        CLICK = "CLICK",
        SHARE = "SHARE",
        CONVERSION = "CONVERSION",
        REFERRAL = "REFERRAL",
    }

    const enum PointType {
        IMPACT = "IMPACT",
        CONSISTENCY = "CONSISTENCY",
        LEADERSHIP = "LEADERSHIP",
        RELIABILITY = "RELIABILITY",
    }

    const enum DonationStatus {
        PENDING = "PENDING",
        COMPLETED = "COMPLETED",
        FAILED = "FAILED",
        REFUNDED = "REFUNDED",
        RECEIVED = "RECEIVED",
        VERIFIED = "VERIFIED",
        REJECTED = "REJECTED",
    }

    const enum TrustFlag {
        DUPLICATE_ACTIVITY = "DUPLICATE_ACTIVITY",
        ABNORMAL_CLICKS = "ABNORMAL_CLICKS",
        SUSPICIOUS_DEVICE = "SUSPICIOUS_DEVICE",
        RATE_LIMITED = "RATE_LIMITED",
    }

    const enum SocialPlatform {
        FACEBOOK = "FACEBOOK",
        INSTAGRAM = "INSTAGRAM",
        TWITTER_X = "TWITTER_X",
        TIKTOK = "TIKTOK",
        YOUTUBE = "YOUTUBE",
        WHATSAPP = "WHATSAPP",
        SNAPCHAT = "SNAPCHAT",
    }

    const enum ViewProofStatus {
        PENDING = "PENDING",
        APPROVED = "APPROVED",
        REJECTED = "REJECTED",
    }

    const enum CampaignAuditEventType {
        CREATED = "CREATED",
        STATUS_CHANGED = "STATUS_CHANGED",
        FIELDS_UPDATED = "FIELDS_UPDATED",
        PARTICIPANT_JOINED = "PARTICIPANT_JOINED",
        DONATION_RECEIVED = "DONATION_RECEIVED",
        GOAL_REACHED = "GOAL_REACHED",
        ENDED = "ENDED",
    }

    const enum BugReportCategory {
        UI_ISSUE = "UI_ISSUE",
        DATA_ISSUE = "DATA_ISSUE",
        PERFORMANCE = "PERFORMANCE",
        FEATURE_REQUEST = "FEATURE_REQUEST",
        ACCESS_AUTH = "ACCESS_AUTH",
        OTHER = "OTHER",
    }

    const enum BugReportStatus {
        OPEN = "OPEN",
        IN_PROGRESS = "IN_PROGRESS",
        RESOLVED = "RESOLVED",
        CLOSED = "CLOSED",
    }

    // ─── Core Entities ───────────────────────────────────────────────────────────

    interface User {
        id: string;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        profilePicture?: string;
        whatsappNumber?: string;
        campus?: string;
        teamId?: string;
        trustScore: number;
        isActive: boolean;
        weaponsOfChoice?: SocialPlatform[];
        createdAt: string;
        updatedAt: string;
    }

    interface AuthUser {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        profilePicture?: string;
        whatsappNumber?: string;
        campus?: string;
    }

    interface CampaignMedia {
        id: string;
        type: CampaignMediaType;
        url: string;
        thumbnailUrl?: string;
        altText?: string;
        order: number;
    }

    interface Campaign {
        id: string;
        title: string;
        description: string;
        content: string;
        media: CampaignMedia[];
        mediaType?: CampaignMediaType;
        mediaUrl?: string;
        thumbnailUrl?: string;
        ctaText?: string;
        ctaUrl?: string;
        createdById: string;
        status: CampaignStatus;
        goalType?: GoalType;
        goalTarget?: number;
        goalCurrent?: number;
        startDate?: string;
        endDate?: string;
        targetAudience?: string[];
        publishedAt?: string;
        metaTitle?: string;
        metaDescription?: string;
        metaImage?: string;
        viewCount: number;
        clickCount: number;
        shareCount: number;
        likeCount?: number;
        participantCount?: number;
        // Mega campaign support
        isMegaCampaign?: boolean;
        parentCampaignId?: string;
        // Donation config
        bankAccountIds?: string[];
        createdAt: string;
        updatedAt: string;
    }

    interface CampaignParticipation {
        id: string;
        userId: string;
        campaignId: string;
        joinedAt: string;
        smartLinkId?: string;
    }

    interface SmartLink {
        id: string;
        slug: string;
        userId: string;
        campaignId: string;
        originalUrl: string;
        clickCount: number;
        uniqueClickCount: number;
        conversionCount: number;
        isActive: boolean;
        isExpired: boolean;
        expiresAt?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface LinkEvent {
        id: string;
        linkId: string;
        smartLinkId?: string;
        slug?: string;
        eventType: LinkEventType;
        type?: LinkEventType;
        userId?: string;
        ipAddress?: string;
        ipHash?: string;
        userAgent?: string;
        referrer?: string;
        referer?: string;
        country?: string;
        createdAt: string;
    }

    interface Referral {
        id: string;
        inviterId: string;
        inviteeId: string;
        campaignId: string;
        slug: string;
        createdAt: string;
    }

    interface Donation {
        id: string;
        userId: string;
        campaignId: string;
        amount: number;
        currency: string;
        status: DonationStatus;
        reference: string;
        bankAccountId?: string;
        proofScreenshotUrl?: string;
        verifiedById?: string;
        verifiedAt?: string;
        notes?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface PointsLedgerEntry {
        id: string;
        userId: string;
        campaignId?: string;
        type: PointType;
        value: number;
        description: string;
        referenceId?: string;
        createdAt: string;
    }

    interface PointsSummary {
        userId: string;
        campaignId?: string;
        impact: number;
        consistency: number;
        leadership: number;
        reliability: number;
        total: number;
    }

    interface LeaderboardSnapshot {
        id: string;
        userId: string;
        campaignId?: string;
        period: string;
        rank: number;
        score: number;
        createdAt: string;
    }

    interface TrustScore {
        id: string;
        userId: string;
        score: number;
        flags: TrustFlag[];
        lastReviewedAt?: string;
        updatedAt: string;
    }

    // ─── View Proofs (Proof of Deployment) ───────────────────────────────────────

    interface ViewProof {
        id: string;
        userId: string;
        campaignId: string;
        smartLinkId: string;
        platform: SocialPlatform;
        screenshotUrl: string;
        viewCount: number;
        status: ViewProofStatus;
        reviewedById?: string;
        reviewedAt?: string;
        notes?: string;
        createdAt: string;
        updatedAt: string;
        /** Enriched fields from API includes */
        userName?: string;
        campaignTitle?: string;
    }

    // ─── Input Types ─────────────────────────────────────────────────────────────

    interface CreateCampaignInput {
        title: string;
        description: string;
        content: string;
        media?: CampaignMedia[];
        mediaType?: CampaignMediaType;
        mediaUrl?: string;
        thumbnailUrl?: string;
        ctaText?: string;
        ctaUrl?: string;
        goalType?: GoalType;
        goalTarget?: number;
        startDate?: string;
        endDate?: string;
        targetAudience?: string[];
        metaTitle?: string;
        metaDescription?: string;
        metaImage?: string;
        publishImmediately?: boolean;
        isMegaCampaign?: boolean;
        parentCampaignId?: string;
    }

    interface UpdateCampaignInput {
        title?: string;
        description?: string;
        content?: string;
        media?: CampaignMedia[];
        mediaType?: CampaignMediaType;
        mediaUrl?: string;
        thumbnailUrl?: string;
        ctaText?: string;
        ctaUrl?: string;
        goalType?: GoalType;
        goalTarget?: number;
        startDate?: string;
        endDate?: string;
        targetAudience?: string[];
        metaTitle?: string;
        metaDescription?: string;
        metaImage?: string;
        status?: CampaignStatus;
        isMegaCampaign?: boolean;
        parentCampaignId?: string;
    }

    interface RegisterInput {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }

    interface LoginInput {
        email: string;
        password: string;
    }

    interface CreateViewProofInput {
        campaignId: string;
        smartLinkId: string;
        platform: SocialPlatform;
        screenshotUrl: string;
        viewCount: number;
    }

    interface UpdateWeaponsOfChoiceInput {
        weaponsOfChoice: SocialPlatform[];
    }

    // ─── Filters & Pagination ────────────────────────────────────────────────────

    interface PaginationParams {
        page: number;
        pageSize: number;
    }

    interface CampaignFilters {
        status?: CampaignStatus;
        search?: string;
        startDateFrom?: string;
        startDateTo?: string;
        goalType?: GoalType;
    }

    // ─── Engagement ──────────────────────────────────────────────────────────────

    interface EngagementStats {
        userId: string;
        campaignId?: string;
        shares: number;
        clicks: number;
        views: number;
        conversions: number;
        referrals: number;
        uniqueVisitors: number;
    }

    interface EngagementTimelinePoint {
        date: string;
        clicks: number;
        shares: number;
        conversions: number;
    }

    // ─── Referrals ───────────────────────────────────────────────────────────────

    interface ReferralStats {
        userId: string;
        campaignId?: string;
        totalReferrals: number;
        activeReferrals: number;
        conversionRate: number;
        directInvites: number;
        pointsEarned: number;
    }

    // ─── Points / Gamification ───────────────────────────────────────────────────

    type PointsAction = "CLICK_RECEIVED" | "SHARE_MADE" | "CONVERSION_RECEIVED" | "DAILY_STREAK" | "WEEKLY_STREAK" | "REFERRAL_JOINED" | "TEAM_MILESTONE" | "GOAL_MET" | "REPORT_ACCURATE" | "PROOF_APPROVED";

    interface RankLevel {
        level: number;
        name: string;
        minScore: number;
        badge: string;
        color: string;
        perks: string[];
    }

    interface RankProgress {
        currentRank: RankLevel;
        nextRank: RankLevel | null;
        totalScore: number;
        pointsToNext: number | null;
        progressPercent: number;
    }

    // ─── Leaderboard ─────────────────────────────────────────────────────────────

    interface LeaderboardEntry {
        userId: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        rank: number;
        score: number;
        impact: number;
        consistency: number;
        leadership: number;
        reliability: number;
        campaignId?: string;
    }

    type LeaderboardFilter = "individual" | "global" | "team" | "group";

    interface UserRankInfo {
        position: number;
        score: number;
        percentile: number;
        campaignId?: string;
    }

    // ─── Donation ────────────────────────────────────────────────────────────────

    interface CreateDonationInput {
        campaignId: string;
        amount: number;
        currency: string;
        message?: string;
    }

    interface DonationStats {
        campaignId: string;
        totalRaised: number;
        donorCount: number;
        conversionRate: number;
        topDonors: { userId: string; firstName: string; lastName: string; total: number }[];
    }

    // ─── Trust ───────────────────────────────────────────────────────────────────

    interface TrustFlagRecord {
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        score: number;
        flags: TrustFlag[];
        lastReviewedAt?: string;
    }

    // ─── Analytics ───────────────────────────────────────────────────────────────

    interface UserAnalytics {
        engagement: EngagementStats;
        points: PointsSummary;
        rank: RankProgress;
        referrals: ReferralStats;
        donations: { total: number; count: number };
        streaks: { daily: number; weekly: number };
    }

    interface CampaignAnalytics {
        participants: number;
        growth: { date: string; count: number }[];
        topPerformers: LeaderboardEntry[];
        engagementTrend: EngagementTimelinePoint[];
        fundraising: DonationStats;
    }

    interface OverviewAnalytics {
        totalUsers: number;
        activeCampaigns: number;
        totalDonations: number;
        totalDonationAmount: number;
        totalPoints: number;
        totalClicks: number;
        totalShares: number;
        totalViews: number;
        totalConversions: number;
        totalSmartLinks: number;
        totalReferrals: number;
        engagementRate: number;
        topCampaigns: { id: string; title: string; participants: number }[];
    }

    // ─── Shared Config Shapes ────────────────────────────────────────────────────

    interface RoleGuarded<T> {
        item: T;
        allowedRoles: string[];
    }

    interface KpiCardConfig {
        key: string;
        label: string;
        icon: string;
        color: string;
        allowedRoles: string[];
    }

    interface NavItem {
        key: string;
        label: string;
        href: string;
        icon: string;
        allowedRoles: string[];
        children?: NavItem[];
    }

    interface PageSection {
        key: string;
        label: string;
        allowedRoles: string[];
    }

    // ─── Notifications ───────────────────────────────────────────────────────────

    type NotificationType =
        | "CAMPAIGN_UPDATE"
        | "REFERRAL_JOINED"
        | "POINTS_EARNED"
        | "TRUST_FLAG"
        | "SYSTEM";

    interface AppNotification {
        id: string;
        userId: string;
        type: NotificationType;
        title: string;
        body: string;
        isRead: boolean;
        link?: string;
        createdAt: string;
    }

    // ─── Teams & Groups ──────────────────────────────────────────────────────────

    interface Group {
        id: string;
        name: string;
        description?: string;
        teamIds: string[];
        maxTeams: number;
        createdAt: string;
        updatedAt: string;
    }

    interface Team {
        id: string;
        name: string;
        groupId: string;
        teamLeadId?: string;
        memberIds: string[];
        maxMembers: number;
        createdAt: string;
        updatedAt: string;
    }

    interface TeamInviteLink {
        id: string;
        token: string;
        teamId: string;
        targetRole: "MEMBER" | "TEAM_LEAD";
        createdById: string;
        usedCount: number;
        maxUses: number;
        expiresAt?: string;
        isActive: boolean;
        createdAt: string;
    }

    interface TeamLeaderboardEntry {
        teamId: string;
        teamName: string;
        groupName: string;
        memberCount: number;
        score: number;
        rank: number;
    }

    interface GroupLeaderboardEntry {
        groupId: string;
        groupName: string;
        teamCount: number;
        memberCount: number;
        score: number;
        rank: number;
    }

    // ─── Bank Accounts ───────────────────────────────────────────────────────────

    interface BankAccount {
        id: string;
        accountName: string;
        accountNumber: string;
        bankName: string;
        currency: "NGN" | "USD" | "GBP";
        isActive: boolean;
        sortOrder: number;
    }

    // ─── Campaign Audit ──────────────────────────────────────────────────────────

    interface CampaignAuditEvent {
        id: string;
        campaignId: string;
        actorId: string;
        actorRole: string;
        eventType: CampaignAuditEventType;
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
        note?: string;
        createdAt: string;
    }

    // ─── User Profile (Admin View) ──────────────────────────────────────────────

    interface UserProfileView {
        user: User;
        analytics: UserAnalytics;
        donations: Donation[];
        participations: CampaignParticipation[];
        referrals: { given: number; received: number };
        team?: Team;
        group?: Group;
        trustScore?: TrustScore;
    }

    // ─── Donation Analytics ──────────────────────────────────────────────────────

    interface DonationAnalytics {
        totalRaised: number;
        totalCount: number;
        byStatus: Record<string, { count: number; amount: number }>;
        timeline: { date: string; amount: number; count: number }[];
        topDonors: { userId: string; firstName: string; lastName: string; total: number }[];
        averageAmount: number;
        byCurrency: Record<string, { count: number; amount: number }>;
    }

    // ─── Extended Donation Input ─────────────────────────────────────────────────

    interface CreateDonationInputExtended extends CreateDonationInput {
        bankAccountId?: string;
        /** Required — Cloudinary URL of the payment screenshot */
        proofScreenshotUrl: string;
        notes?: string;
    }

    // ─── Bug Reports ─────────────────────────────────────────────────────────────

    interface BugReport {
        id: string;
        category: BugReportCategory;
        description: string;
        email: string;
        userId?: string;
        userAgent?: string;
        pageUrl?: string;
        screenshotUrl?: string;
        status: BugReportStatus;
        resolvedAt?: string;
        adminNotes?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface CreateBugReportInput {
        category: BugReportCategory;
        description: string;
        email: string;
    }

    interface UpdateBugReportInput {
        status?: BugReportStatus;
        adminNotes?: string;
    }
}
