import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetArticles(businessId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["articles", businessId?.toString()],
    queryFn: async () => {
      if (!actor || !businessId) return [];
      return actor.getArticles(businessId);
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

export function useGetArticle(articleId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["article", articleId?.toString()],
    queryFn: async () => {
      if (!actor || !articleId) return null;
      return actor.getArticle(articleId);
    },
    enabled: !!actor && !isFetching && !!articleId,
  });
}

export function useCreateArticle() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      title,
      content,
      category,
    }: {
      businessId: bigint;
      title: string;
      content: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.createArticle(
        businessId,
        title,
        content,
        category,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["articles", variables.businessId.toString()],
      });
    },
  });
}

export function useUpdateArticle() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      articleId,
      title,
      content,
      category,
    }: {
      articleId: bigint;
      title?: string | null;
      content?: string | null;
      category?: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.updateArticle(
        articleId,
        title ?? null,
        content ?? null,
        category ?? null,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["article", variables.articleId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useDeleteArticle() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (articleId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.deleteArticle(articleId);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useUploadDocumentChunks() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      title,
      content,
      category,
    }: {
      businessId: bigint;
      title: string;
      content: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.uploadDocumentChunks(
        businessId,
        title,
        content,
        category,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["articles", variables.businessId.toString()],
      });
    },
  });
}

export function useSearchKnowledgeBase() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      businessId,
      queryText,
      topK,
    }: {
      businessId: bigint;
      queryText: string;
      topK: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.searchKnowledgeBase(businessId, queryText, topK);
    },
  });
}

export function useCrawlWebsite() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      url,
      title,
      content,
    }: {
      businessId: bigint;
      url: string;
      title: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.crawlWebsite(businessId, url, title, content);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["crawled-pages", variables.businessId.toString()],
      });
    },
  });
}

export function useGetCrawledPages(businessId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["crawled-pages", businessId?.toString()],
    queryFn: async () => {
      if (!actor || !businessId) return [];
      return actor.getCrawledPages(businessId);
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}
