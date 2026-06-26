import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types";
import TicketLib "../lib/ticket";
import AuthLib "../lib/auth";
import SecurityLib "../lib/security";
import AuditLib "../lib/audit";

mixin (
  accessControlState : AccessControl.AccessControlState,
  tickets : Map.Map<Types.TicketId, Types.Ticket>,
  nextTicketId : { var value : Nat },
  users : Map.Map<Principal, Types.User>,
  rateLimits : Map.Map<Principal, Types.RateLimitEntry>,
  auditLogs : Map.Map<Nat, Types.AuditLog>,
  nextAuditLogId : { var value : Nat },
) {
  public shared ({ caller }) func createTicket(
    businessId : Types.BusinessId,
    title : Text,
    description : Text,
    priority : Types.TicketPriority,
    status : Types.TicketStatus,
    customerId : ?Types.UserId,
  ) : async Types.ApiResult<Types.Ticket> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "createTicket")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "createTicket");

    // Verify caller is registered and belongs to the business
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

    let result = TicketLib.createTicket(tickets, nextTicketId, title, description, priority, status, customerId, businessId, caller);

    // Audit logging
    switch (result) {
      case (#ok(ticket)) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #CREATE_TICKET, caller, ?businessId, "Ticket created: " # ticket.title);
      };
      case (#err(_)) {};
    };

    result;
  };

  public query ({ caller }) func getTicket(ticketId : Types.TicketId) : async ?Types.Ticket {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    switch (TicketLib.getTicket(tickets, ticketId)) {
      case (?ticket) {
        // Verify caller belongs to the same business
        switch (AuthLib.getUser(users, caller)) {
          case (?user) {
            switch (user.businessId) {
              case (?ubid) {
                if (ubid != ticket.businessId) {
                  return null;
                };
              };
              case null { return null };
            };
          };
          case null { return null };
        };
        ?ticket;
      };
      case null { null };
    };
  };

  public query ({ caller }) func getTickets(businessId : Types.BusinessId) : async [Types.Ticket] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
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

    TicketLib.getTickets(tickets, businessId);
  };

  public shared ({ caller }) func updateTicket(
    ticketId : Types.TicketId,
    title : ?Text,
    description : ?Text,
    status : ?Types.TicketStatus,
    priority : ?Types.TicketPriority,
    assignee : ?Types.UserId,
  ) : async Types.ApiResult<Types.Ticket> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "updateTicket")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "updateTicket");

    // Verify caller is registered and belongs to the same business as the ticket
    switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        switch (user.businessId) {
          case (?ubid) {
            switch (tickets.get(ticketId)) {
              case (?ticket) {
                if (ubid != ticket.businessId) {
                  return #err("Unauthorized: Caller does not belong to this business");
                };
              };
              case null { return #err("Ticket not found") };
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

    let result = TicketLib.updateTicket(tickets, caller, ticketId, title, description, status, priority, assignee);

    // Audit logging
    switch (result) {
      case (#ok(ticket)) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_TICKET, caller, ?ticket.businessId, "Ticket updated: " # ticket.title);
      };
      case (#err(_)) {};
    };

    result;
  };

  public shared ({ caller }) func deleteTicket(ticketId : Types.TicketId) : async Types.ApiResult<()> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "deleteTicket")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "deleteTicket");

    // Verify caller is registered and belongs to the same business as the ticket
    let businessId = switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        switch (user.businessId) {
          case (?ubid) {
            switch (tickets.get(ticketId)) {
              case (?ticket) {
                if (ubid != ticket.businessId) {
                  return #err("Unauthorized: Caller does not belong to this business");
                };
                ?ticket.businessId;
              };
              case null { return #err("Ticket not found") };
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

    let result = TicketLib.deleteTicket(tickets, caller, ticketId);

    // Audit logging
    switch (result) {
      case (#ok(())) {
        switch (businessId) {
          case (?bid) {
            ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #DELETE_TICKET, caller, ?bid, "Ticket deleted: " # ticketId.toText());
          };
          case null {};
        };
      };
      case (#err(_)) {};
    };

    result;
  };
};
