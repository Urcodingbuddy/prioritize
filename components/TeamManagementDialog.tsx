"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Users,
  Shield,
  ShieldCheck,
  User as UserIcon,
  Crown,
  X,
  Loader2,
  UserPlus,
  Trash2,
} from "lucide-react";
import { getAvatarUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSoundEffects } from "@/hooks/use-sound-effects";

interface Member {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN" | "OFFICER";
  joinedAt: string;
  avatar?: string;
}

interface TeamManagementDialogProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  currentUserId: string;
  currentUserRole: string | null;
}

export function TeamManagementDialog({
  open,
  onClose,
  teamId,
  currentUserId,
  currentUserRole,
}: TeamManagementDialogProps) {
  const { playClick } = useSoundEffects();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open, teamId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      await api.companies.switch(teamId);
      const membersRes: any = await api.teams.members();
      setMembers(membersRes.data || []);
    } catch (err) {
      console.error("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (newRole === "ADMIN") {
      setError("Cannot promote to Admin directly. Use Transfer Ownership.");
      return;
    }

    try {
      setError("");
      await api.teams.updateMember(userId, newRole);
      fetchMembers();
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    playClick();

    try {
      setError("");
      await api.teams.removeMember(userId);
      fetchMembers();
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setSubmitting(true);
    setInviteError("");
    try {
      await api.teams.invite(inviteEmail);
      setShowInviteDialog(false);
      setInviteEmail("");
      fetchMembers();
    } catch (err: any) {
      setInviteError(err.message || "Failed to send invitation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedMember) return;

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
      fetchMembers();
    } catch (err: any) {
      setError(err.message || "Failed to transfer ownership");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="h-3.5 w-3.5 text-amber-500" />;
      case "OFFICER":
        return <ShieldCheck className="h-3.5 w-3.5 text-primary" />;
      default:
        return <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive"; // Closest to 'amber' distinctive look in default palette
      case "OFFICER":
        return "secondary";
      default:
        return "outline";
    }
  };

  const isAdmin = currentUserRole === "ADMIN";
  const officers = members.filter((m) => m.role === "OFFICER");

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          showCloseButton={false}
          className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8 rounded-sm hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground z-50"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogHeader className="pr-10">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </span>
              {isAdmin && (
                <Button
                  size="sm"
                  onClick={() => {
                    setInviteError("");
                    setShowInviteDialog(true);
                  }}
                  className="gap-1.5 text-xs font-bold"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Invite
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              {isAdmin
                ? "Manage team members, roles, and invitations"
                : "View team members and assign tasks"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex-1 overflow-y-auto space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Members List */}
                <div className="bg-secondary/30 rounded-xl overflow-hidden">
                  <div className="p-3 border-b border-border/50 bg-muted/30">
                    <h3 className="text-xs font-bold flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      Team Members ({members.length})
                    </h3>
                  </div>

                  <div className="divide-y divide-border/30">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="p-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-secondary/30 border border-border overflow-hidden shrink-0 shadow-sm relative">
                            <img
                              src={getAvatarUrl(member.avatar || member.name)}
                              alt={member.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold">{member.name}</p>
                              <Badge
                                variant={getRoleBadge(member.role) as any}
                                className="ml-1"
                              >
                                {member.role}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>

                        {isAdmin &&
                          member.id !== currentUserId &&
                          member.role !== "ADMIN" && (
                            <div className="flex items-center gap-2">
                              <Select
                                value={member.role}
                                onValueChange={(val) =>
                                  handleRoleChange(member.id, val)
                                }
                              >
                                <SelectTrigger className="w-24 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="USER">User</SelectItem>
                                  <SelectItem value="OFFICER">
                                    Officer
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Remove Member?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove{" "}
                                      {member.name} from the team?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() =>
                                        handleRemoveMember(member.id)
                                      }
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ownership Transfer - Only for Admin */}
                {isAdmin && officers.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl overflow-hidden">
                    <div className="p-3 border-b border-amber-500/20">
                      <h3 className="text-xs font-bold flex items-center gap-2 text-amber-600">
                        <Crown className="h-3.5 w-3.5" />
                        Transfer Ownership
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Transfer admin rights to an Officer (7+ days required)
                      </p>
                    </div>

                    <div className="p-3 space-y-2">
                      {officers.map((officer) => {
                        const daysSinceJoined = Math.floor(
                          (Date.now() - new Date(officer.joinedAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        const canTransfer = daysSinceJoined >= 7;

                        return (
                          <div
                            key={officer.id}
                            className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                {officer.name[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold">
                                  {officer.name}
                                </p>
                                <p className="text-[9px] text-muted-foreground">
                                  {daysSinceJoined} days
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
                              className="text-[10px] font-bold h-7"
                            >
                              {canTransfer
                                ? "Transfer"
                                : `${7 - daysSinceJoined}d left`}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join this team.
            </DialogDescription>
          </DialogHeader>
          {inviteError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive">
              {inviteError}
            </div>
          )}
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
              Transfer admin ownership to{" "}
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
    </>
  );
}
