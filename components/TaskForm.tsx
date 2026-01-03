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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Globe2, Lock, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface TaskFormProps {
  task?: Task | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultPriority?: Priority;
  personalMode?: boolean; // Hide team-specific fields for personal tasks
}

export function TaskForm({
  task,
  open,
  onClose,
  onSuccess,
  defaultPriority = "MEDIUM",
  personalMode = false,
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
            {/* Visibility Toggle - Hidden in personal mode */}
            {!personalMode && (
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
            )}

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
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add some details..."
                className="min-h-[120px] resize-none"
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? (
                        format(new Date(dueDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate ? new Date(dueDate) : undefined}
                      onSelect={(date) =>
                        setDueDate(date ? date.toISOString().split("T")[0] : "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="priority"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Priority
                </Label>
                <Select
                  value={priority}
                  onValueChange={(value: Priority) => setPriority(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assign To - Hidden in personal mode */}
            {!personalMode && (
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
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`user-${user.id}`}
                            checked={assignedUserIds.includes(user.id)}
                            onCheckedChange={() => toggleUser(user.id)}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
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
