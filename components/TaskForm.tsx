"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, Priority, User } from "@/lib/types";
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
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Globe2, Lock } from "lucide-react";

interface TaskFormProps {
  task?: Task | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultPriority?: Priority;
}

export function TaskForm({
  task,
  open,
  onClose,
  onSuccess,
  defaultPriority = "MEDIUM",
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [priority, setPriority] = useState<Priority>(
    (task?.priority || defaultPriority) as Priority
  );
  const [isPublic, setIsPublic] = useState(task?.isPublic || false);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(
    task?.assignedUsers?.map((ut) => ut.userId) || []
  );

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(task?.title || "");
      setDescription(task?.description || "");
      setDueDate(
        task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
      );
      setPriority((task?.priority || defaultPriority) as Priority);
      setIsPublic(task?.isPublic || false);
      setAssignedUserIds(task?.assignedUsers?.map((ut) => ut.userId) || []);
      setError("");

      const fetchUsers = async () => {
        try {
          const res = (await api.users.list()) as { data: User[] };
          if (res && res.data) {
            setUsers(res.data);
          }
        } catch (err) {
          console.error("Failed to fetch users", err);
        }
      };
      fetchUsers();
    }
  }, [task, open, defaultPriority]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
        isPublic,
        assignedUserIds,
      };

      if (task) {
        await api.tasks.update(task.id, data);
      } else {
        await api.tasks.create(data);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    setAssignedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[95vh] overflow-y-auto bg-background border-border shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {task ? "Edit Task" : "New Task"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {task
              ? "Update your task details and assignments."
              : "Create a new task to keep your project moving."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Visibility Toggle */}
            <div className="flex items-center gap-2 p-1 bg-secondary/30 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                  !isPublic
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Lock className="h-3 w-3" />
                Private
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                  isPublic
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Globe2 className="h-3 w-3" />
                Public
              </button>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What objective are we tackling?"
                required
                className="h-11 bg-secondary/30 border-transparent focus:border-border transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Description
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add some details..."
                className="w-full min-h-[120px] p-3 rounded-lg bg-secondary/30 border-transparent border focus:border-border transition-all text-sm outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="dueDate"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-secondary/30 border-transparent focus:border-border transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="priority"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Priority
                </Label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full h-10 px-3 rounded-md bg-secondary/30 border-transparent border focus:border-border transition-all text-sm outline-none appearance-none cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assign To
              </Label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {users.length === 0 ? (
                  <div className="py-8 text-center border border-dashed rounded-xl bg-secondary/10">
                    <p className="text-xs text-muted-foreground italic">
                      Fetching team members...
                    </p>
                  </div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => toggleUser(user.id)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group",
                        assignedUserIds.includes(user.id)
                          ? "bg-primary/5 border-primary/20"
                          : "bg-secondary/20 border-transparent hover:bg-secondary/40"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/10">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-none">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border flex items-center justify-center transition-all",
                          assignedUserIds.includes(user.id)
                            ? "bg-primary border-primary"
                            : "border-border"
                        )}
                      >
                        {assignedUserIds.includes(user.id) && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white transition-all scale-100" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-lg animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-8 font-bold shadow-lg shadow-primary/20"
            >
              {loading
                ? "Processing..."
                : task
                ? "Save Changes"
                : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
