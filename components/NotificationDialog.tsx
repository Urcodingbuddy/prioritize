"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Check, X, Mail, Building2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useSoundEffects } from "@/hooks/use-sound-effects";

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  onTeamJoined?: () => void;
}

export function NotificationDialog({
  open,
  onClose,
  onUpdate,
  onTeamJoined,
}: NotificationDialogProps) {
  const { playClick, playSuccess } = useSoundEffects();
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const response: any = await api.teams.listInvites();
      setInvites(response.data || []);
      // Sync with parent sidebar
      onUpdate?.();
    } catch (error) {
      console.error("Failed to fetch invites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchInvites();
    }
  }, [open]);

  const handleAccept = async (inviteId: string) => {
    try {
      playSuccess(); // Acceptance is a success event
      await api.teams.acceptInvite(inviteId);
      // Refresh user to get new team context
      onTeamJoined?.();
      // Refresh list
      fetchInvites();
    } catch (error) {
      console.error("Failed to accept invite");
    }
  };

  const handleReject = async (inviteId: string) => {
    try {
      playClick();
      await api.teams.rejectInvite(inviteId);
      // Refresh list
      fetchInvites();
    } catch (error) {
      console.error("Failed to reject invite");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-zinc-900 border-zinc-800 rounded-2xl overflow-hidden text-foreground">
        <VisuallyHidden>
          <DialogTitle>Notifications</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="p-5 pb-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
              Notifications
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center transition-colors text-zinc-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-2 max-h-[60vh] overflow-y-auto space-y-2">
          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-500 uppercase tracking-widest font-bold">
              Checking for updates...
            </div>
          ) : invites.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <Bell className="h-5 w-5 text-zinc-600" />
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                No new notifications
              </p>
            </div>
          ) : (
            invites.map((invite) => (
              <div
                key={invite.id}
                className="p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-zinc-200">
                        Team Invitation
                      </p>
                      <span className="text-[10px] font-medium text-zinc-500">
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      You have been invited to join{" "}
                      <span className="text-white font-semibold">
                        {invite.company.name}
                      </span>
                    </p>

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="h-8 text-xs font-bold bg-white text-black hover:bg-zinc-200 flex-1"
                        onClick={() => handleAccept(invite.id)}
                      >
                        <Check className="h-3 w-3 mr-1.5" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-700 flex-1"
                        onClick={() => handleReject(invite.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
