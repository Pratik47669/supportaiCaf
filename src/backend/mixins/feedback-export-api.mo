import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types";
import FeedbackLib "../lib/feedback";
import ExportLib "../lib/export";
import AuthLib "../lib/auth";
import SecurityLib "../lib/security";
import AuditLib "../lib/audit";

mixin (
  accessControlState : AccessControl.AccessControlState,
  feedbacks : Map.Map<Types.FeedbackId, Types.Feedback>,
  nextFeedbackId : { var value : Nat },
  conversations : Map.Map<Types.ConversationId, Types.Conversation>,
  messages : Map.Map<Types.MessageId, Types.ChatMessage>,
  tickets : Map.Map<Types.TicketId, Types.Ticket>,
  customers : Map.Map<Types.CustomerId, Types.Customer>,
  users : Map.Map<Principal, Types.User>,
  invites : Map.Map<Types.InviteId, Types.InviteLink>,
  rateLimits : Map.Map<Principal, Types.RateLimitEntry>,
  auditLogs : Map.Map<Nat, Types.AuditLog>,
  nextAuditLogId : { var value : Nat },
) {
  // --- Feedback Methods ---

  public shared ({ caller }) func addFeedback(
    messageId : Types.MessageId,
    conversationId : Types.ConversationId,
    rating : Types.FeedbackRating,
    comment : ?Text,
  ) : async Types.ApiResult<Types.Feedback> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "addFeedback")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "addFeedback");

    // Verify caller owns the conversation
    switch (conversations.get(conversationId)) {
      case (?conv) {
        if (not Principal.equal(conv.userId, caller)) {
          return #err("Unauthorized: Not your conversation");
        };
      };
      case null {
        return #err("Conversation not found");
      };
    };

    // Verify message exists in this conversation
    switch (messages.get(messageId)) {
      case (?msg) {
        if (msg.conversationId != conversationId) {
          return #err("Message does not belong to this conversation");
        };
      };
      case null {
        return #err("Message not found");
      };
    };

    let result = FeedbackLib.addFeedback(feedbacks, nextFeedbackId, messageId, conversationId, rating, comment);

    // Audit logging
    switch (result) {
      case (#ok(feedback)) {
        switch (conversations.get(conversationId)) {
          case (?conv) {
            ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_SETTINGS, caller, ?conv.businessId, "Feedback added for message: " # Nat.toText(messageId));
          };
          case null {};
        };
      };
      case (#err(_)) {};
    };

    result;
  };

  public query ({ caller }) func getFeedbackByConversation(
    conversationId : Types.ConversationId,
  ) : async [Types.Feedback] {
    if (caller.isAnonymous()) {
      return [];
    };

    // Verify caller owns the conversation or belongs to the business
    switch (conversations.get(conversationId)) {
      case (?conv) {
        let isOwner = Principal.equal(conv.userId, caller);
        let isTeamMember = switch (AuthLib.getUser(users, caller)) {
          case (?user) {
            switch (user.businessId) {
              case (?ub) { ub == conv.businessId };
              case null { false };
            };
          };
          case null { false };
        };
        if (not isOwner and not isTeamMember) {
          return [];
        };
      };
      case null { return [] };
    };

    FeedbackLib.getFeedbackByConversation(feedbacks, conversationId);
  };

  public query ({ caller }) func getFeedbackStats() : async Types.FeedbackStats {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Only team members can view feedback stats
    switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        switch (user.businessId) {
          case (?_) { /* ok */ };
          case null { Runtime.trap("Unauthorized: Must belong to a business") };
        };
      };
      case null { Runtime.trap("User not registered") };
    };

    FeedbackLib.getFeedbackStats(feedbacks);
  };

  // --- Export Methods ---

  public query ({ caller }) func exportChats(
    businessId : Types.BusinessId,
  ) : async [Types.ExportedChat] {
    if (caller.isAnonymous()) {
      return [];
    };

    // Verify caller belongs to the business
    switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        switch (user.businessId) {
          case (?ubid) {
            if (ubid != businessId) {
              return [];
            };
          };
          case null { return [] };
        };
      };
      case null { return [] };
    };

    ExportLib.exportChats(conversations, messages, businessId);
  };

  public query ({ caller }) func exportCustomers(
    businessId : Types.BusinessId,
  ) : async [Types.ExportedCustomer] {
    if (caller.isAnonymous()) {
      return [];
    };

    switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        switch (user.businessId) {
          case (?ubid) {
            if (ubid != businessId) {
              return [];
            };
          };
          case null { return [] };
        };
      };
      case null { return [] };
    };

    ExportLib.exportCustomers(customers, businessId);
  };

  public query ({ caller }) func exportTickets(
    businessId : Types.BusinessId,
  ) : async [Types.ExportedTicket] {
    if (caller.isAnonymous()) {
      return [];
    };

    switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        switch (user.businessId) {
          case (?ubid) {
            if (ubid != businessId) {
              return [];
            };
          };
          case null { return [] };
        };
      };
      case null { return [] };
    };

    ExportLib.exportTickets(tickets, businessId);
  };

  public query ({ caller }) func exportAnalytics(
    businessId : Types.BusinessId,
    periodStart : Nat,
    periodEnd : Nat,
  ) : async Types.ApiResult<Types.ExportedAnalytics> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        switch (user.businessId) {
          case (?ubid) {
            if (ubid != businessId) {
              return #err("Unauthorized: Caller does not belong to this business");
            };
          };
          case null {
            return #err("Unauthorized: Caller must belong to a business");
          };
        };
      };
      case null {
        return #err("User not registered");
      };
    };

    ExportLib.exportAnalytics(tickets, conversations, messages, users, invites, businessId, periodStart, periodEnd);
  };
};
