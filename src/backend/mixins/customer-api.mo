import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types";
import CustomerLib "../lib/customer";
import AuthLib "../lib/auth";
import SecurityLib "../lib/security";
import AuditLib "../lib/audit";

mixin (
  accessControlState : AccessControl.AccessControlState,
  customers : Map.Map<Types.CustomerId, Types.Customer>,
  nextCustomerId : { var value : Nat },
  users : Map.Map<Principal, Types.User>,
  rateLimits : Map.Map<Principal, Types.RateLimitEntry>,
  auditLogs : Map.Map<Nat, Types.AuditLog>,
  nextAuditLogId : { var value : Nat },
) {
  public shared ({ caller }) func createCustomer(
    businessId : Types.BusinessId,
    name : Text,
    email : Text,
  ) : async Types.ApiResult<Types.Customer> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "createCustomer")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "createCustomer");

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
        return #err("User not registered");
      };
    };

    let result = CustomerLib.createCustomer(customers, nextCustomerId, businessId, name, email);

    // Audit logging
    switch (result) {
      case (#ok(customer)) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #CREATE_CUSTOMER, caller, ?businessId, "Customer created: " # customer.name);
      };
      case (#err(_)) {};
    };

    result;
  };

  public query ({ caller }) func getCustomers(businessId : Types.BusinessId) : async [Types.Customer] {
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

    CustomerLib.getCustomers(customers, businessId);
  };

  public query ({ caller }) func getCustomer(customerId : Types.CustomerId) : async ?Types.Customer {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    switch (CustomerLib.getCustomer(customers, customerId)) {
      case (?customer) {
        // Verify caller belongs to the same business as the customer
        switch (AuthLib.getUser(users, caller)) {
          case (?user) {
            switch (user.businessId) {
              case (?ubid) {
                if (ubid != customer.businessId) {
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
        ?customer;
      };
      case null {
        null;
      };
    };
  };

  public shared ({ caller }) func updateCustomer(
    customerId : Types.CustomerId,
    name : ?Text,
    email : ?Text,
  ) : async Types.ApiResult<Types.Customer> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "updateCustomer")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "updateCustomer");

    // Verify caller belongs to the same business as the customer
    let businessId = switch (CustomerLib.getCustomer(customers, customerId)) {
      case (?customer) {
        switch (AuthLib.getUser(users, caller)) {
          case (?user) {
            switch (user.businessId) {
              case (?ubid) {
                if (ubid != customer.businessId) {
                  return #err("Unauthorized: Caller does not belong to this business");
                };
                ?customer.businessId;
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
      };
      case null {
        return #err("Customer not found");
      };
    };

    let result = CustomerLib.updateCustomer(customers, customerId, name, email);

    // Audit logging
    switch (result) {
      case (#ok(customer)) {
        switch (businessId) {
          case (?bid) {
            ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_CUSTOMER, caller, ?bid, "Customer updated: " # customer.name);
          };
          case null {};
        };
      };
      case (#err(_)) {};
    };

    result;
  };

  public shared ({ caller }) func deleteCustomer(customerId : Types.CustomerId) : async Types.ApiResult<()> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "deleteCustomer")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "deleteCustomer");

    // Verify caller belongs to the same business as the customer
    let businessId = switch (CustomerLib.getCustomer(customers, customerId)) {
      case (?customer) {
        switch (AuthLib.getUser(users, caller)) {
          case (?user) {
            switch (user.businessId) {
              case (?ubid) {
                if (ubid != customer.businessId) {
                  return #err("Unauthorized: Caller does not belong to this business");
                };
                ?customer.businessId;
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
      };
      case null {
        return #err("Customer not found");
      };
    };

    let result = CustomerLib.deleteCustomer(customers, customerId);

    // Audit logging
    switch (result) {
      case (#ok(())) {
        switch (businessId) {
          case (?bid) {
            ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_CUSTOMER, caller, ?bid, "Customer deleted: " # Nat.toText(customerId));
          };
          case null {};
        };
      };
      case (#err(_)) {};
    };

    result;
  };

  public shared ({ caller }) func addCustomerTag(
    customerId : Types.CustomerId,
    tag : Text,
  ) : async Types.ApiResult<Types.Customer> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "addCustomerTag")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "addCustomerTag");

    // Verify caller belongs to the same business as the customer
    switch (CustomerLib.getCustomer(customers, customerId)) {
      case (?customer) {
        switch (AuthLib.getUser(users, caller)) {
          case (?user) {
            switch (user.businessId) {
              case (?ubid) {
                if (ubid != customer.businessId) {
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
      };
      case null {
        return #err("Customer not found");
      };
    };

    CustomerLib.addCustomerTag(customers, customerId, tag);
  };

  public shared ({ caller }) func removeCustomerTag(
    customerId : Types.CustomerId,
    tag : Text,
  ) : async Types.ApiResult<Types.Customer> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "removeCustomerTag")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "removeCustomerTag");

    // Verify caller belongs to the same business as the customer
    switch (CustomerLib.getCustomer(customers, customerId)) {
      case (?customer) {
        switch (AuthLib.getUser(users, caller)) {
          case (?user) {
            switch (user.businessId) {
              case (?ubid) {
                if (ubid != customer.businessId) {
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
      };
      case null {
        return #err("Customer not found");
      };
    };

    CustomerLib.removeCustomerTag(customers, customerId, tag);
  };

  public shared ({ caller }) func addCustomerNote(
    customerId : Types.CustomerId,
    text : Text,
  ) : async Types.ApiResult<Types.Customer> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "addCustomerNote")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "addCustomerNote");

    // Verify caller belongs to the same business as the customer
    switch (CustomerLib.getCustomer(customers, customerId)) {
      case (?customer) {
        switch (AuthLib.getUser(users, caller)) {
          case (?user) {
            switch (user.businessId) {
              case (?ubid) {
                if (ubid != customer.businessId) {
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
      };
      case null {
        return #err("Customer not found");
      };
    };

    CustomerLib.addCustomerNote(customers, customerId, text, caller);
  };
};
