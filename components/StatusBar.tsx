"use client";

import { cn } from "@/lib/utils";
import { Users, ListTodo, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface StatusBarProps {
  className?: string;
}

export function StatusBar({ className }: StatusBarProps) {
  const { user, stats } = useAuth();

  return (
    <div
      className={cn(
        "h-6.5 bg-primary text-primary-foreground flex items-center justify-between px-6 text-[10px] font-medium border-t border-primary-foreground/20",
        className
      )}
    >
      {/* Left Section - Stats */}
      <div className="flex items-center gap-4">
        {/* Team Count */}
        <div className="flex items-center gap-1.5">
          <Users className="h-3 w-3" />
          <span>{stats.teamCount} Teams</span>
        </div>

        {/* Task Count */}
        <div className="flex items-center gap-1.5">
          <ListTodo className="h-3 w-3" />
          <span>{stats.taskCount} Tasks</span>
        </div>

        {/* Priority Breakdown */}
        <div className="flex items-center gap-3 ml-2 pl-2 border-l border-primary-foreground/30">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <span>{stats.urgent}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-orange-400" />
            <span>{stats.high}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-yellow-400" />
            <span>{stats.medium}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <span>{stats.low}</span>
          </div>
        </div>
      </div>

      {/* Right Section - User & Brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <UserIcon className="h-3 w-3" />
          <span>{user?.name || "User"}</span>
        </div>
        <div className="h-3 w-px bg-primary-foreground/30" />
        <div className="font-bold tracking-wide">Prioritize</div>
      </div>
    </div>
  );
}
