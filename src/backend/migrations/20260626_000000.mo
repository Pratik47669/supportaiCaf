import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldActor = {
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
    var tickets : Map.Map<Nat, {
      id : Nat;
      title : Text;
      description : Text;
      status : {
        #open;
        #inProgress;
        #resolved;
        #closed;
      };
      priority : {
        #low;
        #medium;
        #high;
        #urgent;
      };
      assignee : ?Principal;
      creator : Principal;
      createdAt : Nat;
      updatedAt : Nat;
      businessId : Nat;
    }>;
    var nextTicketId : { var value : Nat };
    var conversations : Map.Map<Nat, {
      id : Nat;
      title : Text;
      userId : Principal;
      businessId : Nat;
      createdAt : Nat;
      updatedAt : Nat;
    }>;
    var messages : Map.Map<Nat, {
      id : Nat;
      conversationId : Nat;
      role : {
        #user;
        #assistant;
        #bot;
      };
      content : Text;
      timestamp : Nat;
    }>;
    var nextConversationId : { var value : Nat };
    var nextMessageId : { var value : Nat };
    var invites : Map.Map<Nat, {
      id : Nat;
      code : Text;
      role : {
        #owner;
        #admin;
        #supportAgent;
        #viewer;
      };
      businessId : Nat;
      createdBy : Principal;
      expiresAt : Nat;
      used : Bool;
      revokedAt : ?Nat;
    }>;
    var nextInviteId : { var value : Nat };
    var customers : Map.Map<Nat, {
      id : Nat;
      name : Text;
      email : Text;
      businessId : Nat;
      createdAt : Nat;
    }>;
    var nextCustomerId : { var value : Nat };
    var articles : Map.Map<Nat, {
      id : Nat;
      title : Text;
      content : Text;
      category : Text;
      businessId : Nat;
      createdAt : Nat;
      updatedAt : Nat;
    }>;
    var nextArticleId : { var value : Nat };
    var geminiApiKey : { var value : Text };
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      var users = old.users;
      var businesses = old.businesses;
      var otps = old.otps;
      var nextBusinessId = old.nextBusinessId;
      var tickets = Map.empty<Nat, {
        id : Nat;
        title : Text;
        description : Text;
        status : {
          #open;
          #inProgress;
          #resolved;
          #closed;
        };
        priority : {
          #low;
          #medium;
          #high;
          #urgent;
        };
        assignee : ?Principal;
        creator : Principal;
        createdAt : Nat;
        updatedAt : Nat;
        businessId : Nat;
      }>();
      var nextTicketId = { var value = 1 };
      var conversations = Map.empty<Nat, {
        id : Nat;
        title : Text;
        userId : Principal;
        businessId : Nat;
        createdAt : Nat;
        updatedAt : Nat;
      }>();
      var messages = Map.empty<Nat, {
        id : Nat;
        conversationId : Nat;
        role : {
          #user;
          #assistant;
          #bot;
        };
        content : Text;
        timestamp : Nat;
      }>();
      var nextConversationId = { var value = 1 };
      var nextMessageId = { var value = 1 };
      var invites = Map.empty<Nat, {
        id : Nat;
        code : Text;
        role : {
          #owner;
          #admin;
          #supportAgent;
          #viewer;
        };
        businessId : Nat;
        createdBy : Principal;
        expiresAt : Nat;
        used : Bool;
        revokedAt : ?Nat;
      }>();
      var nextInviteId = { var value = 1 };
      var customers = Map.empty<Nat, {
        id : Nat;
        name : Text;
        email : Text;
        businessId : Nat;
        createdAt : Nat;
      }>();
      var nextCustomerId = { var value = 1 };
      var articles = Map.empty<Nat, {
        id : Nat;
        title : Text;
        content : Text;
        category : Text;
        businessId : Nat;
        createdAt : Nat;
        updatedAt : Nat;
      }>();
      var nextArticleId = { var value = 1 };
      var geminiApiKey = { var value = "" };
    };
  };
};
