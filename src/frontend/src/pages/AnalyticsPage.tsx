import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/SkeletonLoader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAiAnalytics } from "@/hooks/useChatQueries";
import { useGetFeedbackStats } from "@/hooks/useFeedbackQueries";
import { useGetTeamAnalytics, useGetTicketAnalytics } from "@/hooks/useQueries";
import { useAuthStore } from "@/store";
import {
  AlertCircle,
  BarChart3,
  Clock,
  MessageSquare,
  ThumbsUp,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

export default function AnalyticsPage() {
  const { businessId } = useAuthStore();
  const bId = businessId ? BigInt(businessId) : null;

  const now = BigInt(Date.now() * 1_000_000); // nanoseconds
  const dayAgo = now - BigInt(24 * 60 * 60 * 1_000_000_000);

  const { data: aiAnalytics, isLoading: aiLoading } = useGetAiAnalytics(
    bId,
    dayAgo,
    now,
  );
  const { data: ticketAnalytics, isLoading: ticketLoading } =
    useGetTicketAnalytics(bId, dayAgo, now);
  const { data: feedbackStats, isLoading: feedbackLoading } =
    useGetFeedbackStats();
  const { data: teamAnalytics, isLoading: teamLoading } =
    useGetTeamAnalytics(bId);

  const isLoading =
    aiLoading || ticketLoading || feedbackLoading || teamLoading;

  // Helper to safely get bigint values as numbers
  const num = (val: bigint | undefined) => (val ? Number(val) : 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Insights and metrics for your support operations
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <SkeletonCard key={`analytics-skeleton-${n}`} />
          ))}
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    Total Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {num(aiAnalytics?.totalMessages).toString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    Open Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Ticket className="size-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {num(ticketAnalytics?.open).toString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    Avg Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {num(aiAnalytics?.avgResponseTime).toString()}ms
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="size-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {num(feedbackStats?.thumbsUpPercentage).toString()}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="size-5 text-primary" />
                    Ticket Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ticketAnalytics?.byPriority &&
                  (num(ticketAnalytics.byPriority.low) > 0 ||
                    num(ticketAnalytics.byPriority.medium) > 0 ||
                    num(ticketAnalytics.byPriority.high) > 0 ||
                    num(ticketAnalytics.byPriority.urgent) > 0) ? (
                    <div className="space-y-3">
                      {[
                        {
                          key: "urgent",
                          label: "Urgent",
                          color: "bg-destructive",
                        },
                        { key: "high", label: "High", color: "bg-chart-4" },
                        { key: "medium", label: "Medium", color: "bg-accent" },
                        { key: "low", label: "Low", color: "bg-chart-3" },
                      ].map(({ key, label, color }, i) => {
                        const value = num(
                          ticketAnalytics.byPriority[
                            key as keyof typeof ticketAnalytics.byPriority
                          ],
                        );
                        const total =
                          num(ticketAnalytics.byPriority.low) +
                          num(ticketAnalytics.byPriority.medium) +
                          num(ticketAnalytics.byPriority.high) +
                          num(ticketAnalytics.byPriority.urgent);
                        const pct = total > 0 ? (value / total) * 100 : 0;
                        return (
                          <div
                            key={`priority-${key}`}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm w-20">{label}</span>
                            <div className="flex items-center gap-3 flex-1">
                              <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                                <motion.div
                                  className={`${color} h-full rounded-full`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.1 }}
                                />
                              </div>
                              <span className="text-sm font-medium w-8 text-right">
                                {value}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-2 border-t mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-medium">
                            {num(ticketAnalytics.total).toString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">
                            Resolved
                          </span>
                          <span className="font-medium">
                            {num(ticketAnalytics.resolved).toString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">
                            In Progress
                          </span>
                          <span className="font-medium">
                            {num(ticketAnalytics.inProgress).toString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Closed</span>
                          <span className="font-medium">
                            {num(ticketAnalytics.closed).toString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      type="inbox"
                      description="No ticket data available yet. Create tickets to see trends."
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="size-5 text-primary" />
                    AI Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aiAnalytics && num(aiAnalytics.totalMessages) > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Conversations</span>
                        <span className="text-sm font-medium">
                          {num(aiAnalytics.totalConversations).toString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Messages</span>
                        <span className="text-sm font-medium">
                          {num(aiAnalytics.totalMessages).toString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Assistant Messages</span>
                        <span className="text-sm font-medium">
                          {num(aiAnalytics.assistantMessages).toString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avg Response Time</span>
                        <span className="text-sm font-medium">
                          {num(aiAnalytics.avgResponseTime).toString()}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Thumbs Up</span>
                        <span className="text-sm font-medium text-chart-4">
                          {num(aiAnalytics.thumbsUp).toString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Thumbs Down</span>
                        <span className="text-sm font-medium text-destructive">
                          {num(aiAnalytics.thumbsDown).toString()}
                        </span>
                      </div>
                      <div className="pt-2 border-t mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            Avg Messages / Conversation
                          </span>
                          <span className="text-sm font-medium">
                            {num(
                              aiAnalytics.avgMessagesPerConversation,
                            ).toString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      type="inbox"
                      description="No AI performance data available yet. Start chatting to see metrics."
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Team Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  Team Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamAnalytics && num(teamAnalytics.totalMembers) > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold">
                          {num(teamAnalytics.totalMembers).toString()}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Total Members
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold">
                          {num(teamAnalytics.activeMembers).toString()}
                        </p>
                        <p className="text-muted-foreground text-xs">Active</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold">
                          {num(teamAnalytics.pendingInvites).toString()}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Pending Invites
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold">
                          {num(teamAnalytics.membersByRole.owner).toString()}
                        </p>
                        <p className="text-muted-foreground text-xs">Owners</p>
                      </div>
                    </div>
                    {teamAnalytics.members.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">
                          Member Performance
                        </h4>
                        <div className="space-y-2">
                          {teamAnalytics.members.map((member) => (
                            <div
                              key={member.name}
                              className="flex items-center justify-between bg-muted/30 rounded-lg p-2"
                            >
                              <span className="text-sm">{member.name}</span>
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                <span>
                                  {num(member.ticketsAssigned).toString()}{" "}
                                  assigned
                                </span>
                                <span>
                                  {num(member.ticketsResolved).toString()}{" "}
                                  resolved
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    type="inbox"
                    description="No team data available yet."
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}
