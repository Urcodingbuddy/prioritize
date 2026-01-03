"use client";

import { useState, useEffect } from "react";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { Task, Priority } from "@/lib/types";
import { TaskCard } from "@/components/TaskCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  canCreate?: boolean;
  companyId?: string;
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
  canCreate = true,
  companyId,
}: PriorityBoardProps) {
  const { playClick } = useSoundEffects();
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
        companyId,
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
    <div className="w-full flex h-full gap-3 overflow-x-auto pb-6 px-4 items-start scrollbar-hide snap-x snap-mandatory">
      {priorities.map((priority) => {
        const hasTasks = tasksByPriority[priority].length > 0;
        return (
          <Card
            key={priority}
            className="flex-1 min-w-[250px] flex flex-col bg-card rounded-2xl border-2 border-border transition-all group snap-start"
          >
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full ring-1 ring-foreground",
                    priorityConfig[priority].dotColor
                  )}
                />
                <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-foreground">
                  {priorityConfig[priority].label}
                </h2>
                <div className="px-2 py-0.5 rounded-lg bg-card border-2 border-foreground text-[9px] font-black text-foreground">
                  {tasksByPriority[priority].length}
                </div>
              </div>
              {!publicOnly && canCreate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-foreground hover:bg-foreground/5 transition-all rounded-xl"
                  onClick={() => {
                    playClick();
                    onCreateTask?.(priority);
                  }}
                >
                  <Plus className="h-5 w-5 stroke-[3px]" />
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-3 pt-2 flex-1 flex flex-col gap-2 min-h-[200px]">
              {!hasTasks ? (
                canCreate ? (
                  <button
                    onClick={() => {
                      playClick();
                      onCreateTask?.(priority);
                    }}
                    className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-foreground/20 rounded-2xl p-8 text-center group/empty transition-all hover:bg-foreground/5 hover:border-foreground cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-foreground/5 flex items-center justify-center mb-3 group-hover/empty:scale-110 group-hover/empty:rotate-6 transition-all duration-300">
                      <Plus className="h-6 w-6 text-foreground stroke-[3px]" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60">
                      Capture Task
                    </p>
                  </button>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-foreground/20 rounded-2xl p-8 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60">
                      No Tasks
                    </p>
                  </div>
                )
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
