module {
  public type UserId = Principal;
  public type BusinessId = Nat;
  public type Timestamp = Nat;

  public type UserRole = {
    #owner;
    #admin;
    #supportAgent;
    #viewer;
  };

  public type User = {
    id : UserId;
    principal : Principal;
    name : Text;
    email : ?Text;
    role : UserRole;
    businessId : ?BusinessId;
    createdAt : Timestamp;
    isActive : Bool;
  };

  public type Business = {
    id : BusinessId;
    name : Text;
    industry : Text;
    website : ?Text;
    description : Text;
    teamSize : Text;
    logoUrl : ?Text;
    supportEmail : Text;
    phoneNumber : ?Text;
    ownerId : UserId;
    createdAt : Timestamp;
  };

  public type OtpRecord = {
    code : Text;
    email : Text;
    createdAt : Timestamp;
    verified : Bool;
  };

  public type OnboardingStep = {
    #businessInfo;
    #teamSetup;
    #complete;
  };

  public type ApiResult<T> = {
    #ok : T;
    #err : Text;
  };

  // --- Phase 2 Types ---

  public type TicketId = Nat;
  public type ConversationId = Nat;
  public type MessageId = Nat;
  public type InviteId = Nat;
  public type CustomerId = Nat;
  public type ArticleId = Nat;

  public type TicketStatus = {
    #open;
    #inProgress;
    #resolved;
    #closed;
  };

  public type TicketPriority = {
    #low;
    #medium;
    #high;
    #urgent;
  };

  public type Ticket = {
    id : TicketId;
    title : Text;
    description : Text;
    status : TicketStatus;
    priority : TicketPriority;
    assignee : ?UserId;
    creator : UserId;
    customerId : ?UserId;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    businessId : BusinessId;
    isDeleted : ?Bool;
  };

  public type ChatMessageRole = {
    #user;
    #assistant;
    #bot;
  };

  public type ChatMessage = {
    id : MessageId;
    conversationId : ConversationId;
    role : ChatMessageRole;
    content : Text;
    timestamp : Timestamp;
    confidence : ?Float;
  };

  public type Conversation = {
    id : ConversationId;
    title : Text;
    userId : UserId;
    businessId : BusinessId;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type InviteLink = {
    id : InviteId;
    code : Text;
    role : UserRole;
    businessId : BusinessId;
    createdBy : UserId;
    expiresAt : Timestamp;
    used : Bool;
    revokedAt : ?Timestamp;
  };

  public type CustomerNote = {
    text : Text;
    createdAt : Timestamp;
    authorId : UserId;
  };

  public type Customer = {
    id : CustomerId;
    name : Text;
    email : Text;
    businessId : BusinessId;
    createdAt : Timestamp;
    tags : [Text];
    notes : [CustomerNote];
    lastInteraction : Timestamp;
    totalChats : Nat;
  };

  public type KnowledgeBaseArticle = {
    id : ArticleId;
    title : Text;
    content : Text;
    category : Text;
    businessId : BusinessId;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  // --- Analytics Types ---

  public type AnalyticsSnapshot = {
    totalTickets : Nat;
    openTickets : Nat;
    resolvedTickets : Nat;
    avgResolutionTime : Nat;
    totalConversations : Nat;
    totalMessages : Nat;
    aiInteractions : Nat;
    teamSize : Nat;
    periodStart : Timestamp;
    periodEnd : Timestamp;
  };

  public type AiAnalytics = {
    totalConversations : Nat;
    totalMessages : Nat;
    assistantMessages : Nat;
    avgMessagesPerConversation : Nat;
    avgResponseTime : Nat;
    thumbsUp : Nat;
    thumbsDown : Nat;
    periodStart : Timestamp;
    periodEnd : Timestamp;
  };

  public type TicketAnalytics = {
    total : Nat;
    open : Nat;
    inProgress : Nat;
    resolved : Nat;
    closed : Nat;
    avgResolutionTime : Nat;
    byPriority : {
      low : Nat;
      medium : Nat;
      high : Nat;
      urgent : Nat;
    };
    periodStart : Timestamp;
    periodEnd : Timestamp;
  };

  public type TeamMemberAnalytics = {
    agentId : Principal;
    name : Text;
    ticketsAssigned : Nat;
    ticketsResolved : Nat;
  };

  public type TeamAnalytics = {
    members : [TeamMemberAnalytics];
    totalMembers : Nat;
    activeMembers : Nat;
    membersByRole : {
      owner : Nat;
      admin : Nat;
      supportAgent : Nat;
      viewer : Nat;
    };
    pendingInvites : Nat;
  };

  // AI Service types
  public type HandoffTicket = {
    ticket : Ticket;
    chatHistory : [ChatMessage];
    confidence : Float;
  };

  public type AIService = {
    sendMessage : (conversationId : ConversationId, message : Text) -> async ApiResult<Text>;
    setApiKey : (key : Text) -> async ApiResult<()>;
    getApiKey : () -> async ?Text;
  };

  public type GeminiRequest = {
    contents : [GeminiContent];
  };

  public type GeminiContent = {
    role : Text;
    parts : [GeminiPart];
  };

  public type GeminiPart = {
    text : Text;
  };

  public type GeminiCandidate = {
    content : GeminiContent;
    finishReason : ?Text;
  };

  public type GeminiResponse = {
    candidates : [GeminiCandidate];
  };

  public type AiPersonality = {
    #friendly;
    #professional;
    #witty;
    #calm;
  };

  public type ResponseTone = {
    #formal;
    #casual;
    #empathetic;
    #direct;
  };

  public type AiConfig = {
    businessId : BusinessId;
    systemPrompt : Text;
    temperature : Float;
    maxTokens : Nat;
    personality : AiPersonality;
    tone : ResponseTone;
    updatedAt : Timestamp;
  };

  public type PromptVersion = {
    id : Nat;
    businessId : BusinessId;
    versionNumber : Nat;
    systemPrompt : Text;
    createdAt : Timestamp;
    isActive : Bool;
  };

  // --- Phase 3 Security & Audit Types ---

  public type AuditEventType = {
    #LOGIN;
    #LOGOUT;
    #CREATE_TICKET;
    #UPDATE_TICKET;
    #DELETE_TICKET;
    #CREATE_CUSTOMER;
    #UPDATE_CUSTOMER;
    #SEND_MESSAGE;
    #UPDATE_SETTINGS;
    #INVITE_MEMBER;
    #EXPORT_DATA;
  };

  public type AuditLog = {
    id : Nat;
    eventType : AuditEventType;
    principal : Principal;
    businessId : ?BusinessId;
    timestamp : Timestamp;
    details : Text;
  };

  public type ActivityEvent = {
    eventType : AuditEventType;
    principal : Principal;
    timestamp : Timestamp;
    details : Text;
  };

  public type RateLimitEntry = {
    principal : Principal;
    endpoint : Text;
    count : Nat;
    windowStart : Timestamp;
  };

  public type RateLimitConfig = {
    maxRequests : Nat;
    windowSeconds : Nat;
  };

  public type ValidationError = {
    #invalidLength;
    #invalidCharacters;
    #containsHtml;
    #emptyInput;
    #tooLong : Nat; // max allowed
  };

  public type RateLimitError = {
    #rateLimited : {
      retryAfter : Nat;
      message : Text;
    };
  };

  public type ChunkId = Nat;
  public type CrawledPageId = Nat;

  public type DocumentChunk = {
    id : ChunkId;
    articleId : ArticleId;
    content : Text;
    chunkIndex : Nat;
    createdAt : Timestamp;
  };

  public type Embedding = {
    chunkId : ChunkId;
    vector : [Float];
  };

  public type CrawledPage = {
    id : CrawledPageId;
    url : Text;
    title : Text;
    content : Text;
    businessId : BusinessId;
    createdAt : Timestamp;
  };

  public type SearchResult = {
    chunk : DocumentChunk;
    score : Float;
  };

  public type KnowledgeBaseContext = {
    relevantChunks : [DocumentChunk];
    sourceArticleIds : [ArticleId];
  };

  public type AiResponseWithSources = {
    response : Text;
    sources : [SearchResult];
  };

  // --- Phase 3 Feedback & Export Types ---

  public type FeedbackId = Nat;

  public type FeedbackRating = {
    #thumbsUp;
    #thumbsDown;
  };

  public type Feedback = {
    id : FeedbackId;
    messageId : MessageId;
    conversationId : ConversationId;
    rating : FeedbackRating;
    comment : ?Text;
    createdAt : Timestamp;
  };

  public type FeedbackStats = {
    total : Nat;
    thumbsUp : Nat;
    thumbsDown : Nat;
    thumbsUpPercentage : Nat;
  };

  // Export types
  public type ExportedChat = {
    conversationId : ConversationId;
    title : Text;
    userId : UserId;
    businessId : BusinessId;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    messages : [ChatMessage];
  };

  public type ExportedCustomer = {
    id : CustomerId;
    name : Text;
    email : Text;
    businessId : BusinessId;
    createdAt : Timestamp;
  };

  public type ExportedTicket = {
    id : TicketId;
    title : Text;
    description : Text;
    status : TicketStatus;
    priority : TicketPriority;
    assignee : ?UserId;
    creator : UserId;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    businessId : BusinessId;
  };

  public type ExportedAnalytics = {
    overview : AnalyticsSnapshot;
    aiAnalytics : AiAnalytics;
    ticketAnalytics : TicketAnalytics;
    teamAnalytics : TeamAnalytics;
  };
};
