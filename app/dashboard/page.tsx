"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PriorityBoard } from "@/components/PriorityBoard";
import { User, Task } from "@/lib/types";
import { api } from "@/lib/api";
import {
  Layout,
  Building2,
  ArrowRight,
  CheckCircle2,
  Star,
  Clock,
  User as UserIcon,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, urgent: 0, completed: 0 });

  useEffect(() => {
    const init = async () => {
      try {
        const response: any = await api.auth.me();
        setCurrentUser(response.data);

        // Fetch personal stats for the overview
        const tasksRes: any = await api.tasks.list({ personalOnly: true });
        const tasks = tasksRes.data;
        setStats({
          total: tasks.length,
          urgent: tasks.filter((t: Task) => t.priority === "URGENT").length,
          completed: tasks.filter((t: Task) => t.status === "COMPLETED").length,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-2xl shadow-primary/20" />
      </div>
    );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-primary/10 rounded-md flex items-center justify-center border border-primary/10">
              <UserIcon className="h-3 w-3 text-primary fill-primary/20" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/70">
              Private Operations
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground drop-shadow-sm">
            Personal Space
          </h1>
          <p className="text-muted-foreground text-sm font-medium max-w-lg leading-relaxed">
            Welcome back, {currentUser?.name.split(" ")[0]}. Here's your private
            command center for non-team tasks.
          </p>
        </div>

        <Button
          onClick={() => router.push("/teams")}
          variant="outline"
          className="h-10 px-6 font-bold rounded-xl border-2 border-primary/10 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all text-sm group/btn relative overflow-hidden shadow-xl shadow-primary/5"
        >
          <span className="relative z-10 flex items-center">
            Switch to Team Hub
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-border/40 bg-card/40 backdrop-blur-md shadow-lg hover:shadow-primary/5 transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle2 className="h-16 w-16 -mr-4 -mt-4" />
          </div>
          <CardContent className="p-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5 border border-primary/10 transition-transform group-hover:scale-105">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
              My Private Tasks
            </h3>
            <p className="text-4xl font-black text-foreground">{stats.total}</p>
            <p className="mt-6 text-[10px] font-black text-primary/70 uppercase tracking-tighter">
              Solo Mission
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 bg-card/40 backdrop-blur-md shadow-lg hover:shadow-red-500/5 transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="h-16 w-16 -mr-4 -mt-4" />
          </div>
          <CardContent className="p-6">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-5 border border-red-500/10 transition-transform group-hover:scale-105">
              <Clock className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
              Urgent Matters
            </h3>
            <p className="text-4xl font-black text-foreground">
              {stats.urgent}
            </p>
            <p className="mt-6 text-[10px] font-black text-red-500/70 uppercase tracking-tighter">
              Personal Priority
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 bg-card/40 backdrop-blur-md shadow-lg hover:shadow-green-500/5 transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle2 className="h-16 w-16 -mr-4 -mt-4" />
          </div>
          <CardContent className="p-6">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-5 border border-green-500/10 transition-transform group-hover:scale-105">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
              Completed
            </h3>
            <p className="text-4xl font-black text-foreground">
              {stats.completed}
            </p>
            <p className="mt-6 text-[10px] font-black text-green-500/70 uppercase tracking-tighter">
              Personal Growth
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight">
            Private Objective Board
          </h2>
        </div>
        <div className="rounded-[2rem] border border-border/60 bg-white/50 dark:bg-card/30 backdrop-blur-md p-6 shadow-2xl shadow-black/[0.02]">
          <PriorityBoard
            onEditTask={() => {}}
            onDeleteTask={() => {}}
            personalOnly={true}
            refreshTrigger={0}
          />
        </div>
      </div>
    </div>
  );
}
