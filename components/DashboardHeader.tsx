"use client";

// Simplified header - minimal design without breadcrumbs/notifications/new mission
export function DashboardHeader({ onNewTask }: { onNewTask?: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Empty left side - can add search later */}
        <div />

        {/* Empty right side - actions moved to sidebar */}
        <div />
      </div>
    </header>
  );
}
