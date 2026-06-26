import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Types "../types";

module {
  public type Ticket = Types.Ticket;
  public type TicketId = Types.TicketId;
  public type ApiResult<T> = Types.ApiResult<T>;
  public type UserId = Types.UserId;
  public type BusinessId = Types.BusinessId;
  public type TicketStatus = Types.TicketStatus;
  public type TicketPriority = Types.TicketPriority;

  public func createTicket(
    tickets : Map.Map<TicketId, Ticket>,
    nextTicketId : { var value : Nat },
    title : Text,
    description : Text,
    priority : TicketPriority,
    status : TicketStatus,
    customerId : ?UserId,
    businessId : BusinessId,
    createdBy : UserId,
  ) : ApiResult<Ticket> {
    let id = nextTicketId.value;
    nextTicketId.value += 1;

    let now = Int.abs(Time.now());

    let ticket : Ticket = {
      id = id;
      title = title;
      description = description;
      status = status;
      priority = priority;
      assignee = null;
      creator = createdBy;
      customerId = customerId;
      createdAt = now;
      updatedAt = now;
      businessId = businessId;
      isDeleted = ?false;
    };

    tickets.add(id, ticket);
    #ok(ticket);
  };

  public func createHandoffTicket(
    tickets : Map.Map<TicketId, Ticket>,
    nextTicketId : { var value : Nat },
    caller : UserId,
    businessId : BusinessId,
    description : Text,
    confidence : Float,
  ) : ApiResult<Ticket> {
    let id = nextTicketId.value;
    nextTicketId.value += 1;
    let now = Int.abs(Time.now());

    let ticket : Ticket = {
      id = id;
      title = "AI Handoff: Low confidence (" # debug_show(confidence) # ")";
      description = description;
      status = #open;
      priority = #high;
      assignee = null;
      creator = caller;
      customerId = ?caller;
      createdAt = now;
      updatedAt = now;
      businessId = businessId;
      isDeleted = ?false;
    };

    tickets.add(id, ticket);
    #ok(ticket);
  };

  public func getTicket(
    tickets : Map.Map<TicketId, Ticket>,
    ticketId : TicketId,
  ) : ?Ticket {
    tickets.get(ticketId);
  };

  public func getTickets(
    tickets : Map.Map<TicketId, Ticket>,
    businessId : BusinessId,
  ) : [Ticket] {
    var result : List.List<Ticket> = List.empty<Ticket>();
    for ((_, ticket) in tickets.entries()) {
      if (ticket.businessId == businessId and ticket.isDeleted != ?true) {
        result.add(ticket);
      };
    };
    result.toArray();
  };

  public func updateTicket(
    tickets : Map.Map<TicketId, Ticket>,
    caller : UserId,
    ticketId : TicketId,
    title : ?Text,
    description : ?Text,
    status : ?TicketStatus,
    priority : ?TicketPriority,
    assignee : ?UserId,
  ) : ApiResult<Ticket> {
    switch (tickets.get(ticketId)) {
      case (?existing) {
        let updated : Ticket = {
          existing with
          title = switch (title) { case (?t) { t }; case null { existing.title } };
          description = switch (description) { case (?d) { d }; case null { existing.description } };
          status = switch (status) { case (?s) { s }; case null { existing.status } };
          priority = switch (priority) { case (?p) { p }; case null { existing.priority } };
          assignee = switch (assignee) { case (?a) { ?a }; case null { existing.assignee } };
          updatedAt = Int.abs(Time.now());
        };
        tickets.add(ticketId, updated);
        #ok(updated);
      };
      case null {
        #err("Ticket not found");
      };
    };
  };

  public func deleteTicket(
    tickets : Map.Map<TicketId, Ticket>,
    caller : UserId,
    ticketId : TicketId,
  ) : ApiResult<()> {
    switch (tickets.get(ticketId)) {
      case (?existing) {
        // Only creator or assignee can delete
        if (not Principal.equal(existing.creator, caller)) {
          switch (existing.assignee) {
            case (?a) {
              if (not Principal.equal(a, caller)) {
                return #err("Unauthorized: Only the creator or assignee can delete this ticket");
              };
            };
            case null {
              return #err("Unauthorized: Only the creator can delete this ticket");
            };
          };
        };
        let updated : Ticket = {
          existing with
          isDeleted = ?true;
          updatedAt = Int.abs(Time.now());
        };
        tickets.add(ticketId, updated);
        #ok(());
      };
      case null {
        #err("Ticket not found");
      };
    };
  };
};
