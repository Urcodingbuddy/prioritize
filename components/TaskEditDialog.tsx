"use client";

import { useState, useEffect } from "react";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { Task, Priority, User } from "@/lib/types";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Circle,
  Clock,
  CheckCircle2,
  Edit3,
  Trash2,
  X,
  ChevronDown,
  Calendar,
  Users,
} from "lucide-react";

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  isNew?: boolean;
  canAssign?: boolean;
  teamId?: string;
}

export function TaskEditDialog({
  task,
  open,
  onClose,
  onSave,
  isNew = false,
  canAssign = false,
  teamId,
}: TaskEditDialogProps) {
  const { playSuccess } = useSoundEffects();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [status, setStatus] = useState("PENDING");
  const [dueDate, setDueDate] = useState("");
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (open && canAssign && teamId) {
      fetchTeamMembers();
    }
  }, [open, canAssign, teamId]);

  const fetchTeamMembers = async () => {
    setLoadingMembers(true);
    try {
      const res: any = await api.teams.listMembers();
      setTeamMembers(res.data || []);
    } catch (error) {
      console.error("Failed to fetch team members", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || "");
        setPriority(task.priority as Priority);
        setStatus(task.status);
        setDueDate(
          task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
        );
        setAssignedUserIds(
          task.assignedUsers?.map((au) => au.user?.id || au.userId) || []
        );
      } else {
        setTitle("");
        setDescription("");
        setPriority("MEDIUM");
        setStatus("PENDING");
        setDueDate("");
        setAssignedUserIds([]);
      }
    }
  }, [task, open]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const updates: any = {
        title: title.trim(),
        priority,
        status,
        assignedUserIds: canAssign ? assignedUserIds : undefined,
      };

      if (description.trim()) {
        updates.description = description.trim();
      } else {
        updates.description = null; // Or undefined depending on API, but generally we want to clear it if empty
      }

      if (dueDate) {
        updates.dueDate = new Date(dueDate).toISOString();
      } else {
        updates.dueDate = null; // Clear date
      }

      await onSave(updates);
      playSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-zinc-900 border-zinc-800 rounded-2xl overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Edit Task</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="p-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            <div
              className={cn(
                "h-10 w-10 rounded-full border-2 flex items-center justify-center",
                status === "COMPLETED"
                  ? "border-emerald-500 bg-emerald-500/10"
                  : status === "IN_PROGRESS"
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-zinc-600 bg-zinc-800"
              )}
            >
              {status === "COMPLETED" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : status === "IN_PROGRESS" ? (
                <Clock className="h-5 w-5 text-blue-400" />
              ) : (
                <Circle className="h-5 w-5 text-zinc-400" />
              )}
            </div>

            {/* Priority Badge */}
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase",
                getPriorityColor(priority)
              )}
            >
              {priority}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-zinc-400" />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 pb-5 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Title
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Description
            </Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details..."
              rows={4}
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600 text-sm resize-none outline-none"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Due Date
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600 pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority Dropdown */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Priority
              </Label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full h-10 px-3 pr-8 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm outline-none appearance-none cursor-pointer focus:border-zinc-600"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Status
              </Label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 pr-8 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm outline-none appearance-none cursor-pointer focus:border-zinc-600"
                >
                  <option value="PENDING">To Do</option>
                  <option value="IN_PROGRESS">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Assigned Members (Only if canAssign is true) */}
          {canAssign && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Users className="h-3 w-3" />
                Assign To
              </Label>
              <div className="border border-zinc-700 rounded-lg p-2 max-h-32 overflow-y-auto bg-zinc-800 space-y-1">
                {loadingMembers ? (
                  <p className="text-xs text-zinc-500 p-2">
                    Loading members...
                  </p>
                ) : teamMembers.length === 0 ? (
                  <p className="text-xs text-zinc-500 p-2">No members found</p>
                ) : (
                  teamMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-2 p-1.5 hover:bg-zinc-700/50 rounded cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 h-4 w-4"
                        checked={assignedUserIds.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedUserIds([...assignedUserIds, member.id]);
                          } else {
                            setAssignedUserIds(
                              assignedUserIds.filter((id) => id !== member.id)
                            );
                          }
                        }}
                      />
                      <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                        {member.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-800 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="bg-white text-black hover:bg-zinc-200 font-semibold"
          >
            {loading ? "Saving..." : isNew ? "Create" : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
