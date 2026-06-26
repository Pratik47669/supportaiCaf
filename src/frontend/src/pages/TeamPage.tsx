import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Copy,
  Link2,
  Mail,
  MoreHorizontal,
  Plus,
  Shield,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { SidebarLayout } from "@/components/AppSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateInvite,
  useGetCallerUser,
  useGetMyBusiness,
  useRemoveTeamMember,
  useUpdateUserRole,
} from "@/hooks/useQueries";
import { useAuthStore, useInviteStore } from "@/store";

const roleOptions: { value: string; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "supportAgent", label: "Support Agent" },
  { value: "viewer", label: "Viewer" },
];

function roleBadgeColor(role: string) {
  switch (role) {
    case "owner":
      return "bg-chart-4/10 text-chart-4 border-chart-4/20";
    case "admin":
      return "bg-primary/10 text-primary border-primary/20";
    case "supportAgent":
      return "bg-accent/10 text-accent border-accent/20";
    case "viewer":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function formatRole(role: string) {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TeamPage() {
  const { user: currentUser } = useAuthStore();
  const { invites, addInvite } = useInviteStore();
  const { data: callerUser } = useGetCallerUser();
  const { data: business } = useGetMyBusiness();
  const updateRoleMutation = useUpdateUserRole();
  const removeMemberMutation = useRemoveTeamMember();
  const createInviteMutation = useCreateInvite();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviteExpiry, setInviteExpiry] = useState("7");
  const [generatedLink, setGeneratedLink] = useState("");
  const [roleEditUser, setRoleEditUser] = useState<string | null>(null);
  const [roleEditValue, setRoleEditValue] = useState("");
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const canManage =
    currentUser?.role === "owner" || currentUser?.role === "admin";

  const teamMembers = callerUser
    ? [
        {
          id: callerUser.principal.toText(),
          name: callerUser.name,
          email: callerUser.email || "—",
          role: callerUser.role,
          status: "active" as const,
          joinedAt: new Date(
            Number(callerUser.createdAt) / 1_000_000,
          ).toLocaleDateString(),
        },
      ]
    : currentUser
      ? [
          {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
            status: "active" as const,
            joinedAt: new Date().toLocaleDateString(),
          },
        ]
      : [];

  const pendingInvites = invites.filter((i) => i.status === "pending");

  function handleGenerateInvite() {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    const code = `${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
    const link = `${window.location.origin}/register?invite=${code}&role=${inviteRole}`;
    setGeneratedLink(link);
    addInvite({
      id: code,
      email: inviteEmail,
      role: inviteRole as import("@/store").UserRole,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    toast.success("Invite link generated");
  }

  function copyLink() {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    toast.success("Link copied to clipboard");
  }

  function handleRevokeInvite(inviteId: string) {
    useInviteStore.setState((state) => ({
      invites: state.invites.map((i) =>
        i.id === inviteId ? { ...i, status: "expired" as const } : i,
      ),
    }));
    toast.success("Invitation revoked");
  }

  function handleRoleChange(userId: string, newRole: string) {
    updateRoleMutation.mutate(
      {
        targetUserId: userId,
        newRole: newRole as import("@/backend").UserRole,
      },
      {
        onSuccess: () => {
          toast.success("Role updated successfully");
          setRoleEditUser(null);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to update role",
          );
        },
      },
    );
  }

  function openRemoveDialog(userId: string) {
    setRemoveTarget(userId);
    setRemoveDialogOpen(true);
  }

  function confirmRemove() {
    if (!removeTarget) return;
    removeMemberMutation.mutate(removeTarget, {
      onSuccess: () => {
        toast.success("Member removed successfully");
        setRemoveDialogOpen(false);
        setRemoveTarget(null);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to remove member",
        );
      },
    });
  }

  function handleResendInvite(invite: import("@/store").Invite) {
    if (!business?.id) {
      toast.error("Business not found");
      return;
    }
    const businessId =
      typeof business.id === "string" ? BigInt(business.id) : business.id;
    const code = `${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
    const expiresAt =
      BigInt(Date.now()) * 1_000_000n +
      BigInt(7 * 24 * 60 * 60 * 1_000_000_000);

    const roleMap: Record<string, import("@/backend").UserRole> = {
      owner: "owner" as import("@/backend").UserRole,
      admin: "admin" as import("@/backend").UserRole,
      support_agent: "supportAgent" as import("@/backend").UserRole,
      viewer: "viewer" as import("@/backend").UserRole,
    };

    createInviteMutation.mutate(
      {
        businessId,
        code,
        role:
          roleMap[invite.role] || ("viewer" as import("@/backend").UserRole),
        expiresAt,
      },
      {
        onSuccess: () => {
          toast.success(`Invite resent to ${invite.email}`);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to resend invite",
          );
        },
      },
    );
  }

  return (
    <SidebarLayout>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-semibold">Team</h1>
              <p className="text-muted-foreground text-sm">
                Manage your support team members
              </p>
            </div>
            {canManage && (
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button
                    data-ocid="team.invite.open_modal_button"
                    className="gap-2"
                  >
                    <UserPlus className="size-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display">
                      Invite Team Member
                    </DialogTitle>
                    <DialogDescription>
                      Generate a secure invite link to share with your team.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email address</Label>
                      <Input
                        id="invite-email"
                        data-ocid="team.invite.email_input"
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger
                          id="invite-role"
                          data-ocid="team.invite.role_select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-expiry">Link expires in</Label>
                      <Select
                        value={inviteExpiry}
                        onValueChange={setInviteExpiry}
                      >
                        <SelectTrigger
                          id="invite-expiry"
                          data-ocid="team.invite.expiry_select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {generatedLink && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        <Label>Invite link</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            readOnly
                            value={generatedLink}
                            className="flex-1 text-xs"
                          />
                          <Button
                            data-ocid="team.invite.copy_button"
                            variant="outline"
                            size="icon"
                            onClick={copyLink}
                            aria-label="Copy invite link"
                          >
                            <Copy className="size-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      data-ocid="team.invite.cancel_button"
                      variant="outline"
                      onClick={() => {
                        setInviteOpen(false);
                        setGeneratedLink("");
                        setInviteEmail("");
                      }}
                    >
                      Close
                    </Button>
                    <Button
                      data-ocid="team.invite.generate_button"
                      onClick={handleGenerateInvite}
                      disabled={!inviteEmail.trim()}
                    >
                      <Link2 className="size-4 mr-1" />
                      Generate Link
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </header>

        <div className="space-y-6 p-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                      <Users className="size-4" />
                    </div>
                    <span className="text-muted-foreground text-xs font-medium">
                      Active
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="font-display text-2xl font-bold">
                      {teamMembers.length}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Team Members
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="bg-accent/10 text-accent flex size-9 items-center justify-center rounded-lg">
                      <Mail className="size-4" />
                    </div>
                    <span className="text-muted-foreground text-xs font-medium">
                      Pending
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="font-display text-2xl font-bold">
                      {pendingInvites.length}
                    </p>
                    <p className="text-muted-foreground text-sm">Invitations</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="bg-chart-3/10 text-chart-3 flex size-9 items-center justify-center rounded-lg">
                      <Shield className="size-4" />
                    </div>
                    <span className="text-muted-foreground text-xs font-medium">
                      You
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="font-display text-2xl font-bold capitalize">
                      {currentUser?.role?.replace("_", " ") || "Member"}
                    </p>
                    <p className="text-muted-foreground text-sm">Your Role</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Team Members Table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <div
                    data-ocid="team.members.empty_state"
                    className="bg-muted/50 rounded-lg border p-8 text-center"
                  >
                    <Users className="text-muted-foreground mx-auto size-8 mb-3" />
                    <p className="text-muted-foreground font-medium">
                      No team members yet
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Invite colleagues to collaborate on support.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        {canManage && <TableHead className="w-[80px]" />}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member, index) => (
                        <TableRow
                          key={member.id}
                          data-ocid={`team.members.item.${index + 1}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {member.name}
                                </p>
                                <p className="text-muted-foreground text-xs truncate">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {roleEditUser === member.id ? (
                              <Select
                                value={roleEditValue}
                                onValueChange={(val) => {
                                  handleRoleChange(member.id, val);
                                }}
                                open
                              >
                                <SelectTrigger
                                  data-ocid={`team.members.role_select.${index + 1}`}
                                  className="w-[140px]"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {roleOptions.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                      {r.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge
                                variant="outline"
                                className={`capitalize ${roleBadgeColor(member.role)}`}
                              >
                                {formatRole(member.role)}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-chart-3/10 text-chart-3 border-chart-3/20 gap-1"
                            >
                              <CheckCircle2 className="size-3" />
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {member.joinedAt}
                          </TableCell>
                          {canManage && (
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    data-ocid={`team.members.actions_button.${index + 1}`}
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    aria-label="Member actions"
                                  >
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    data-ocid={`team.members.edit_role_button.${index + 1}`}
                                    onClick={() => {
                                      setRoleEditUser(member.id);
                                      setRoleEditValue(member.role);
                                    }}
                                  >
                                    <Shield className="size-4 mr-2" />
                                    Edit Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    data-ocid={`team.members.remove_button.${index + 1}`}
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => openRemoveDialog(member.id)}
                                  >
                                    <Trash2 className="size-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Invitations */}
          {canManage && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.32 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Mail className="size-5 text-accent" />
                    Pending Invitations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingInvites.length === 0 ? (
                    <div
                      data-ocid="team.invites.empty_state"
                      className="bg-muted/50 rounded-lg border p-8 text-center"
                    >
                      <Mail className="text-muted-foreground mx-auto size-8 mb-3" />
                      <p className="text-muted-foreground font-medium">
                        No pending invitations
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Generated invites will appear here.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Sent</TableHead>
                          <TableHead className="w-[180px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingInvites.map((invite, index) => (
                          <TableRow
                            key={invite.id}
                            data-ocid={`team.invites.item.${index + 1}`}
                          >
                            <TableCell className="text-sm">
                              {invite.email}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`capitalize ${roleBadgeColor(invite.role)}`}
                              >
                                {formatRole(invite.role)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(invite.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  data-ocid={`team.invites.resend_button.${index + 1}`}
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleResendInvite(invite)}
                                  disabled={createInviteMutation.isPending}
                                >
                                  <Mail className="size-3.5" />
                                  Resend
                                </Button>
                                <Button
                                  data-ocid={`team.invites.revoke_button.${index + 1}`}
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive gap-1"
                                  onClick={() => handleRevokeInvite(invite.id)}
                                >
                                  <Ban className="size-3.5" />
                                  Revoke
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Activity Log */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Clock className="size-5 text-chart-3" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {callerUser ? (
                  <>
                    <div
                      data-ocid="team.activity.item.1"
                      className="flex items-start gap-3"
                    >
                      <div className="bg-chart-3/10 text-chart-3 flex size-8 shrink-0 items-center justify-center rounded-full">
                        <CheckCircle2 className="size-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Account active</p>
                        <p className="text-muted-foreground text-xs">
                          by {callerUser.name}
                        </p>
                      </div>
                      <span className="text-muted-foreground shrink-0 text-xs">
                        {new Date(
                          Number(callerUser.createdAt) / 1_000_000,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div
                      data-ocid="team.activity.item.2"
                      className="flex items-start gap-3"
                    >
                      <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
                        <Shield className="size-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Role assigned</p>
                        <p className="text-muted-foreground text-xs">
                          {callerUser.role} role
                        </p>
                      </div>
                      <span className="text-muted-foreground shrink-0 text-xs">
                        Active
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">
                      Activity will appear here as your team interacts with the
                      platform.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Remove Member Confirmation */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="text-destructive size-5" />
              Remove Team Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              data-ocid="team.remove.cancel_button"
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="team.remove.confirm_button"
              variant="destructive"
              onClick={confirmRemove}
              disabled={removeMemberMutation.isPending}
            >
              <Trash2 className="size-4 mr-1" />
              {removeMemberMutation.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
}
