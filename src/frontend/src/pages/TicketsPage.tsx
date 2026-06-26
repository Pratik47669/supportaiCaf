import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Filter,
  Inbox,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  ShieldAlert,
  Ticket,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { SidebarLayout } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateTicket,
  useDeleteTicket,
  useGetTickets,
  useUpdateTicket,
} from "@/hooks/useQueries";
import { useBusinessStore } from "@/store";
import { toast } from "sonner";

import type { TicketPriority, TicketStatus } from "@/backend";

const statusConfig: Record<
  TicketStatus,
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  open: {
    label: "Open",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    icon: Inbox,
  },
  inProgress: {
    label: "In Progress",
    color: "text-primary",
    bg: "bg-primary/10",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    icon: CheckCircle2,
  },
  closed: {
    label: "Closed",
    color: "text-muted-foreground",
    bg: "bg-muted",
    icon: XCircle,
  },
};

const priorityConfig: Record<
  TicketPriority,
  { label: string; color: string; bg: string; icon: typeof AlertCircle }
> = {
  low: {
    label: "Low",
    color: "text-muted-foreground",
    bg: "bg-muted",
    icon: ArrowUpDown,
  },
  medium: {
    label: "Medium",
    color: "text-accent",
    bg: "bg-accent/10",
    icon: AlertCircle,
  },
  high: {
    label: "High",
    color: "text-destructive",
    bg: "bg-destructive/10",
    icon: ShieldAlert,
  },
  urgent: {
    label: "Urgent",
    color: "text-destructive",
    bg: "bg-destructive/20",
    icon: ShieldAlert,
  },
};

function StatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="secondary"
      className={`${config.bg} ${config.color} border-0 font-medium gap-1`}
    >
      <config.icon className="size-3" />
      {config.label}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const config = priorityConfig[priority];
  return (
    <Badge
      variant="secondary"
      className={`${config.bg} ${config.color} border-0 font-medium gap-1`}
    >
      <config.icon className="size-3" />
      {config.label}
    </Badge>
  );
}

