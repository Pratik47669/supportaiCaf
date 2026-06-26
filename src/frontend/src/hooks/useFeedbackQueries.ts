import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAddFeedback() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      messageId,
      conversationId,
      rating,
      comment,
    }: {
      messageId: bigint;
      conversationId: bigint;
      rating: import("@/backend").FeedbackRating;
      comment?: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.addFeedback(
        messageId,
        conversationId,
        rating,
        comment ?? null,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback-stats"] });
      queryClient.invalidateQueries({ queryKey: ["feedback-by-conversation"] });
    },
  });
}

export function useGetFeedbackStats() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["feedback-stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getFeedbackStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFeedbackByConversation(conversationId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["feedback-by-conversation", conversationId?.toString()],
    queryFn: async () => {
      if (!actor || !conversationId) return [];
      return actor.getFeedbackByConversation(conversationId);
    },
    enabled: !!actor && !isFetching && !!conversationId,
  });
}
