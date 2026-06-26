import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

export function useGetAuditLogs(businessId: bigint | null, limit = 100n) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["audit-logs", businessId?.toString(), limit.toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (businessId) {
        return actor.getAuditLogs(businessId, limit);
      }
      return actor.getMyAuditLogs(limit);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetActivityTimeline(businessId: bigint | null, hours = 24n) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["activity-timeline", businessId?.toString(), hours.toString()],
    queryFn: async () => {
      if (!actor || !businessId) return [];
      return actor.getActivityTimeline(businessId, hours);
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}