function TicketSummaryCards({
  tickets,
}: {
  tickets: import("@/backend").Ticket[];
}) {
  const counts = {
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "inProgress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  const cards = [
    {
      label: "Open",
      value: counts.open,
      icon: Inbox,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      label: "In Progress",
      value: counts.inProgress,
      icon: Clock,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Resolved",
      value: counts.resolved,
      icon: CheckCircle2,
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
    {
      label: "Closed",
      value: counts.closed,
      icon: XCircle,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div
                  className={`${card.bg} ${card.color} flex size-9 items-center justify-center rounded-lg`}
                >
                  <card.icon className="size-4" />
                </div>
                <span className="font-display text-2xl font-bold">
                  {card.value}
                </span>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                {card.label} Tickets
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function CreateTicketModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>(
    "medium" as TicketPriority,
  );

  const { business } = useBusinessStore();
  const businessId = business?.id ? BigInt(business.id) : null;

  const createTicket = useCreateTicket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !businessId) return;

    createTicket.mutate(
      {
        businessId,
        title: title.trim(),
        description: description.trim(),
        priority,
      },
      {
        onSuccess: () => {
          toast.success("Ticket created successfully");
          setTitle("");
          setDescription("");
          setPriority("medium" as TicketPriority);
          onClose();
        },
        onError: () => {
          toast.error("Failed to create ticket");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Create New Ticket</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new support ticket.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket-title">Title</Label>
            <Input
              id="ticket-title"
              data-ocid="ticket.create.input.title"
              placeholder="Brief summary of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-desc">Description</Label>
            <Textarea
              id="ticket-desc"
              data-ocid="ticket.create.textarea.description"
              placeholder="Detailed description of the problem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TicketPriority)}
              >
                <SelectTrigger
                  id="ticket-priority"
                  data-ocid="ticket.create.select.priority"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              data-ocid="ticket.create.cancel_button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="ticket.create.submit_button"
              disabled={createTicket.isPending || !title.trim() || !businessId}
            >
              {createTicket.isPending ? "Creating..." : "Create Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TicketDetailModal({
  ticket,
  open,
  onClose,
}: {
  ticket: import("@/backend").Ticket | null;
  open: boolean;
  onClose: () => void;
}) {
  const updateTicket = useUpdateTicket();

  if (!ticket) return null;

  const handleStatusChange = (newStatus: TicketStatus) => {
    updateTicket.mutate(
      { ticketId: ticket.id, status: newStatus },
      {
        onSuccess: () =>
          toast.success(`Status updated to ${statusConfig[newStatus].label}`),
        onError: () => toast.error("Failed to update status"),
      },
    );
  };

  const handlePriorityChange = (newPriority: TicketPriority) => {
    updateTicket.mutate(
      { ticketId: ticket.id, priority: newPriority },
      {
        onSuccess: () =>
          toast.success(
            `Priority updated to ${priorityConfig[newPriority].label}`,
          ),
        onError: () => toast.error("Failed to update priority"),
      },
    );
  };

  const handleAssign = (assigneeText: string) => {
    updateTicket.mutate(
      {
        ticketId: ticket.id,
        assignee: assigneeText === "unassigned" ? null : undefined,
      },
      {
        onSuccess: () => toast.success("Assignee updated"),
        onError: () => toast.error("Failed to update assignee"),
      },
    );
  };

  const assigneeText = ticket.assignee
    ? ticket.assignee.toText()
    : "unassigned";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display pr-8">
            {ticket.title}
          </DialogTitle>
          <DialogDescription>
            Ticket #{ticket.id.toString()} · Created{" "}
            {new Date(
              Number(ticket.createdAt) / 1_000_000,
            ).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            {ticket.assignee ? (
              <Badge variant="outline" className="gap-1">
                <User className="size-3" />
                {ticket.assignee.toText()}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground gap-1">
                <User className="size-3" />
                Unassigned
              </Badge>
            )}
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">Description</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {ticket.description}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={ticket.status}
                onValueChange={(v) => handleStatusChange(v as TicketStatus)}
              >
                <SelectTrigger data-ocid="ticket.detail.select.status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={ticket.priority}
                onValueChange={(v) => handlePriorityChange(v as TicketPriority)}
              >
                <SelectTrigger data-ocid="ticket.detail.select.priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select value={assigneeText} onValueChange={(v) => handleAssign(v)}>
              <SelectTrigger data-ocid="ticket.detail.select.assignee">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            data-ocid="ticket.detail.close_button"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmModal({
  ticket,
  open,
  onClose,
  onConfirm,
}: {
  ticket: import("@/backend").Ticket | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Delete Ticket</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium">{ticket?.title}</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            data-ocid="ticket.delete.cancel_button"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            data-ocid="ticket.delete.confirm_button"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TicketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">(
    "all",
  );
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority">(
    "newest",
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState<
    import("@/backend").Ticket | null
  >(null);
  const [deleteTicket, setDeleteTicket] = useState<
    import("@/backend").Ticket | null
  >(null);

  const { business } = useBusinessStore();
  const businessId = business?.id ? BigInt(business.id) : null;

  const { data: ticketsFromQuery, isLoading } = useGetTickets(businessId);
  const deleteMutation = useDeleteTicket();

  const tickets = ticketsFromQuery || [];

  const filteredTickets = tickets
    .filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toString().toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || t.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return Number(b.createdAt - a.createdAt);
      if (sortBy === "oldest") return Number(a.createdAt - b.createdAt);
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const handleDelete = () => {
    if (!deleteTicket) return;
    deleteMutation.mutate(deleteTicket.id, {
      onSuccess: () => {
        toast.success("Ticket deleted");
        setDeleteTicket(null);
      },
      onError: () => toast.error("Failed to delete ticket"),
    });
  };

  return (
    <SidebarLayout>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-semibold">Tickets</h1>
              <p className="text-muted-foreground text-sm">
                Manage customer support tickets
              </p>
            </div>
            <Button
              data-ocid="ticket.create.open_modal_button"
              onClick={() => setCreateOpen(true)}
              className="gap-2"
            >
              <Plus className="size-4" />
              New Ticket
            </Button>
          </div>
        </header>

        <div className="space-y-6 p-6">
          {/* Summary Cards */}
          <TicketSummaryCards tickets={tickets} />

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                    <Input
                      data-ocid="ticket.search_input"
                      placeholder="Search tickets by title, description, or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Filter className="text-muted-foreground size-4" />
                      <Select
                        value={statusFilter}
                        onValueChange={(v) =>
                          setStatusFilter(v as TicketStatus | "all")
                        }
                      >
                        <SelectTrigger
                          data-ocid="ticket.filter.select.status"
                          className="w-[140px]"
                        >
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="inProgress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Select
                      value={priorityFilter}
                      onValueChange={(v) =>
                        setPriorityFilter(v as TicketPriority | "all")
                      }
                    >
                      <SelectTrigger
                        data-ocid="ticket.filter.select.priority"
                        className="w-[140px]"
                      >
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={sortBy}
                      onValueChange={(v) =>
                        setSortBy(v as "newest" | "oldest" | "priority")
                      }
                    >
                      <SelectTrigger
                        data-ocid="ticket.filter.select.sort"
                        className="w-[140px]"
                      >
                        <ArrowUpDown className="text-muted-foreground mr-2 size-3.5" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="priority">
                          Priority (High → Low)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ticket List */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Ticket className="size-5 text-primary" />
                  All Tickets
                  <Badge variant="secondary" className="ml-2">
                    {filteredTickets.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={`ticket-skeleton-${n}`}
                        className="bg-muted/50 h-16 animate-pulse rounded-lg"
                      />
                    ))}
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div
                    data-ocid="ticket.list.empty_state"
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="bg-muted flex size-12 items-center justify-center rounded-full mb-4">
                      <MessageSquare className="text-muted-foreground size-5" />
                    </div>
                    <h3 className="font-medium mb-1">No tickets found</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      {searchQuery ||
                      statusFilter !== "all" ||
                      priorityFilter !== "all"
                        ? "Try adjusting your filters or search query."
                        : "Get started by creating your first support ticket."}
                    </p>
                    {!searchQuery &&
                      statusFilter === "all" &&
                      priorityFilter === "all" && (
                        <Button
                          data-ocid="ticket.empty_state.create_button"
                          variant="outline"
                          className="mt-4 gap-2"
                          onClick={() => setCreateOpen(true)}
                        >
                          <Plus className="size-4" />
                          Create Ticket
                        </Button>
                      )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {filteredTickets.map((ticket, index) => {
                        const PriorityIcon =
                          priorityConfig[ticket.priority].icon;
                        return (
                          <motion.div
                            key={ticket.id.toString()}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                          >
                            <button
                              data-ocid={`ticket.item.${index + 1}`}
                              className="group hover:bg-muted/50 flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors"
                              onClick={() => setDetailTicket(ticket)}
                              type="button"
                            >
                              <div className="mt-0.5 shrink-0">
                                <div
                                  className={`${priorityConfig[ticket.priority].bg} ${priorityConfig[ticket.priority].color} flex size-8 items-center justify-center rounded-lg`}
                                >
                                  <PriorityIcon className="size-4" />
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-medium truncate">
                                      {ticket.title}
                                    </h4>
                                    <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                                      {ticket.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <StatusBadge status={ticket.status} />
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                          data-ocid={`ticket.item.${index + 1}.more_button`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreHorizontal className="size-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          data-ocid={`ticket.item.${index + 1}.edit_button`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDetailTicket(ticket);
                                          }}
                                        >
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          data-ocid={`ticket.item.${index + 1}.delete_button`}
                                          className="text-destructive focus:text-destructive"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteTicket(ticket);
                                          }}
                                        >
                                          <Trash2 className="size-3.5 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                  <PriorityBadge priority={ticket.priority} />
                                  <span className="text-muted-foreground text-xs">
                                    #{ticket.id.toString()}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    ·
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {new Date(
                                      Number(ticket.createdAt) / 1_000_000,
                                    ).toLocaleDateString()}
                                  </span>
                                  {ticket.assignee && (
                                    <>
                                      <span className="text-muted-foreground text-xs">
                                        ·
                                      </span>
                                      <span className="text-muted-foreground text-xs flex items-center gap-1">
                                        <User className="size-3" />
                                        {ticket.assignee.toText()}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <CreateTicketModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <TicketDetailModal
        ticket={detailTicket}
        open={!!detailTicket}
        onClose={() => setDetailTicket(null)}
      />
      <DeleteConfirmModal
        ticket={deleteTicket}
        open={!!deleteTicket}
        onClose={() => setDeleteTicket(null)}
        onConfirm={handleDelete}
      />
    </SidebarLayout>
  );
}
