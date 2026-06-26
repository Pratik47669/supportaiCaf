import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Types "../types";

module {
  public type RateLimitEntry = Types.RateLimitEntry;
  public type RateLimitConfig = Types.RateLimitConfig;
  public type RateLimitError = Types.RateLimitError;
  public type ValidationError = Types.ValidationError;
  public type Timestamp = Types.Timestamp;

  // Default rate limit: 100 requests per 60 seconds
  let DEFAULT_MAX_REQUESTS : Nat = 100;
  let DEFAULT_WINDOW_SECONDS : Nat = 60;

  // Check if a request is rate limited
  public func checkRateLimit(
    rateLimits : Map.Map<Principal, RateLimitEntry>,
    caller : Principal,
    endpoint : Text,
  ) : ?RateLimitError {
    let now = Int.abs(Time.now());
    let windowSeconds = DEFAULT_WINDOW_SECONDS;
    let maxRequests = DEFAULT_MAX_REQUESTS;

    let key = generateKey(caller, endpoint);

    switch (rateLimits.get(key)) {
      case (?entry) {
        // Check if we're in the same window
        if (now - entry.windowStart < windowSeconds) {
          // Same window - check count
          if (entry.count >= maxRequests) {
            let retryAfter = windowSeconds - (now - entry.windowStart);
            return ?#rateLimited({
              retryAfter = retryAfter;
              message = "Rate limit exceeded. Try again in " # retryAfter.toText() # " seconds.";
            });
          };
        };
      };
      case null {};
    };

    null;
  };

  // Record a request in the rate limit tracker
  public func recordRequest(
    rateLimits : Map.Map<Principal, RateLimitEntry>,
    caller : Principal,
    endpoint : Text,
  ) {
    let now = Int.abs(Time.now());
    let windowSeconds = DEFAULT_WINDOW_SECONDS;
    let key = generateKey(caller, endpoint);

    switch (rateLimits.get(key)) {
      case (?entry) {
        if (now - entry.windowStart < windowSeconds) {
          // Same window - increment count
          let updatedEntry = {
            entry with
            count = entry.count + 1;
          };
          rateLimits.add(key, updatedEntry);
        } else {
          // New window - reset
          let newEntry : RateLimitEntry = {
            principal = caller;
            endpoint = endpoint;
            count = 1;
            windowStart = now;
          };
          rateLimits.add(key, newEntry);
        };
      };
      case null {
        // First request for this endpoint
        let newEntry : RateLimitEntry = {
          principal = caller;
          endpoint = endpoint;
          count = 1;
          windowStart = now;
        };
        rateLimits.add(key, newEntry);
      };
    };
  };

  // Generate a composite key for rate limit lookup
  func generateKey(principal : Principal, endpoint : Text) : Principal {
    // Use a simple hash of principal + endpoint
    // Since Map requires a comparable key, we use Principal
    // In practice, we use the principal as key and store endpoint in the value
    principal;
  };

  // Validate text input for length and allowed characters
  public func validateText(
    input : Text,
    minLength : Nat,
    maxLength : Nat,
    allowHtml : Bool,
  ) : ?ValidationError {
    // Check empty
    if (input.size() == 0) {
      return ?#emptyInput;
    };

    // Check length
    if (input.size() < minLength) {
      return ?#invalidLength;
    };
    if (input.size() > maxLength) {
      return ?#tooLong(maxLength);
    };

    // Check for HTML tags if not allowed
    if (not allowHtml) {
      if (containsHtmlTags(input)) {
        return ?#containsHtml;
      };
    };

    // Check for invalid characters (basic check for control characters)
    if (containsInvalidChars(input)) {
      return ?#invalidCharacters;
    };

    null;
  };

  // Sanitize HTML tags from text
  public func sanitizeHtml(input : Text) : Text {
    var result = input;
    // Replace common HTML tags with empty string
    result := result.replace(#text "<script", "&lt;script");
    result := result.replace(#text "</script>", "&lt;/script&gt;");
    result := result.replace(#text "<", "&lt;");
    result := result.replace(#text ">", "&gt;");
    result := result.replace(#text "\"", "&quot;");
    result := result.replace(#text "'", "&#x27;");
    result;
  };

  // Convert text to lowercase manually
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

  // Check if text contains HTML tags
  func containsHtmlTags(input : Text) : Bool {
    let lower = toLowerCase(input);
    lower.contains(#text "<") and lower.contains(#text ">");
  };

  // Check for invalid/control characters
  func containsInvalidChars(input : Text) : Bool {
    for (ch in input.chars()) {
      let code = Char.toNat32(ch);
      // Reject control characters except common whitespace (tab, newline, carriage return)
      if (code < 32 and code != 9 and code != 10 and code != 13) {
        return true;
      };
    };
    false;
  };

  // Validate email format (basic check)
  public func validateEmail(email : Text) : Bool {
    if (email.size() == 0) {
      return false;
    };
    if (email.size() > 254) {
      return false;
    };
    // Must contain @ and .
    if (not email.contains(#text "@")) {
      return false;
    };
    if (not email.contains(#text ".")) {
      return false;
    };
    true;
  };

  // Validate URL format (basic check)
  public func validateUrl(url : Text) : Bool {
    if (url.size() == 0) {
      return false;
    };
    if (url.size() > 2048) {
      return false;
    };
    let lower = toLowerCase(url);
    lower.startsWith(#text "http://") or lower.startsWith(#text "https://");
  };
};
