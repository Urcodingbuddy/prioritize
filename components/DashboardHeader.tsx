"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  ChevronRight,
  X,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Invitation {
  id: string;
  company: {
    id: string;
    name: string;
  };
}

export function DashboardHeader({ onNewTask }: { onNewTask?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invitesRes, userRes]: any = await Promise.all([
        api.teams.listInvites(),
        api.auth.me(),
      ]);
      setInvites(invitesRes.data || []);
      setCurrentUser(userRes.data);
    } catch (error) {
      console.error("Failed to fetch data");
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await api.teams.acceptInvite(id);
      fetchData();
      setShowNotifications(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to accept");
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setLoading(true);
    try {
      await api.teams.rejectInvite(rejectId);
      setRejectId(null);
      fetchData();
    } catch (error) {
      console.error("Failed to reject");
    } finally {
      setLoading(false);
    }
  };

  // Generate breadcrumbs from pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathParts
    .map((part, i) => {
      let label = part.charAt(0).toUpperCase() + part.slice(1);

      // Replace ID with team name if applicable
      if (i > 0 && pathParts[i - 1] === "teams" && currentUser?.memberships) {
        const membership = currentUser.memberships.find(
          (m: any) => m.companyId === part || m.company?.id === part
        );
        if (membership?.company?.name) label = membership.company.name;
      }

      const href = "/" + pathParts.slice(0, i + 1).join("/");
      // User requested naming convention: "Terminal" -> "Dashboard" or "Teams"
      const finalLabel = label === "Teams" ? "Teams" : label;
      return { label: finalLabel, href };
    })
    .filter((crumb) => crumb.label !== "Dashboard");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 overflow-hidden">
          <button
            onClick={() => router.push("/dashboard")}
            className="hover:text-primary transition-colors shrink-0"
          >
            Dashboard
          </button>
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center shrink-0">
              <ChevronRight className="h-3 w-3 mx-2 opacity-20" />
              <button
                onClick={() => router.push(crumb.href)}
                className={cn(
                  "hover:text-primary transition-colors truncate max-w-[150px]",
                  i === breadcrumbs.length - 1 && "text-foreground font-black"
                )}
              >
                {crumb.label}
              </button>
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 relative">
          <ThemeToggle />
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative h-10 w-10 rounded-xl transition-all border border-transparent",
                showNotifications
                  ? "bg-secondary border-border"
                  : "bg-secondary/20 hover:bg-secondary/40"
              )}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-4.5 w-4.5" />
              {invites.length > 0 && (
                <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-primary rounded-full ring-2 ring-background animate-pulse" />
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-3 w-80 p-2 bg-background/95 backdrop-blur-2xl border border-border/50 rounded-[2rem] shadow-2xl z-[101] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                      Operations
                    </span>
                    {invites.length > 0 && (
                      <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {invites.length} pending
                      </span>
                    )}
                  </div>
                  <div className="max-h-[350px] overflow-y-auto mb-1 px-1">
                    {invites.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                          No alerts found.
                        </p>
                      </div>
                    ) : (
                      invites.map((invite) => (
                        <div
                          key={invite.id}
                          className="p-4 rounded-2xl hover:bg-white/5 transition-all mb-1 group border border-transparent hover:border-white/5"
                        >
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black truncate leading-tight">
                                {invite.company.name}
                              </p>
                              <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-tighter mt-1">
                                Operational Invite
                              </p>
                              <div className="flex gap-2 mt-4">
                                <Button
                                  size="sm"
                                  className="h-8 flex-1 font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20"
                                  onClick={() => handleAccept(invite.id)}
                                >
                                  Authorize
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-muted-foreground/40"
                                  onClick={() => setRejectId(invite.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <Button
            onClick={onNewTask}
            className="hidden md:flex h-10 px-6 font-black uppercase text-[10px] tracking-[0.2em] rounded-xl shadow-xl bg-primary hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Mission
          </Button>

          {/* Mobile Plus Button */}
          <Button
            variant="default"
            size="icon"
            onClick={onNewTask}
            className="md:hidden h-10 w-10 rounded-xl shadow-lg shadow-primary/20 bg-primary"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Rejection Confirmation */}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent className="rounded-[2rem] max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="h-12 w-12 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl font-black">
              Decline Invitation?
            </DialogTitle>
            <DialogDescription className="font-medium">
              Are you sure you want to decline this team invitation? You won't
              be able to join until re-invited.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2 mt-4">
            <Button
              variant="destructive"
              className="w-full font-bold h-11 rounded-xl shadow-lg shadow-destructive/20"
              onClick={handleReject}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Decline"}
            </Button>
            <Button
              variant="ghost"
              className="w-full font-bold h-11 rounded-xl text-muted-foreground"
              onClick={() => setRejectId(null)}
            >
              Go Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
