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
      confidence : ?Float;
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
      tags : [Text];
      notes : [{
        text : Text;
        createdAt : Nat;
        authorId : Principal;
      }];
      lastInteraction : Nat;
      totalChats : Nat;
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
    var chunks : Map.Map<Nat, {
      id : Nat;
      articleId : Nat;
      content : Text;
      chunkIndex : Nat;
      createdAt : Nat;
    }>;
    var nextChunkId : { var value : Nat };
    var embeddings : Map.Map<Nat, {
      chunkId : Nat;
      vector : [Float];
    }>;
    var crawledPages : Map.Map<Nat, {
      id : Nat;
      url : Text;
      title : Text;
      content : Text;
      businessId : Nat;
      createdAt : Nat;
    }>;
    var nextCrawledPageId : { var value : Nat };
    var aiConfigs : Map.Map<Nat, {
      businessId : Nat;
      systemPrompt : Text;
      temperature : Float;
      maxTokens : Nat;
      personality : {
        #friendly;
        #professional;
        #witty;
        #calm;
      };
      tone : {
        #formal;
        #casual;
        #empathetic;
        #direct;
      };
      updatedAt : Nat;
    }>;
    var promptVersions : Map.Map<Nat, {
      id : Nat;
      businessId : Nat;
      versionNumber : Nat;
      systemPrompt : Text;
      createdAt : Nat;
      isActive : Bool;
    }>;
    var nextPromptVersionId : { var value : Nat };
    var rateLimits : Map.Map<Principal, {
      principal : Principal;
      endpoint : Text;
      count : Nat;
      windowStart : Nat;
    }>;
    var auditLogs : Map.Map<Nat, {
      id : Nat;
      eventType : {
        #LOGIN;
        #LOGOUT;
        #CREATE_TICKET;
        #UPDATE_TICKET;
        #DELETE_TICKET;
        #CREATE_CUSTOMER;
        #UPDATE_CUSTOMER;
        #SEND_MESSAGE;
        #UPDATE_SETTINGS;
        #INVITE_MEMBER;
        #EXPORT_DATA;
      };
      principal : Principal;
      businessId : ?Nat;
      timestamp : Nat;
      details : Text;
    }>;
    var nextAuditLogId : { var value : Nat };
    var feedbacks : Map.Map<Nat, {
      id : Nat;
      messageId : Nat;
      conversationId : Nat;
      rating : {
        #thumbsUp;
        #thumbsDown;
      };
      comment : ?Text;
      createdAt : Nat;
    }>;
    var nextFeedbackId : { var value : Nat };
  };

  public func migration(old : OldActor) : NewActor {
    let migratedCustomers = old.customers.map<Nat, {
      id : Nat;
      name : Text;
      email : Text;
      businessId : Nat;
      createdAt : Nat;
    }, {
      id : Nat;
      name : Text;
      email : Text;
      businessId : Nat;
      createdAt : Nat;
      tags : [Text];
      notes : [{
        text : Text;
        createdAt : Nat;
        authorId : Principal;
      }];
      lastInteraction : Nat;
      totalChats : Nat;
    }>(
      func(_id, c) {
        {
          c with
          tags = [];
          notes = [];
          lastInteraction = c.createdAt;
          totalChats = 0;
        };
      }
    );

    let migratedMessages = old.messages.map<Nat, {
      id : Nat;
      conversationId : Nat;
      role : {
        #user;
        #assistant;
        #bot;
      };
      content : Text;
      timestamp : Nat;
    }, {
      id : Nat;
      conversationId : Nat;
      role : {
        #user;
        #assistant;
        #bot;
      };
      content : Text;
      timestamp : Nat;
      confidence : ?Float;
    }>(
      func(_id, m) {
        {
          m with
          confidence = null;
        };
      }
    );

    {
      accessControlState = old.accessControlState;
      var users = old.users;
      var businesses = old.businesses;
      var otps = old.otps;
      var nextBusinessId = old.nextBusinessId;
      var tickets = old.tickets;
      var nextTicketId = old.nextTicketId;
      var conversations = old.conversations;
      var messages = migratedMessages;
      var nextConversationId = old.nextConversationId;
      var nextMessageId = old.nextMessageId;
      var invites = old.invites;
      var nextInviteId = old.nextInviteId;
      var customers = migratedCustomers;
      var nextCustomerId = old.nextCustomerId;
      var articles = old.articles;
      var nextArticleId = old.nextArticleId;
      var geminiApiKey = old.geminiApiKey;
      var chunks = Map.empty<Nat, {
        id : Nat;
        articleId : Nat;
        content : Text;
        chunkIndex : Nat;
        createdAt : Nat;
      }>();
      var nextChunkId = { var value = 0 };
      var embeddings = Map.empty<Nat, {
        chunkId : Nat;
        vector : [Float];
      }>();
      var crawledPages = Map.empty<Nat, {
        id : Nat;
        url : Text;
        title : Text;
        content : Text;
        businessId : Nat;
        createdAt : Nat;
      }>();
      var nextCrawledPageId = { var value = 0 };
      var aiConfigs = Map.empty<Nat, {
        businessId : Nat;
        systemPrompt : Text;
        temperature : Float;
        maxTokens : Nat;
        personality : {
          #friendly;
          #professional;
          #witty;
          #calm;
        };
        tone : {
          #formal;
          #casual;
          #empathetic;
          #direct;
        };
        updatedAt : Nat;
      }>();
      var promptVersions = Map.empty<Nat, {
        id : Nat;
        businessId : Nat;
        versionNumber : Nat;
        systemPrompt : Text;
        createdAt : Nat;
        isActive : Bool;
      }>();
      var nextPromptVersionId = { var value = 0 };
      var rateLimits = Map.empty<Principal, {
        principal : Principal;
        endpoint : Text;
        count : Nat;
        windowStart : Nat;
      }>();
      var auditLogs = Map.empty<Nat, {
        id : Nat;
        eventType : {
          #LOGIN;
          #LOGOUT;
          #CREATE_TICKET;
          #UPDATE_TICKET;
          #DELETE_TICKET;
          #CREATE_CUSTOMER;
          #UPDATE_CUSTOMER;
          #SEND_MESSAGE;
          #UPDATE_SETTINGS;
          #INVITE_MEMBER;
          #EXPORT_DATA;
        };
        principal : Principal;
        businessId : ?Nat;
        timestamp : Nat;
        details : Text;
      }>();
      var nextAuditLogId = { var value = 0 };
      var feedbacks = Map.empty<Nat, {
        id : Nat;
        messageId : Nat;
        conversationId : Nat;
        rating : {
          #thumbsUp;
          #thumbsDown;
        };
        comment : ?Text;
        createdAt : Nat;
      }>();
      var nextFeedbackId = { var value = 0 };
    };
  };
};
