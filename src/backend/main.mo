import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinViews "mo:caffeineai-data-viewer/MixinViews";
import Types "types";
import AuthMixin "mixins/auth-api";
import BusinessMixin "mixins/business-api";
import OtpMixin "mixins/otp-api";
import TicketMixin "mixins/ticket-api";
import ChatMixin "mixins/chat-api";
import InviteMixin "mixins/invite-api";
import CustomerMixin "mixins/customer-api";
import KnowledgeMixin "mixins/knowledge-api";
import AnalyticsMixin "mixins/analytics-api";
import AiMixin "mixins/ai-api";
import SecurityAuditMixin "mixins/security-audit-api";
import FeedbackExportMixin "mixins/feedback-export-api";

actor {
  let accessControlState : AccessControl.AccessControlState;

  let users : Map.Map<Principal, Types.User>;
  let businesses : Map.Map<Types.BusinessId, Types.Business>;
  let otps : Map.Map<Text, Types.OtpRecord>;
  let nextBusinessId : { var value : Nat };

  // Phase 2 state
  let tickets : Map.Map<Types.TicketId, Types.Ticket>;
  let nextTicketId : { var value : Nat };

  let conversations : Map.Map<Types.ConversationId, Types.Conversation>;
  let messages : Map.Map<Types.MessageId, Types.ChatMessage>;
  let nextConversationId : { var value : Nat };
  let nextMessageId : { var value : Nat };

  let invites : Map.Map<Types.InviteId, Types.InviteLink>;
  let nextInviteId : { var value : Nat };

  let customers : Map.Map<Types.CustomerId, Types.Customer>;
  let nextCustomerId : { var value : Nat };

  let articles : Map.Map<Types.ArticleId, Types.KnowledgeBaseArticle>;
  let nextArticleId : { var value : Nat };

  // Phase 3 RAG state
  let chunks : Map.Map<Types.ChunkId, Types.DocumentChunk>;
  let embeddings : Map.Map<Types.ChunkId, Types.Embedding>;
  let nextChunkId : { var value : Nat };

  let crawledPages : Map.Map<Types.CrawledPageId, Types.CrawledPage>;
  let nextCrawledPageId : { var value : Nat };

  let geminiApiKey : { var value : Text };

  // Phase 3 Security & Audit state
  let rateLimits : Map.Map<Principal, Types.RateLimitEntry>;
  let auditLogs : Map.Map<Nat, Types.AuditLog>;
  let nextAuditLogId : { var value : Nat };

  // Phase 3 AI Config state
  let aiConfigs : Map.Map<Types.BusinessId, Types.AiConfig>;
  let promptVersions : Map.Map<Nat, Types.PromptVersion>;
  let nextPromptVersionId : { var value : Nat };

  // Phase 3 Feedback state
  let feedbacks : Map.Map<Types.FeedbackId, Types.Feedback>;
  let nextFeedbackId : { var value : Nat };

  include MixinAuthorization(accessControlState, null);
  include MixinViews();
  include AuthMixin(accessControlState, users, rateLimits, auditLogs, nextAuditLogId);
  include BusinessMixin(accessControlState, businesses, nextBusinessId, users, rateLimits, auditLogs, nextAuditLogId);
  include OtpMixin(accessControlState, otps, rateLimits, auditLogs, nextAuditLogId);
  include TicketMixin(accessControlState, tickets, nextTicketId, users, rateLimits, auditLogs, nextAuditLogId);
  include ChatMixin(accessControlState, conversations, messages, nextConversationId, nextMessageId, users, tickets, nextTicketId, rateLimits, auditLogs, nextAuditLogId);
  include InviteMixin(accessControlState, invites, nextInviteId, users, rateLimits, auditLogs, nextAuditLogId);
  include CustomerMixin(accessControlState, customers, nextCustomerId, users, rateLimits, auditLogs, nextAuditLogId);
  include KnowledgeMixin(accessControlState, articles, nextArticleId, chunks, embeddings, nextChunkId, crawledPages, nextCrawledPageId, users, rateLimits, auditLogs, nextAuditLogId);
  include AnalyticsMixin(accessControlState, tickets, conversations, messages, users, invites, feedbacks);
  include AiMixin(accessControlState, geminiApiKey, conversations, messages, nextMessageId, users, chunks, embeddings, articles, rateLimits, auditLogs, nextAuditLogId);
  include SecurityAuditMixin(accessControlState, rateLimits, auditLogs, nextAuditLogId, users);
  include FeedbackExportMixin(accessControlState, feedbacks, nextFeedbackId, conversations, messages, tickets, customers, users, invites, rateLimits, auditLogs, nextAuditLogId);
};
