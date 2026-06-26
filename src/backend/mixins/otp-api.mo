import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types";
import OtpLib "../lib/otp";
import SecurityLib "../lib/security";
import AuditLib "../lib/audit";

mixin (
  accessControlState : AccessControl.AccessControlState,
  otps : Map.Map<Text, Types.OtpRecord>,
  rateLimits : Map.Map<Principal, Types.RateLimitEntry>,
  auditLogs : Map.Map<Nat, Types.AuditLog>,
  nextAuditLogId : { var value : Nat },
) {
  public shared ({ caller }) func generateOtp(email : Text) : async Types.ApiResult<Text> {
    // Allow any caller (including anonymous) to generate OTP during registration flow
    // The email itself is the key, not the caller principal

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "generateOtp")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "generateOtp");

    let result = OtpLib.generateOtp(otps, email);

    // Audit logging
    switch (result) {
      case (#ok(_)) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #LOGIN, caller, null, "OTP generated for: " # email);
      };
      case (#err(_)) {};
    };

    result;
  };

  public shared ({ caller }) func verifyOtp(email : Text, code : Text) : async Types.ApiResult<Bool> {
    // Allow any caller (including anonymous) to verify OTP during registration flow

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "verifyOtp")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "verifyOtp");

    let result = OtpLib.verifyOtp(otps, email, code);

    // Audit logging
    switch (result) {
      case (#ok(true)) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #LOGIN, caller, null, "OTP verified for: " # email);
      };
      case (#ok(false)) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #LOGIN, caller, null, "OTP verification failed for: " # email);
      };
      case (#err(_)) {};
    };

    result;
  };

  public query ({ caller }) func getSimulatedOtp(email : Text) : async ?Text {
    if (caller.isAnonymous()) {
      return null;
    };
    OtpLib.getOtpForDisplay(otps, email);
  };
};
