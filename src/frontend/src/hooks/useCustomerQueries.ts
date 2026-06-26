import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetCustomers(businessId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["customers", businessId?.toString()],
    queryFn: async () => {
      if (!actor || !businessId) return [];
      return actor.getCustomers(businessId);
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

export function useCreateCustomer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      name,
      email,
    }: {
      businessId: bigint;
      name: string;
      email: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.createCustomer(businessId, name, email);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customers", variables.businessId.toString()],
      });
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customerId,
      name,
      email,
    }: {
      customerId: bigint;
      name?: string | null;
      email?: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.updateCustomer(
        customerId,
        name ?? null,
        email ?? null,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customerId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
