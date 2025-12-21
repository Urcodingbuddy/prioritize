"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Lock,
  Zap,
  Globe2,
  ChevronRight,
  LayoutDashboard,
  Star,
} from "lucide-react";
import  Logo  from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] opacity-20" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
          scrolled
            ? "glass py-3 translate-y-0"
            : "bg-transparent py-6 border-transparent"
        )}
      >
        <div className="container mx-auto px-6 h-10 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <Logo w={45} h={45} />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link href="/register">
              <Button className="h-10 px-6 font-black uppercase tracking-widest rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/10 transition-all active:scale-95">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-40 pb-20 container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-10 mb-20">
          <div className="reveal-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-2 shadow-inner">
            <Star className="h-3 w-3 fill-primary" />
            <span>Next-Gen Task Intelligence</span>
          </div>

          <h1 className="reveal-up [animation-delay:100ms] text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-foreground">
            Workflow <br /> Redefined by <br />
            <span className="text-gradient">Priorities.</span>
          </h1>

          <p className="reveal-up [animation-delay:200ms] text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
            The only task management system that separates your{" "}
            <span className="text-foreground italic font-bold">
              Solo Missions
            </span>{" "}
            from{" "}
            <span className="text-foreground italic font-bold">
              Team Objectives
            </span>{" "}
            while keeping priority at the absolute center.
          </p>

          <div className="reveal-up [animation-delay:300ms] flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 px-10 text-xs font-black uppercase tracking-[0.2em] rounded-2xl bg-primary text-primary-foreground hover:scale-105 transition-all shadow-2xl shadow-primary/40 group"
              >
                Commence Mission{" "}
                <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-xs font-black uppercase tracking-[0.2em] rounded-2xl border-border hover:bg-accent hover:text-accent-foreground transition-all"
              >
                Explore Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="reveal-up [animation-delay:400ms] relative max-w-6xl mx-auto">
          <div className="absolute inset-0 bg-primary/20 blur-[150px] -z-10 opacity-30 animate-pulse" />
          <div className="glass rounded-[2.5rem] p-4 border border-border/80 dark:border-border bg-white/40 dark:bg-black/40 shadow-[0_40px_100px_rgba(0,0,0,0.08)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="h-10 flex items-center px-4 gap-2 border-b border-border mb-4">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/60" />
              </div>
              <div className="flex-1 text-center">
                <div className="h-5 w-48 bg-muted rounded mx-auto" />
              </div>
            </div>

            <div className="aspect-video bg-background dark:bg-background/20 rounded-[1.5rem] overflow-hidden flex shadow-inner border border-border">
              <div className="w-16 border-r border-border flex flex-col items-center py-6 gap-6 bg-muted/40 dark:bg-muted/30">
                <div className="h-6 w-6 rounded bg-primary/20" />
                <div className="h-6 w-6 rounded bg-muted" />
                <div className="h-6 w-6 rounded bg-muted" />
              </div>
              <div className="flex-1 p-8 grid md:grid-cols-4 gap-4 overflow-hidden">
                {["Urgent", "High", "Medium", "Low"].map((p, i) => (
                  <div key={p} className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          i === 0
                            ? "bg-red-500"
                            : i === 1
                            ? "bg-orange-500"
                            : "bg-muted-foreground/30"
                        )}
                      />
                      <div className="h-3 w-16 bg-muted rounded" />
                    </div>
                    <div
                      className="h-32 bg-card rounded-2xl border border-border p-4 animate-in fade-in slide-in-from-bottom-2 shadow-sm"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="h-2 w-full bg-muted rounded mb-2" />
                      <div className="h-2 w-3/4 bg-muted/50 rounded" />
                      <div className="mt-8 flex justify-between">
                        <div className="h-4 w-4 rounded bg-muted" />
                        <div className="h-4 w-12 bg-muted/50 rounded" />
                      </div>
                    </div>
                    <div className="h-24 bg-card/50 rounded-2xl border border-border/60 p-4 opacity-50">
                      <div className="h-2 w-full bg-muted rounded mb-2" />
                      <div className="h-2 w-1/2 bg-muted/50 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-60 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: LayoutDashboard,
              title: "Priority Board",
              desc: "A vertical sorting system designed to let you tackle what matters most, without the noise.",
              color: "primary",
            },
            {
              icon: Users,
              title: "Enterprise Teams",
              desc: "Multi-tenant company structures with Admin, Officer, and Member roles for perfect governance.",
              color: "blue-500",
            },
            {
              icon: Lock,
              title: "Private Space",
              desc: "One-click switch between team objectives and your own personal solo missions.",
              color: "amber-400",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="reveal-up group glass rounded-[2.5rem] p-10 border-border/50 hover:border-primary/20 transition-all hover:-translate-y-2 duration-500"
            >
              <div
                className={cn(
                  "h-16 w-16 rounded-3xl flex items-center justify-center mb-8 shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6",
                  `bg-${feature.color}/10 border border-${feature.color}/20`
                )}
              >
                <feature.icon
                  className={cn("h-8 w-8", `text-${feature.color}`)}
                />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Systems Section */}
        <div
          id="teams"
          className="mt-60 grid lg:grid-cols-2 gap-20 items-center"
        >
          <div className="reveal-up space-y-8">
            <div className="h-px w-20 bg-primary" />
            <h2 className="text-5xl font-black tracking-tighter text-foreground">
              Unified Team <br /> Intelligence.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-medium">
              Managing multiple companies? Prioritize allows you to switch
              between different workspaces instantly. Each workspace carries its
              own permissions, members, and public task boards.
            </p>
            <div className="space-y-4">
              {[
                "Role-based access (Admin, Officer, User)",
                "Company-wide public task boards",
                "Dedicated personal task spaces",
                "Audit-ready member activity",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold text-foreground/80">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-[80px] -z-10 group-hover:bg-primary/30 transition-all duration-700" />
            <div className="glass-dark rounded-[3rem] p-10 border-white/5 rotate-3 group-hover:rotate-0 transition-transform duration-700">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe2 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                      Teams / Global Hub
                    </span>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="h-px bg-white/5" />
                <div className="space-y-3">
                  {[
                    { name: "Engineering", count: 12 },
                    { name: "Strategy", count: 4 },
                    { name: "Operations", count: 8 },
                  ].map((t) => (
                    <div
                      key={t.name}
                      className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group/item text-foreground"
                    >
                      <span className="text-sm font-bold">{t.name}</span>
                      <div className="flex items-center gap-3 text-muted-foreground group-hover/item:text-primary transition-colors">
                        <span className="text-xs">{t.count} Active</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-60 mb-20 text-center reveal-up">
          <div className="glass rounded-[4rem] p-20 border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
              <Zap className="h-96 w-96 -mr-40 -mt-20 text-primary" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 max-w-2xl mx-auto text-foreground">
              Ready to command your workflow?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto font-medium">
              Join hundreds of high-performing teams already using Prioritize to
              master their objectives.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="h-16 px-12 text-xs font-black uppercase tracking-[0.3em] rounded-2xl bg-primary text-primary-foreground hover:scale-105 transition-all shadow-2xl shadow-primary/20"
              >
                Establish Base of Operations
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-40 pt-10 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60">
          <div className="flex items-center gap-2 text-foreground">
            <Logo w={60} h={60} />
            <span className="text-sm font-black tracking-tighter">
              Prioritize &copy; 2024
            </span>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Deployments
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
