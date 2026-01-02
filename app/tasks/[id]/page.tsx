"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Task, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { TaskForm } from "@/components/TaskForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskId, setTaskId] = useState<string>("");

  useEffect(() => {
    params.then((p) => {
      setTaskId(p.id);
      fetchTask(p.id);
    });
  }, []);

  const fetchTask = async (id: string) => {
    setLoading(true);
    try {
      const response: any = await api.tasks.get(id);
      setTask(response.data);
    } catch (error) {
      console.error("Failed to fetch task:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.tasks.delete(taskId);
      router.push("/");
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleFormSuccess = () => {
    fetchTask(taskId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading task...
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const priorityColors: Record<string, string> = {
    LOW: "info",
    MEDIUM: "warning",
    HIGH: "bg-orange-500 text-white",
    URGENT: "destructive",
  };

  const statusVariants: Record<string, "default" | "warning" | "success"> = {
    PENDING: "default",
    IN_PROGRESS: "warning",
    COMPLETED: "success",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/home")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-3xl">{task.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={statusVariants[task.status]}>
                    {task.status.replace("_", " ")}
                  </Badge>
                  <Badge className={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowEditForm(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {task.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(task.dueDate), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}

              {task.creator && (
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created By</p>
                    <p className="text-sm text-muted-foreground">
                      {task.creator.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {task.assignedUsers && task.assignedUsers.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Assigned Users</h3>
                <div className="space-y-2">
                  {task.assignedUsers.map((userTask: any) => (
                    <div
                      key={userTask.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{userTask.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {userTask.user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>Created: {format(new Date(task.createdAt), "PPP p")}</p>
              <p>Updated: {format(new Date(task.updatedAt), "PPP p")}</p>
            </div>
          </CardContent>
        </Card>

        <TaskForm
          task={task}
          open={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleFormSuccess}
        />

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{task.title}"? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
