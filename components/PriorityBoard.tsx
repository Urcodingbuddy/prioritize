"use client";

import { useState, useEffect } from "react";
import { Task, Priority } from "@/lib/types";
import { TaskCard } from "@/components/TaskCard";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PriorityBoardProps {
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTask?: (priority: Priority) => void;
  refreshTrigger?: number;
  assignedToMe?: boolean;
  publicOnly?: boolean;
  personalOnly?: boolean;
}

const priorities: Priority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];

const priorityConfig: Record<Priority, { label: string; dotColor: string }> = {
  URGENT: { label: "Urgent", dotColor: "bg-red-500" },
  HIGH: { label: "High", dotColor: "bg-orange-500" },
  MEDIUM: { label: "Medium", dotColor: "bg-amber-400" },
  LOW: { label: "Low", dotColor: "bg-blue-500" },
};

export function PriorityBoard({
  onEditTask,
  onDeleteTask,
  onCreateTask,
  refreshTrigger,
  assignedToMe = false,
  publicOnly = false,
  personalOnly = false,
}: PriorityBoardProps) {
  const [tasksByPriority, setTasksByPriority] = useState<
    Record<Priority, Task[]>
  >({
    URGENT: [],
    HIGH: [],
    MEDIUM: [],
    LOW: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response: any = await api.tasks.list({
        limit: 100,
        assignedToMe,
        publicOnly,
        personalOnly,
      });
      const grouped = response.data.reduce(
        (acc: Record<Priority, Task[]>, task: Task) => {
          if (acc[task.priority]) {
            acc[task.priority].push(task);
          }
          return acc;
        },
        {
          URGENT: [],
          HIGH: [],
          MEDIUM: [],
          LOW: [],
        }
      );
      setTasksByPriority(grouped);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger, assignedToMe, publicOnly, personalOnly]);

  const handleStatusChange = async (taskId: string, status: any) => {
    try {
      await api.tasks.update(taskId, { status });
      fetchTasks();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 bg-secondary/5 rounded-3xl border border-dashed border-border/20 animate-pulse">
        Syncing Command Board...
      </div>
    );
  }

  return (
    <div className="flex h-full gap-5 overflow-x-auto pb-6 items-start scrollbar-hide">
      {priorities.map((priority) => {
        const hasTasks = tasksByPriority[priority].length > 0;
        return (
          <div
            key={priority}
            className="w-80 min-w-[300px] shrink-0 flex flex-col gap-4 bg-secondary/5 dark:bg-card/30 backdrop-blur-sm rounded-3xl p-4 border border-border/40 hover:border-border/80 transition-all group"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    priorityConfig[priority].dotColor
                  )}
                />
                <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
                  {priorityConfig[priority].label}
                </h2>
                <div className="px-2 py-0.5 rounded-lg bg-background/50 border border-border/20 text-[9px] font-black text-muted-foreground/60">
                  {tasksByPriority[priority].length}
                </div>
              </div>
              {!publicOnly && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground/40 hover:text-primary hover:bg-primary/5 transition-all rounded-xl"
                  onClick={() => onCreateTask?.(priority)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-3 min-h-[200px]">
              {!hasTasks ? (
                <button
                  onClick={() => onCreateTask?.(priority)}
                  className="flex-1 flex flex-col items-center justify-center border border-dashed border-border/30 rounded-2xl p-8 text-center group/empty transition-all hover:bg-white/5 hover:border-primary/20 cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-2xl bg-secondary/40 flex items-center justify-center mb-3 group-hover/empty:scale-110 group-hover/empty:rotate-6 transition-all duration-300">
                    <Plus className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                    Capture Task
                  </p>
                </button>
              ) : (
                tasksByPriority[priority].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
