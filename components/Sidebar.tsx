"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  CheckCircle2,
  Globe2,
  ChevronDown,
  Building2,
  ShieldCheck,
  Sparkles,
  Palette,
  Settings,
  HelpCircle,
  MoreVertical,
  User as UserIcon,
} from "lucide-react";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isPopOverOpen, setIsPopOverOpen] = useState(false);
  const popOverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popOverRef.current &&
        !popOverRef.current.contains(event.target as Node)
      ) {
        setIsPopOverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUser = async () => {
    try {
      const response: any = await api.auth.me();
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user");
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const currentCompanyId = user?.currentCompanyId;
  const isOfficer =
    user?.memberships?.find((m) => m.companyId === currentCompanyId)?.role ===
    "OFFICER";
  const isAdmin =
    user?.memberships?.find((m) => m.companyId === currentCompanyId)?.role ===
    "ADMIN";

  const links = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/teams",
      label: "Teams",
      icon: Building2,
    },
    {
      href: `/teams/${currentCompanyId}/tasks`,
      label: "My Tasks",
      icon: CheckCircle2,
      show: !!currentCompanyId,
    },
    {
      href: `/teams/${currentCompanyId}/public`,
      label: "Public Tasks",
      icon: Globe2,
      show: !!currentCompanyId,
    },
    {
      href: "/admin/users",
      label: isAdmin || isOfficer ? "Management" : "Members",
      icon: Users,
      show: !!currentCompanyId,
    },
  ];

  return (
    <aside
      className={cn(
        "group/sidebar h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col fixed left-0 top-0 z-30",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      <div className="h-16 flex items-center px-3 border-b border-sidebar-border">
        <div
          className={cn(
            "flex items-center overflow-hidden px-2 transition-all",
            collapsed ? "w-0 opacity-0" : "w-full opacity-100"
          )}
        >
          <Logo w={30} h={30} />
          <span className="font-black tracking-tight text-foreground truncate">
            rioritize
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto w-10", collapsed && "ml-0")}
          onClick={onToggle}
        >
          {collapsed ? (
            <Logo w={30} h={30} />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {!user
          ? // Skeleton loader for links during initial fetch
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-full bg-secondary/20 rounded-xl animate-pulse mb-1"
              />
            ))
          : links
              .filter((l) => l.show !== false)
              .map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all relative group",
                      isActive ||
                        (link.href === "/teams" &&
                          pathname.startsWith("/teams/"))
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground/70 hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform",
                        isActive && "scale-110"
                      )}
                    />
                    <span
                      className={cn(
                        "truncate transition-all duration-300",
                        collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                      )}
                    >
                      {link.label}
                    </span>

                    {isActive && (
                      <div className="absolute left-0 w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    )}

                    {collapsed && (
                      <div className="absolute left-full ml-4 px-3 py-1.5 bg-background border shadow-xl rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all scale-95 group-hover:scale-100 origin-left">
                        {link.label}
                      </div>
                    )}
                  </Link>
                );
              })}
      </div>

      {/* User Section Popover */}
      <div
        className="p-3 border-t border-sidebar-border mt-auto relative"
        ref={popOverRef}
      >
        {isPopOverOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-popover/95 backdrop-blur-xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
            {/* Popover Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xs font-black text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)]">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-black text-foreground truncate leading-tight">
                  {user?.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate font-medium">
                  @{user?.email?.split("@")[0]}
                </p>
              </div>
            </div>

            {/* Popover Actions */}
            <div className="p-1.5 space-y-0.5">
              <button
                onClick={() => setIsPopOverOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all text-left group"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-amber-400 transition-colors" />
                <span>Upgrade plan</span>
              </button>

              <button
                onClick={() => setIsPopOverOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all text-left group"
              >
                <Palette className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                <span>Personalization</span>
              </button>

              <button
                onClick={() => setIsPopOverOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all text-left group"
              >
                <Settings className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>Settings</span>
              </button>

              <div className="h-[1px] bg-border my-2 mx-2" />

              <button
                onClick={() => setIsPopOverOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all text-left group"
              >
                <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="flex-1">Help</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all text-left group"
              >
                <LogOut className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-destructive transition-colors" />
                <span>Log out</span>
              </button>
            </div>

            {/* Dummy Features Wrapper */}
            <div className="bg-muted/50 p-3 mt-1 border-t border-border">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                Upcoming
              </p>
              <div className="flex gap-2">
                <div className="px-2 py-1 rounded bg-accent/50 text-[9px] font-bold text-muted-foreground">
                  Auto-Prioritize
                </div>
                <div className="px-2 py-1 rounded bg-accent/50 text-[9px] font-bold text-muted-foreground">
                  Team Chat
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <button
                onClick={() => setIsPopOverOpen(!isPopOverOpen)}
                className={cn(
                  "h-9 w-9 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/40 transition-all flex items-center justify-center",
                  isPopOverOpen ? "bg-secondary/60 border-primary/20" : ""
                )}
              >
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-[10px] font-black text-primary border border-primary/10">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsPopOverOpen(!isPopOverOpen)}
                className={cn(
                  "flex-1 flex items-center gap-3 p-2 rounded-2xl bg-secondary/50 hover:bg-secondary/70 border border-border/40 transition-all group",
                  isPopOverOpen
                    ? "bg-secondary/70 border-primary/20 ring-1 ring-primary/10"
                    : ""
                )}
              >
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0 border border-primary/10 shadow-sm transition-transform group-active:scale-95">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 overflow-hidden transition-all text-left">
                  <p className="text-[10px] font-black truncate text-foreground leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[8px] text-muted-foreground truncate uppercase font-bold tracking-tighter opacity-60">
                    {user?.email?.split("@")[0]}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-muted-foreground/50 transition-transform duration-200",
                    isPopOverOpen ? "rotate-180 text-primary" : ""
                  )}
                />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
