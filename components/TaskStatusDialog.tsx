"use client";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Circle,
  Clock,
  CheckCircle2,
  Calendar,
  X,
  Edit3,
  Trash2,
} from "lucide-react";

interface TaskStatusDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onOpenEdit: () => void;
  onDelete: () => void;
}

export function TaskStatusDialog({
  task,
  open,
  onClose,
  onStatusChange,
  onOpenEdit,
  onDelete,
}: TaskStatusDialogProps) {
  const handleStatusChange = (newStatus: string) => {
    onStatusChange(newStatus);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500 text-white";
      case "HIGH":
        return "bg-orange-500 text-white";
      case "MEDIUM":
        return "bg-yellow-500 text-black";
      case "LOW":
        return "bg-emerald-500 text-white";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getStatusIcon = (status: string, isActive: boolean) => {
    const baseClass = "h-5 w-5";
    switch (status) {
      case "COMPLETED":
        return (
          <CheckCircle2
            className={cn(
              baseClass,
              isActive ? "text-emerald-400" : "text-muted-foreground"
            )}
          />
        );
      case "IN_PROGRESS":
        return (
          <Clock
            className={cn(
              baseClass,
              isActive ? "text-blue-400" : "text-muted-foreground"
            )}
          />
        );
      default:
        return (
          <Circle
            className={cn(
              baseClass,
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          />
        );
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 bg-zinc-900 border-zinc-800 rounded-2xl overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Task Status</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="p-5 space-y-4">
          {/* Top row with status icon, priority, and actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Status Icon */}
              <div
                className={cn(
                  "h-10 w-10 rounded-full border-2 flex items-center justify-center",
                  task.status === "COMPLETED"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : task.status === "IN_PROGRESS"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-zinc-600 bg-zinc-800"
                )}
              >
                {task.status === "COMPLETED" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : task.status === "IN_PROGRESS" ? (
                  <Clock className="h-5 w-5 text-blue-400" />
                ) : (
                  <Circle className="h-5 w-5 text-zinc-400" />
                )}
              </div>

              {/* Priority Badge */}
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase",
                  getPriorityColor(task.priority)
                )}
              >
                {task.priority}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenEdit}
                className="h-9 w-9 rounded-lg border border-blue-500 bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition-colors"
              >
                <Edit3 className="h-4 w-4 text-blue-400" />
              </button>
              <button
                onClick={onDelete}
                className="h-9 w-9 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-lg hover:bg-zinc-800 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Task Title */}
          <h3
            className={cn(
              "text-lg font-semibold text-white",
              task.status === "COMPLETED" && "line-through text-zinc-500"
            )}
          >
            {task.title}
          </h3>

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Calendar className="h-4 w-4" />
              <span>
                Due on{" "}
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-zinc-500">
            {task.description || "No description provided."}
          </p>
        </div>

        {/* Status Toggle Section */}
        <div className="px-5 pb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
            Update Status
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange("PENDING")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                task.status === "PENDING"
                  ? "bg-zinc-700 text-white border border-zinc-600"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800"
              )}
            >
              <Circle className="h-4 w-4" />
              To Do
            </button>
            <button
              onClick={() => handleStatusChange("IN_PROGRESS")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                task.status === "IN_PROGRESS"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800"
              )}
            >
              <Clock className="h-4 w-4" />
              Active
            </button>
            <button
              onClick={() => handleStatusChange("COMPLETED")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                task.status === "COMPLETED"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800"
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              Done
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
