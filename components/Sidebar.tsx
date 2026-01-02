"use client";
import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  CheckCircle2,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { TeamTree } from "./TeamTree";
import { useAuth } from "@/lib/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";
import { NotificationDialog } from "@/components/NotificationDialog";
import { Bell } from "lucide-react";
import { useSoundEffects } from "@/hooks/use-sound-effects";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = memo(function Sidebar({
  collapsed,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, refetchUser } = useAuth();
  const { playClick, playSuccess } = useSoundEffects();
  const [teamsExpanded, setTeamsExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const prevInviteCount = useRef(0);

  // Poll for notifications (real-time updates)
  const checkNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response: any = await api.teams.listInvites();
      const invites = response.data || [];

      // Play sound if we have new invites (count increased)
      if (invites.length > prevInviteCount.current) {
        playSuccess();
      }
      prevInviteCount.current = invites.length;

      setHasUnread(invites.length > 0);
    } catch (error) {
      // Silent fail
    }
  }, [user, playSuccess]);

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, [checkNotifications]);

  const handleTeamCreated = useCallback(() => {
    refetchUser();
  }, [refetchUser]);

  const handleToggleTeams = useCallback(() => {
    playClick();
    setTeamsExpanded((prev) => !prev);
  }, [playClick]);

  const currentCompanyId = user?.currentCompanyId;

  return (
    <>
      <aside
        className={cn(
          "group/sidebar h-[calc(100vh-24px)] bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col fixed left-0 top-0 z-30",
          collapsed ? "w-[60px]" : "w-[280px]"
        )}
      >
        {/* Border toggle - clickable right edge */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/30 transition-colors z-50"
          onClick={() => {
            playClick();
            onToggle();
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        />

        {/* Header */}
        <div className="h-16 flex items-center justify-between border-b border-sidebar-border px-4">
          <Link
            href="/"
            onClick={() => playClick()}
            className={cn(
              "flex items-center gap-0.5 hover:opacity-80 transition-opacity",
              collapsed ? "w-full justify-center" : ""
            )}
          >
            <Logo w={collapsed ? 26 : 30} h={collapsed ? 26 : 30} />
            {!collapsed && (
              <span className="font-black tracking-tight text-foreground text-md">
                rioritize
              </span>
            )}
          </Link>
          {/* Toggle icon - only in header when expanded */}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onToggle}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 py-3 flex flex-col gap-1 px-2 overflow-y-auto scrollbar-hide">
          {loading ? (
            // Skeleton loader
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-full bg-secondary/20 rounded-xl animate-pulse mb-1"
              />
            ))
          ) : (
            <>
              {/* Toggle Button - Only when collapsed, above Home */}
              {collapsed && (
                <button
                  onClick={onToggle}
                  className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold transition-all mb-1 text-muted-foreground/70 hover:bg-[#125DB0] hover:text-white"
                >
                  <PanelLeft className="h-4 w-4 shrink-0" />
                </button>
              )}

              {/* Home Link */}
              <Link
                href="/home"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all relative group",
                  pathname === "/home"
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground/70 hover:bg-[#125DB0] hover:text-white"
                )}
              >
                <Home
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform",
                    pathname === "/home" && "scale-110"
                  )}
                />
                <span
                  className={cn(
                    "truncate transition-all duration-300",
                    collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}
                >
                  Home
                </span>
                {pathname === "/home" && (
                  <div className="absolute left-0 w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                )}
                {collapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-background border shadow-xl rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all scale-95 group-hover:scale-100 origin-left">
                    Home
                  </div>
                )}
              </Link>

              {/* My Tasks Link */}
              <Link
                href="/my-tasks"
                onClick={() => playClick()}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all relative group",
                  pathname === "/my-tasks"
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground/70 hover:bg-[#125DB0] hover:text-white"
                )}
              >
                <CheckCircle2
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform",
                    pathname === "/my-tasks" && "scale-110"
                  )}
                />
                <span
                  className={cn(
                    "truncate transition-all duration-300",
                    collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}
                >
                  My Tasks
                </span>
                {pathname === "/my-tasks" && (
                  <div className="absolute left-0 w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                )}
                {collapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-background border shadow-xl rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all scale-95 group-hover:scale-100 origin-left">
                    My Tasks
                  </div>
                )}
              </Link>

              {/* Teams Tree */}
              <TeamTree
                memberships={user?.memberships || []}
                currentCompanyId={currentCompanyId}
                collapsed={collapsed}
                isExpanded={teamsExpanded}
                onToggleExpand={handleToggleTeams}
                onTeamCreated={handleTeamCreated}
              />
            </>
          )}
        </div>

        {/* Notifications Button (Fixed at Bottom) */}
        <div className="px-2 pb-2">
          <button
            onClick={() => {
              playClick();
              setShowNotifications(true);
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all relative group w-full text-left",
              showNotifications
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground/70 hover:bg-[#125DB0] hover:text-white"
            )}
          >
            <div className="relative">
              <Bell
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform",
                  showNotifications && "scale-110"
                )}
              />
              {hasUnread && (
                <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-sidebar shadow-sm animate-pulse" />
              )}
            </div>
            <span
              className={cn(
                "truncate transition-all duration-300",
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              )}
            >
              Notifications
            </span>
            {hasUnread && !collapsed && (
              <div className="ml-auto">
                <span className="h-2 w-2 rounded-full bg-red-500 block" />
              </div>
            )}
            {showNotifications && (
              <div className="absolute left-0 w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
            )}
            {collapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-background border shadow-xl rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all scale-95 group-hover:scale-100 origin-left">
                Notifications {hasUnread && "•"}
              </div>
            )}
          </button>
        </div>

        {/* User Section with Settings and Theme Toggle */}
        <div className="p-3 border-t border-sidebar-border mt-auto">
          <div className="flex items-center gap-2">
            {collapsed ? (
              <div className="flex flex-col items-center gap-2 w-full">
                {/* Settings Button */}
                <button
                  onClick={() => {
                    playClick();
                    setShowSettings(true);
                  }}
                  className="h-9 w-9 group rounded-xl bg-secondary/30 hover:bg-blue-500/20 border border-border/40 transition-all flex items-center justify-center"
                  title="Settings"
                >
                  <Settings className="h-4 w-4 text-muted-foreground group-hover:rotate-180 transition-transform duration-500" />
                </button>
                {/* Theme Toggle */}
                <ThemeToggle />
                {/* User Avatar */}
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-[10px] font-black text-primary border border-primary/10">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-secondary/30 border border-border/40 w-full">
                {/* User Avatar */}
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0 border border-primary/10">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                {/* User Info */}
                <div className="flex-1 overflow-hidden text-left">
                  <p className="text-[10px] font-black truncate text-foreground leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[8px] text-muted-foreground truncate uppercase font-bold tracking-tighter opacity-60">
                    {user?.email?.split("@")[0]}
                  </p>
                </div>
                {/* Settings Icon */}
                <button
                  onClick={() => {
                    playClick();
                    setShowSettings(true);
                  }}
                  className="h-8 w-8 group rounded-lg hover:bg-blue-500/20 transition-all flex items-center justify-center shrink-0"
                  title="Settings"
                >
                  <Settings className="h-4 w-4 text-muted-foreground group-hover:rotate-180 transition-transform duration-500" />
                </button>
                {/* Theme Toggle */}
                <ThemeToggle />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Settings Dialog */}
      <SettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
      />

      <NotificationDialog
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        onUpdate={checkNotifications}
        onTeamJoined={refetchUser}
      />
    </>
  );
});
