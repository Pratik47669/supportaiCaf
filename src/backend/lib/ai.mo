import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Types "../types";

module {
  public type ApiResult<T> = Types.ApiResult<T>;
  public type ConversationId = Types.ConversationId;
  public type MessageId = Types.MessageId;
  public type ChatMessage = Types.ChatMessage;
  public type ChatMessageRole = Types.ChatMessageRole;
  public type KnowledgeBaseContext = Types.KnowledgeBaseContext;
  public type SearchResult = Types.SearchResult;

  // Build conversation history for Gemini context
  func buildConversationHistory(
    messages : Map.Map<MessageId, ChatMessage>,
    conversationId : ConversationId,
  ) : [Types.GeminiContent] {
    let allMessages = messages.entries();
    var convMessages : List.List<ChatMessage> = List.empty<ChatMessage>();
    for ((_, msg) in allMessages) {
      if (msg.conversationId == conversationId) {
        convMessages.add(msg);
      };
    };

    // Sort by timestamp
    let sorted = convMessages.toArray().sort(
      func(a, b) { Nat.compare(a.timestamp, b.timestamp) },
    );

    // Convert to Gemini format
    sorted.map<ChatMessage, Types.GeminiContent>(
      func(msg) {
        let role = switch (msg.role) {
          case (#user) { "user" };
          case (#assistant) { "model" };
          case (#bot) { "user" };
        };
        {
          role = role;
          parts = [{ text = msg.content }];
        };
      },
    );
  };

  // Escape a string for JSON
  func jsonEscape(s : Text) : Text {
    var result = "";
    for (ch in s.chars()) {
      let chText = Text.fromChar(ch);
      if (chText == "\"") {
        result #= "\\\"";
      } else if (chText == "\\") {
        result #= "\\\\";
      } else if (chText == "\n") {
        result #= "\\n";
      } else if (chText == "\r") {
        result #= "\\r";
      } else if (chText == "\t") {
        result #= "\\t";
      } else {
        result #= chText;
      };
    };
    result;
  };

  // Build the request body for Gemini API with optional KB context
  func buildGeminiRequestBody(
    messages : Map.Map<MessageId, ChatMessage>,
    conversationId : ConversationId,
    newMessage : Text,
    kbContext : ?KnowledgeBaseContext,
  ) : Text {
    let history = buildConversationHistory(messages, conversationId);

    // Build system instruction with KB context if available
    var systemText = "You are a helpful customer support AI assistant. Be concise, professional, and helpful.";
    switch (kbContext) {
      case (?ctx) {
        if (ctx.relevantChunks.size() > 0) {
          systemText #= "\n\nUse the following knowledge base information to help answer the user's question:\n";
          for (chunk in ctx.relevantChunks.vals()) {
            systemText #= "\n[Source] " # chunk.content # "\n";
          };
          systemText #= "\nIf the knowledge base does not contain the answer, say so clearly.";
        };
      };
      case null {};
    };

    let systemContent : Types.GeminiContent = {
      role = "user";
      parts = [{ text = systemText }];
    };

    let newContent : Types.GeminiContent = {
      role = "user";
      parts = [{ text = newMessage }];
    };

    let allContents = Array.flatten([
      [systemContent],
      history,
      [newContent],
    ]);

    // Simple JSON serialization
    var json = "{\"contents\":[";
    for (i in allContents.keys()) {
      if (i > 0) { json #= "," };
      let content = allContents[i];
      json #= "{\"role\":\"" # content.role # "\",\"parts\":[";
      for (j in content.parts.keys()) {
        if (j > 0) { json #= "," };
        let part = content.parts[j];
        let escaped = jsonEscape(part.text);
        json #= "{\"text\":\"" # escaped # "\"}";
      };
      json #= "]}";
    };
    json #= "]}";
    json;
  };

  // Parse the Gemini response - extract text from JSON
  func parseGeminiResponse(responseText : Text) : ?Text {
    // Look for "text" field in the response
    // Simple parsing: find first occurrence of "text":" and extract until next "
    let prefix = "\"text\":\"";
    let prefixChars = prefix.toArray();
    let chars = responseText.toArray();

    // Search for prefix
    var startIdx : ?Nat = null;
    var i = 0;
    label searchPrefix while (i + prefixChars.size() <= chars.size()) {
      var match = true;
      var j = 0;
      while (j < prefixChars.size()) {
        if (chars[i + j] != prefixChars[j]) {
          match := false;
          j := prefixChars.size();
        } else {
          j += 1;
        };
      };
      if (match) {
        startIdx := ?i;
        break searchPrefix;
      };
      i += 1;
    };

    switch (startIdx) {
      case (?foundIdx) {
        let textStart = foundIdx + prefixChars.size();
        var textEnd = textStart;
        var escaped = false;
        label search while (textEnd < chars.size()) {
          let char = chars[textEnd];
          if (escaped) {
            escaped := false;
            textEnd += 1;
          } else if (char == '\\') {
            escaped := true;
            textEnd += 1;
          } else if (char == '\"') {
            break search;
          } else {
            textEnd += 1;
          };
        };
        if (textEnd > textStart) {
          let sliceSize = Int.abs(textEnd : Int - textStart : Int);
          var builtText = "";
          var k = 0;
          while (k < sliceSize) {
            builtText #= Text.fromChar(chars[textStart + k]);
            k += 1;
          };
          let rawText = builtText;
          // Unescape common sequences
          let unescaped = rawText.replace(#text("\\n"), "\n");
          let unescaped2 = unescaped.replace(#text("\\\""), "\"");
          let unescaped3 = unescaped2.replace(#text("\\\\"), "\\");
          ?unescaped3;
        } else {
          null;
        };
      };
      case null { null };
    };
  };

  public func sendToGemini(
    apiKey : { var value : Text },
    conversations : Map.Map<ConversationId, Types.Conversation>,
    messages : Map.Map<MessageId, ChatMessage>,
    nextMessageId : { var value : Nat },
    conversationId : ConversationId,
    message : Text,
    kbContext : ?KnowledgeBaseContext,
    transform : OutCall.Transform,
  ) : async ApiResult<Text> {
    // Check API key is set
    if (apiKey.value == "") {
      return #err("Gemini API key not configured");
    };

    // Verify conversation exists
    switch (conversations.get(conversationId)) {
      case (?_) {};
      case null {
        return #err("Conversation not found");
      };
    };

    // Store the user message first
    let userMsgId = nextMessageId.value;
    nextMessageId.value += 1;
    let now = Int.abs(Time.now());
    let userMessage : ChatMessage = {
      id = userMsgId;
      conversationId = conversationId;
      role = #user;
      content = message;
      timestamp = now;
      confidence = null;
    };
    messages.add(userMsgId, userMessage);

    // Build request
    let url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" # apiKey.value;
    let body = buildGeminiRequestBody(messages, conversationId, message, kbContext);

    let headers : [OutCall.Header] = [
      { name = "Content-Type"; value = "application/json" },
    ];

    try {
      let response = await OutCall.httpPostRequest(url, headers, body, transform);

      // Parse response
      switch (parseGeminiResponse(response)) {
        case (?aiText) {
          // Store AI response
          let aiMsgId = nextMessageId.value;
          nextMessageId.value += 1;
          let aiMessage : ChatMessage = {
            id = aiMsgId;
            conversationId = conversationId;
            role = #assistant;
            content = aiText;
            timestamp = Int.abs(Time.now());
            confidence = null;
          };
          messages.add(aiMsgId, aiMessage);

          // Update conversation updatedAt
          switch (conversations.get(conversationId)) {
            case (?conv) {
              let updatedConv = { conv with updatedAt = Int.abs(Time.now()) };
              conversations.add(conversationId, updatedConv);
            };
            case null {};
          };

          #ok(aiText);
        };
        case null {
          #err("Failed to parse Gemini response");
        };
      };
    } catch (_e) {
      #err("HTTP outcall failed");
    };
  };

  public func sendToGeminiWithSources(
    apiKey : { var value : Text },
    conversations : Map.Map<ConversationId, Types.Conversation>,
    messages : Map.Map<MessageId, ChatMessage>,
    nextMessageId : { var value : Nat },
    conversationId : ConversationId,
    message : Text,
    kbContext : ?KnowledgeBaseContext,
    sources : [SearchResult],
    transform : OutCall.Transform,
  ) : async ApiResult<Types.AiResponseWithSources> {
    let result = await sendToGemini(apiKey, conversations, messages, nextMessageId, conversationId, message, kbContext, transform);
    switch (result) {
      case (#ok(response)) {
        #ok({ response = response; sources = sources });
      };
      case (#err(err)) {
        #err(err);
      };
    };
  };

  public func setGeminiApiKey(
    apiKey : { var value : Text },
    _caller : Principal,
    key : Text,
  ) : ApiResult<()> {
    apiKey.value := key;
    #ok(());
  };

  public func getGeminiApiKey(
    apiKey : { var value : Text },
  ) : ?Text {
    if (apiKey.value == "") {
      null;
    } else {
      ?apiKey.value;
    };
  };
};
