import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetConversations(businessId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["conversations", businessId?.toString()],
    queryFn: async () => {
      if (!actor || !businessId) return [];
      return actor.getConversations(businessId);
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

export function useGetMessages(conversationId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["messages", conversationId?.toString()],
    queryFn: async () => {
      if (!actor || !conversationId) return [];
      return actor.getMessages(conversationId);
    },
    enabled: !!actor && !isFetching && !!conversationId,
  });
}

export function useCreateConversation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      title,
    }: {
      businessId: bigint;
      title: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.createConversation(businessId, title);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", variables.businessId.toString()],
      });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      role,
      content,
      confidence,
    }: {
      conversationId: bigint;
      role: import("@/backend").ChatMessageRole;
      content: string;
      confidence?: number | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.sendMessage(
        conversationId,
        role,
        content,
        confidence ?? null,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSendToGemini() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      conversationId,
      message,
    }: {
      conversationId: bigint;
      message: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.sendToGemini(conversationId, message);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
  });
}

export function useSendToGeminiWithSources() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      conversationId,
      message,
    }: {
      conversationId: bigint;
      message: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.sendToGeminiWithSources(
        conversationId,
        message,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
  });
}

export function useDeleteConversation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.deleteConversation(conversationId);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useGetAiAnalytics(
  businessId: bigint | null,
  periodStart: bigint,
  periodEnd: bigint,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: [
      "ai-analytics",
      businessId?.toString(),
      periodStart.toString(),
      periodEnd.toString(),
    ],
    queryFn: async () => {
      if (!actor || !businessId) return null;
      const result = await actor.getAiAnalytics(
        businessId,
        periodStart,
        periodEnd,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}
