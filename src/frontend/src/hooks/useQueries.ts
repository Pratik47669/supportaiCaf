import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBackendStatus() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["backend-status"],
    queryFn: async () => {
      if (!actor) return null;
      return { status: "connected" as const };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUser() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["caller-user"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUser();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyBusiness() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["my-business"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyBusiness();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBusiness(businessId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["business", businessId?.toString()],
    queryFn: async () => {
      if (!actor || !businessId) return null;
      return actor.getBusiness(businessId);
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

export function useGetUser(userId: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUser({ toText: () => userId } as unknown as Principal);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetUserRole(userId: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["user-role", userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserRole({
        toText: () => userId,
      } as unknown as Principal);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useIsBusinessOwner(businessId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["is-business-owner", businessId?.toString()],
    queryFn: async () => {
      if (!actor || !businessId) return false;
      // Fallback: check if caller is the business owner via getMyBusiness
      const myBusiness = await actor.getMyBusiness();
      return myBusiness?.id === businessId;
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

export function useGetTeamAnalytics(businessId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["team-analytics", businessId?.toString()],
    queryFn: async () => {
      if (!actor || !businessId) return null;
      const result = await actor.getTeamAnalytics(businessId);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["is-caller-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegister() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      name,
      email,
    }: {
      name: string;
      email: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.register(name, email);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
  });
}

export function useGenerateOtp() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.generateOtp(email);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
  });
}

export function useVerifyOtp() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.verifyOtp(email, code);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
  });
}

export function useGetSimulatedOtp(email: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["simulated-otp", email],
    queryFn: async () => {
      if (!actor || !email) return null;
      return actor.getSimulatedOtp(email);
    },
    enabled: !!actor && !isFetching && !!email,
  });
}

export function useCreateBusiness() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      name,
      industry,
      website,
      description,
      teamSize,
      logoUrl,
      supportEmail,
      phoneNumber,
    }: {
      name: string;
      industry: string;
      website: string | null;
      description: string;
      teamSize: string;
      logoUrl: string | null;
      supportEmail: string;
      phoneNumber: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.createBusiness(
        name,
        industry,
        website,
        description,
        teamSize,
        logoUrl,
        supportEmail,
        phoneNumber,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
  });
}

export function useUpdateBusiness() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      name,
      industry,
      website,
      description,
      teamSize,
      logoUrl,
      supportEmail,
      phoneNumber,
    }: {
      businessId: bigint;
      name: string;
      industry: string;
      website: string | null;
      description: string;
      teamSize: string;
      logoUrl: string | null;
      supportEmail: string;
      phoneNumber: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.updateBusiness(
        businessId,
        name,
        industry,
        website,
        description,
        teamSize,
        logoUrl,
        supportEmail,
        phoneNumber,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
    },
  });
}

export function useUpdateUserRole() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      targetUserId,
      newRole,
    }: {
      targetUserId: string;
      newRole: import("@/backend").UserRole;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.updateUserRole(
        { toText: () => targetUserId } as unknown as Principal,
        newRole,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
  });
}

export function useGetGeminiApiKey() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["gemini-api-key"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getGeminiApiKey();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetGeminiApiKey() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (apiKey: string) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.setGeminiApiKey(apiKey);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gemini-api-key"] });
    },
  });
}

// ─── Ticket Hooks ───

export function useGetTickets(businessId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["tickets", businessId?.toString()],
    queryFn: async () => {
      if (!actor || !businessId) return [];
      return actor.getTickets(businessId);
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

export function useGetTicket(ticketId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["ticket", ticketId?.toString()],
    queryFn: async () => {
      if (!actor || !ticketId) return null;
      return actor.getTicket(ticketId);
    },
    enabled: !!actor && !isFetching && !!ticketId,
  });
}

export function useCreateTicket() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      title,
      description,
      priority,
    }: {
      businessId: bigint;
      title: string;
      description: string;
      priority: import("@/backend").TicketPriority;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.createTicket(
        businessId,
        title,
        description,
        priority,
        "open" as import("@/backend").TicketStatus,
        null,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tickets", variables.businessId.toString()],
      });
    },
  });
}

export function useUpdateTicket() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ticketId,
      title,
      description,
      status,
      priority,
      assignee,
    }: {
      ticketId: bigint;
      title?: string | null;
      description?: string | null;
      status?: import("@/backend").TicketStatus | null;
      priority?: import("@/backend").TicketPriority | null;
      assignee?: import("@/backend").UserId | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.updateTicket(
        ticketId,
        title ?? null,
        description ?? null,
        status ?? null,
        priority ?? null,
        assignee ?? null,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.ticketId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useDeleteTicket() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.deleteTicket(ticketId);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useGetTicketAnalytics(
  businessId: bigint | null,
  periodStart: bigint,
  periodEnd: bigint,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: [
      "ticket-analytics",
      businessId?.toString(),
      periodStart.toString(),
      periodEnd.toString(),
    ],
    queryFn: async () => {
      if (!actor || !businessId) return null;
      const result = await actor.getTicketAnalytics(
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

// ─── Customer Hooks ───

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

export function useGetCustomer(customerId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["customer", customerId?.toString()],
    queryFn: async () => {
      if (!actor || !customerId) return null;
      return actor.getCustomer(customerId);
    },
    enabled: !!actor && !isFetching && !!customerId,
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

export function useDeleteCustomer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customerId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.deleteCustomer(customerId);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useAddCustomerNote() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customerId,
      text,
    }: {
      customerId: bigint;
      text: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.addCustomerNote(customerId, text);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customerId.toString()],
      });
    },
  });
}

export function useAddCustomerTag() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customerId,
      tag,
    }: {
      customerId: bigint;
      tag: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.addCustomerTag(customerId, tag);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customerId.toString()],
      });
    },
  });
}

export function useRemoveCustomerTag() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customerId,
      tag,
    }: {
      customerId: bigint;
      tag: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.removeCustomerTag(customerId, tag);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customerId.toString()],
      });
    },
  });
}

export function useRemoveTeamMember() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.removeTeamMember({
        toText: () => targetUserId,
      } as unknown as Principal);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caller-user"] });
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
    },
  });
}

export function useCreateInvite() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      code,
      role,
      expiresAt,
    }: {
      businessId: bigint;
      code: string;
      role: import("@/backend").UserRole;
      expiresAt: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.createInvite(
        businessId,
        code,
        role,
        expiresAt,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
    },
  });
}
