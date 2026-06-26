import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Types "../types";

module {
  public type InviteLink = Types.InviteLink;
  public type InviteId = Types.InviteId;
  public type ApiResult<T> = Types.ApiResult<T>;
  public type UserId = Types.UserId;
  public type BusinessId = Types.BusinessId;
  public type UserRole = Types.UserRole;

  public func createInvite(
    invites : Map.Map<InviteId, InviteLink>,
    nextInviteId : { var value : Nat },
    caller : UserId,
    businessId : BusinessId,
    code : Text,
    role : UserRole,
    expiresAt : Nat,
  ) : ApiResult<InviteLink> {
    // Check if code already exists
    let entries = invites.entries();
    for ((_, invite) in entries) {
      if (invite.code == code) {
        return #err("Invite code already exists");
      };
    };

    let id = nextInviteId.value;
    nextInviteId.value += 1;

    let invite : InviteLink = {
      id = id;
      code = code;
      role = role;
      businessId = businessId;
      createdBy = caller;
      expiresAt = expiresAt;
      used = false;
      revokedAt = null;
    };

    invites.add(id, invite);
    #ok(invite);
  };

  public func getInvites(
    invites : Map.Map<InviteId, InviteLink>,
    businessId : BusinessId,
  ) : [InviteLink] {
    var result : List.List<InviteLink> = List.empty<InviteLink>();
    let entries = invites.entries();
    for ((_, invite) in entries) {
      if (invite.businessId == businessId) {
        result.add(invite);
      };
    };
    result.toArray();
  };

  public func revokeInvite(
    invites : Map.Map<InviteId, InviteLink>,
    caller : UserId,
    inviteId : InviteId,
  ) : ApiResult<InviteLink> {
    switch (invites.get(inviteId)) {
      case (?invite) {
        if (not Principal.equal(invite.createdBy, caller)) {
          return #err("Unauthorized: Only the creator can revoke this invite");
        };
        if (invite.used) {
          return #err("Invite has already been used");
        };
        if (invite.revokedAt != null) {
          return #err("Invite has already been revoked");
        };
        let updatedInvite = { invite with revokedAt = ?Int.abs(Time.now()) };
        invites.add(inviteId, updatedInvite);
        #ok(updatedInvite);
      };
      case null {
        #err("Invite not found");
      };
    };
  };

  public func acceptInvite(
    invites : Map.Map<InviteId, InviteLink>,
    users : Map.Map<Principal, Types.User>,
    caller : UserId,
    code : Text,
  ) : ApiResult<InviteLink> {
    let now = Int.abs(Time.now());

    // Find invite by code
    let inviteOpt = findInviteByCode(invites, code);
    switch (inviteOpt) {
      case (?invite) {
        // Check if invite is expired
        if (invite.expiresAt < now) {
          return #err("Invite has expired");
        };

        // Check if invite is already used
        if (invite.used) {
          return #err("Invite has already been used");
        };

        // Check if invite is revoked
        if (invite.revokedAt != null) {
          return #err("Invite has been revoked");
        };

        // Update user's business and role
        switch (users.get(caller)) {
          case (?user) {
            let updatedUser = {
              user with
              businessId = ?invite.businessId;
              role = invite.role;
            };
            users.add(caller, updatedUser);
          };
          case null {
            return #err("User not registered");
          };
        };

        // Mark invite as used
        let updatedInvite = { invite with used = true };
        invites.add(invite.id, updatedInvite);
        #ok(updatedInvite);
      };
      case null {
        #err("Invalid invite code");
      };
    };
  };

  public func getInviteByCode(
    invites : Map.Map<InviteId, InviteLink>,
    code : Text,
  ) : ?InviteLink {
    findInviteByCode(invites, code);
  };

  private func findInviteByCode(
    invites : Map.Map<InviteId, InviteLink>,
    code : Text,
  ) : ?InviteLink {
    let entries = invites.entries();
    for ((_, invite) in entries) {
      if (invite.code == code) {
        return ?invite;
      };
    };
    null;
  };
};
