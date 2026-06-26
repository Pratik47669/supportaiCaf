import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types";

module {
  public type Business = Types.Business;
  public type BusinessId = Types.BusinessId;
  public type UserId = Types.UserId;
  public type ApiResult<T> = Types.ApiResult<T>;

  public func createBusiness(
    businesses : Map.Map<BusinessId, Business>,
    nextBusinessId : { var value : Nat },
    ownerId : UserId,
    name : Text,
    industry : Text,
    website : ?Text,
    description : Text,
    teamSize : Text,
    logoUrl : ?Text,
    supportEmail : Text,
    phoneNumber : ?Text,
  ) : ApiResult<Business> {
    let id = nextBusinessId.value;
    nextBusinessId.value += 1;

    let business : Business = {
      id = id;
      name = name;
      industry = industry;
      website = website;
      description = description;
      teamSize = teamSize;
      logoUrl = logoUrl;
      supportEmail = supportEmail;
      phoneNumber = phoneNumber;
      ownerId = ownerId;
      createdAt = Int.abs(Time.now());
    };

    businesses.add(id, business);
    #ok(business);
  };

  public func getBusiness(
    businesses : Map.Map<BusinessId, Business>,
    businessId : BusinessId,
  ) : ?Business {
    businesses.get(businessId);
  };

  public func getBusinessByOwner(
    businesses : Map.Map<BusinessId, Business>,
    ownerId : UserId,
  ) : ?Business {
    let entries = businesses.entries();
    for ((_, business) in entries) {
      if (Principal.equal(business.ownerId, ownerId)) {
        return ?business;
      };
    };
    null;
  };

  public func updateBusiness(
    businesses : Map.Map<BusinessId, Business>,
    caller : UserId,
    businessId : BusinessId,
    name : Text,
    industry : Text,
    website : ?Text,
    description : Text,
    teamSize : Text,
    logoUrl : ?Text,
    supportEmail : Text,
    phoneNumber : ?Text,
  ) : ApiResult<Business> {
    switch (businesses.get(businessId)) {
      case (?existing) {
        if (not Principal.equal(existing.ownerId, caller)) {
          return #err("Unauthorized: Only the business owner can update the business");
        };
        let updated = {
          existing with
          name = name;
          industry = industry;
          website = website;
          description = description;
          teamSize = teamSize;
          logoUrl = logoUrl;
          supportEmail = supportEmail;
          phoneNumber = phoneNumber;
        };
        businesses.add(businessId, updated);
        #ok(updated);
      };
      case null {
        #err("Business not found");
      };
    };
  };

  public func deleteBusiness(
    businesses : Map.Map<BusinessId, Business>,
    caller : UserId,
    businessId : BusinessId,
  ) : ApiResult<()> {
    switch (businesses.get(businessId)) {
      case (?existing) {
        if (not Principal.equal(existing.ownerId, caller)) {
          return #err("Unauthorized: Only the business owner can delete the business");
        };
        businesses.remove(businessId);
        #ok(());
      };
      case null {
        #err("Business not found");
      };
    };
  };
};
