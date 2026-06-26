import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Types "../types";
import AiLib "../lib/ai";
import AuthLib "../lib/auth";
import KnowledgeLib "../lib/knowledge";
import SecurityLib "../lib/security";
import AuditLib "../lib/audit";

mixin (
  accessControlState : AccessControl.AccessControlState,
  geminiApiKey : { var value : Text },
  conversations : Map.Map<Types.ConversationId, Types.Conversation>,
  messages : Map.Map<Types.MessageId, Types.ChatMessage>,
  nextMessageId : { var value : Nat },
  users : Map.Map<Principal, Types.User>,
  chunks : Map.Map<Types.ChunkId, Types.DocumentChunk>,
  embeddings : Map.Map<Types.ChunkId, Types.Embedding>,
  articles : Map.Map<Types.ArticleId, Types.KnowledgeBaseArticle>,
  rateLimits : Map.Map<Principal, Types.RateLimitEntry>,
  auditLogs : Map.Map<Nat, Types.AuditLog>,
  nextAuditLogId : { var value : Nat },
) {
  public shared ({ caller }) func sendToGemini(
    conversationId : Types.ConversationId,
    message : Text,
  ) : async Types.ApiResult<Text> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "sendToGemini")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "sendToGemini");

    let user = switch (AuthLib.getUser(users, caller)) {
      case (?u) { u };
      case null { Runtime.trap("User not registered") };
    };

    // Verify user owns the conversation
    switch (conversations.get(conversationId)) {
      case (?conv) {
        if (not Principal.equal(conv.userId, caller)) {
          return #err("Unauthorized: Not your conversation");
        };
        // Verify user belongs to the same business as the conversation
        switch (user.businessId) {
          case (?ub) {
            if (ub != conv.businessId) {
              return #err("Unauthorized: Business mismatch");
            };
          };
          case null {
            return #err("Unauthorized: User must belong to a business");
          };
        };
      };
      case null {
        return #err("Conversation not found");
      };
    };

    // Build KB context from the conversation's business
    let kbContext = switch (conversations.get(conversationId)) {
      case (?conv) {
        ?KnowledgeLib.buildKbContext(chunks, embeddings, conv.businessId, articles, message);
      };
      case null { null };
    };

    let result = await AiLib.sendToGemini(geminiApiKey, conversations, messages, nextMessageId, conversationId, message, kbContext, transform);

    // Audit logging
    switch (result) {
      case (#ok(_)) {
        switch (conversations.get(conversationId)) {
          case (?conv) {
            ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #SEND_MESSAGE, caller, ?conv.businessId, "AI message sent in conversation: " # Nat.toText(conversationId));
          };
          case null {};
        };
      };
      case (#err(_)) {};
    };

    result;
  };

  public shared ({ caller }) func sendToGeminiWithSources(
    conversationId : Types.ConversationId,
    message : Text,
  ) : async Types.ApiResult<Types.AiResponseWithSources> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "sendToGeminiWithSources")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "sendToGeminiWithSources");

    let user = switch (AuthLib.getUser(users, caller)) {
      case (?u) { u };
      case null { Runtime.trap("User not registered") };
    };

    // Verify user owns the conversation
    switch (conversations.get(conversationId)) {
      case (?conv) {
        if (not Principal.equal(conv.userId, caller)) {
          return #err("Unauthorized: Not your conversation");
        };
        switch (user.businessId) {
          case (?ub) {
            if (ub != conv.businessId) {
              return #err("Unauthorized: Business mismatch");
            };
          };
          case null {
            return #err("Unauthorized: User must belong to a business");
          };
        };
      };
      case null {
        return #err("Conversation not found");
      };
    };

    // Build KB context and get sources
    let (kbContext, sources) = switch (conversations.get(conversationId)) {
      case (?conv) {
        let ctx = KnowledgeLib.buildKbContext(chunks, embeddings, conv.businessId, articles, message);
        let searchResults = KnowledgeLib.searchKnowledgeBase(chunks, embeddings, conv.businessId, articles, message, 5);
        (?ctx, searchResults);
      };
      case null { (null, []) };
    };

    let result = await AiLib.sendToGeminiWithSources(
      geminiApiKey,
      conversations,
      messages,
      nextMessageId,
      conversationId,
      message,
      kbContext,
      sources,
      transform,
    );

    // Audit logging
    switch (result) {
      case (#ok(_)) {
        switch (conversations.get(conversationId)) {
          case (?conv) {
            ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #SEND_MESSAGE, caller, ?conv.businessId, "AI message with sources sent in conversation: " # Nat.toText(conversationId));
          };
          case null {};
        };
      };
      case (#err(_)) {};
    };

    result;
  };

  public shared ({ caller }) func setGeminiApiKey(key : Text) : async Types.ApiResult<()> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "setGeminiApiKey")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "setGeminiApiKey");

    // Only owner or admin can set API key
    let user = switch (AuthLib.getUser(users, caller)) {
      case (?u) { u };
      case null { Runtime.trap("User not registered") };
    };

    if (user.role != #owner and user.role != #admin) {
      return #err("Unauthorized: Only owners and admins can set the API key");
    };

    let result = AiLib.setGeminiApiKey(geminiApiKey, caller, key);

    // Audit logging
    switch (result) {
      case (#ok(())) {
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_SETTINGS, caller, user.businessId, "Gemini API key updated");
      };
      case (#err(_)) {};
    };

    result;
  };

  public query ({ caller }) func getGeminiApiKey() : async ?Text {
    if (caller.isAnonymous()) {
      return null;
    };

    // Only owner or admin can view API key
    let user = switch (AuthLib.getUser(users, caller)) {
      case (?u) { u };
      case null { return null };
    };

    if (user.role != #owner and user.role != #admin) {
      return null;
    };

    AiLib.getGeminiApiKey(geminiApiKey);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
