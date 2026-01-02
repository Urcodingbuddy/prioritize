"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Users,
  Shield,
  ShieldCheck,
  User as UserIcon,
  Crown,
  ArrowLeft,
  Loader2,
  UserPlus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Member {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN" | "OFFICER";
  joinedAt: string;
}

export default function ManagementPage() {
  const { id } = useParams();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch current user
      const userRes: any = await api.auth.me();
      setCurrentUserId(userRes.data.id);
      const membership = userRes.data.memberships?.find(
        (m: any) => m.companyId === id
      );
      setCurrentUserRole(membership?.role || null);

      // Fetch members
      await api.companies.switch(id as string);
      const membersRes: any = await api.teams.members();
      setMembers(membersRes.data || []);
    } catch (err) {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Admin cannot promote to Admin
    if (newRole === "ADMIN" && currentUserRole === "ADMIN") {
      setError("Only the current Admin can transfer ownership");
      return;
    }

    try {
      await api.teams.updateMember(userId, newRole);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await api.teams.removeMember(userId);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      await api.teams.invite(inviteEmail);
      setShowInviteDialog(false);
      setInviteEmail("");
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to send invitation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedMember) return;

    // Check 7-day rule
    const joinedDate = new Date(selectedMember.joinedAt);
    const daysSinceJoined = Math.floor(
      (Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceJoined < 7) {
      setError(
        `Officer must be a member for at least 7 days. ${selectedMember.name} has been a member for ${daysSinceJoined} days.`
      );
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.teams.transferOwnership(selectedMember.id);
      setShowTransferDialog(false);
      setSelectedMember(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to transfer ownership");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="h-4 w-4 text-amber-500" />;
      case "OFFICER":
        return <ShieldCheck className="h-4 w-4 text-primary" />;
      default:
        return <UserIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "OFFICER":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // Check if user can access this page
  // Requirement: "User managment visible for all users but edit permissions is olny for ADMIN"
  const canAccess = true; // Everyone can view
  const canManage =
    currentUserRole === "ADMIN" || currentUserRole === "OFFICER";
  const isAdmin = currentUserRole === "ADMIN";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-sm text-muted-foreground">
          Only Admin and Officer can access team management.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  const officers = members.filter((m) => m.role === "OFFICER");

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Tasks
          </button>
          <h1 className="text-3xl font-black tracking-tight">
            Team Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {canManage
              ? "Manage team members, roles, and invitations"
              : "View team members"}
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => setShowInviteDialog(true)}
            className="gap-2 font-bold"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Members List */}
      <div className="bg-card border rounded-2xl overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members ({members.length})
          </h3>
        </div>

        <div className="divide-y">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-sm font-bold">
                  {member.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{member.name}</p>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1",
                        getRoleBadge(member.role)
                      )}
                    >
                      {getRoleIcon(member.role)}
                      {member.role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>

              {/* Actions - Only Admin/Officer can manage, but only Admin can change roles/remove? 
                  Requirement: "User managment visible for all users but edit permissions is olny for ADMIN"
                  This implies Officer might NOT be able to edit roles?
                  Requirement 6: "Task assign permission for officer and admin"
                  Let's assume Officer can maybe invite? 
                  "edit permissions is olny for ADMIN" usually refers to Role editing. 
                  Let's stick to: Only Admin can change roles/remove. Officer can maybe Invite?
                  For now, keep existing logic: Only ADMIN can change roles/remove.
              */}
              {isAdmin && member.id !== currentUserId && (
                <div className="flex items-center gap-2">
                  {/* Role Change Dropdown */}
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(member.id, e.target.value)
                    }
                    className="h-8 px-2 text-xs font-bold bg-secondary border-0 rounded-lg cursor-pointer"
                    disabled={member.role === "ADMIN"}
                  >
                    <option value="USER">User</option>
                    <option value="OFFICER">Officer</option>
                  </select>

                  {/* Remove Button */}
                  {member.role !== "ADMIN" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ownership Transfer Section - Only for Admin */}
      {isAdmin && officers.length > 0 && (
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="p-4 border-b bg-amber-500/5">
            <h3 className="text-sm font-bold flex items-center gap-2 text-amber-600">
              <Crown className="h-4 w-4" />
              Transfer Ownership
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Transfer admin rights to an Officer (requires 7+ days membership)
            </p>
          </div>

          <div className="p-4 space-y-3">
            {officers.map((officer) => {
              const joinedDate = new Date(officer.joinedAt);
              const daysSinceJoined = Math.floor(
                (Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              const canTransfer = daysSinceJoined >= 7;

              return (
                <div
                  key={officer.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {officer.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{officer.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Member for {daysSinceJoined} days
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={canTransfer ? "default" : "outline"}
                    size="sm"
                    disabled={!canTransfer}
                    onClick={() => {
                      setSelectedMember(officer);
                      setShowTransferDialog(true);
                    }}
                    className="text-xs font-bold"
                  >
                    {canTransfer
                      ? "Transfer Ownership"
                      : `${7 - daysSinceJoined} days left`}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join this team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer Ownership Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Transfer Ownership
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to transfer admin ownership to{" "}
              <strong>{selectedMember?.name}</strong>? You will become an
              Officer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTransferDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleTransferOwnership}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm Transfer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
