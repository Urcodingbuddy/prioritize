"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckCircle2,
  Globe2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export function BottomNav() {
  const pathname = usePathname();
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);

  useEffect(() => {
    api.auth
      .me()
      .then((res: any) => {
        setCurrentCompanyId(res.data.currentCompanyId);
      })
      .catch(console.error);
  }, [pathname]);

  const links = [
    {
      id: "home",
      href: "/home",
      label: "Home",
      icon: LayoutDashboard,
    },
    {
      id: "teams",
      href: "/teams",
      label: "Groups",
      icon: Building2,
    },
    {
      id: "tasks",
      href: currentCompanyId ? `/teams/${currentCompanyId}/tasks` : "/home",
      label: "Tasks",
      icon: CheckCircle2,
    },
    {
      id: "admin",
      href: "/admin/users",
      label: "Team",
      icon: Users,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/40 pb-safe-area-inset-bottom shadow-[0_-8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_-8px_30px_rgb(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.id}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all relative",
                isActive ? "text-primary" : "text-muted-foreground/50"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-2xl transition-all duration-300",
                  isActive && "bg-primary/10 shadow-inner"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    isActive && "scale-110 rotate-[2deg]"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[9px] font-black uppercase tracking-tighter transition-all duration-300",
                  isActive ? "opacity-100 scale-100" : "opacity-70 scale-95"
                )}
              >
                {link.label}
              </span>
              {isActive && (
                <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-10 h-[3px] bg-primary rounded-full shadow-[0_0_12px_rgba(var(--primary),0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
