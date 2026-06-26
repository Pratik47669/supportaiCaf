import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types";
import AnalyticsLib "../lib/analytics";
import AuthLib "../lib/auth";

mixin (
  accessControlState : AccessControl.AccessControlState,
  tickets : Map.Map<Types.TicketId, Types.Ticket>,
  conversations : Map.Map<Types.ConversationId, Types.Conversation>,
  messages : Map.Map<Types.MessageId, Types.ChatMessage>,
  users : Map.Map<Principal, Types.User>,
  invites : Map.Map<Types.InviteId, Types.InviteLink>,
  feedbacks : Map.Map<Types.FeedbackId, Types.Feedback>,
) {
  public query ({ caller }) func getOverview(
    businessId : Types.BusinessId,
    periodStart : Nat,
    periodEnd : Nat,
  ) : async Types.ApiResult<Types.AnalyticsSnapshot> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Verify caller belongs to the business
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
        return #err("User must be registered first");
      };
    };

    AnalyticsLib.getOverview(tickets, conversations, messages, users, businessId, periodStart, periodEnd);
  };

  public query ({ caller }) func getAiAnalytics(
    businessId : Types.BusinessId,
    periodStart : Nat,
    periodEnd : Nat,
  ) : async Types.ApiResult<Types.AiAnalytics> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Verify caller belongs to the business
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
        return #err("User must be registered first");
      };
    };

    AnalyticsLib.getAiAnalytics(conversations, messages, feedbacks, businessId, periodStart, periodEnd);
  };

  public query ({ caller }) func getTicketAnalytics(
    businessId : Types.BusinessId,
    periodStart : Nat,
    periodEnd : Nat,
  ) : async Types.ApiResult<Types.TicketAnalytics> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Verify caller belongs to the business
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
        return #err("User must be registered first");
      };
    };

    AnalyticsLib.getTicketAnalytics(tickets, businessId, periodStart, periodEnd);
  };

  public query ({ caller }) func getTeamAnalytics(
    businessId : Types.BusinessId,
  ) : async Types.ApiResult<Types.TeamAnalytics> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Verify caller belongs to the business
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
        return #err("User must be registered first");
      };
    };

    AnalyticsLib.getTeamAnalytics(users, tickets, invites, businessId);
  };
};
