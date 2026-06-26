import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types";

module {
  public type User = Types.User;
  public type UserRole = Types.UserRole;
  public type BusinessId = Types.BusinessId;
  public type ApiResult<T> = Types.ApiResult<T>;

  public func registerUser(
    users : Map.Map<Principal, User>,
    caller : Principal,
    name : Text,
    email : ?Text,
  ) : ApiResult<User> {
    switch (users.get(caller)) {
      case (?_) {
        #err("User already registered");
      };
      case null {
        let isFirstUser = users.size() == 0;
        let role = if (isFirstUser) { #owner } else { #viewer };
        let user : User = {
          id = caller;
          principal = caller;
          name = name;
          email = email;
          role = role;
          businessId = null;
          createdAt = Int.abs(Time.now());
          isActive = true;
        };
        users.add(caller, user);
        #ok(user);
      };
    };
  };

  public func getUser(
    users : Map.Map<Principal, User>,
    userId : Principal,
  ) : ?User {
    users.get(userId);
  };

  public func updateUserRole(
    users : Map.Map<Principal, User>,
    caller : Principal,
    targetUserId : Principal,
    newRole : UserRole,
  ) : ApiResult<User> {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Caller not registered") };
    };

    if (callerUser.role != #owner and callerUser.role != #admin) {
      return #err("Unauthorized: Only owners and admins can update roles");
    };

    let targetUser = switch (users.get(targetUserId)) {
      case (?u) { u };
      case null { return #err("Target user not found") };
    };

    // Owner can update anyone in the same business
    // Admin can update support agents and viewers in the same business
    if (callerUser.role == #admin) {
      if (targetUser.role == #owner or targetUser.role == #admin) {
        return #err("Unauthorized: Admins cannot update owner or admin roles");
      };
    };

    // Must be in the same business (or target has no business yet)
    switch (callerUser.businessId, targetUser.businessId) {
      case (?cb, ?tb) {
        if (cb != tb) {
          return #err("Unauthorized: Users must be in the same business");
        };
      };
      case (?_cb, null) {
        // target has no business, ok if caller is owner
        if (callerUser.role != #owner) {
          return #err("Unauthorized: Only owners can assign roles to users outside the business");
        };
      };
      case (null, _) {
        return #err("Unauthorized: Caller must belong to a business");
      };
    };

    let updatedUser = { targetUser with role = newRole };
    users.add(targetUserId, updatedUser);
    #ok(updatedUser);
  };

  public func getUserRole(
    users : Map.Map<Principal, User>,
    userId : Principal,
  ) : ?UserRole {
    switch (users.get(userId)) {
      case (?u) { ?u.role };
      case null { null };
    };
  };

  public func isBusinessOwner(
    users : Map.Map<Principal, User>,
    userId : Principal,
  ) : Bool {
    switch (users.get(userId)) {
      case (?u) { u.role == #owner };
      case null { false };
    };
  };

  public func removeTeamMember(
    users : Map.Map<Principal, User>,
    caller : Principal,
    targetUserId : Principal,
  ) : ApiResult<User> {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Caller not registered") };
    };

    if (callerUser.role != #owner and callerUser.role != #admin) {
      return #err("Unauthorized: Only owners and admins can remove team members");
    };

    let targetUser = switch (users.get(targetUserId)) {
      case (?u) { u };
      case null { return #err("Target user not found") };
    };

    // Cannot remove the business owner
    if (targetUser.role == #owner) {
      return #err("Unauthorized: Cannot remove the business owner");
    };

    // Must be in the same business
    switch (callerUser.businessId, targetUser.businessId) {
      case (?cb, ?tb) {
        if (cb != tb) {
          return #err("Unauthorized: Users must be in the same business");
        };
      };
      case (_, _) {
        return #err("Unauthorized: Both users must belong to a business");
      };
    };

    // Remove business association from the target user
    let updatedUser = { targetUser with businessId = null };
    users.add(targetUserId, updatedUser);
    #ok(updatedUser);
  };

  public func assignBusiness(
    users : Map.Map<Principal, User>,
    userId : Principal,
    businessId : BusinessId,
  ) : ApiResult<User> {
    switch (users.get(userId)) {
      case (?user) {
        let updatedUser = { user with businessId = ?businessId };
        users.add(userId, updatedUser);
        #ok(updatedUser);
      };
      case null {
        #err("User not found");
      };
    };
  };
};
