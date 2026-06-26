module {
  public type UserId = Principal;
  public type BusinessId = Nat;
  public type Timestamp = Nat;

  public type UserRole = {
    #owner;
    #admin;
    #supportAgent;
    #viewer;
  };

  public type User = {
    id : UserId;
    principal : Principal;
    name : Text;
    email : ?Text;
    role : UserRole;
    businessId : ?BusinessId;
    createdAt : Timestamp;
    isActive : Bool;
  };

  public type Business = {
    id : BusinessId;
    name : Text;
    industry : Text;
    website : ?Text;
    description : Text;
    teamSize : Text;
    logoUrl : ?Text;
    supportEmail : Text;
    phoneNumber : ?Text;
    ownerId : UserId;
    createdAt : Timestamp;
  };

  public type OtpRecord = {
    code : Text;
    email : Text;
    createdAt : Timestamp;
    verified : Bool;
  };

  public type OnboardingStep = {
    #businessInfo;
    #teamSetup;
    #complete;
  };

  public type ApiResult<T> = {
    #ok : T;
    #err : Text;
  };
};
