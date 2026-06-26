import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation } from "@tanstack/react-query";

export function useExportChats() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (businessId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.exportChats(businessId);
    },
  });
}

export function useExportCustomers() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (businessId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.exportCustomers(businessId);
    },
  });
}

export function useExportTickets() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (businessId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.exportTickets(businessId);
    },
  });
}

export function useExportAnalytics() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      businessId,
      periodStart,
      periodEnd,
    }: {
      businessId: bigint;
      periodStart: bigint;
      periodEnd: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.exportAnalytics(
        businessId,
        periodStart,
        periodEnd,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
  });
}
