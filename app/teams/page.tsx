"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Plus,
  ChevronRight,
  ShieldCheck,
  Layout,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { TeamMembership } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TeamsPage() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res: any = await api.auth.me();
      setMemberships(res.data.memberships || []);
    } catch (error) {
      console.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const res: any = await api.companies.create(newCompanyName);
      setShowCreateDialog(false);
      setNewCompanyName("");
      router.push(`/teams/${res.data.id}/tasks`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectTeam = async (companyId: string) => {
    try {
      await api.companies.switch(companyId);
      router.push(`/teams/${companyId}/tasks`);
      router.refresh();
    } catch (error) {
      console.error("Failed to switch");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-5 w-5 bg-primary/10 rounded flex items-center justify-center">
              <Building2 className="h-3 w-3 text-primary" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/70">
              Organization Hub
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Your Teams
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Manage your workspace memberships and team collaborations.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateDialog(true)}
          className="shadow-lg shadow-primary/20 h-10 px-5 font-bold rounded-xl text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Register New Team
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {memberships.map((membership) => (
          <Card
            key={membership.companyId}
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-border/40 bg-card hover:border-primary/20 rounded-3xl overflow-hidden"
            onClick={() => handleSelectTeam(membership.companyId)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-black text-lg border border-primary/10 group-hover:scale-105 transition-transform">
                  {membership.company.name[0].toUpperCase()}
                </div>
                <div
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter flex items-center gap-1",
                    membership.role === "ADMIN"
                      ? "bg-primary text-primary-foreground"
                      : membership.role === "OFFICER"
                      ? "bg-blue-500 text-white"
                      : "bg-secondary text-muted-foreground border border-border"
                  )}
                >
                  {membership.role === "ADMIN" && (
                    <ShieldCheck className="h-2.5 w-2.5" />
                  )}
                  {membership.role}
                </div>
              </div>

              <h3 className="text-lg font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
                {membership.company.name}
              </h3>

              <div className="flex items-center justify-between mt-5 pt-3 border-t border-dashed border-border/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                <span>Open Workspace</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}

        {memberships.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center text-center space-y-6 bg-secondary/5 rounded-3xl border-2 border-dashed border-border/40">
            <div className="h-16 w-16 bg-background rounded-2xl flex items-center justify-center shadow-md ring-1 ring-border/50 animate-bounce">
              <Building2 className="h-8 w-8 text-primary/30" />
            </div>
            <div className="max-w-md px-6">
              <h2 className="text-xl font-black tracking-tight mb-1.5">
                Initialize Your Workspace
              </h2>
              <p className="text-muted-foreground font-medium text-xs leading-relaxed">
                Prioritize works best when you're part of a team. Connect with
                colleagues or start an organization.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-9 px-4 font-bold rounded-lg border-2 text-xs"
                onClick={() => window.location.reload()}
              >
                Refresh Invites
              </Button>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="h-9 px-4 font-bold rounded-lg shadow-md text-xs"
              >
                Register Company
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md p-8 bg-background border-border shadow-2xl rounded-[2rem]">
          <DialogHeader className="text-center">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">
              Create New Team
            </DialogTitle>
            <DialogDescription className="text-sm font-medium mt-1">
              Build a workspace for your organization.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCompany} className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label
                htmlFor="companyName"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1"
              >
                Team/Company Name
              </Label>
              <Input
                id="companyName"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Acme Corp, Engineering Team, etc."
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
                disabled={submitting}
                className="w-full h-12 font-bold shadow-lg shadow-primary/20 rounded-xl"
              >
                {submitting ? "Establishing..." : "Initialize Team"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreateDialog(false)}
                className="w-full text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
