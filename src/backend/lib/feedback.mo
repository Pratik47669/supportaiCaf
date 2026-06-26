import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Types "../types";

module {
  public type Feedback = Types.Feedback;
  public type FeedbackId = Types.FeedbackId;
  public type FeedbackRating = Types.FeedbackRating;
  public type FeedbackStats = Types.FeedbackStats;
  public type MessageId = Types.MessageId;
  public type ConversationId = Types.ConversationId;
  public type ApiResult<T> = Types.ApiResult<T>;

  public func addFeedback(
    feedbacks : Map.Map<FeedbackId, Feedback>,
    nextFeedbackId : { var value : Nat },
    messageId : MessageId,
    conversationId : ConversationId,
    rating : FeedbackRating,
    comment : ?Text,
  ) : ApiResult<Feedback> {
    let id = nextFeedbackId.value;
    nextFeedbackId.value += 1;

    let feedback : Feedback = {
      id = id;
      messageId = messageId;
      conversationId = conversationId;
      rating = rating;
      comment = comment;
      createdAt = Int.abs(Time.now());
    };

    feedbacks.add(id, feedback);
    #ok(feedback);
  };

  public func getFeedbackByConversation(
    feedbacks : Map.Map<FeedbackId, Feedback>,
    conversationId : ConversationId,
  ) : [Feedback] {
    var result : List.List<Feedback> = List.empty<Feedback>();
    for ((_, feedback) in feedbacks.entries()) {
      if (feedback.conversationId == conversationId) {
        result.add(feedback);
      };
    };
    result.toArray();
  };

  public func getFeedbackStats(
    feedbacks : Map.Map<FeedbackId, Feedback>,
  ) : FeedbackStats {
    var total : Nat = 0;
    var thumbsUp : Nat = 0;
    var thumbsDown : Nat = 0;

    for ((_, feedback) in feedbacks.entries()) {
      total += 1;
      switch (feedback.rating) {
        case (#thumbsUp) { thumbsUp += 1 };
        case (#thumbsDown) { thumbsDown += 1 };
      };
    };

    let thumbsUpPercentage = if (total > 0) { (thumbsUp * 100) / total } else { 0 };

    {
      total = total;
      thumbsUp = thumbsUp;
      thumbsDown = thumbsDown;
      thumbsUpPercentage = thumbsUpPercentage;
    };
  };

  public func getFeedbackByMessage(
    feedbacks : Map.Map<FeedbackId, Feedback>,
    messageId : MessageId,
  ) : ?Feedback {
    for ((_, feedback) in feedbacks.entries()) {
      if (feedback.messageId == messageId) {
        return ?feedback;
      };
    };
    null;
  };
};
