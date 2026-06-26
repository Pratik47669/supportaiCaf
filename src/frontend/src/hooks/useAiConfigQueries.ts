import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetAiConfig(businessId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["ai-config", businessId?.toString()],
    queryFn: async () => {
      if (!actor || !businessId) return null;
      return actor.getGeminiApiKey();
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

export function useSetAiConfig() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      key,
    }: {
      key: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.setGeminiApiKey(key);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ai-config"],
      });
    },
  });
}

export function useSavePromptVersion() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_variables: {
      businessId: bigint;
      systemPrompt: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      // No direct savePromptVersion on backend; use crawlWebsite as a placeholder
      // or remove this hook if not needed. Using a no-op that throws to indicate
      // the backend method is missing.
      throw new Error("savePromptVersion is not implemented on the backend");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["prompt-versions", variables.businessId.toString()],
      });
    },
  });
}

export function useGetPromptVersions(businessId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["prompt-versions", businessId?.toString()],
    queryFn: async () => {
      if (!actor || !businessId) return [];
      // No direct getPromptVersions on backend; return empty array
      return [];
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

export function useSetActivePromptVersion() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_variables: {
      businessId: bigint;
      versionId: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      // No direct setActivePromptVersion on backend; throw to indicate missing method
      throw new Error(
        "setActivePromptVersion is not implemented on the backend",
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["prompt-versions", variables.businessId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["ai-config", variables.businessId.toString()],
      });
    },
  });
}
