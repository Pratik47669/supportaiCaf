import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types";
import BusinessLib "../lib/business";
import AuthLib "../lib/auth";
import SecurityLib "../lib/security";
import AuditLib "../lib/audit";

mixin (
  accessControlState : AccessControl.AccessControlState,
  businesses : Map.Map<Types.BusinessId, Types.Business>,
  nextBusinessId : { var value : Nat },
  users : Map.Map<Principal, Types.User>,
  rateLimits : Map.Map<Principal, Types.RateLimitEntry>,
  auditLogs : Map.Map<Nat, Types.AuditLog>,
  nextAuditLogId : { var value : Nat },
) {
  public shared ({ caller }) func createBusiness(
    name : Text,
    industry : Text,
    website : ?Text,
    description : Text,
    teamSize : Text,
    logoUrl : ?Text,
    supportEmail : Text,
    phoneNumber : ?Text,
  ) : async Types.ApiResult<Types.Business> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "createBusiness")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "createBusiness");

    // Check if user already has a business
    switch (BusinessLib.getBusinessByOwner(businesses, caller)) {
      case (?_) {
        return #err("User already has a business");
      };
      case null {};
    };

    // Check if user is registered
    switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        if (user.role != #owner) {
          return #err("Only owners can create a business");
        };
      };
      case null {
        return #err("User must be registered first");
      };
    };

    let result = BusinessLib.createBusiness(
      businesses,
      nextBusinessId,
      caller,
      name,
      industry,
      website,
      description,
      teamSize,
      logoUrl,
      supportEmail,
      phoneNumber,
    );

    // Assign business to the owner and audit log
    switch (result) {
      case (#ok(business)) {
        ignore AuthLib.assignBusiness(users, caller, business.id);
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_SETTINGS, caller, ?business.id, "Business created: " # business.name);
        #ok(business);
      };
      case (#err(e)) {
        #err(e);
      };
    };
  };

  public query ({ caller }) func getBusiness(businessId : Types.BusinessId) : async ?Types.Business {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };
    BusinessLib.getBusiness(businesses, businessId);
  };

  public query ({ caller }) func getMyBusiness() : async ?Types.Business {
    if (caller.isAnonymous()) {
      return null;
    };
    BusinessLib.getBusinessByOwner(businesses, caller);
  };

  public shared ({ caller }) func updateBusiness(
    businessId : Types.BusinessId,
    name : Text,
    industry : Text,
    website : ?Text,
    description : Text,
    teamSize : Text,
    logoUrl : ?Text,
    supportEmail : Text,
    phoneNumber : ?Text,
  ) : async Types.ApiResult<Types.Business> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "updateBusiness")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "updateBusiness");

    let result = BusinessLib.updateBusiness(
      businesses,
      caller,
      businessId,
      name,
      industry,
      website,
      description,
      teamSize,
      logoUrl,
      supportEmail,
      phoneNumber,
    );

    // Audit logging
    switch (result) {
      case (#ok(business)) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_SETTINGS, caller, ?businessId, "Business updated: " # business.name);
      };
      case (#err(_)) {};
    };

    result;
  };

  public shared ({ caller }) func deleteBusiness(businessId : Types.BusinessId) : async Types.ApiResult<()> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "deleteBusiness")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "deleteBusiness");

    let result = BusinessLib.deleteBusiness(businesses, caller, businessId);

    // Audit logging
    switch (result) {
      case (#ok(())) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_SETTINGS, caller, ?businessId, "Business deleted: " # Nat.toText(businessId));
      };
      case (#err(_)) {};
    };

    result;
  };
};
