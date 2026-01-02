"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Plus,
  CheckCircle2,
  Clock,
  Circle,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskEditDialog } from "@/components/TaskEditDialog";
import { TaskStatusDialog } from "@/components/TaskStatusDialog";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res: any = await api.tasks.list({ personalOnly: true });
      setTasks(res.data || []);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    // Optimistic update
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
    setSelectedTask(null);

    try {
      await api.tasks.delete(selectedTask.id);
    } catch (error) {
      console.error("Failed to delete task", error);
      // Revert on failure
      setTasks(previousTasks);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTask) return;

    // Optimistic update
    const previousTasks = [...tasks];
    const updatedTask = {
      ...selectedTask,
      status: newStatus as Task["status"],
    };

    setTasks((prev) =>
      prev.map((t) => (t.id === selectedTask.id ? updatedTask : t))
    );
    setSelectedTask(updatedTask); // Update the open dialog as well

    try {
      await api.tasks.update(selectedTask.id, { status: newStatus });
    } catch (error) {
      console.error("Failed to update status", error);
      // Revert
      setTasks(previousTasks);
      setSelectedTask(selectedTask);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    // Optimistic update for edit
    if (editTask) {
      const previousTasks = [...tasks];
      const updatedTask = { ...editTask, ...taskData } as Task;

      setTasks((prev) =>
        prev.map((t) => (t.id === editTask.id ? updatedTask : t))
      );
      setEditTask(null); // Close dialog immediately

      try {
        await api.tasks.update(editTask.id, {
          ...taskData,
          dueDate:
            taskData.dueDate === null
              ? null
              : taskData.dueDate
              ? new Date(taskData.dueDate).toISOString()
              : undefined,
        });
      } catch (error) {
        console.error("Failed to update task", error);
        setTasks(previousTasks);
      }
    }
    // Create is less critical for optimistic UI, but we can fast-close
    else {
      setIsNewTaskOpen(false);

      // Optimistic Update: Create a temp task and add it immediately
      const tempId = "temp-" + Date.now();
      const tempTask: Task = {
        id: tempId,
        title: taskData.title || "New Task",
        description: taskData.description || null,
        priority: taskData.priority || "MEDIUM",
        status: "PENDING",
        dueDate: taskData.dueDate || null,
        isPublic: false,
        companyId: "", // Placeholder
        creatorId: "current-user",
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedUsers: [],
        creator: {
          id: "current",
          name: "You",
          email: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      setTasks((prev) => [tempTask, ...prev]);

      try {
        const res: any = await api.tasks.create({
          title: taskData.title!,
          description: taskData.description || undefined,
          priority: taskData.priority,
          dueDate: taskData.dueDate
            ? new Date(taskData.dueDate).toISOString()
            : undefined,
          isPublic: false,
        });

        // Replace temp task with real task
        if (res.data) {
          setTasks((prev) => prev.map((t) => (t.id === tempId ? res.data : t)));
        } else {
          // Fallback if data missing (shouldn't happen)
          fetchTasks();
        }
      } catch (error) {
        console.error("Failed to create task", error);
        // Revert optimistic add
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground/50" />;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return { dot: "bg-red-500", border: "border-l-red-500" };
      case "HIGH":
        return { dot: "bg-orange-500", border: "border-l-orange-500" };
      case "MEDIUM":
        return { dot: "bg-yellow-500", border: "border-l-yellow-500" };
      case "LOW":
        return { dot: "bg-emerald-500", border: "border-l-emerald-500" };
      default:
        return { dot: "bg-muted", border: "border-l-muted" };
    }
  };

  const priorityTasks = {
    URGENT: tasks.filter((t) => t.priority === "URGENT"),
    HIGH: tasks.filter((t) => t.priority === "HIGH"),
    MEDIUM: tasks.filter((t) => t.priority === "MEDIUM"),
    LOW: tasks.filter((t) => t.priority === "LOW"),
  };

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-secondary/40 rounded mb-2" />
            <div className="h-4 w-48 bg-secondary/20 rounded" />
          </div>
          <div className="h-10 w-28 bg-secondary/30 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[600px] border-2 border-dashed border-zinc-800 rounded-3xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-16 bg-secondary/30 rounded" />
                <div className="h-4 w-6 bg-secondary/20 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-24 w-full bg-secondary/20 rounded-xl" />
                <div className="h-24 w-full bg-secondary/20 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">
            My Tasks
          </h1>
          <p className="text-muted-foreground">
            Your personal space • {tasks.length} tasks
          </p>
          {/* Quick Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-400">
              <Clock className="h-4 w-4" />
              <span>{inProgressCount} IN PROGRESS</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>{completedCount} COMPLETED</span>
            </div>
          </div>
        </div>
        <Button
          onClick={() => setIsNewTaskOpen(true)}
          className="gap-2 font-bold bg-white text-black hover:bg-zinc-200 rounded-full px-6"
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Task Grid by Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {(["URGENT", "HIGH", "MEDIUM", "LOW"] as const).map((priority) => {
          const styles = getPriorityStyles(priority);
          return (
            <div key={priority} className="flex flex-col h-full">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-3">
                  <div className={cn("h-2 w-2 rounded-full", styles.dot)} />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {priority}
                  </span>
                </div>
                <div className="h-5 w-8 rounded-full bg-secondary/50 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {priorityTasks[priority].length}
                  </span>
                </div>
              </div>

              {/* Tasks Container */}
              <div className="flex-1 bg-secondary/20 border-2 border-dashed border-zinc-800 rounded-3xl p-3 space-y-3 overflow-y-auto">
                {priorityTasks[priority].length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-zinc-700 italic font-medium">
                      No tasks
                    </p>
                  </div>
                ) : (
                  priorityTasks[priority].map((task) => {
                    const pStyles = getPriorityStyles(task.priority);
                    return (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={cn(
                          "w-full p-4 bg-card rounded-2xl text-left transition-all cursor-pointer group border-l-4 shadow-sm hover:translate-y-[-2px] hover:shadow-lg relative overflow-hidden",
                          pStyles.border,
                          task.status === "COMPLETED" && "opacity-60"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Status Icon */}
                          <div className="mt-0.5 shrink-0">
                            {getStatusIcon(task.status)}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            {/* Title */}
                            <p
                              className={cn(
                                "text-sm font-semibold truncate leading-tight",
                                task.status === "COMPLETED" &&
                                  "line-through text-muted-foreground"
                              )}
                            >
                              {task.title}
                            </p>

                            {/* Description Preview */}
                            {task.description && (
                              <p className="text-xs text-muted-foreground/60 truncate">
                                {task.description}
                              </p>
                            )}

                            {/* Due Date */}
                            {task.dueDate && (
                              <div className="flex items-center gap-1.5 pt-1">
                                <Calendar className="h-3 w-3 text-muted-foreground/40" />
                                <span
                                  className={cn(
                                    "text-[10px] font-medium",
                                    new Date(task.dueDate) < new Date() &&
                                      task.status !== "COMPLETED"
                                      ? "text-red-500"
                                      : "text-muted-foreground/50"
                                  )}
                                >
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation Dialog */}
      <TaskEditDialog
        open={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onSave={handleSaveTask}
        task={null}
        isNew={true}
      />

      {/* Task Status/Detail Dialog */}
      <TaskStatusDialog
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusChange={handleStatusChange}
        onOpenEdit={() => {
          setEditTask(selectedTask);
          setSelectedTask(null);
        }}
        onDelete={handleDeleteTask}
      />

      {/* Task Edit Dialog */}
      <TaskEditDialog
        task={editTask}
        open={!!editTask}
        onClose={() => setEditTask(null)}
        onSave={handleSaveTask}
        isNew={false}
      />
    </div>
  );
}
