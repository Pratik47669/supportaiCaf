import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Types "../types";

module {
  public type Customer = Types.Customer;
  public type CustomerId = Types.CustomerId;
  public type ApiResult<T> = Types.ApiResult<T>;
  public type BusinessId = Types.BusinessId;
  public type UserId = Types.UserId;
  public type CustomerNote = Types.CustomerNote;

  public func createCustomer(
    customers : Map.Map<CustomerId, Customer>,
    nextCustomerId : { var value : Nat },
    businessId : BusinessId,
    name : Text,
    email : Text,
  ) : ApiResult<Customer> {
    let id = nextCustomerId.value;
    nextCustomerId.value += 1;
    let now = Int.abs(Time.now());

    let customer : Customer = {
      id = id;
      name = name;
      email = email;
      businessId = businessId;
      createdAt = now;
      tags = [];
      notes = [];
      lastInteraction = now;
      totalChats = 0;
    };

    customers.add(id, customer);
    #ok(customer);
  };

  public func getCustomers(
    customers : Map.Map<CustomerId, Customer>,
    businessId : BusinessId,
  ) : [Customer] {
    var result : [Customer] = [];
    for ((_, customer) in customers.entries()) {
      if (customer.businessId == businessId) {
        result := result.concat([customer]);
      };
    };
    result;
  };

  public func getCustomer(
    customers : Map.Map<CustomerId, Customer>,
    customerId : CustomerId,
  ) : ?Customer {
    customers.get(customerId);
  };

  public func updateCustomer(
    customers : Map.Map<CustomerId, Customer>,
    customerId : CustomerId,
    name : ?Text,
    email : ?Text,
  ) : ApiResult<Customer> {
    switch (customers.get(customerId)) {
      case (?existing) {
        let updated = {
          existing with
          name = switch (name) {
            case (?n) { n };
            case null { existing.name };
          };
          email = switch (email) {
            case (?e) { e };
            case null { existing.email };
          };
        };
        customers.add(customerId, updated);
        #ok(updated);
      };
      case null {
        #err("Customer not found");
      };
    };
  };

  public func deleteCustomer(
    customers : Map.Map<CustomerId, Customer>,
    customerId : CustomerId,
  ) : ApiResult<()> {
    switch (customers.get(customerId)) {
      case (?_) {
        customers.remove(customerId);
        #ok(());
      };
      case null {
        #err("Customer not found");
      };
    };
  };

  public func addCustomerTag(
    customers : Map.Map<CustomerId, Customer>,
    customerId : CustomerId,
    tag : Text,
  ) : ApiResult<Customer> {
    switch (customers.get(customerId)) {
      case (?existing) {
        let trimmed = tag;
        // Check if tag already exists
        let alreadyExists = switch (existing.tags.find(func(t : Text) : Bool { t == trimmed })) {
          case (?_) { true };
          case null { false };
        };
        if (alreadyExists) {
          return #err("Tag already exists");
        };
        let updated = { existing with tags = existing.tags.concat([trimmed]) };
        customers.add(customerId, updated);
        #ok(updated);
      };
      case null {
        #err("Customer not found");
      };
    };
  };

  public func removeCustomerTag(
    customers : Map.Map<CustomerId, Customer>,
    customerId : CustomerId,
    tag : Text,
  ) : ApiResult<Customer> {
    switch (customers.get(customerId)) {
      case (?existing) {
        let filtered = existing.tags.filter(func(t : Text) : Bool { t != tag });
        let updated = { existing with tags = filtered };
        customers.add(customerId, updated);
        #ok(updated);
      };
      case null {
        #err("Customer not found");
      };
    };
  };

  public func addCustomerNote(
    customers : Map.Map<CustomerId, Customer>,
    customerId : CustomerId,
    text : Text,
    authorId : UserId,
  ) : ApiResult<Customer> {
    switch (customers.get(customerId)) {
      case (?existing) {
        let note : CustomerNote = {
          text = text;
          createdAt = Int.abs(Time.now());
          authorId = authorId;
        };
        let updated = { existing with notes = existing.notes.concat([note]) };
        customers.add(customerId, updated);
        #ok(updated);
      };
      case null {
        #err("Customer not found");
      };
    };
  };

  public func updateLastInteraction(
    customers : Map.Map<CustomerId, Customer>,
    customerId : CustomerId,
  ) : ApiResult<Customer> {
    switch (customers.get(customerId)) {
      case (?existing) {
        let updated = { existing with lastInteraction = Int.abs(Time.now()) };
        customers.add(customerId, updated);
        #ok(updated);
      };
      case null {
        #err("Customer not found");
      };
    };
  };

  public func incrementTotalChats(
    customers : Map.Map<CustomerId, Customer>,
    customerId : CustomerId,
  ) : ApiResult<Customer> {
    switch (customers.get(customerId)) {
      case (?existing) {
        let updated = { existing with totalChats = existing.totalChats + 1 };
        customers.add(customerId, updated);
        #ok(updated);
      };
      case null {
        #err("Customer not found");
      };
    };
  };
};
