import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types";
import AuthLib "../lib/auth";
import SecurityLib "../lib/security";
import AuditLib "../lib/audit";

mixin (
  accessControlState : AccessControl.AccessControlState,
  users : Map.Map<Principal, Types.User>,
  rateLimits : Map.Map<Principal, Types.RateLimitEntry>,
  auditLogs : Map.Map<Nat, Types.AuditLog>,
  nextAuditLogId : { var value : Nat },
) {
  public shared ({ caller }) func register(name : Text, email : ?Text) : async Types.ApiResult<Types.User> {
    // Allow anonymous users to register — they are registering for the first time
    // The actual uniqueness check is done in AuthLib.registerUser

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "register")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "register");

    let result = AuthLib.registerUser(users, caller, name, email);

    // Audit logging
    switch (result) {
      case (#ok(user)) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #LOGIN, caller, null, "User registered: " # user.name);
      };
      case (#err(_)) {};
    };

    result;
  };

  public query ({ caller }) func getCallerUser() : async ?Types.User {
    if (caller.isAnonymous()) {
      return null;
    };
    AuthLib.getUser(users, caller);
  };

  public query ({ caller }) func getUser(userId : Principal) : async ?Types.User {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };
    AuthLib.getUser(users, userId);
  };

  public shared ({ caller }) func updateUserRole(targetUserId : Principal, newRole : Types.UserRole) : async Types.ApiResult<Types.User> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "updateUserRole")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "updateUserRole");

    let result = AuthLib.updateUserRole(users, caller, targetUserId, newRole);

    // Audit logging
    switch (result) {
      case (#ok(user)) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_SETTINGS, caller, user.businessId, "Updated role for user: " # user.name);
      };
      case (#err(_)) {};
    };

    result;
  };

  public query ({ caller }) func getUserRole(userId : Principal) : async ?Types.UserRole {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };
    AuthLib.getUserRole(users, userId);
  };

  public shared ({ caller }) func removeTeamMember(targetUserId : Principal) : async Types.ApiResult<Types.User> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "removeTeamMember")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "removeTeamMember");

    let result = AuthLib.removeTeamMember(users, caller, targetUserId);

    // Audit logging
    switch (result) {
      case (#ok(user)) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_SETTINGS, caller, user.businessId, "Removed team member: " # user.name);
      };
      case (#err(_)) {};
    };

    result;
  };
};
