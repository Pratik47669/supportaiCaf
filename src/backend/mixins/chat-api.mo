import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types";
import ChatLib "../lib/chat";
import AuthLib "../lib/auth";
import SecurityLib "../lib/security";
import AuditLib "../lib/audit";

mixin (
  accessControlState : AccessControl.AccessControlState,
  conversations : Map.Map<Types.ConversationId, Types.Conversation>,
  messages : Map.Map<Types.MessageId, Types.ChatMessage>,
  nextConversationId : { var value : Nat },
  nextMessageId : { var value : Nat },
  users : Map.Map<Principal, Types.User>,
  tickets : Map.Map<Types.TicketId, Types.Ticket>,
  nextTicketId : { var value : Nat },
  rateLimits : Map.Map<Principal, Types.RateLimitEntry>,
  auditLogs : Map.Map<Nat, Types.AuditLog>,
  nextAuditLogId : { var value : Nat },
) {
  public shared ({ caller }) func createConversation(
    businessId : Types.BusinessId,
    title : Text,
  ) : async Types.ApiResult<Types.Conversation> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "createConversation")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "createConversation");

    let user = switch (AuthLib.getUser(users, caller)) {
      case (?u) { u };
      case null { Runtime.trap("User not registered") };
    };

    // User must belong to the business
    switch (user.businessId) {
      case (?ub) {
        if (ub != businessId) {
          return #err("Unauthorized: User does not belong to this business");
        };
      };
      case null {
        return #err("Unauthorized: User must belong to a business");
      };
    };

    let result = ChatLib.createConversation(conversations, nextConversationId, caller, businessId, title);

    // Audit logging
    switch (result) {
      case (#ok(conv)) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #SEND_MESSAGE, caller, ?businessId, "Conversation created: " # conv.title);
      };
      case (#err(_)) {};
    };

    result;
  };

  public query ({ caller }) func getConversations(businessId : Types.BusinessId) : async [Types.Conversation] {
    if (caller.isAnonymous()) {
      return [];
    };

    let user = switch (AuthLib.getUser(users, caller)) {
      case (?u) { u };
      case null { return [] };
    };

    // User must belong to the business
    switch (user.businessId) {
      case (?ub) {
        if (ub != businessId) {
          return [];
        };
      };
      case null { return [] };
    };

    ChatLib.getConversations(conversations, caller, businessId);
  };

  public query ({ caller }) func getMessages(conversationId : Types.ConversationId) : async [Types.ChatMessage] {
    if (caller.isAnonymous()) {
      return [];
    };

    // Verify caller owns the conversation
    switch (conversations.get(conversationId)) {
      case (?conv) {
        if (not Principal.equal(conv.userId, caller)) {
          return [];
        };
      };
      case null { return [] };
    };

    ChatLib.getMessages(messages, conversationId);
  };

  public shared ({ caller }) func sendMessage(
    conversationId : Types.ConversationId,
    role : Types.ChatMessageRole,
    content : Text,
    confidence : ?Float,
  ) : async Types.ApiResult<Types.ChatMessage> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "sendMessage")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "sendMessage");

    let result = ChatLib.sendMessage(messages, conversations, nextMessageId, caller, conversationId, role, content, confidence);

    // Audit logging
    switch (result) {
      case (#ok(msg)) {
        switch (conversations.get(conversationId)) {
          case (?conv) {
            ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #SEND_MESSAGE, caller, ?conv.businessId, "Message sent in conversation: " # conversationId.toText());
          };
          case null {};
        };

        #ok(msg);
      };
      case (#err(e)) { #err(e) };
    };
  };

  public shared ({ caller }) func deleteConversation(conversationId : Types.ConversationId) : async Types.ApiResult<()> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    ChatLib.deleteConversation(conversations, messages, caller, conversationId);
  };
};
