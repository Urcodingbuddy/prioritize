"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { StatusBar } from "@/components/StatusBar";
import { TaskForm } from "@/components/TaskForm";
import { cn } from "@/lib/utils";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const handleToggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const handleCloseTask = useCallback(() => {
    setShowTaskForm(false);
  }, []);

  const handleTaskSuccess = useCallback(() => {
    setShowTaskForm(false);
    window.location.reload();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar hidden on mobile, visible on medium+ screens */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      </div>

      {/* Main content area */}
      <main
        className={cn(
          "min-h-screen transition-[padding] duration-300 ease-in-out pb-20 md:pb-8",
          collapsed ? "md:pl-[60px]" : "md:pl-[320px]"
        )}
      >
        <div className="container mx-auto max-w-7xl pt-6 px-3 md:px-6 pb-4">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* VS Code-style Status Bar - fixed at bottom, full width */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 z-40">
        <StatusBar />
      </div>

      {/* Global Task Form Trigger */}
      <TaskForm
        open={showTaskForm}
        onClose={handleCloseTask}
        onSuccess={handleTaskSuccess}
      />
    </div>
  );
}
