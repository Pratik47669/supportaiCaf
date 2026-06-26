import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Types "../types";

module {
  public type AuditLog = Types.AuditLog;
  public type AuditEventType = Types.AuditEventType;
  public type ActivityEvent = Types.ActivityEvent;
  public type BusinessId = Types.BusinessId;
  public type Timestamp = Types.Timestamp;

  // Create a new audit log entry
  public func logEvent(
    auditLogs : Map.Map<Nat, AuditLog>,
    nextAuditLogId : { var value : Nat },
    eventType : AuditEventType,
    caller : Principal,
    businessId : ?BusinessId,
    details : Text,
  ) : AuditLog {
    let id = nextAuditLogId.value;
    nextAuditLogId.value += 1;

    let log : AuditLog = {
      id = id;
      eventType = eventType;
      principal = caller;
      businessId = businessId;
      timestamp = Int.abs(Time.now());
      details = details;
    };

    auditLogs.add(id, log);
    log;
  };

  // Get all audit logs (with optional business filter)
  public func getAuditLogs(
    auditLogs : Map.Map<Nat, AuditLog>,
    businessId : ?BusinessId,
    limit : Nat,
  ) : [AuditLog] {
    var result : List.List<AuditLog> = List.empty<AuditLog>();
    let entries = auditLogs.entries();

    for ((_, log) in entries) {
      let shouldInclude = switch (businessId) {
        case (?bid) {
          switch (log.businessId) {
            case (?lbid) { lbid == bid };
            case null { false };
          };
        };
        case null { true };
      };

      if (shouldInclude) {
        result.add(log);
      };
    };

    // Sort by timestamp descending (most recent first)
    let sorted = Array.sort(
      result.toArray(),
      func(a, b) { Int.compare(b.timestamp, a.timestamp) },
    );

    // Apply limit
    if (sorted.size() > limit) {
      var limited : List.List<AuditLog> = List.empty<AuditLog>();
      var i = 0;
      while (i < limit) {
        limited.add(sorted[i]);
        i += 1;
      };
      limited.toArray();
    } else {
      sorted;
    };
  };

  // Get activity timeline for a business (recent events)
  public func getActivityTimeline(
    auditLogs : Map.Map<Nat, AuditLog>,
    businessId : BusinessId,
    hours : Nat,
  ) : [ActivityEvent] {
    let now = Int.abs(Time.now());
    let cutoff = now - (hours * 3600 * 1_000_000_000); // Convert hours to nanoseconds

    var result : List.List<ActivityEvent> = List.empty<ActivityEvent>();
    let entries = auditLogs.entries();

    for ((_, log) in entries) {
      // Filter by business
      let matchesBusiness = switch (log.businessId) {
        case (?lbid) { lbid == businessId };
        case null { false };
      };

      if (matchesBusiness and log.timestamp >= cutoff) {
        let event : ActivityEvent = {
          eventType = log.eventType;
          principal = log.principal;
          timestamp = log.timestamp;
          details = log.details;
        };
        result.add(event);
      };
    };

    // Sort by timestamp descending
    Array.sort<ActivityEvent>(
      result.toArray(),
      func(a, b) { Int.compare(b.timestamp, a.timestamp) },
    );
  };

  // Get audit logs for a specific principal
  public func getAuditLogsByPrincipal(
    auditLogs : Map.Map<Nat, AuditLog>,
    principal : Principal,
    limit : Nat,
  ) : [AuditLog] {
    var result : List.List<AuditLog> = List.empty<AuditLog>();
    let entries = auditLogs.entries();

    for ((_, log) in entries) {
      if (Principal.equal(log.principal, principal)) {
        result.add(log);
      };
    };

    // Sort by timestamp descending
    let sorted = Array.sort(
      result.toArray(),
      func(a, b) { Int.compare(b.timestamp, a.timestamp) },
    );

    // Apply limit
    if (sorted.size() > limit) {
      var limited : List.List<AuditLog> = List.empty<AuditLog>();
      var i = 0;
      while (i < limit) {
        limited.add(sorted[i]);
        i += 1;
      };
      limited.toArray();
    } else {
      sorted;
    };
  };

  // Cleanup old audit logs (keep last N entries per business)
  public func cleanupOldLogs(
    auditLogs : Map.Map<Nat, AuditLog>,
    maxEntriesPerBusiness : Nat,
  ) : Nat {
    var removed = 0;

    // Group by business
    let businessLogs = Map.empty<BusinessId, List.List<AuditLog>>();
    let entries = auditLogs.entries();

    for ((id, log) in entries) {
      switch (log.businessId) {
        case (?bid) {
          switch (businessLogs.get(bid)) {
            case (?list) { list.add(log) };
            case null {
              var newList : List.List<AuditLog> = List.empty<AuditLog>();
              newList.add(log);
              businessLogs.add(bid, newList);
            };
          };
        };
        case null {};
      };
    };

    // For each business, remove excess logs
    for ((bid, logs) in businessLogs.entries()) {
      if (logs.size() > maxEntriesPerBusiness) {
        let sorted = Array.sort(
          logs.toArray(),
          func(a, b) { Int.compare(b.timestamp, a.timestamp) },
        );

        // Keep only the most recent maxEntriesPerBusiness
        var i = maxEntriesPerBusiness;
        while (i < sorted.size()) {
          auditLogs.remove(sorted[i].id);
          removed += 1;
          i += 1;
        };
      };
    };

    removed;
  };
};
