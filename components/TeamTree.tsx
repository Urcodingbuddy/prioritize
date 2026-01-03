"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { TeamMembership } from "@/lib/types";
import { Users, ChevronDown, ChevronRight, Plus, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface TeamTreeProps {
  memberships: TeamMembership[];
  currentCompanyId: string | null | undefined;
  collapsed: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTeamCreated?: () => void;
}

export function TeamTree({
  memberships,
  currentCompanyId,
  collapsed,
  isExpanded,
  onToggleExpand,
  onTeamCreated,
}: TeamTreeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Check if we're on a team-related page to determine active team from URL
  const urlTeamId = pathname.match(/\/teams\/([^\/]+)/)?.[1];
  // Only show team as active if we're actually on that team's page
  const activeTeamId = urlTeamId || null;

  const getPriorityScore = (p: string) => {
    switch (p) {
      case "URGENT":
        return 4;
      case "HIGH":
        return 3;
      case "MEDIUM":
        return 2;
      case "LOW":
        return 1;
      default:
        return 0;
    }
  };

  const getUrgencyColor = (tasks: any[]) => {
    const activeTasks = tasks.filter((t: any) => t.status !== "COMPLETED");
    if (activeTasks.length === 0) return null;

    const maxPriority = Math.max(
      0,
      ...activeTasks.map((t: any) => getPriorityScore(t.priority))
    );

    switch (maxPriority) {
      case 4:
        return "bg-red-500 text-white border-red-600 hover:bg-red-600 font-bold shadow-md shadow-red-500/20"; // Urgent - Solid Red
      case 3:
        return "bg-orange-500 text-white border-orange-600 hover:bg-orange-600 font-bold shadow-md shadow-orange-500/20"; // High - Solid Orange
      case 2:
        return "bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-500 font-bold shadow-md shadow-yellow-500/20"; // Medium - Solid Yellow
      case 1:
        return "bg-blue-500 text-white border-blue-600 hover:bg-blue-600 font-bold shadow-md shadow-blue-500/20"; // Low - Solid Blue
      default:
        return null;
    }
  };

  const sortedMemberships = [...memberships].sort((a, b) => {
    const tasksA = (a.company as any).tasks || [];
    const activeTasksA = tasksA.filter((t: any) => t.status !== "COMPLETED");

    const tasksB = (b.company as any).tasks || [];
    const activeTasksB = tasksB.filter((t: any) => t.status !== "COMPLETED");

    if (activeTasksA.length !== activeTasksB.length) {
      return activeTasksB.length - activeTasksA.length;
    }

    const maxPriorityA = Math.max(
      0,
      ...activeTasksA.map((t: any) => getPriorityScore(t.priority))
    );
    const maxPriorityB = Math.max(
      0,
      ...activeTasksB.map((t: any) => getPriorityScore(t.priority))
    );

    return maxPriorityB - maxPriorityA;
  });

  const handleSelectTeam = async (companyId: string) => {
    try {
      await api.companies.switch(companyId);
      router.push(`/teams/${companyId}/tasks`);
    } catch (error) {
      console.error("Failed to switch team");
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const res: any = await api.companies.create(newTeamName);
      setShowCreateDialog(false);
      setNewTeamName("");
      onTeamCreated?.();
      router.push(`/teams/${res.data.id}/tasks`);
    } catch (err: any) {
      setError(err.message || "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  // Total items: New Team button + all memberships
  const totalItems = sortedMemberships.length + 1;

  // COLLAPSED STATE - Show teams as icon list with shared expand state
  if (collapsed) {
    return (
      <>
        <div className="space-y-1">
          {/* Teams folder icon - clickable to toggle expand */}
          <div className="relative group flex justify-center">
            <button
              onClick={onToggleExpand}
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center transition-all",
                isExpanded
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground/70 hover:bg-[#125DB0] hover:text-white"
              )}
            >
              <Users className="h-4 w-4" />
            </button>
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-background border shadow-xl rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all scale-95 group-hover:scale-100 origin-left">
              Teams {isExpanded ? "(Collapse)" : "(Expand)"}
            </div>
          </div>

          {/* Only show team list when expanded */}
          {isExpanded && (
            <>
              {/* New Team button - FIRST */}
              <div className="relative group flex justify-center">
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="h-9 w-9 rounded-xl flex items-center justify-center bg-muted/20 border border-dashed border-muted-foreground/20 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-background border shadow-xl rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all scale-95 group-hover:scale-100 origin-left">
                  New Team
                </div>
              </div>

              {/* Team icons list */}
              {sortedMemberships.map((membership) => {
                const isSelected = activeTeamId === membership.companyId;
                const tasks = (membership.company as any).tasks || [];
                const activeTaskCount = tasks.filter(
                  (t: any) => t.status !== "COMPLETED"
                ).length;
                const urgencyClasses = getUrgencyColor(tasks);

                return (
                  <div
                    key={membership.companyId}
                    className="relative group flex justify-center"
                  >
                    <button
                      onClick={() => handleSelectTeam(membership.companyId)}
                      className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center transition-all text-[11px] font-bold border",
                        isSelected
                          ? "bg-primary/20 text-primary ring-2 ring-primary/30 border-transparent"
                          : urgencyClasses
                          ? urgencyClasses
                          : "bg-muted/30 text-muted-foreground hover:bg-[#125DB0] hover:text-white border-transparent"
                      )}
                    >
                      {membership.company.name[0].toUpperCase()}
                    </button>
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-background border shadow-xl rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all scale-95 group-hover:scale-100 origin-left flex items-center gap-2">
                      <span>{membership.company.name}</span>
                      <span className="opacity-70">({activeTaskCount})</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Create Team Dialog */}
        <CreateTeamDialogContent
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          newTeamName={newTeamName}
          setNewTeamName={setNewTeamName}
          handleCreateTeam={handleCreateTeam}
          submitting={submitting}
          error={error}
        />
      </>
    );
  }

  // EXPANDED STATE - Full tree with connector lines
  return (
    <>
      <div className="space-y-0.5">
        {/* Teams Folder Header */}
        <button
          onClick={onToggleExpand}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all",
            "text-muted-foreground/70 hover:bg-[#125DB0] hover:text-white"
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform" />
          )}
          <Users className="h-5 w-5 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-widest truncate">
            Teams
          </span>
        </button>

        {/* Team List with SOLID connector lines */}
        {isExpanded && (
          <div className="ml-[18px] pl-3 relative">
            {/* Vertical connector line */}
            <div
              className="absolute left-0 top-0 w-[2px] bg-primary/40"
              style={{
                height: totalItems > 0 ? `calc(100% - 14px)` : "0px",
              }}
            />

            {/* New Team button - FIRST child */}
            <div className="relative flex items-center">
              {/* Horizontal connector */}
              <div
                className="absolute w-3 h-[2px] bg-primary/40"
                style={{ left: "-12px" }}
              />
              {/* L-corner if this is the only item */}
              {sortedMemberships.length === 0 && (
                <div
                  className="absolute w-[2px] bg-card"
                  style={{ left: "-12px", top: "50%", height: "50%" }}
                />
              )}
              <button
                onClick={() => setShowCreateDialog(true)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-all text-muted-foreground/50 hover:text-primary hover:bg-primary/10 group/new"
              >
                <div className="h-7 w-7 rounded-lg border border-dashed border-muted-foreground/30 flex items-center justify-center group-hover/new:border-primary/50 group-hover/new:bg-primary/10 transition-all">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-semibold">New Team</span>
              </button>
            </div>

            {/* Existing teams */}
            {sortedMemberships.map((membership, index) => {
              const isSelected = activeTeamId === membership.companyId;
              const isLast = index === sortedMemberships.length - 1;
              const tasks = (membership.company as any).tasks || [];
              const activeTaskCount = tasks.filter(
                (t: any) => t.status !== "COMPLETED"
              ).length;
              const urgencyClasses = getUrgencyColor(tasks);

              return (
                <div
                  key={membership.companyId}
                  className="relative flex items-center"
                >
                  {/* Horizontal connector */}
                  <div
                    className="absolute w-3 h-[2px] bg-primary/40"
                    style={{ left: "-12px" }}
                  />
                  {/* L-corner for last item */}
                  {isLast && (
                    <div
                      className="absolute w-[2px] bg-card"
                      style={{ left: "-12px", top: "50%", height: "50%" }}
                    />
                  )}

                  <button
                    onClick={() => handleSelectTeam(membership.companyId)}
                    className={cn(
                      "w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-left transition-all group/team",
                      isSelected
                        ? "bg-[#125DB0] text-white"
                        : "text-muted-foreground/70 hover:bg-[#125DB0] hover:text-white"
                    )}
                  >
                    {/* Team initial badge */}
                    <div
                      className={cn(
                        "h-6 w-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-all border",
                        isSelected
                          ? "bg-white text-[#125DB0] border-transparent"
                          : urgencyClasses
                          ? urgencyClasses
                          : "bg-muted/50 text-muted-foreground group-hover/team:bg-white/90 group-hover/team:text-[#125DB0] border-transparent"
                      )}
                    >
                      {membership.company.name[0].toUpperCase()}
                    </div>

                    {/* Team name */}
                    <span
                      className={cn(
                        "text-sm font-semibold truncate flex-1",
                        isSelected && "font-bold"
                      )}
                    >
                      {membership.company.name}
                    </span>

                    {/* Task count badge */}
                    {activeTaskCount > 0 && (
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {activeTaskCount}
                      </span>
                    )}

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-pulse" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Team Dialog */}
      <CreateTeamDialogContent
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        newTeamName={newTeamName}
        setNewTeamName={setNewTeamName}
        handleCreateTeam={handleCreateTeam}
        submitting={submitting}
        error={error}
      />
    </>
  );
}

// Extracted dialog component for reuse
function CreateTeamDialogContent({
  open,
  onOpenChange,
  newTeamName,
  setNewTeamName,
  handleCreateTeam,
  submitting,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newTeamName: string;
  setNewTeamName: (name: string) => void;
  handleCreateTeam: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-8 bg-background border-border shadow-2xl rounded-[2rem]">
        <DialogHeader className="text-center">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">
            Create New Team
          </DialogTitle>
          <DialogDescription className="text-sm font-medium mt-1">
            Build a workspace for your organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateTeam} className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label
              htmlFor="teamName"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1"
            >
              Team Name
            </Label>
            <Input
              id="teamName"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Engineering, Marketing, etc."
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
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Team"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
