import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Types "../types";

module {
  public type ChatMessage = Types.ChatMessage;
  public type Conversation = Types.Conversation;
  public type MessageId = Types.MessageId;
  public type ConversationId = Types.ConversationId;
  public type ApiResult<T> = Types.ApiResult<T>;
  public type UserId = Types.UserId;
  public type BusinessId = Types.BusinessId;
  public type ChatMessageRole = Types.ChatMessageRole;
  public type Ticket = Types.Ticket;
  public type TicketId = Types.TicketId;

  public func createConversation(
    conversations : Map.Map<ConversationId, Conversation>,
    nextConversationId : { var value : Nat },
    caller : UserId,
    businessId : BusinessId,
    title : Text,
  ) : ApiResult<Conversation> {
    let id = nextConversationId.value;
    nextConversationId.value += 1;
    let now = Int.abs(Time.now());

    let conversation : Conversation = {
      id = id;
      title = title;
      userId = caller;
      businessId = businessId;
      createdAt = now;
      updatedAt = now;
    };

    conversations.add(id, conversation);
    #ok(conversation);
  };

  public func getConversations(
    conversations : Map.Map<ConversationId, Conversation>,
    userId : UserId,
    businessId : BusinessId,
  ) : [Conversation] {
    let entries = conversations.entries();
    var result : List.List<Conversation> = List.empty<Conversation>();
    for ((_, conv) in entries) {
      if (Principal.equal(conv.userId, userId) and conv.businessId == businessId) {
        result.add(conv);
      };
    };
    result.toArray();
  };

  public func getMessages(
    messages : Map.Map<MessageId, ChatMessage>,
    conversationId : ConversationId,
  ) : [ChatMessage] {
    let entries = messages.entries();
    var result : List.List<ChatMessage> = List.empty<ChatMessage>();
    for ((_, msg) in entries) {
      if (msg.conversationId == conversationId) {
        result.add(msg);
      };
    };
    // Sort by timestamp ascending
    result.toArray().sort<ChatMessage>(
      func(a, b) { Nat.compare(a.timestamp, b.timestamp) },
    );
  };

  // Convert text to lowercase manually (same approach as lib/security.mo)
  func toLowerCase(t : Text) : Text {
    var result = "";
    for (ch in t.chars()) {
      let code = Char.toNat32(ch);
      // ASCII uppercase A-Z (65-90) to lowercase a-z (97-122)
      if (code >= 65 and code <= 90) {
        result #= Text.fromChar(Char.fromNat32(code + 32));
      } else {
        result #= Text.fromChar(ch);
      };
    };
    result;
  };

  public func sendMessage(
    messages : Map.Map<MessageId, ChatMessage>,
    conversations : Map.Map<ConversationId, Conversation>,
    nextMessageId : { var value : Nat },
    caller : UserId,
    conversationId : ConversationId,
    role : ChatMessageRole,
    content : Text,
    confidence : ?Float,
  ) : ApiResult<ChatMessage> {
    // Verify conversation exists and caller owns it
    switch (conversations.get(conversationId)) {
      case (?conv) {
        if (not Principal.equal(conv.userId, caller)) {
          return #err("Unauthorized: Not your conversation");
        };
      };
      case null {
        return #err("Conversation not found");
      };
    };

    let id = nextMessageId.value;
    nextMessageId.value += 1;
    let now = Int.abs(Time.now());

    let message : ChatMessage = {
      id = id;
      conversationId = conversationId;
      role = role;
      content = content;
      timestamp = now;
      confidence = confidence;
    };

    messages.add(id, message);

    // Update conversation updatedAt
    switch (conversations.get(conversationId)) {
      case (?conv) {
        let updatedConv = { conv with updatedAt = now };
        conversations.add(conversationId, updatedConv);
      };
      case null {};
    };

    // If this is a user message, generate a simulated AI response
    if (role == #user) {
      let aiMsgId = nextMessageId.value;
      nextMessageId.value += 1;

      let lowerContent = toLowerCase(content);
      let aiResponse = if (lowerContent.contains(#text "hello") or lowerContent.contains(#text "hi")) {
        "Hello! Welcome to our support. How can I assist you today?"
      } else if (lowerContent.contains(#text "ticket") or lowerContent.contains(#text "issue")) {
        "I understand you're experiencing an issue. Could you please provide more details so I can help you better? If needed, I can create a support ticket for you."
      } else {
        "Thank you for reaching out! I'm here to help. Could you please share more details about what you need assistance with?"
      };

      let aiMessage : ChatMessage = {
        id = aiMsgId;
        conversationId = conversationId;
        role = #assistant;
        content = aiResponse;
        timestamp = Int.abs(Time.now());
        confidence = null;
      };
      messages.add(aiMsgId, aiMessage);
    };

    #ok(message);
  };

  public func deleteConversation(
    conversations : Map.Map<ConversationId, Conversation>,
    messages : Map.Map<MessageId, ChatMessage>,
    caller : UserId,
    conversationId : ConversationId,
  ) : ApiResult<()> {
    switch (conversations.get(conversationId)) {
      case (?conv) {
        if (not Principal.equal(conv.userId, caller)) {
          return #err("Unauthorized: Not your conversation");
        };
        conversations.remove(conversationId);

        // Delete all messages in this conversation
        let msgEntries = messages.entries();
        for ((msgId, msg) in msgEntries) {
          if (msg.conversationId == conversationId) {
            messages.remove(msgId);
          };
        };

        #ok(());
      };
      case null {
        #err("Conversation not found");
      };
    };
  };

  // Build chat history text for ticket description
  public func buildChatHistoryText(
    messages : Map.Map<MessageId, ChatMessage>,
    conversationId : ConversationId,
  ) : Text {
    let msgs = getMessages(messages, conversationId);
    var history = "Chat History:\n\n";
    for (msg in msgs.vals()) {
      let roleText = switch (msg.role) {
        case (#user) { "User" };
        case (#assistant) { "AI" };
        case (#bot) { "Bot" };
      };
      history #= roleText # ": " # msg.content # "\n";
    };
    history;
  };

  // Check if confidence is below threshold and create handoff ticket
  public func checkHandoff(
    messages : Map.Map<MessageId, ChatMessage>,
    conversations : Map.Map<ConversationId, Conversation>,
    tickets : Map.Map<TicketId, Ticket>,
    nextTicketId : { var value : Nat },
    conversationId : ConversationId,
    confidence : Float,
    threshold : Float,
  ) : ?Ticket {
    if (confidence >= threshold) {
      return null;
    };

    switch (conversations.get(conversationId)) {
      case (?conv) {
        let chatHistory = buildChatHistoryText(messages, conversationId);
        let now = Int.abs(Time.now());
        let id = nextTicketId.value;
        nextTicketId.value += 1;

        let ticket : Ticket = {
          id = id;
          title = "AI Handoff: Low confidence (" # debug_show(confidence) # ")";
          description = "The AI assistant could not confidently answer the customer's question.\n\n" # chatHistory;
          status = #open;
          priority = #high;
          assignee = null;
          creator = conv.userId;
          customerId = ?conv.userId;
          createdAt = now;
          updatedAt = now;
          businessId = conv.businessId;
          isDeleted = ?false;
        };

        tickets.add(id, ticket);
        ?ticket;
      };
      case null { null };
    };
  };
};
