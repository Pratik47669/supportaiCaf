import Map "mo:core/Map";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Types "../types";

module {
  public type OtpRecord = Types.OtpRecord;
  public type ApiResult<T> = Types.ApiResult<T>;

  let OTP_EXPIRY_SECONDS : Nat = 600; // 10 minutes

  public func generateOtp(
    otps : Map.Map<Text, OtpRecord>,
    email : Text,
  ) : ApiResult<Text> {
    let now = Int.abs(Time.now());
    // Generate a 6-digit code using time + a random offset
    let timePart = now % 900000;
    let randomOffset = Int.abs(Time.now()) % 100000;
    let rawCode = (timePart + randomOffset) % 900000;
    let code = Int.toText(rawCode + 100000);

    let record : OtpRecord = {
      code = code;
      email = email;
      createdAt = now;
      verified = false;
    };

    otps.add(email, record);
    #ok(code);
  };

  public func verifyOtp(
    otps : Map.Map<Text, OtpRecord>,
    email : Text,
    code : Text,
  ) : ApiResult<Bool> {
    let now = Int.abs(Time.now());

    switch (otps.get(email)) {
      case (?record) {
        let elapsed = (now - record.createdAt) / 1_000_000_000;
        if (elapsed > OTP_EXPIRY_SECONDS) {
          return #err("OTP has expired");
        };
        if (record.code != code) {
          return #err("Invalid OTP code");
        };
        if (record.verified) {
          return #err("OTP already used");
        };
        let updated = { record with verified = true };
        otps.add(email, updated);
        #ok(true);
      };
      case null {
        #err("No OTP found for this email");
      };
    };
  };

  public func getOtpForDisplay(
    otps : Map.Map<Text, OtpRecord>,
    email : Text,
  ) : ?Text {
    switch (otps.get(email)) {
      case (?record) {
        if (record.verified) {
          null;
        } else {
          ?record.code;
        };
      };
      case null { null };
    };
  };

  public func cleanupExpiredOtps(
    otps : Map.Map<Text, OtpRecord>,
    currentTime : Nat,
  ) : Nat {
    var removed = 0;
    let entries = otps.entries();
    for ((email, record) in entries) {
      let elapsed = (currentTime - record.createdAt) / 1_000_000_000;
      if (elapsed > OTP_EXPIRY_SECONDS) {
        otps.remove(email);
        removed += 1;
      };
    };
    removed;
  };
};
