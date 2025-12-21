"use client";

import { Task, Status } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Trash2, Globe2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Status) => void;
}

const statusConfig: Record<
  Status,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | "success"
      | "warning"
      | "info";
  }
> = {
  PENDING: { label: "To Do", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "warning" },
  COMPLETED: { label: "Done", variant: "success" },
};

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const nextStatus: Record<Status, Status> = {
    PENDING: "IN_PROGRESS",
    IN_PROGRESS: "COMPLETED",
    COMPLETED: "PENDING",
  };

  return (
    <Card className="group relative border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-primary/20 transition-all duration-300 bg-card/60 dark:bg-card/40 backdrop-blur-sm hover:bg-card rounded-2xl overflow-hidden cursor-pointer animate-in fade-in slide-in-from-bottom-1">
      <CardContent className="p-4 space-y-4">
        {/* Header: Status & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Badge
              variant={statusConfig[task.status].variant as any}
              className="font-black rounded-full px-2 py-0.5 text-[8px] uppercase tracking-widest shadow-none border-transparent"
            >
              {statusConfig[task.status].label}
            </Badge>
            {task.isPublic && (
              <div className="flex items-center gap-1 text-[8px] font-black uppercase text-muted-foreground/60 tracking-tighter">
                <Globe2 className="h-2.5 w-2.5" />
                <span>Team</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground/40 hover:text-foreground hover:bg-secondary rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Body: Title & Description */}
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-foreground leading-snug tracking-tight group-hover:text-primary transition-colors">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-[10px] text-muted-foreground/60 line-clamp-2 leading-relaxed font-medium">
              {task.description}
            </p>
          )}
        </div>

        {/* Footer: Date & Assignees & Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-border/20">
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full",
                  new Date(task.dueDate).getTime() <
                    new Date().setHours(0, 0, 0, 0)
                    ? "text-red-500 bg-red-500/5"
                    : "text-muted-foreground bg-secondary/80"
                )}
              >
                <Calendar className="h-2.5 w-2.5" />
                <span>{format(new Date(task.dueDate), "MMM d")}</span>
              </div>
            )}

            {task.assignedUsers && task.assignedUsers.length > 0 && (
              <div className="flex items-center -space-x-1.5">
                {task.assignedUsers.slice(0, 3).map((ut: any) => (
                  <div
                    key={ut.userId}
                    className="h-4.5 w-4.5 rounded-full ring-2 ring-background bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-[7px] font-black text-primary uppercase border border-primary/20 shadow-sm"
                    title={ut.user?.name || "Assigned User"}
                  >
                    {(ut.user?.name || "U")[0]}
                  </div>
                ))}
                {task.assignedUsers.length > 3 && (
                  <div className="h-4.5 w-4.5 rounded-full ring-2 ring-background bg-secondary/80 flex items-center justify-center text-[7px] font-black text-muted-foreground/60">
                    +{task.assignedUsers.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, nextStatus[task.status]);
            }}
            className="flex items-center gap-1 px-1.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group/btn"
          >
            {task.status === "COMPLETED" ? "Reopen" : "Next"}
            <ChevronRight className="h-2.5 w-2.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
