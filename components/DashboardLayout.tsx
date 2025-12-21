"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BottomNav } from "@/components/BottomNav";
import { TaskForm } from "@/components/TaskForm";
import { cn } from "@/lib/utils";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Sidebar hidden on mobile, visible on medium+ screens */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      <main
        className={cn(
          "transition-[padding] duration-300 ease-in-out pb-24 md:pb-8",
          collapsed ? "md:pl-[60px]" : "md:pl-[220px]"
        )}
      >
        <DashboardHeader onNewTask={() => setShowTaskForm(true)} />

        <div className="container mx-auto max-w-7xl pt-4 px-3 md:px-6">
          {children}
        </div>
      </main>

      <BottomNav />

      {/* Global Task Form Trigger */}
      <TaskForm
        open={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSuccess={() => {
          setShowTaskForm(false);
          setRefreshTrigger((prev) => prev + 1);
          // We use a broadcast or context/refresh if we need to sync multiple places
          // For now, reload or router.refresh is easier
          window.location.reload();
        }}
      />
    </div>
  );
}
