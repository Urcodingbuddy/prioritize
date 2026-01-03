"use client";

import { Task, Status } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Edit,
  Trash2,
  Globe2,
  ChevronRight,
  Clock,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { cn, getAvatarUrl } from "@/lib/utils";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    className: string;
  }
> = {
  PENDING: {
    label: "To Do",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-50 text-blue-600 border-blue-200",
  },
  COMPLETED: {
    label: "Done",
    className: "bg-green-50 text-green-600 border-green-200",
  },
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
  const { playClick, playSuccess } = useSoundEffects();

  return (
    <Card
      onClick={() => {
        playClick();
        onEdit(task);
      }}
      className="group relative border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-primary/20 transition-all duration-300 bg-card/60 dark:bg-card/40 backdrop-blur-sm hover:bg-card rounded-2xl overflow-hidden cursor-pointer animate-in fade-in slide-in-from-bottom-1"
    >
      <CardContent className="p-4 space-y-4">
        {/* Header: Status & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "font-black rounded-lg px-2 py-0.5 text-[9px] uppercase tracking-widest border shadow-sm",
                statusConfig[task.status].className
              )}
            >
              {statusConfig[task.status].label}
            </Badge>
            {task.isPublic && (
              <div className="flex items-center gap-1 text-[9px] font-bold uppercase text-indigo-500 tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100/50">
                <Globe2 className="h-3 w-3" />
                <span>Team</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                playClick();
                onEdit(task);
              }}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                playClick();
                onDelete(task.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
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
          <div className="flex items-center gap-2 flex-wrap">
            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1.5 text-[9px] font-bold uppercase px-2 py-1 rounded-md border",
                  new Date(task.dueDate).getTime() <
                    new Date().setHours(0, 0, 0, 0)
                    ? "text-red-600 bg-red-50 border-red-100"
                    : "text-orange-600 bg-orange-50 border-orange-100"
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.dueDate), "MMM d")}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase px-2 py-1 rounded-md border text-purple-600 bg-purple-50 border-purple-100">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(task.createdAt), "MMM d")}</span>
            </div>

            {task.assignedUsers && task.assignedUsers.length > 0 && (
              <div className="flex items-center -space-x-1.5">
                {task.assignedUsers.slice(0, 3).map((ut: any) => (
                  <TooltipProvider key={ut.userId}>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="h-4.5 w-4.5 rounded-full ring-2 ring-background bg-secondary/50 overflow-hidden flex items-center justify-center border border-primary/20 shadow-sm">
                          <img
                            src={getAvatarUrl(ut.user?.avatar || ut.user?.name)}
                            alt={ut.user?.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{ut.user?.name || "Assigned User"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
              const next = nextStatus[task.status];
              if (next === "COMPLETED") {
                playSuccess();
              } else {
                playClick();
              }
              onStatusChange(task.id, next);
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
