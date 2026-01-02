"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  User as UserIcon,
  Shield,
  LogOut,
  Loader2,
  Mail,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { User } from "@/lib/types";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function SettingsDialog({ open, onClose, user }: SettingsDialogProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.auth.logout();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0">
        <div className="flex h-[500px]">
          {/* Sidebar */}
          <div className="w-56 bg-muted/30 border-r border-border p-4 flex flex-col">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-black">Account</DialogTitle>
              <DialogDescription className="text-xs">
                Manage your account info.
              </DialogDescription>
            </DialogHeader>

            <nav className="space-y-1 flex-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-muted-foreground">
                  Profile details
                </h2>

                <div className="border-t border-border pt-6 space-y-6">
                  {/* Profile */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Profile
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-black">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span className="text-sm font-medium">{user?.name}</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between border-t border-border pt-6">
                    <span className="text-sm text-muted-foreground">
                      Email address
                    </span>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{user?.email}</span>
                      <span className="px-2 py-0.5 bg-secondary text-[10px] font-bold rounded-full uppercase">
                        Primary
                      </span>
                    </div>
                  </div>

                  {/* Member since */}
                  {user?.createdAt && (
                    <div className="flex items-center justify-between border-t border-border pt-6">
                      <span className="text-sm text-muted-foreground">
                        Member since
                      </span>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <div className="border-t border-border pt-6">
                  <Button
                    variant="destructive"
                    className="w-full gap-2 font-bold"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    {loggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    Log out
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-muted-foreground">
                  Security
                </h2>

                <div className="border-t border-border pt-6 space-y-6">
                  {/* Password */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Password
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold"
                    >
                      Set password
                    </Button>
                  </div>

                  {/* Active devices */}
                  <div className="border-t border-border pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">
                        Active devices
                      </span>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-4 flex items-center gap-4">
                      <div className="h-10 w-10 bg-background rounded-lg flex items-center justify-center">
                        <div className="h-6 w-6 bg-foreground rounded" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">
                            Current Device
                          </span>
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                            This device
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Active now
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delete account */}
                  <div className="border-t border-border pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Delete account
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Delete account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
