"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Mail, Building2, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function TeamInvites() {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    try {
      const response: any = await api.teams.listInvites();
      setInvites(response.data);
    } catch (error) {
      console.error("Failed to fetch invites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleAccept = async (inviteId: string) => {
    try {
      await api.teams.acceptInvite(inviteId);
      window.location.reload(); // Refresh to switch to new team context
    } catch (error) {
      console.error("Failed to accept invite");
    }
  };

  if (loading || invites.length === 0) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Bell className="h-4 w-4 text-primary animate-bounce" />
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
          Pending Invitations
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {invites.map((invite) => (
          <Card
            key={invite.id}
            className="relative overflow-hidden border-primary/20 bg-primary/5 shadow-xl shadow-primary/5 group"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Building2 className="h-12 w-12" />
            </div>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black tracking-tight text-foreground truncate">
                    {invite.company.name}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    Team Invite
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <Button
                  size="sm"
                  onClick={() => handleAccept(invite.id)}
                  className="flex-1 font-bold h-9 shadow-lg shadow-primary/10"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
