"use client";

import { useState } from "react";
import { PriorityBoard } from "@/components/PriorityBoard";
import { TaskForm } from "@/components/TaskForm";
import { Task } from "@/lib/types";
import { Globe2 } from "lucide-react";

export default function PublicDashboardPage() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleFormSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setEditingTask(null);
  };

  const handleFormClose = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-5 bg-primary/10 rounded flex items-center justify-center">
              <Globe2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
              Team Scope
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Public Board
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Visibility into all public tasks shared with the team.
          </p>
        </div>
      </div>

      <PriorityBoard
        onEditTask={handleEditTask}
        onDeleteTask={() => {}} // Usually non-creators/admins can't delete from here anyway
        refreshTrigger={refreshTrigger}
        publicOnly={true}
      />

      <TaskForm
        task={editingTask}
        open={showTaskForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
