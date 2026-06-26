import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Clock,
  MessageSquare,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

import { SidebarLayout } from "@/components/AppSidebar";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/SkeletonLoader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetConversations, useGetMessages } from "@/hooks/useChatQueries";
import { useGetCustomers, useGetTickets } from "@/hooks/useQueries";
import { useGetMyBusiness } from "@/hooks/useQueries";
import { useAuthStore, useBusinessStore } from "@/store";

export default function DashboardPage() {
  const { user, businessId } = useAuthStore();
  const { business } = useBusinessStore();
  const bId = businessId ? BigInt(businessId) : null;

  const { data: tickets = [], isLoading: ticketsLoading } = useGetTickets(bId);
  const { data: customers = [], isLoading: customersLoading } =
    useGetCustomers(bId);
  const { data: conversations = [], isLoading: conversationsLoading } =
    useGetConversations(bId);
  const { data: myBusiness, isLoading: businessLoading } = useGetMyBusiness();

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const totalCustomers = customers.length;
  const totalConversations = conversations.length;
  const teamSize =
    myBusiness?.teamSize ?? business?.teamSize ?? business?.size ?? "—";

  const stats = [
    {
      label: "Total Tickets",
      value: totalTickets.toString(),
      icon: Ticket,
      trend: `${openTickets} open`,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Customers",
      value: totalCustomers.toString(),
      icon: Users,
      trend: "All time",
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Conversations",
      value: totalConversations.toString(),
      icon: MessageSquare,
      trend: "Active chats",
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      label: "Team Members",
      value: String(teamSize),
      icon: Users,
      trend: "Size",
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
  ];

  const isLoading =
    ticketsLoading ||
    customersLoading ||
    conversationsLoading ||
    businessLoading;

  return (
    <SidebarLayout>
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-semibold">Dashboard</h1>
              <p className="text-muted-foreground text-sm">
                Welcome back, {user?.name?.split(" ")[0] || "there"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="capitalize">
                {user?.role?.replace("_", " ") || "Member"}
              </Badge>
            </div>
          </div>
        </header>

        <div className="space-y-6 p-6">
          {/* Business card */}
          {business && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-lg">
                    {business.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded">
                        <Ticket className="size-3" />
                      </div>
                      <span className="text-muted-foreground">Industry:</span>
                      <span className="font-medium">{business.industry}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-accent/10 text-accent flex size-6 items-center justify-center rounded">
                        <Users className="size-3" />
                      </div>
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium">
                        {business.size || business.teamSize}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-chart-3/10 text-chart-3 flex size-6 items-center justify-center rounded">
                        <Clock className="size-3" />
                      </div>
                      <span className="text-muted-foreground">Slug:</span>
                      <span className="font-medium">
                        {business.slug ||
                          business.name.toLowerCase().replace(/\s+/g, "-")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats grid */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <SkeletonCard key={`dashboard-skeleton-${n}`} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <Card className="glass">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div
                          className={`${stat.bg} ${stat.color} flex size-9 items-center justify-center rounded-lg`}
                        >
                          <stat.icon className="size-4" />
                        </div>
                        <span className="text-muted-foreground text-xs font-medium">
                          {stat.trend}
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="font-display text-2xl font-bold">
                          {stat.value}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {stat.label}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Activity + Quick actions */}
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="font-display text-lg">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tickets.length === 0 &&
                  customers.length === 0 &&
                  conversations.length === 0 ? (
                    <EmptyState
                      type="inbox"
                      description="No activity yet. Create a ticket or start a conversation to see updates here."
                    />
                  ) : (
                    <>
                      {tickets.slice(0, 3).map((ticket) => (
                        <div
                          key={`activity-ticket-${ticket.id.toString()}`}
                          className="flex items-start gap-3"
                        >
                          <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
                            <Ticket className="size-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              Ticket created: {ticket.title}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Status: {ticket.status} · Priority:{" "}
                              {ticket.priority}
                            </p>
                          </div>
                          <span className="text-muted-foreground shrink-0 text-xs">
                            {new Date(
                              Number(ticket.createdAt) / 1_000_000,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {conversations.slice(0, 2).map((conv) => (
                        <div
                          key={`activity-conv-${conv.id.toString()}`}
                          className="flex items-start gap-3"
                        >
                          <div className="bg-chart-3/10 text-chart-3 flex size-8 shrink-0 items-center justify-center rounded-full">
                            <MessageSquare className="size-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              Conversation: {conv.title}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Started chatting
                            </p>
                          </div>
                          <span className="text-muted-foreground shrink-0 text-xs">
                            {new Date(
                              Number(conv.createdAt) / 1_000_000,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="font-display text-lg">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link
                    to="/tickets"
                    className="bg-card hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                        <Ticket className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">View Tickets</p>
                        <p className="text-muted-foreground text-xs">
                          Manage customer support tickets
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="text-muted-foreground size-4" />
                  </Link>
                  <Link
                    to="/team"
                    className="bg-card hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-accent/10 text-accent flex size-8 items-center justify-center rounded-lg">
                        <Users className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Team Settings</p>
                        <p className="text-muted-foreground text-xs">
                          Invite and manage team members
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="text-muted-foreground size-4" />
                  </Link>
                  <Link
                    to="/chat"
                    className="bg-card hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-chart-3/10 text-chart-3 flex size-8 items-center justify-center rounded-lg">
                        <MessageSquare className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">AI Chat</p>
                        <p className="text-muted-foreground text-xs">
                          Start a conversation with AI support
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="text-muted-foreground size-4" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
