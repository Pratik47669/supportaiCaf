import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Types "../types";

module {
  public type AnalyticsSnapshot = Types.AnalyticsSnapshot;
  public type AiAnalytics = Types.AiAnalytics;
  public type TicketAnalytics = Types.TicketAnalytics;
  public type TeamAnalytics = Types.TeamAnalytics;
  public type TeamMemberAnalytics = Types.TeamMemberAnalytics;
  public type ApiResult<T> = Types.ApiResult<T>;
  public type BusinessId = Types.BusinessId;
  public type Ticket = Types.Ticket;
  public type Conversation = Types.Conversation;
  public type ConversationId = Types.ConversationId;
  public type MessageId = Types.MessageId;
  public type ChatMessage = Types.ChatMessage;
  public type User = Types.User;
  public type InviteLink = Types.InviteLink;
  public type Feedback = Types.Feedback;

  // Helper: filter entries by businessId and time period
  func filterByBusinessAndTime<T>(
    entries : [(Nat, T)],
    getBusinessId : T -> BusinessId,
    getTimestamp : T -> Nat,
    businessId : BusinessId,
    periodStart : Nat,
    periodEnd : Nat,
  ) : [T] {
    let filtered = entries.filter(
      func((_, item)) {
        getBusinessId(item) == businessId and getTimestamp(item) >= periodStart and getTimestamp(item) <= periodEnd;
      }
    );
    // Extract just the values from the (key, value) tuples
    filtered.map<(Nat, T), T>(func((_, item)) { item });
  };

  public func getOverview(
    tickets : Map.Map<Nat, Ticket>,
    conversations : Map.Map<Nat, Conversation>,
    messages : Map.Map<Nat, ChatMessage>,
    users : Map.Map<Principal, User>,
    businessId : BusinessId,
    periodStart : Nat,
    periodEnd : Nat,
  ) : ApiResult<AnalyticsSnapshot> {
    let ticketList = filterByBusinessAndTime(
      tickets.entries().toArray(),
      func(t) { t.businessId },
      func(t) { t.createdAt },
      businessId,
      periodStart,
      periodEnd,
    );

    let convList = filterByBusinessAndTime(
      conversations.entries().toArray(),
      func(c) { c.businessId },
      func(c) { c.createdAt },
      businessId,
      periodStart,
      periodEnd,
    );

    let msgList = filterByBusinessAndTime(
      messages.entries().toArray(),
      func(m) {
        // Find conversation for this message to get businessId
        switch (conversations.get(m.conversationId)) {
          case (?conv) { conv.businessId };
          case null { 0 };
        };
      },
      func(m) { m.timestamp },
      businessId,
      periodStart,
      periodEnd,
    );

    let openTickets = ticketList.filter(func(t) { t.status == #open or t.status == #inProgress }).size();
    let resolvedTickets = ticketList.filter(func(t) { t.status == #resolved or t.status == #closed }).size();

    // Calculate average resolution time for resolved tickets
    var totalResolutionTime : Nat = 0;
    var resolvedCount : Nat = 0;
    for (t in ticketList.vals()) {
      if (t.status == #resolved or t.status == #closed) {
        let resolutionTime = Int.abs(t.updatedAt : Int - t.createdAt : Int);
        totalResolutionTime += resolutionTime;
        resolvedCount += 1;
      };
    };
    let avgResolutionTime = if (resolvedCount > 0) { totalResolutionTime / resolvedCount } else { 0 };

    // Count AI interactions (assistant messages)
    let aiInteractions = msgList.filter(func(m) { m.role == #assistant }).size();

    // Count team members for this business
    let teamSize = users.entries().toArray().filter(
      func((_, u)) {
        switch (u.businessId) {
          case (?ub) { ub == businessId };
          case null { false };
        };
      }
    ).size();

    #ok({
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
    });
  };

  public func getAiAnalytics(
    conversations : Map.Map<Nat, Conversation>,
    messages : Map.Map<Nat, ChatMessage>,
    feedbacks : Map.Map<Nat, Feedback>,
    businessId : BusinessId,
    periodStart : Nat,
    periodEnd : Nat,
  ) : ApiResult<AiAnalytics> {
    let convList = filterByBusinessAndTime(
      conversations.entries().toArray(),
      func(c) { c.businessId },
      func(c) { c.createdAt },
      businessId,
      periodStart,
      periodEnd,
    );

    // Get all messages for conversations in this business and period
    let conversationIds = convList.map(func(c) { c.id });
    let allMessages = messages.entries().toArray().filter(
      func((_, m)) {
        conversationIds.contains(m.conversationId) and m.timestamp >= periodStart and m.timestamp <= periodEnd;
      }
    );

    let assistantMessages = allMessages.filter(func((_, m)) { m.role == #assistant }).size();

    // Calculate average messages per conversation
    let avgMessagesPerConversation = if (convList.size() > 0) {
      allMessages.size() / convList.size()
    } else { 0 };

    // Calculate average response time (time between user message and next assistant message)
    var totalResponseTime : Nat = 0;
    var responseCount : Nat = 0;

    for (conv in convList.vals()) {
      let convMessages = allMessages.filter(func((_, m)) { m.conversationId == conv.id });
      // Extract values from tuples for indexing
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

    // Count feedback (thumbs up/down) for messages in this business and period
    var thumbsUp : Nat = 0;
    var thumbsDown : Nat = 0;
    for ((_, feedback) in feedbacks.entries()) {
      // Only count feedback for messages in the filtered conversations and period
      if (
        conversationIds.contains(feedback.conversationId) and
        feedback.createdAt >= periodStart and
        feedback.createdAt <= periodEnd
      ) {
        switch (feedback.rating) {
          case (#thumbsUp) { thumbsUp += 1 };
          case (#thumbsDown) { thumbsDown += 1 };
        };
      };
    };

    #ok({
      totalConversations = convList.size();
      totalMessages = allMessages.size();
      assistantMessages = assistantMessages;
      avgMessagesPerConversation = avgMessagesPerConversation;
      avgResponseTime = avgResponseTime;
      thumbsUp = thumbsUp;
      thumbsDown = thumbsDown;
      periodStart = periodStart;
      periodEnd = periodEnd;
    });
  };

  public func getTicketAnalytics(
    tickets : Map.Map<Nat, Ticket>,
    businessId : BusinessId,
    periodStart : Nat,
    periodEnd : Nat,
  ) : ApiResult<TicketAnalytics> {
    let ticketList = filterByBusinessAndTime(
      tickets.entries().toArray(),
      func(t) { t.businessId },
      func(t) { t.createdAt },
      businessId,
      periodStart,
      periodEnd,
    );

    let open = ticketList.filter(func(t) { t.status == #open }).size();
    let inProgress = ticketList.filter(func(t) { t.status == #inProgress }).size();
    let resolved = ticketList.filter(func(t) { t.status == #resolved }).size();
    let closed = ticketList.filter(func(t) { t.status == #closed }).size();

    let low = ticketList.filter(func(t) { t.priority == #low }).size();
    let medium = ticketList.filter(func(t) { t.priority == #medium }).size();
    let high = ticketList.filter(func(t) { t.priority == #high }).size();
    let urgent = ticketList.filter(func(t) { t.priority == #urgent }).size();

    // Average resolution time
    var totalResolutionTime : Nat = 0;
    var resolvedCount : Nat = 0;
    for (t in ticketList.vals()) {
      if (t.status == #resolved or t.status == #closed) {
        let resolutionTime = Int.abs(t.updatedAt : Int - t.createdAt : Int);
        totalResolutionTime += resolutionTime;
        resolvedCount += 1;
      };
    };
    let avgResolutionTime = if (resolvedCount > 0) { totalResolutionTime / resolvedCount } else { 0 };

    #ok({
      total = ticketList.size();
      open = open;
      inProgress = inProgress;
      resolved = resolved;
      closed = closed;
      avgResolutionTime = avgResolutionTime;
      byPriority = { low = low; medium = medium; high = high; urgent = urgent };
      periodStart = periodStart;
      periodEnd = periodEnd;
    });
  };

  public func getTeamAnalytics(
    users : Map.Map<Principal, User>,
    tickets : Map.Map<Nat, Ticket>,
    invites : Map.Map<Nat, InviteLink>,
    businessId : BusinessId,
  ) : ApiResult<TeamAnalytics> {
    // Get all team members for this business
    let teamMembers = users.entries().toArray().filter(
      func((_, u)) {
        switch (u.businessId) {
          case (?ub) { ub == businessId };
          case null { false };
        };
      }
    );

    // Get all tickets for this business
    let businessTickets = tickets.entries().toArray().filter(
      func((_, t)) { t.businessId == businessId }
    );

    // Build analytics per team member
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

    #ok({
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
    });
  };
};
