"use client";

import { useState, useEffect } from "react";
import { PriorityBoard } from "@/components/PriorityBoard";
import { Task, User } from "@/lib/types";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Layout, Users, Globe2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeamTasksPage() {
  const { id } = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchCurrentUser();
    // Ensure we are switched to this company context
    if (id) {
      api.companies.switch(id as string).catch(console.error);
    }
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const response: any = await api.auth.me();
      setCurrentUser(response.data);
    } catch (err) {
      console.error("Failed to fetch current user");
    }
  };

  const handleEditTask = (task: Task) => {
    // We can use a global task form in the layout or navigate to an edit page
    // For now, I'll assume we can trigger it or handle it in the board
  };

  const handleDeleteTask = (taskId: string) => {};

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
          <button
            onClick={() => router.push(`/teams/${id}/public`)}
            className="h-10 px-4 flex items-center gap-2 rounded-xl bg-secondary/50 hover:bg-secondary text-xs font-bold uppercase tracking-widest transition-all"
          >
            <Globe2 className="h-4 w-4" />
            Public Board
          </button>
        </div>
      </div>

      <PriorityBoard
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onCreateTask={() => {}} // Could trigger layout's form
        refreshTrigger={refreshTrigger}
        assignedToMe={true} // User self tasks as requested
      />
    </div>
  );
}
