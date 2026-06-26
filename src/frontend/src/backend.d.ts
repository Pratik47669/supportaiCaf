import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PromptVersion {
    id: bigint;
    businessId: BusinessId;
    createdAt: Timestamp;
    isActive: boolean;
    systemPrompt: string;
    versionNumber: bigint;
}
export interface AiAnalytics {
    assistantMessages: bigint;
    avgMessagesPerConversation: bigint;
    thumbsDown: bigint;
    totalMessages: bigint;
    periodEnd: Timestamp;
    thumbsUp: bigint;
    periodStart: Timestamp;
    avgResponseTime: bigint;
    totalConversations: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export interface HttpRequestResult {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export interface Feedback {
    id: FeedbackId;
    messageId: MessageId;
    createdAt: Timestamp;
    comment?: string;
    conversationId: ConversationId;
    rating: FeedbackRating;
}
export interface TeamMemberAnalytics {
    name: string;
    agentId: Principal;
    ticketsResolved: bigint;
    ticketsAssigned: bigint;
}
export type ApiResult_1 = {
    __kind__: "ok";
    ok: KnowledgeBaseArticle;
} | {
    __kind__: "err";
    err: string;
};
export type TicketId = bigint;
export type ApiResult_11 = {
    __kind__: "ok";
    ok: TicketAnalytics;
} | {
    __kind__: "err";
    err: string;
};
export interface ExportedTicket {
    id: TicketId;
    status: TicketStatus;
    assignee?: UserId;
    title: string;
    creator: UserId;
    businessId: BusinessId;
    createdAt: Timestamp;
    description: string;
    updatedAt: Timestamp;
    priority: TicketPriority;
}
export type BusinessId = bigint;
export interface AnalyticsSnapshot {
    teamSize: bigint;
    avgResolutionTime: bigint;
    totalMessages: bigint;
    resolvedTickets: bigint;
    periodEnd: Timestamp;
    openTickets: bigint;
    aiInteractions: bigint;
    periodStart: Timestamp;
    totalTickets: bigint;
    totalConversations: bigint;
}
export interface ActivityEvent {
    principal: Principal;
    timestamp: Timestamp;
    details: string;
    eventType: AuditEventType;
}
export type ApiResult_8 = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export type ApiResult_14 = {
    __kind__: "ok";
    ok: AiAnalytics;
} | {
    __kind__: "err";
    err: string;
};
export interface ChatMessage {
    id: MessageId;
    content: string;
    role: ChatMessageRole;
    conversationId: ConversationId;
    timestamp: Timestamp;
    confidence?: number;
}
export type ApiResult_13 = {
    __kind__: "ok";
    ok: AnalyticsSnapshot;
} | {
    __kind__: "err";
    err: string;
};
export interface DocumentChunk {
    id: ChunkId;
    content: string;
    chunkIndex: bigint;
    createdAt: Timestamp;
    articleId: ArticleId;
}
export interface ExportedCustomer {
    id: CustomerId;
    businessId: BusinessId;
    name: string;
    createdAt: Timestamp;
    email: string;
}
export interface CustomerNote {
    authorId: UserId;
    createdAt: Timestamp;
    text: string;
}
export type CrawledPageId = bigint;
export type ApiResult_3 = {
    __kind__: "ok";
    ok: Ticket;
} | {
    __kind__: "err";
    err: string;
};
export type ApiResult = {
    __kind__: "ok";
    ok: boolean;
} | {
    __kind__: "err";
    err: string;
};
export interface OtpRecord {
    verified: boolean;
    code: string;
    createdAt: Timestamp;
    email: string;
}
export type ApiResult_2 = {
    __kind__: "ok";
    ok: User;
} | {
    __kind__: "err";
    err: string;
};
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface HttpHeader {
    value: string;
    name: string;
}
export interface KnowledgeBaseArticle {
    id: ArticleId;
    title: string;
    content: string;
    businessId: BusinessId;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    category: string;
}
export type UserId = Principal;
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type MessageId = bigint;
export interface Embedding {
    chunkId: ChunkId;
    vector: Array<number>;
}
export type CustomerId = bigint;
export type ApiResult_12 = {
    __kind__: "ok";
    ok: TeamAnalytics;
} | {
    __kind__: "err";
    err: string;
};
export type ApiResult_10 = {
    __kind__: "ok";
    ok: InviteLink;
} | {
    __kind__: "err";
    err: string;
};
export interface Ticket {
    id: TicketId;
    status: TicketStatus;
    assignee?: UserId;
    title: string;
    creator: UserId;
    isDeleted?: boolean;
    businessId: BusinessId;
    createdAt: Timestamp;
    description: string;
    updatedAt: Timestamp;
    customerId?: UserId;
    priority: TicketPriority;
}
export interface Conversation {
    id: ConversationId;
    title: string;
    businessId: BusinessId;
    userId: UserId;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface SearchResult {
    chunk: DocumentChunk;
    score: number;
}
export type Timestamp = bigint;
export interface AuditLog {
    id: bigint;
    principal: Principal;
    businessId?: BusinessId;
    timestamp: Timestamp;
    details: string;
    eventType: AuditEventType;
}
export type ApiResult_7 = {
    __kind__: "ok";
    ok: AiResponseWithSources;
} | {
    __kind__: "err";
    err: string;
};
export interface TeamAnalytics {
    members: Array<TeamMemberAnalytics>;
    totalMembers: bigint;
    membersByRole: {
        admin: bigint;
        owner: bigint;
        supportAgent: bigint;
        viewer: bigint;
    };
    activeMembers: bigint;
    pendingInvites: bigint;
}
export type ChunkId = bigint;
export type ArticleId = bigint;
export type ConversationId = bigint;
export type ApiResult_6 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export type ApiResult_5 = {
    __kind__: "ok";
    ok: Business;
} | {
    __kind__: "err";
    err: string;
};
export type InviteId = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: HttpRequestResult;
}
export interface ExportedAnalytics {
    teamAnalytics: TeamAnalytics;
    overview: AnalyticsSnapshot;
    aiAnalytics: AiAnalytics;
    ticketAnalytics: TicketAnalytics;
}
export type FeedbackId = bigint;
export interface AiConfig {
    personality: AiPersonality;
    businessId: BusinessId;
    temperature: number;
    tone: ResponseTone;
    updatedAt: Timestamp;
    systemPrompt: string;
    maxTokens: bigint;
}
export type ApiResult_4 = {
    __kind__: "ok";
    ok: Customer;
} | {
    __kind__: "err";
    err: string;
};
export interface RateLimitEntry {
    principal: Principal;
    endpoint: string;
    count: bigint;
    windowStart: Timestamp;
}
export interface FeedbackStats {
    total: bigint;
    thumbsDown: bigint;
    thumbsUp: bigint;
    thumbsUpPercentage: bigint;
}
export type ApiResult_9 = {
    __kind__: "ok";
    ok: ChatMessage;
} | {
    __kind__: "err";
    err: string;
};
export interface Business {
    id: BusinessId;
    teamSize: string;
    ownerId: UserId;
    name: string;
    createdAt: Timestamp;
    description: string;
    website?: string;
    logoUrl?: string;
    supportEmail: string;
    phoneNumber?: string;
    industry: string;
}
export interface User {
    id: UserId;
    principal: Principal;
    businessId?: BusinessId;
    name: string;
    createdAt: Timestamp;
    role: UserRole;
    isActive: boolean;
    email?: string;
}
export interface ExportedChat {
    title: string;
    businessId: BusinessId;
    messages: Array<ChatMessage>;
    userId: UserId;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    conversationId: ConversationId;
}
export interface CrawledPage {
    id: CrawledPageId;
    url: string;
    title: string;
    content: string;
    businessId: BusinessId;
    createdAt: Timestamp;
}
export type ApiResult_16 = {
    __kind__: "ok";
    ok: Conversation;
} | {
    __kind__: "err";
    err: string;
};
export interface TicketAnalytics {
    resolved: bigint;
    closed: bigint;
    total: bigint;
    avgResolutionTime: bigint;
    open: bigint;
    periodEnd: Timestamp;
    periodStart: Timestamp;
    inProgress: bigint;
    byPriority: {
        low: bigint;
        high: bigint;
        urgent: bigint;
        medium: bigint;
    };
}
export type ApiResult_15 = {
    __kind__: "ok";
    ok: ExportedAnalytics;
} | {
    __kind__: "err";
    err: string;
};
export type RateLimitError = {
    __kind__: "rateLimited";
    rateLimited: {
        retryAfter: bigint;
        message: string;
    };
};
export interface Customer {
    id: CustomerId;
    businessId: BusinessId;
    name: string;
    createdAt: Timestamp;
    totalChats: bigint;
    tags: Array<string>;
    email: string;
    notes: Array<CustomerNote>;
    lastInteraction: Timestamp;
}
export interface InviteLink {
    id: InviteId;
    expiresAt: Timestamp;
    businessId: BusinessId;
    code: string;
    createdBy: UserId;
    role: UserRole;
    used: boolean;
    revokedAt?: Timestamp;
}
export type ApiResult_18 = {
    __kind__: "ok";
    ok: Feedback;
} | {
    __kind__: "err";
    err: string;
};
export interface AiResponseWithSources {
    response: string;
    sources: Array<SearchResult>;
}
export type ValidationError = {
    __kind__: "emptyInput";
    emptyInput: null;
} | {
    __kind__: "tooLong";
    tooLong: bigint;
} | {
    __kind__: "containsHtml";
    containsHtml: null;
} | {
    __kind__: "invalidLength";
    invalidLength: null;
} | {
    __kind__: "invalidCharacters";
    invalidCharacters: null;
};
export type ApiResult_17 = {
    __kind__: "ok";
    ok: CrawledPage;
} | {
    __kind__: "err";
    err: string;
};
export enum AiPersonality {
    calm = "calm",
    professional = "professional",
    friendly = "friendly",
    witty = "witty"
}
export enum AuditEventType {
    LOGOUT = "LOGOUT",
    EXPORT_DATA = "EXPORT_DATA",
    DELETE_TICKET = "DELETE_TICKET",
    UPDATE_CUSTOMER = "UPDATE_CUSTOMER",
    UPDATE_TICKET = "UPDATE_TICKET",
    CREATE_TICKET = "CREATE_TICKET",
    CREATE_CUSTOMER = "CREATE_CUSTOMER",
    UPDATE_SETTINGS = "UPDATE_SETTINGS",
    INVITE_MEMBER = "INVITE_MEMBER",
    LOGIN = "LOGIN",
    SEND_MESSAGE = "SEND_MESSAGE"
}
export enum ChatMessageRole {
    bot = "bot",
    user = "user",
    assistant = "assistant"
}
export enum FeedbackRating {
    thumbsDown = "thumbsDown",
    thumbsUp = "thumbsUp"
}
export enum ResponseTone {
    casual = "casual",
    direct = "direct",
    empathetic = "empathetic",
    formal = "formal"
}
export enum TicketPriority {
    low = "low",
    high = "high",
    urgent = "urgent",
    medium = "medium"
}
export enum TicketStatus {
    resolved = "resolved",
    closed = "closed",
    open = "open",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    owner = "owner",
    supportAgent = "supportAgent",
    viewer = "viewer"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptInvite(code: string): Promise<ApiResult_10>;
    addCustomerNote(customerId: CustomerId, text: string): Promise<ApiResult_4>;
    addCustomerTag(customerId: CustomerId, tag: string): Promise<ApiResult_4>;
    addFeedback(messageId: MessageId, conversationId: ConversationId, rating: FeedbackRating, comment: string | null): Promise<ApiResult_18>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    checkRateLimit(endpoint: string): Promise<RateLimitError | null>;
    crawlWebsite(businessId: BusinessId, url: string, title: string, content: string): Promise<ApiResult_17>;
    createArticle(businessId: BusinessId, title: string, content: string, category: string): Promise<ApiResult_1>;
    createBusiness(name: string, industry: string, website: string | null, description: string, teamSize: string, logoUrl: string | null, supportEmail: string, phoneNumber: string | null): Promise<ApiResult_5>;
    createConversation(businessId: BusinessId, title: string): Promise<ApiResult_16>;
    createCustomer(businessId: BusinessId, name: string, email: string): Promise<ApiResult_4>;
    createInvite(businessId: BusinessId, code: string, role: UserRole, expiresAt: bigint): Promise<ApiResult_10>;
    createTicket(businessId: BusinessId, title: string, description: string, priority: TicketPriority, status: TicketStatus, customerId: UserId | null): Promise<ApiResult_3>;
    deleteArticle(articleId: ArticleId): Promise<ApiResult_6>;
    deleteBusiness(businessId: BusinessId): Promise<ApiResult_6>;
    deleteConversation(conversationId: ConversationId): Promise<ApiResult_6>;
    deleteCustomer(customerId: CustomerId): Promise<ApiResult_6>;
    deleteTicket(ticketId: TicketId): Promise<ApiResult_6>;
    exportAnalytics(businessId: BusinessId, periodStart: bigint, periodEnd: bigint): Promise<ApiResult_15>;
    exportChats(businessId: BusinessId): Promise<Array<ExportedChat>>;
    exportCustomers(businessId: BusinessId): Promise<Array<ExportedCustomer>>;
    exportTickets(businessId: BusinessId): Promise<Array<ExportedTicket>>;
    generateOtp(email: string): Promise<ApiResult_8>;
    getActivityTimeline(businessId: BusinessId, hours: bigint): Promise<Array<ActivityEvent>>;
    getAiAnalytics(businessId: BusinessId, periodStart: bigint, periodEnd: bigint): Promise<ApiResult_14>;
    getArticle(articleId: ArticleId): Promise<KnowledgeBaseArticle | null>;
    getArticles(businessId: BusinessId): Promise<Array<KnowledgeBaseArticle>>;
    getAuditLogs(businessId: BusinessId, limit: bigint): Promise<Array<AuditLog>>;
    getBusiness(businessId: BusinessId): Promise<Business | null>;
    getCallerUser(): Promise<User | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getConversations(businessId: BusinessId): Promise<Array<Conversation>>;
    getCrawledPages(businessId: BusinessId): Promise<Array<CrawledPage>>;
    getCustomer(customerId: CustomerId): Promise<Customer | null>;
    getCustomers(businessId: BusinessId): Promise<Array<Customer>>;
    getFeedbackByConversation(conversationId: ConversationId): Promise<Array<Feedback>>;
    getFeedbackStats(): Promise<FeedbackStats>;
    getGeminiApiKey(): Promise<string | null>;
    getInviteByCode(code: string): Promise<InviteLink | null>;
    getInvites(businessId: BusinessId): Promise<Array<InviteLink>>;
    getMessages(conversationId: ConversationId): Promise<Array<ChatMessage>>;
    getMyAuditLogs(limit: bigint): Promise<Array<AuditLog>>;
    getMyBusiness(): Promise<Business | null>;
    getOverview(businessId: BusinessId, periodStart: bigint, periodEnd: bigint): Promise<ApiResult_13>;
    getSimulatedOtp(email: string): Promise<string | null>;
    getTeamAnalytics(businessId: BusinessId): Promise<ApiResult_12>;
    getTicket(ticketId: TicketId): Promise<Ticket | null>;
    getTicketAnalytics(businessId: BusinessId, periodStart: bigint, periodEnd: bigint): Promise<ApiResult_11>;
    getTickets(businessId: BusinessId): Promise<Array<Ticket>>;
    getUser(userId: Principal): Promise<User | null>;
    getUserRole(userId: Principal): Promise<UserRole | null>;
    isCallerAdmin(): Promise<boolean>;
    register(name: string, email: string | null): Promise<ApiResult_2>;
    removeCustomerTag(customerId: CustomerId, tag: string): Promise<ApiResult_4>;
    removeTeamMember(targetUserId: Principal): Promise<ApiResult_2>;
    revokeInvite(inviteId: InviteId): Promise<ApiResult_10>;
    sanitizeInput(input: string): Promise<string>;
    searchKnowledgeBase(businessId: BusinessId, queryText: string, topK: bigint): Promise<Array<SearchResult>>;
    sendMessage(conversationId: ConversationId, role: ChatMessageRole, content: string, confidence: number | null): Promise<ApiResult_9>;
    sendToGemini(conversationId: ConversationId, message: string): Promise<ApiResult_8>;
    sendToGeminiWithSources(conversationId: ConversationId, message: string): Promise<ApiResult_7>;
    setGeminiApiKey(key: string): Promise<ApiResult_6>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateArticle(articleId: ArticleId, title: string | null, content: string | null, category: string | null): Promise<ApiResult_1>;
    updateBusiness(businessId: BusinessId, name: string, industry: string, website: string | null, description: string, teamSize: string, logoUrl: string | null, supportEmail: string, phoneNumber: string | null): Promise<ApiResult_5>;
    updateCustomer(customerId: CustomerId, name: string | null, email: string | null): Promise<ApiResult_4>;
    updateTicket(ticketId: TicketId, title: string | null, description: string | null, status: TicketStatus | null, priority: TicketPriority | null, assignee: UserId | null): Promise<ApiResult_3>;
    updateUserRole(targetUserId: Principal, newRole: UserRole): Promise<ApiResult_2>;
    uploadDocumentChunks(businessId: BusinessId, title: string, content: string, category: string): Promise<ApiResult_1>;
    validateInput(input: string, minLength: bigint, maxLength: bigint, allowHtml: boolean): Promise<ValidationError | null>;
    verifyOtp(email: string, code: string): Promise<ApiResult>;
}
