import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Types "../types";

module {
  public type ExportedChat = Types.ExportedChat;
  public type ExportedCustomer = Types.ExportedCustomer;
  public type ExportedTicket = Types.ExportedTicket;
  public type ExportedAnalytics = Types.ExportedAnalytics;
  public type ApiResult<T> = Types.ApiResult<T>;
  public type BusinessId = Types.BusinessId;
  public type Ticket = Types.Ticket;
  public type Customer = Types.Customer;
  public type Conversation = Types.Conversation;
  public type ChatMessage = Types.ChatMessage;
  public type User = Types.User;
  public type InviteLink = Types.InviteLink;

  public func exportChats(
    conversations : Map.Map<Nat, Conversation>,
    messages : Map.Map<Nat, ChatMessage>,
    businessId : BusinessId,
  ) : [ExportedChat] {
    var result : List.List<ExportedChat> = List.empty<ExportedChat>();
    for ((_, conv) in conversations.entries()) {
      if (conv.businessId == businessId) {
        // Get messages for this conversation
        var convMessages : List.List<ChatMessage> = List.empty<ChatMessage>();
        for ((_, msg) in messages.entries()) {
          if (msg.conversationId == conv.id) {
            convMessages.add(msg);
          };
        };
        // Sort messages by timestamp
        let sortedMessages = Array.sort(
          convMessages.toArray(),
          func(a, b) { Nat.compare(a.timestamp, b.timestamp) },
        );

        result.add({
          conversationId = conv.id;
          title = conv.title;
          userId = conv.userId;
          businessId = conv.businessId;
          createdAt = conv.createdAt;
          updatedAt = conv.updatedAt;
          messages = sortedMessages;
        });
      };
    };
    result.toArray();
  };

  public func exportCustomers(
    customers : Map.Map<Nat, Customer>,
    businessId : BusinessId,
  ) : [ExportedCustomer] {
    var result : List.List<ExportedCustomer> = List.empty<ExportedCustomer>();
    for ((_, customer) in customers.entries()) {
      if (customer.businessId == businessId) {
        result.add({
          id = customer.id;
          name = customer.name;
          email = customer.email;
          businessId = customer.businessId;
          createdAt = customer.createdAt;
        });
      };
    };
    result.toArray();
  };

  public func exportTickets(
    tickets : Map.Map<Nat, Ticket>,
    businessId : BusinessId,
  ) : [ExportedTicket] {
    var result : List.List<ExportedTicket> = List.empty<ExportedTicket>();
    for ((_, ticket) in tickets.entries()) {
      if (ticket.businessId == businessId) {
        result.add({
          id = ticket.id;
          title = ticket.title;
          description = ticket.description;
          status = ticket.status;
          priority = ticket.priority;
          assignee = ticket.assignee;
          creator = ticket.creator;
          createdAt = ticket.createdAt;
          updatedAt = ticket.updatedAt;
          businessId = ticket.businessId;
        });
      };
    };
    result.toArray();
  };

  public func exportAnalytics(
    tickets : Map.Map<Nat, Ticket>,
    conversations : Map.Map<Nat, Conversation>,
    messages : Map.Map<Nat, ChatMessage>,
    users : Map.Map<Principal, User>,
    invites : Map.Map<Nat, Types.InviteLink>,
    businessId : BusinessId,
    periodStart : Nat,
    periodEnd : Nat,
  ) : ApiResult<ExportedAnalytics> {
    // Import analytics lib functions inline to avoid circular dependency issues
    let ticketList = tickets.entries().toArray().filter(
      func((_, t)) { t.businessId == businessId and t.createdAt >= periodStart and t.createdAt <= periodEnd }
    );

    let convList = conversations.entries().toArray().filter(
      func((_, c)) { c.businessId == businessId and c.createdAt >= periodStart and c.createdAt <= periodEnd }
    );

    let msgList = messages.entries().toArray().filter(
      func((_, m)) {
        let belongsToBusiness = switch (conversations.get(m.conversationId)) {
          case (?conv) { conv.businessId == businessId };
          case null { false };
        };
        m.timestamp >= periodStart and m.timestamp <= periodEnd and belongsToBusiness;
      }
    );

    let openTickets = ticketList.filter(func((_, t)) { t.status == #open or t.status == #inProgress }).size();
    let resolvedTickets = ticketList.filter(func((_, t)) { t.status == #resolved or t.status == #closed }).size();

    var totalResolutionTime : Nat = 0;
    var resolvedCount : Nat = 0;
    for ((_, t) in ticketList.vals()) {
      if (t.status == #resolved or t.status == #closed) {
        let resolutionTime = Int.abs(t.updatedAt : Int - t.createdAt : Int);
        totalResolutionTime += resolutionTime;
        resolvedCount += 1;
      };
    };
    let avgResolutionTime = if (resolvedCount > 0) { totalResolutionTime / resolvedCount } else { 0 };

    let aiInteractions = msgList.filter(func((_, m)) { m.role == #assistant }).size();

    let teamSize = users.entries().toArray().filter(
      func((_, u)) {
        switch (u.businessId) {
          case (?ub) { ub == businessId };
          case null { false };
        };
      }
    ).size();

    let overview = {
      totalTickets = ticketList.size();
      openTickets = openTickets;
      resolvedTickets = resolvedTickets;
      avgResolutionTime = avgResolutionTime;
      totalConversations = convList.size();
      totalMessages = msgList.size();
      aiInteractions = aiInteractions;
      teamSize = teamSize;
      periodStart = periodStart;
      periodEnd = periodEnd;
    };

    let assistantMessages = msgList.filter(func((_, m)) { m.role == #assistant }).size();

    var totalResponseTime : Nat = 0;
    var responseCount : Nat = 0;

    for ((_, conv) in convList.vals()) {
      let convMessages = msgList.filter(func((_, m)) { m.conversationId == conv.id });
      let convMsgValues = convMessages.map(func((_, m)) { m });
      var i = 0;
      while (i + 1 < convMsgValues.size()) {
        if (convMsgValues[i].role == #user and convMsgValues[i + 1].role == #assistant) {
          let responseTime = if (convMsgValues[i + 1].timestamp > convMsgValues[i].timestamp) {
            convMsgValues[i + 1].timestamp - convMsgValues[i].timestamp;
          } else { 0 };
          totalResponseTime += responseTime;
          responseCount += 1;
        };
        i += 1;
      };
    };

    let avgResponseTime = if (responseCount > 0) { totalResponseTime / responseCount } else { 0 };

    let avgMessagesPerConversation = if (convList.size() > 0) { msgList.size() / convList.size() } else { 0 };

    let aiAnalytics = {
      totalConversations = convList.size();
      totalMessages = msgList.size();
      assistantMessages = assistantMessages;
      avgMessagesPerConversation = avgMessagesPerConversation;
      avgResponseTime = avgResponseTime;
      thumbsUp = 0;
      thumbsDown = 0;
      periodStart = periodStart;
      periodEnd = periodEnd;
    };

    let open = ticketList.filter(func((_, t)) { t.status == #open }).size();
    let inProgress = ticketList.filter(func((_, t)) { t.status == #inProgress }).size();
    let resolved = ticketList.filter(func((_, t)) { t.status == #resolved }).size();
    let closed = ticketList.filter(func((_, t)) { t.status == #closed }).size();

    let low = ticketList.filter(func((_, t)) { t.priority == #low }).size();
    let medium = ticketList.filter(func((_, t)) { t.priority == #medium }).size();
    let high = ticketList.filter(func((_, t)) { t.priority == #high }).size();
    let urgent = ticketList.filter(func((_, t)) { t.priority == #urgent }).size();

    let ticketAnalytics = {
      total = ticketList.size();
      open = open;
      inProgress = inProgress;
      resolved = resolved;
      closed = closed;
      avgResolutionTime = avgResolutionTime;
      byPriority = { low = low; medium = medium; high = high; urgent = urgent };
      periodStart = periodStart;
      periodEnd = periodEnd;
    };

    let teamMembers = users.entries().toArray().filter(
      func((_, u)) {
        switch (u.businessId) {
          case (?ub) { ub == businessId };
          case null { false };
        };
      }
    );

    let businessTickets = tickets.entries().toArray().filter(
      func((_, t)) { t.businessId == businessId }
    );

    let memberAnalytics = teamMembers.map(
      func((principal, user)) {
        let assigned = businessTickets.filter(func((_, t)) {
          switch (t.assignee) {
            case (?a) { Principal.equal(a, principal) };
            case null { false };
          };
        }).size();

        let resolved = businessTickets.filter(func((_, t)) {
          let isAssigned = switch (t.assignee) {
            case (?a) { Principal.equal(a, principal) };
            case null { false };
          };
          isAssigned and (t.status == #resolved or t.status == #closed);
        }).size();

        {
          agentId = principal;
          name = user.name;
          ticketsAssigned = assigned;
          ticketsResolved = resolved;
        };
      }
    );

    let activeMembers = teamMembers.filter(func((_, u)) { u.isActive }).size();

    // Count members by role
    var ownerCount : Nat = 0;
    var adminCount : Nat = 0;
    var supportAgentCount : Nat = 0;
    var viewerCount : Nat = 0;
    for ((_, u) in teamMembers.vals()) {
      switch (u.role) {
        case (#owner) { ownerCount += 1 };
        case (#admin) { adminCount += 1 };
        case (#supportAgent) { supportAgentCount += 1 };
        case (#viewer) { viewerCount += 1 };
      };
    };

    // Count pending invites for this business
    let pendingInvites = invites.entries().toArray().filter(
      func((_, invite)) {
        invite.businessId == businessId and
        not invite.used and
        invite.revokedAt == null
      }
    ).size();

    let teamAnalytics = {
      members = memberAnalytics;
      totalMembers = teamMembers.size();
      activeMembers = activeMembers;
      membersByRole = {
        owner = ownerCount;
        admin = adminCount;
        supportAgent = supportAgentCount;
        viewer = viewerCount;
      };
      pendingInvites = pendingInvites;
    };

    #ok({
      overview = overview;
      aiAnalytics = aiAnalytics;
      ticketAnalytics = ticketAnalytics;
      teamAnalytics = teamAnalytics;
    });
  };
};
