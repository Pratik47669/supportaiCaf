import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types";
import InviteLib "../lib/invite";
import AuthLib "../lib/auth";
import SecurityLib "../lib/security";
import AuditLib "../lib/audit";

mixin (
  accessControlState : AccessControl.AccessControlState,
  invites : Map.Map<Types.InviteId, Types.InviteLink>,
  nextInviteId : { var value : Nat },
  users : Map.Map<Principal, Types.User>,
  rateLimits : Map.Map<Principal, Types.RateLimitEntry>,
  auditLogs : Map.Map<Nat, Types.AuditLog>,
  nextAuditLogId : { var value : Nat },
) {
  public shared ({ caller }) func createInvite(
    businessId : Types.BusinessId,
    code : Text,
    role : Types.UserRole,
    expiresAt : Nat,
  ) : async Types.ApiResult<Types.InviteLink> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "createInvite")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "createInvite");

    // Only owners and admins can create invites
    let callerUser = switch (AuthLib.getUser(users, caller)) {
      case (?u) { u };
      case null { Runtime.trap("User not registered") };
    };

    if (callerUser.role != #owner and callerUser.role != #admin) {
      Runtime.trap("Unauthorized: Only owners and admins can create invites");
    };

    // Verify the caller belongs to the business they're inviting for
    switch (callerUser.businessId) {
      case (?cb) {
        if (cb != businessId) {
          Runtime.trap("Unauthorized: Can only create invites for your own business");
        };
      };
      case null {
        Runtime.trap("Unauthorized: Must belong to a business to create invites");
      };
    };

    let result = InviteLib.createInvite(invites, nextInviteId, caller, businessId, code, role, expiresAt);

    // Audit logging
    switch (result) {
      case (#ok(invite)) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #INVITE_MEMBER, caller, ?businessId, "Invite created with role: " # debug_show(invite.role));
      };
      case (#err(_)) {};
    };

    result;
  };

  public query ({ caller }) func getInvites(businessId : Types.BusinessId) : async [Types.InviteLink] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Verify caller belongs to the business
    let callerUser = switch (AuthLib.getUser(users, caller)) {
      case (?u) { u };
      case null { Runtime.trap("User not registered") };
    };

    switch (callerUser.businessId) {
      case (?cb) {
        if (cb != businessId) {
          Runtime.trap("Unauthorized: Can only view invites for your own business");
        };
      };
      case null {
        Runtime.trap("Unauthorized: Must belong to a business to view invites");
      };
    };

    InviteLib.getInvites(invites, businessId);
  };

  public shared ({ caller }) func revokeInvite(inviteId : Types.InviteId) : async Types.ApiResult<Types.InviteLink> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    InviteLib.revokeInvite(invites, caller, inviteId);
  };

  public shared ({ caller }) func acceptInvite(code : Text) : async Types.ApiResult<Types.InviteLink> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "acceptInvite")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "acceptInvite");

    let result = InviteLib.acceptInvite(invites, users, caller, code);

    // Audit logging
    switch (result) {
      case (#ok(invite)) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #INVITE_MEMBER, caller, ?invite.businessId, "Invite accepted: " # code);
      };
      case (#err(_)) {};
    };

    result;
  };

  public query func getInviteByCode(code : Text) : async ?Types.InviteLink {
    InviteLib.getInviteByCode(invites, code);
  };
};
