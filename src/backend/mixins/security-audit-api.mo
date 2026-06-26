import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types";
import SecurityLib "../lib/security";
import AuditLib "../lib/audit";
import AuthLib "../lib/auth";

mixin (
  accessControlState : AccessControl.AccessControlState,
  rateLimits : Map.Map<Principal, Types.RateLimitEntry>,
  auditLogs : Map.Map<Nat, Types.AuditLog>,
  nextAuditLogId : { var value : Nat },
  users : Map.Map<Principal, Types.User>,
) {
  // Rate limiting check endpoint
  public query ({ caller }) func checkRateLimit(endpoint : Text) : async ?Types.RateLimitError {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };
    SecurityLib.checkRateLimit(rateLimits, caller, endpoint);
  };

  // Get audit logs for a business
  public query ({ caller }) func getAuditLogs(
    businessId : Types.BusinessId,
    limit : Nat,
  ) : async [Types.AuditLog] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Verify caller belongs to the business
    switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        switch (user.businessId) {
          case (?ubid) {
            if (ubid != businessId) {
              Runtime.trap("Unauthorized: Caller does not belong to this business");
            };
          };
          case null {
            Runtime.trap("Unauthorized: Caller must belong to a business");
          };
        };
      };
      case null {
        Runtime.trap("User not registered");
      };
    };

    AuditLib.getAuditLogs(auditLogs, ?businessId, limit);
  };

  // Get activity timeline for a business
  public query ({ caller }) func getActivityTimeline(
    businessId : Types.BusinessId,
    hours : Nat,
  ) : async [Types.ActivityEvent] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Verify caller belongs to the business
    switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        switch (user.businessId) {
          case (?ubid) {
            if (ubid != businessId) {
              Runtime.trap("Unauthorized: Caller does not belong to this business");
            };
          };
          case null {
            Runtime.trap("Unauthorized: Caller must belong to a business");
          };
        };
      };
      case null {
        Runtime.trap("User not registered");
      };
    };

    AuditLib.getActivityTimeline(auditLogs, businessId, hours);
  };

  // Get audit logs for the current user
  public query ({ caller }) func getMyAuditLogs(limit : Nat) : async [Types.AuditLog] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };
    AuditLib.getAuditLogsByPrincipal(auditLogs, caller, limit);
  };

  // Validate text input (public utility endpoint)
  public query func validateInput(
    input : Text,
    minLength : Nat,
    maxLength : Nat,
    allowHtml : Bool,
  ) : async ?Types.ValidationError {
    SecurityLib.validateText(input, minLength, maxLength, allowHtml);
  };

  // Sanitize HTML from text (public utility endpoint)
  public query func sanitizeInput(input : Text) : async Text {
    SecurityLib.sanitizeHtml(input);
  };
};
