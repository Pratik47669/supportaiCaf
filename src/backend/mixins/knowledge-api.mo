import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types";
import KnowledgeLib "../lib/knowledge";
import AuthLib "../lib/auth";
import SecurityLib "../lib/security";
import AuditLib "../lib/audit";

mixin (
  accessControlState : AccessControl.AccessControlState,
  articles : Map.Map<Types.ArticleId, Types.KnowledgeBaseArticle>,
  nextArticleId : { var value : Nat },
  chunks : Map.Map<Types.ChunkId, Types.DocumentChunk>,
  embeddings : Map.Map<Types.ChunkId, Types.Embedding>,
  nextChunkId : { var value : Nat },
  crawledPages : Map.Map<Types.CrawledPageId, Types.CrawledPage>,
  nextCrawledPageId : { var value : Nat },
  users : Map.Map<Principal, Types.User>,
  rateLimits : Map.Map<Principal, Types.RateLimitEntry>,
  auditLogs : Map.Map<Nat, Types.AuditLog>,
  nextAuditLogId : { var value : Nat },
) {
  // --- Existing Article CRUD ---

  public shared ({ caller }) func createArticle(
    businessId : Types.BusinessId,
    title : Text,
    content : Text,
    category : Text,
  ) : async Types.ApiResult<Types.KnowledgeBaseArticle> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "createArticle")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "createArticle");

    // Verify caller is registered and belongs to the business
    switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        switch (user.businessId) {
          case (?ubid) {
            if (ubid != businessId) {
              return #err("Unauthorized: Caller does not belong to this business");
            };
          };
          case null {
            return #err("Unauthorized: Caller must belong to a business");
          };
        };
      };
      case null {
        return #err("User must be registered first");
      };
    };

    let result = KnowledgeLib.createArticle(articles, nextArticleId, businessId, title, content, category);

    // If article created successfully, chunk and embed it
    switch (result) {
      case (#ok(article)) {
        ignore KnowledgeLib.createChunksForArticle(chunks, embeddings, nextChunkId, article.id, article.content);
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_SETTINGS, caller, ?businessId, "Article created: " # article.title);
      };
      case (#err(_)) {};
    };

    result;
  };

  public query ({ caller }) func getArticles(businessId : Types.BusinessId) : async [Types.KnowledgeBaseArticle] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };
    KnowledgeLib.getArticles(articles, businessId);
  };

  public query ({ caller }) func getArticle(articleId : Types.ArticleId) : async ?Types.KnowledgeBaseArticle {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };
    KnowledgeLib.getArticle(articles, articleId);
  };

  public shared ({ caller }) func updateArticle(
    articleId : Types.ArticleId,
    title : ?Text,
    content : ?Text,
    category : ?Text,
  ) : async Types.ApiResult<Types.KnowledgeBaseArticle> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "updateArticle")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "updateArticle");

    // Verify caller is registered and belongs to the article's business
    switch (KnowledgeLib.getArticle(articles, articleId)) {
      case (?article) {
        switch (AuthLib.getUser(users, caller)) {
          case (?user) {
            switch (user.businessId) {
              case (?ubid) {
                if (ubid != article.businessId) {
                  return #err("Unauthorized: Caller does not belong to this business");
                };
              };
              case null {
                return #err("Unauthorized: Caller must belong to a business");
              };
            };
          };
          case null {
            return #err("User must be registered first");
          };
        };
      };
      case null {
        return #err("Article not found");
      };
    };

    let result = KnowledgeLib.updateArticle(articles, articleId, title, content, category);

    // If content updated, re-chunk and re-embed
    switch (result) {
      case (#ok(updatedArticle)) {
        switch (content) {
          case (?_) {
            // Content changed - delete old chunks and create new ones
            KnowledgeLib.deleteChunksForArticle(chunks, embeddings, articleId);
            ignore KnowledgeLib.createChunksForArticle(chunks, embeddings, nextChunkId, articleId, updatedArticle.content);
          };
          case null {};
        };
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_SETTINGS, caller, ?updatedArticle.businessId, "Article updated: " # updatedArticle.title);
      };
      case (#err(_)) {};
    };

    result;
  };

  public shared ({ caller }) func deleteArticle(articleId : Types.ArticleId) : async Types.ApiResult<()> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "deleteArticle")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "deleteArticle");

    // Verify caller is registered and belongs to the article's business
    let businessId = switch (KnowledgeLib.getArticle(articles, articleId)) {
      case (?article) {
        switch (AuthLib.getUser(users, caller)) {
          case (?user) {
            switch (user.businessId) {
              case (?ubid) {
                if (ubid != article.businessId) {
                  return #err("Unauthorized: Caller does not belong to this business");
                };
                ?article.businessId;
              };
              case null {
                return #err("Unauthorized: Caller must belong to a business");
              };
            };
          };
          case null {
            return #err("User must be registered first");
          };
        };
      };
      case null {
        return #err("Article not found");
      };
    };

    // Delete chunks first
    KnowledgeLib.deleteChunksForArticle(chunks, embeddings, articleId);

    let result = KnowledgeLib.deleteArticle(articles, articleId);

    // Audit logging
    switch (result) {
      case (#ok(())) {
        switch (businessId) {
          case (?bid) {
            ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_SETTINGS, caller, ?bid, "Article deleted: " # Nat.toText(articleId));
          };
          case null {};
        };
      };
      case (#err(_)) {};
    };

    result;
  };

  // --- RAG: Document Chunking ---

  public shared ({ caller }) func uploadDocumentChunks(
    businessId : Types.BusinessId,
    title : Text,
    content : Text,
    category : Text,
  ) : async Types.ApiResult<Types.KnowledgeBaseArticle> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "uploadDocumentChunks")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "uploadDocumentChunks");

    // Verify caller belongs to the business
    switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        switch (user.businessId) {
          case (?ubid) {
            if (ubid != businessId) {
              return #err("Unauthorized: Caller does not belong to this business");
            };
          };
          case null {
            return #err("Unauthorized: Caller must belong to a business");
          };
        };
      };
      case null {
        return #err("User must be registered first");
      };
    };

    // Create article then chunk it
    let result = KnowledgeLib.createArticle(articles, nextArticleId, businessId, title, content, category);
    switch (result) {
      case (#ok(article)) {
        ignore KnowledgeLib.createChunksForArticle(chunks, embeddings, nextChunkId, article.id, article.content);
        ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_SETTINGS, caller, ?businessId, "Document uploaded and chunked: " # article.title);
      };
      case (#err(_)) {};
    };
    result;
  };

  // --- RAG: Semantic Search ---

  public query ({ caller }) func searchKnowledgeBase(
    businessId : Types.BusinessId,
    queryText : Text,
    topK : Nat,
  ) : async [Types.SearchResult] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Verify caller belongs to the business
    switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        switch (user.businessId) {
          case (?ubid) {
            if (ubid != businessId) {
              Runtime.trap("Unauthorized: Caller does not belong to this business");
            };
          };
          case null {
            Runtime.trap("Unauthorized: Caller must belong to a business");
          };
        };
      };
      case null {
        Runtime.trap("User must be registered first");
      };
    };

    KnowledgeLib.searchKnowledgeBase(chunks, embeddings, businessId, articles, queryText, topK);
  };

  // --- RAG: Website Crawl Simulation ---

  public shared ({ caller }) func crawlWebsite(
    businessId : Types.BusinessId,
    url : Text,
    title : Text,
    content : Text,
  ) : async Types.ApiResult<Types.CrawledPage> {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Rate limiting
    switch (SecurityLib.checkRateLimit(rateLimits, caller, "crawlWebsite")) {
      case (?#rateLimited(err)) { return #err(err.message) };
      case null {};
    };
    SecurityLib.recordRequest(rateLimits, caller, "crawlWebsite");

    // Verify caller belongs to the business
    switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        switch (user.businessId) {
          case (?ubid) {
            if (ubid != businessId) {
              return #err("Unauthorized: Caller does not belong to this business");
            };
          };
          case null {
            return #err("Unauthorized: Caller must belong to a business");
          };
        };
      };
      case null {
        return #err("User must be registered first");
      };
    };

    let page = KnowledgeLib.crawlWebsite(
      crawledPages,
      nextCrawledPageId,
      chunks,
      embeddings,
      nextChunkId,
      businessId,
      url,
      title,
      content,
    );
    ignore AuditLib.logEvent(auditLogs, nextAuditLogId, #UPDATE_SETTINGS, caller, ?businessId, "Website crawled: " # url);
    #ok(page);
  };

  public query ({ caller }) func getCrawledPages(businessId : Types.BusinessId) : async [Types.CrawledPage] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized");
    };

    // Verify caller belongs to the business
    switch (AuthLib.getUser(users, caller)) {
      case (?user) {
        switch (user.businessId) {
          case (?ubid) {
            if (ubid != businessId) {
              Runtime.trap("Unauthorized: Caller does not belong to this business");
            };
          };
          case null {
            Runtime.trap("Unauthorized: Caller must belong to a business");
          };
        };
      };
      case null {
        Runtime.trap("User must be registered first");
      };
    };

    KnowledgeLib.getCrawledPages(crawledPages, businessId);
  };
};
