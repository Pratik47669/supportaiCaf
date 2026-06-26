import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldActor = {};

  type NewActor = {
    accessControlState : {
      var adminAssigned : Bool;
      userRoles : Map.Map<Principal, {
        #admin;
        #user;
        #guest;
      }>;
    };
    var users : Map.Map<Principal, {
      id : Principal;
      principal : Principal;
      name : Text;
      email : ?Text;
      role : {
        #owner;
        #admin;
        #supportAgent;
        #viewer;
      };
      businessId : ?Nat;
      createdAt : Nat;
      isActive : Bool;
    }>;
    var businesses : Map.Map<Nat, {
      id : Nat;
      name : Text;
      industry : Text;
      website : ?Text;
      description : Text;
      teamSize : Text;
      logoUrl : ?Text;
      supportEmail : Text;
      phoneNumber : ?Text;
      ownerId : Principal;
      createdAt : Nat;
    }>;
    var otps : Map.Map<Text, {
      code : Text;
      email : Text;
      createdAt : Nat;
      verified : Bool;
    }>;
    var nextBusinessId : { var value : Nat };
  };

  public func migration(_old : OldActor) : NewActor {
    {
      accessControlState = {
        var adminAssigned = false;
        userRoles = Map.empty<Principal, {
          #admin;
          #user;
          #guest;
        }>();
      };
      var users = Map.empty<Principal, {
        id : Principal;
        principal : Principal;
        name : Text;
        email : ?Text;
        role : {
          #owner;
          #admin;
          #supportAgent;
          #viewer;
        };
        businessId : ?Nat;
        createdAt : Nat;
        isActive : Bool;
      }>();
      var businesses = Map.empty<Nat, {
        id : Nat;
        name : Text;
        industry : Text;
        website : ?Text;
        description : Text;
        teamSize : Text;
        logoUrl : ?Text;
        supportEmail : Text;
        phoneNumber : ?Text;
        ownerId : Principal;
        createdAt : Nat;
      }>();
      var otps = Map.empty<Text, {
        code : Text;
        email : Text;
        createdAt : Nat;
        verified : Bool;
      }>();
      var nextBusinessId = { var value = 1 };
    };
  };
};
