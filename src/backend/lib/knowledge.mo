import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Types "../types";

module {
  public type KnowledgeBaseArticle = Types.KnowledgeBaseArticle;
  public type ArticleId = Types.ArticleId;
  public type ApiResult<T> = Types.ApiResult<T>;
  public type BusinessId = Types.BusinessId;
  public type DocumentChunk = Types.DocumentChunk;
  public type ChunkId = Types.ChunkId;
  public type Embedding = Types.Embedding;
  public type CrawledPage = Types.CrawledPage;
  public type CrawledPageId = Types.CrawledPageId;
  public type SearchResult = Types.SearchResult;
  public type KnowledgeBaseContext = Types.KnowledgeBaseContext;

  // --- Article CRUD ---

  public func createArticle(
    articles : Map.Map<ArticleId, KnowledgeBaseArticle>,
    nextArticleId : { var value : Nat },
    businessId : BusinessId,
    title : Text,
    content : Text,
    category : Text,
  ) : ApiResult<KnowledgeBaseArticle> {
    let id = nextArticleId.value;
    nextArticleId.value += 1;
    let now = Int.abs(Time.now());

    let article : KnowledgeBaseArticle = {
      id = id;
      title = title;
      content = content;
      category = category;
      businessId = businessId;
      createdAt = now;
      updatedAt = now;
    };

    articles.add(id, article);
    #ok(article);
  };

  public func getArticles(
    articles : Map.Map<ArticleId, KnowledgeBaseArticle>,
    businessId : BusinessId,
  ) : [KnowledgeBaseArticle] {
    var result : List.List<KnowledgeBaseArticle> = List.empty<KnowledgeBaseArticle>();
    for ((_, article) in articles.entries()) {
      if (article.businessId == businessId) {
        result.add(article);
      };
    };
    result.toArray();
  };

  public func getArticle(
    articles : Map.Map<ArticleId, KnowledgeBaseArticle>,
    articleId : ArticleId,
  ) : ?KnowledgeBaseArticle {
    articles.get(articleId);
  };

  public func updateArticle(
    articles : Map.Map<ArticleId, KnowledgeBaseArticle>,
    articleId : ArticleId,
    title : ?Text,
    content : ?Text,
    category : ?Text,
  ) : ApiResult<KnowledgeBaseArticle> {
    switch (articles.get(articleId)) {
      case (?existing) {
        let updated : KnowledgeBaseArticle = {
          existing with
          title = switch (title) { case (?t) { t }; case null { existing.title } };
          content = switch (content) { case (?c) { c }; case null { existing.content } };
          category = switch (category) { case (?c) { c }; case null { existing.category } };
          updatedAt = Int.abs(Time.now());
        };
        articles.add(articleId, updated);
        #ok(updated);
      };
      case null {
        #err("Article not found");
      };
    };
  };

  public func deleteArticle(
    articles : Map.Map<ArticleId, KnowledgeBaseArticle>,
    articleId : ArticleId,
  ) : ApiResult<()> {
    switch (articles.get(articleId)) {
      case (?_) {
        articles.remove(articleId);
        #ok(());
      };
      case null {
        #err("Article not found");
      };
    };
  };

  // --- Chunking ---

  // Split text into chunks of approximately targetSize characters with overlap
  public func chunkText(
    text : Text,
    targetSize : Nat,
    overlap : Nat,
  ) : [Text] {
    let chars = text.toArray();
    if (chars.size() == 0) {
      return [];
    };

    var chunkList : List.List<Text> = List.empty<Text>();
    var start = 0;
    while (start < chars.size()) {
      var end = start + targetSize;
      if (end > chars.size()) {
        end := chars.size();
      };

      // Build chunk text
      var chunkText_ = "";
      var i = start;
      while (i < end) {
        chunkText_ #= Text.fromChar(chars[i]);
        i += 1;
      };
      chunkList.add(chunkText_);

      // Move start forward by (targetSize - overlap), but at least 1
      let step = if (targetSize > overlap) { targetSize - overlap } else { targetSize };
      start += step;
      if (start >= chars.size()) {
        // Done
      };
      // If remaining text is smaller than targetSize/2, append to last chunk instead
      if (start < chars.size() and chars.size() - start < targetSize / 2) {
        var remaining = "";
        var j = start;
        while (j < chars.size()) {
          remaining #= Text.fromChar(chars[j]);
          j += 1;
        };
        // Get last chunk, append remaining, replace
        let chunksArray = chunkList.toArray();
        if (chunksArray.size() > 0) {
          let lastIdx = chunksArray.size() - 1;
          let lastChunk = chunksArray[lastIdx];
          let newChunk = lastChunk # " " # remaining;
          // Rebuild list with last element replaced
          chunkList := List.empty<Text>();
          var k = 0;
          while (k < lastIdx) {
            chunkList.add(chunksArray[k]);
            k += 1;
          };
          chunkList.add(newChunk);
        };
        start := chars.size();
      };
    };
    chunkList.toArray();
  };

  // --- Simulated Embeddings ---

  // Generate a simple hash-based numeric embedding vector of fixed dimension
  // This simulates embeddings without external API calls
  public func generateEmbedding(text : Text) : [Float] {
    let dim = 64;
    let chars = text.toArray();

    // Build immutable vector initialized to 0.0
    var vec : [Float] = Array.tabulate<Float>(dim, func(_) { 0.0 });

    // Use character code sums at different positions to create a pseudo-vector
    for (i in chars.keys()) {
      let charCode = Int.fromNat(Nat32.toNat(Char.toNat32(chars[i]))).toFloat();
      let idx = i % dim;
      vec := Array.tabulate<Float>(dim, func(j) {
        if (j == idx) { vec[j] + charCode } else { vec[j] }
      });
    };

    // Normalize the vector
    var sumSq = 0.0;
    for (i in vec.keys()) {
      sumSq += vec[i] * vec[i];
    };
    let norm = Float.sqrt(sumSq);
    if (norm > 0.0) {
      vec := Array.tabulate<Float>(dim, func(i) { vec[i] / norm });
    };

    vec;
  };

  // Cosine similarity between two vectors
  public func cosineSimilarity(a : [Float], b : [Float]) : Float {
    if (a.size() != b.size() or a.size() == 0) {
      return 0.0;
    };
    var dot = 0.0;
    for (i in a.keys()) {
      dot += a[i] * b[i];
    };
    dot;
  };

  // --- Document Chunk Storage ---

  public func createChunksForArticle(
    chunks : Map.Map<ChunkId, DocumentChunk>,
    embeddings : Map.Map<ChunkId, Embedding>,
    nextChunkId : { var value : Nat },
    articleId : ArticleId,
    content : Text,
  ) : [DocumentChunk] {
    let chunkTexts = chunkText(content, 500, 50);
    var createdChunks : List.List<DocumentChunk> = List.empty<DocumentChunk>();

    for (i in chunkTexts.keys()) {
      let id = nextChunkId.value;
      nextChunkId.value += 1;

      let chunk : DocumentChunk = {
        id = id;
        articleId = articleId;
        content = chunkTexts[i];
        chunkIndex = i;
        createdAt = Int.abs(Time.now());
      };

      chunks.add(id, chunk);

      let embeddingVec = generateEmbedding(chunkTexts[i]);
      let embedding : Embedding = {
        chunkId = id;
        vector = embeddingVec;
      };
      embeddings.add(id, embedding);

      createdChunks.add(chunk);
    };

    createdChunks.toArray();
  };

  public func deleteChunksForArticle(
    chunks : Map.Map<ChunkId, DocumentChunk>,
    embeddings : Map.Map<ChunkId, Embedding>,
    articleId : ArticleId,
  ) : () {
    var toDelete : List.List<ChunkId> = List.empty<ChunkId>();
    for ((id, chunk) in chunks.entries()) {
      if (chunk.articleId == articleId) {
        toDelete.add(id);
      };
    };
    for (id in toDelete.toArray().vals()) {
      chunks.remove(id);
      embeddings.remove(id);
    };
  };

  // --- Semantic Search ---

  public func searchKnowledgeBase(
    chunks : Map.Map<ChunkId, DocumentChunk>,
    embeddings : Map.Map<ChunkId, Embedding>,
    businessId : BusinessId,
    articles : Map.Map<ArticleId, KnowledgeBaseArticle>,
    searchQuery : Text,
    topK : Nat,
  ) : [SearchResult] {
    let queryEmbedding = generateEmbedding(searchQuery);

    var scores : List.List<SearchResult> = List.empty<SearchResult>();

    for ((chunkId, chunk) in chunks.entries()) {
      // Filter by business via article
      switch (articles.get(chunk.articleId)) {
        case (?article) {
          if (article.businessId == businessId) {
            switch (embeddings.get(chunkId)) {
              case (?emb) {
                let score = cosineSimilarity(queryEmbedding, emb.vector);
                scores.add({ chunk = chunk; score = score });
              };
              case null {};
            };
          };
        };
        case null {};
      };
    };

    // Sort by score descending
    let scoresArray = scores.toArray();
    let sorted = scoresArray.sort<SearchResult>(
      func(a : SearchResult, b : SearchResult) {
        if (a.score > b.score) { #less } else if (a.score < b.score) { #greater } else { #equal };
      }
    );

    // Take topK
    let resultSize = if (sorted.size() > topK) { topK } else { sorted.size() };
    Array.tabulate<SearchResult>(resultSize, func(i) = sorted[i]);
  };

  // --- Website Crawl Simulation ---

  public func crawlWebsite(
    crawledPages : Map.Map<CrawledPageId, CrawledPage>,
    nextCrawledPageId : { var value : Nat },
    chunks : Map.Map<ChunkId, DocumentChunk>,
    embeddings : Map.Map<ChunkId, Embedding>,
    nextChunkId : { var value : Nat },
    businessId : BusinessId,
    url : Text,
    title : Text,
    content : Text,
  ) : CrawledPage {
    let id = nextCrawledPageId.value;
    nextCrawledPageId.value += 1;

    let page : CrawledPage = {
      id = id;
      url = url;
      title = title;
      content = content;
      businessId = businessId;
      createdAt = Int.abs(Time.now());
    };

    crawledPages.add(id, page);

    // Chunk and embed the crawled content
    // Use a synthetic articleId based on page id (offset to avoid collision)
    let syntheticArticleId = id + 1_000_000;
    ignore createChunksForArticle(chunks, embeddings, nextChunkId, syntheticArticleId, content);

    page;
  };

  public func getCrawledPages(
    crawledPages : Map.Map<CrawledPageId, CrawledPage>,
    businessId : BusinessId,
  ) : [CrawledPage] {
    var result : List.List<CrawledPage> = List.empty<CrawledPage>();
    for ((_, page) in crawledPages.entries()) {
      if (page.businessId == businessId) {
        result.add(page);
      };
    };
    result.toArray();
  };

  // --- Knowledge Base Context for AI ---

  public func buildKbContext(
    chunks : Map.Map<ChunkId, DocumentChunk>,
    embeddings : Map.Map<ChunkId, Embedding>,
    businessId : BusinessId,
    articles : Map.Map<ArticleId, KnowledgeBaseArticle>,
    searchQuery : Text,
  ) : KnowledgeBaseContext {
    let topResults = searchKnowledgeBase(chunks, embeddings, businessId, articles, searchQuery, 5);

    let relevantChunks = Array.tabulate(topResults.size(), func(i) = topResults[i].chunk);

    // Collect unique article IDs
    var articleIdList : List.List<ArticleId> = List.empty<ArticleId>();
    for (result in topResults.vals()) {
      let alreadyExists = articleIdList.toArray().find<ArticleId>(func(id : ArticleId) : Bool { id == result.chunk.articleId }) != null;
      if (not alreadyExists) {
        articleIdList.add(result.chunk.articleId);
      };
    };

    {
      relevantChunks = relevantChunks;
      sourceArticleIds = articleIdList.toArray();
    };
  };
};
