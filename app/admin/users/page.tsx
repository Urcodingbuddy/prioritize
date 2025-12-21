"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Send,
  Trash2,
  UserPlus,
  Mail,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  ChevronRight,
  Shield,
  MoreVertical,
  Settings2,
  ArrowUpCircle,
  ArrowDownCircle,
  UserMinus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [managingMember, setManagingMember] = useState<any | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const meRes: any = await api.auth.me();
        setCurrentUser(meRes.data);

        if (meRes.data.currentCompanyId) {
          const membersRes: any = await api.teams.listMembers();
          setMembers(membersRes.data);
        }
      } catch (err: any) {
        if (err.status === 403) router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInviting(true);

    try {
      await api.teams.invite(inviteEmail);
      setShowInviteDialog(false);
      setInviteEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    try {
      await api.teams.updateMember(userId, newRole);
      setManagingMember(null);
      const membersRes: any = await api.teams.listMembers();
      setMembers(membersRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;
    try {
      await api.teams.removeMember(deletingUserId);
      setDeletingUserId(null);
      setManagingMember(null);
      const response: any = await api.teams.listMembers();
      setMembers(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-sm" />
          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest animate-pulse">
            Syncing Team...
          </p>
        </div>
      </div>
    );
  }

  const teamMembership = currentUser?.memberships?.find(
    (m: any) => m.companyId === currentUser.currentCompanyId
  );
  const teamRole = teamMembership?.role || "USER";
  const isAdmin = teamRole === "ADMIN";
  const isOfficer = teamRole === "OFFICER";
  const hasTeam = !!currentUser?.currentCompanyId;

  if (!hasTeam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8 text-center">
        <div className="max-w-sm space-y-6">
          <div className="h-20 w-20 bg-secondary/50 rounded-[2rem] mx-auto flex items-center justify-center">
            <UserPlus className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">No Team Joined</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              You're not currently a member of any team. Register a new team in
              the Teams section.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/teams")}
            className="w-full h-11 rounded-xl"
          >
            Go to Teams Hub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-5 bg-primary/10 rounded flex items-center justify-center border border-primary/20">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
                Team Governance
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {isAdmin || isOfficer ? "Management Center" : "Team Directory"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm font-medium">
              {isAdmin || isOfficer
                ? "Manage access levels and oversee workspace collaboration."
                : "View and collaborate with your fellow team members."}
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setShowInviteDialog(true)}
              className="shadow-xl shadow-primary/20 h-11 px-6 font-bold rounded-xl"
            >
              <Send className="h-4 w-4 mr-3" />
              Invite Member
            </Button>
          )}
        </div>

        <div className="grid gap-4">
          {members.map((member) => (
            <Card
              key={member.id}
              className="group hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 border-border/40 bg-card/60 backdrop-blur-sm rounded-3xl overflow-hidden"
            >
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-black text-xl border border-primary/10 shadow-sm transition-transform group-hover:scale-105">
                    {member.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-foreground tracking-tight">
                        {member.name}
                        {member.id === currentUser?.id && (
                          <span className="ml-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-secondary px-1.5 py-0.5 rounded-md">
                            You
                          </span>
                        )}
                      </h3>
                      <div
                        className={cn(
                          "text-[9px] font-black uppercase tracking-tighter h-5 px-2 rounded-lg flex items-center gap-1 transition-all",
                          member.role === "ADMIN"
                            ? "bg-primary text-primary-foreground"
                            : member.role === "OFFICER"
                            ? "bg-blue-600 text-white"
                            : "bg-secondary text-muted-foreground border border-border"
                        )}
                      >
                        {member.role === "ADMIN" && (
                          <ShieldCheck className="h-2.5 w-2.5" />
                        )}
                        {member.role === "OFFICER" && (
                          <ShieldAlert className="h-2.5 w-2.5" />
                        )}
                        {member.role}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mt-1 flex items-center gap-2 opacity-80">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </p>
                  </div>
                </div>

                {isAdmin && member.id !== currentUser?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground/40 hover:text-foreground hover:bg-secondary rounded-xl transition-all"
                    onClick={() => setManagingMember(member)}
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Manage Member Dialog (The 3-dots replacement) */}
        <Dialog
          open={!!managingMember}
          onOpenChange={(open) => !open && setManagingMember(null)}
        >
          <DialogContent className="max-w-sm p-6 bg-background border-border shadow-2xl rounded-[2.5rem]">
            <DialogHeader className="text-center pb-4">
              <div className="h-16 w-16 rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-black text-2xl mx-auto mb-4 border border-primary/20">
                {managingMember?.name[0].toUpperCase()}
              </div>
              <DialogTitle className="text-xl font-black">
                {managingMember?.name}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                Access Management
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 text-center mb-4">
                Update Access Level
              </p>

              <div className="grid gap-2">
                {managingMember?.role !== "ADMIN" && (
                  <Button
                    variant="outline"
                    className="justify-start h-12 rounded-2xl gap-3 font-bold border-2 hover:bg-primary/5 hover:text-primary transition-all"
                    onClick={() => handleUpdateRole(managingMember.id, "ADMIN")}
                  >
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Promote to Admin
                  </Button>
                )}
                {managingMember?.role !== "OFFICER" && (
                  <Button
                    variant="outline"
                    className="justify-start h-12 rounded-2xl gap-3 font-bold border-2 hover:bg-blue-500/5 hover:text-blue-500 transition-all"
                    onClick={() =>
                      handleUpdateRole(managingMember.id, "OFFICER")
                    }
                  >
                    <ShieldAlert className="h-4 w-4 text-blue-500" />
                    Set as Officer
                  </Button>
                )}
                {managingMember?.role !== "USER" && (
                  <Button
                    variant="outline"
                    className="justify-start h-12 rounded-2xl gap-3 font-bold border-2 hover:bg-muted transition-all"
                    onClick={() => handleUpdateRole(managingMember.id, "USER")}
                  >
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    Demote to Member
                  </Button>
                )}

                {managingMember?.id !== currentUser?.id && (
                  <Button
                    variant="ghost"
                    className="justify-start h-12 rounded-2xl gap-3 font-bold text-destructive hover:bg-destructive/10 transition-all mt-2"
                    onClick={() => setDeletingUserId(managingMember.id)}
                  >
                    <UserMinus className="h-4 w-4" />
                    Remove from Team
                  </Button>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => setManagingMember(null)}
              className="w-full mt-4 text-[10px] font-black uppercase tracking-widest"
            >
              Exit
            </Button>
          </DialogContent>
        </Dialog>

        {/* Invite Dialog */}
        <Dialog
          open={showInviteDialog}
          onOpenChange={(open) => {
            setShowInviteDialog(open);
            if (!open) {
              setInviteEmail("");
              setError("");
            }
          }}
        >
          <DialogContent className="max-w-md p-8 bg-background border-border shadow-2xl rounded-[2.5rem]">
            <DialogHeader className="text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                Invite to Workspace
              </DialogTitle>
              <DialogDescription className="text-sm font-medium mt-1 leading-relaxed">
                Add a new collaborator to your team. They will receive an
                invitation to join.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleInviteUser} className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label
                  htmlFor="inviteEmail"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1"
                >
                  New Member Email
                </Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collaborator@company.com"
                  required
                  className="h-12 bg-secondary/30 border-transparent focus:border-primary/30 transition-all font-medium rounded-xl"
                />
              </div>

              {error && (
                <div className="text-xs font-bold text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20 animate-in fade-in">
                  {error}
                </div>
              )}

              <DialogFooter className="pt-2 sm:flex-col gap-2">
                <Button
                  type="submit"
                  disabled={inviting}
                  className="w-full h-12 font-bold shadow-lg shadow-primary/20 rounded-xl"
                >
                  {inviting ? "Delivering..." : "Send Invitation"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowInviteDialog(false)}
                  className="w-full text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog
          open={!!deletingUserId}
          onOpenChange={() => setDeletingUserId(null)}
        >
          <DialogContent className="rounded-[2.5rem] p-8 max-w-sm">
            <DialogHeader className="text-center">
              <div className="h-14 w-14 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-destructive/20 text-destructive">
                <UserMinus className="h-7 w-7" />
              </div>
              <DialogTitle className="text-xl font-black">
                Revoke Access?
              </DialogTitle>
              <DialogDescription className="text-sm font-medium leading-relaxed">
                This will permanently remove the member from your workspace. All
                their active task assignments will be cleared.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-6 sm:flex-col gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                className="w-full h-12 font-bold shadow-lg shadow-destructive/20 rounded-xl"
              >
                Confirm Removal
              </Button>
              <Button
                variant="ghost"
                onClick={() => setDeletingUserId(null)}
                className="w-full text-xs font-black uppercase tracking-widest"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
