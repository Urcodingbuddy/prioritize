"use client";

import { useState, useEffect } from "react";
import { PriorityBoard } from "@/components/PriorityBoard";
import { Task, User } from "@/lib/types";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Users, Globe2, Settings, UserCircle, LayoutGrid } from "lucide-react";
import { TeamManagementDialog } from "@/components/TeamManagementDialog";
import { TaskEditDialog } from "@/components/TaskEditDialog";

// Skeleton component for loading state
function TeamPageSkeleton() {
  return (
    <div className="space-y-10 pb-12 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="h-5 w-32 bg-secondary/30 rounded mb-3" />
          <div className="h-10 w-64 bg-secondary/40 rounded mb-2" />
          <div className="h-4 w-96 bg-secondary/20 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-secondary/30 rounded-xl" />
          <div className="h-10 w-32 bg-secondary/30 rounded-xl" />
        </div>
      </div>

      {/* Priority Board skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-secondary/20 rounded-2xl p-4 space-y-3">
            <div className="h-6 w-24 bg-secondary/30 rounded" />
            <div className="space-y-2">
              <div className="h-20 w-full bg-secondary/30 rounded-xl" />
              <div className="h-20 w-full bg-secondary/30 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeamTasksPage() {
  const { id } = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showManagement, setShowManagement] = useState(false);
  const [activeTab, setActiveTab] = useState<"my-tasks" | "all-tasks">(
    "my-tasks"
  );
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCurrentUser();
    if (id) {
      api.companies.switch(id as string).catch(console.error);
    }
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const response: any = await api.auth.me();
      setCurrentUser(response.data);

      const membership = response.data.memberships?.find(
        (m: any) => m.companyId === id
      );
      setUserRole(membership?.role || null);
    } catch (err) {
      console.error("Failed to fetch current user");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.tasks.delete(taskId);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleSaveTask = async (
    taskData: Partial<Task> & { assignedUserIds?: string[] }
  ) => {
    try {
      if (editTask) {
        await api.tasks.update(editTask.id, {
          ...taskData,
          dueDate:
            taskData.dueDate === null
              ? null
              : taskData.dueDate
              ? new Date(taskData.dueDate).toISOString()
              : undefined,
        });
      } else {
        await api.tasks.create({
          title: taskData.title!,
          description: taskData.description || undefined,
          dueDate: taskData.dueDate
            ? new Date(taskData.dueDate).toISOString()
            : undefined,
          priority: taskData.priority,
          isPublic: true,
          assignedUserIds: taskData.assignedUserIds,
          companyId: id as string,
        });
      }
      setRefreshTrigger((prev) => prev + 1);
      setEditTask(null);
      setIsNewTaskOpen(false);
    } catch (error) {
      console.error("Failed to save task", error);
    }
  };

  const canAccessManagement = true; // Everyone can see member list now
  const isOfficerOrAdmin = userRole === "ADMIN" || userRole === "OFFICER";
  const canCreateInTeam = isOfficerOrAdmin;

  if (loading) {
    return <TeamPageSkeleton />;
  }

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-5 bg-blue-500/10 rounded flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500/70">
              Corporate Tasks
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Team Workspace
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium max-w-lg">
            Focused view of objectives assigned specifically to you within this
            team environment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canAccessManagement && (
            <button
              onClick={() => setShowManagement(true)}
              className="h-10 px-4 group flex items-center gap-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest transition-all"
            >
              <Settings className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              Management
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border/50 pb-1">
        <button
          onClick={() => setActiveTab("my-tasks")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === "my-tasks"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCircle className="h-4 w-4" />
          My Corporate Tasks
        </button>
        <button
          onClick={() => setActiveTab("all-tasks")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === "all-tasks"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          All Team Tasks
        </button>
      </div>

      <div className={activeTab === "my-tasks" ? "block" : "hidden"}>
        <PriorityBoard
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onCreateTask={() => setIsNewTaskOpen(true)}
          refreshTrigger={refreshTrigger}
          assignedToMe={true}
          personalOnly={false}
          canCreate={isOfficerOrAdmin}
          companyId={id as string}
        />
      </div>

      <div className={activeTab === "all-tasks" ? "block" : "hidden"}>
        <PriorityBoard
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onCreateTask={() => setIsNewTaskOpen(true)}
          refreshTrigger={refreshTrigger}
          assignedToMe={false}
          personalOnly={false}
          canCreate={isOfficerOrAdmin}
          companyId={id as string}
        />
      </div>

      {/* Management Overlay */}
      <TeamManagementDialog
        open={showManagement}
        onClose={() => setShowManagement(false)}
        teamId={id as string}
        currentUserId={currentUser?.id || ""}
        currentUserRole={userRole}
      />

      <TaskEditDialog
        open={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onSave={handleSaveTask}
        task={null}
        isNew={true}
        canAssign={isOfficerOrAdmin}
        teamId={id as string}
      />

      <TaskEditDialog
        task={editTask}
        open={!!editTask}
        onClose={() => setEditTask(null)}
        onSave={handleSaveTask}
        isNew={false}
        canAssign={isOfficerOrAdmin}
        teamId={id as string}
      />
    </div>
  );
}
