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
  Sparkles,
  Rocket,
} from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { FAQ } from "@/components/landing/FAQ";
import { ThemeToggle } from "@/components/ThemeToggle";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const teamsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const orbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mockupRef = useRef<HTMLDivElement>(null);
  const mockupBallRef = useRef<HTMLDivElement>(null);

  // Smooth scroll with Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Connect GSAP ScrollTrigger with Lenis
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Handle scroll state for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cursor tracking for floating orbs and mockup ball
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Apply cursor-following effect to orbs (stronger parallax)
  useEffect(() => {
    const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;
    const deltaX = (mousePos.x - centerX) / centerX;
    const deltaY = (mousePos.y - centerY) / centerY;

    // Background orbs with stronger parallax
    orbRefs.current.forEach((orb, i) => {
      if (orb) {
        const speed = (i + 1) * 40; // Increased from 15 to 40 for stronger effect
        gsap.to(orb, {
          x: deltaX * speed,
          y: deltaY * speed,
          duration: 1,
          ease: "power2.out",
        });
      }
    });

    // Mockup ball follows cursor within mockup bounds
    if (mockupRef.current && mockupBallRef.current) {
      const rect = mockupRef.current.getBoundingClientRect();
      const relX = mousePos.x - rect.left;
      const relY = mousePos.y - rect.top;
      const boundedX = Math.max(0, Math.min(relX, rect.width));
      const boundedY = Math.max(0, Math.min(relY, rect.height));

      gsap.to(mockupBallRef.current, {
        x: boundedX - 30,
        y: boundedY - 30,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [mousePos]);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTl
        .fromTo(
          ".hero-badge",
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8 }
        )
        .fromTo(
          ".hero-title .word",
          { opacity: 0, y: 60, rotateX: -30 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.15 },
          "-=0.4"
        )
        .fromTo(
          ".hero-subtitle",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        )
        .fromTo(
          ".hero-buttons",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        )
        .fromTo(
          ".hero-preview",
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1 },
          "-=0.3"
        );

      // Features section scroll animation
      gsap.fromTo(
        ".feature-card",
        { opacity: 0, y: 80, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Teams section parallax
      gsap.fromTo(
        ".teams-content",
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          scrollTrigger: {
            trigger: teamsRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".teams-card",
        { opacity: 0, x: 60, rotateZ: 6 },
        {
          opacity: 1,
          x: 0,
          rotateZ: 3,
          duration: 1,
          scrollTrigger: {
            trigger: teamsRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // CTA section animation
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // Animated Button Component with GSAP text slide effect
  const AnimatedButton = ({
    children,
    className,
    variant = "primary",
    size = "default",
    icon,
  }: {
    children: React.ReactNode;
    className?: string;
    variant?: "primary" | "outline";
    size?: "default" | "lg" | "xl";
    icon?: React.ReactNode;
  }) => {
    const sizeClasses = {
      default: "h-10 px-6 text-[11px]",
      lg: "h-14 px-10 text-xs",
      xl: "h-16 px-12 text-xs",
    };

    const variantClasses = {
      primary:
        "bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10",
      outline:
        "bg-transparent border border-border hover:bg-muted hover:border-foreground/20",
    };

    // CSS-based smooth animation
    return (
      <button
        className={cn(
          "group relative font-black uppercase tracking-[0.2em] rounded-full transition-all duration-300 active:scale-95 overflow-hidden flex items-center justify-center gap-3",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      >
        <div className="relative overflow-hidden h-4 w-auto flex flex-col justify-start">
          <div className="flex flex-col gap-0 transition-transform duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-4">
            <span className="h-4 flex items-center justify-center leading-none">
              {children}
            </span>
            <span className="h-4 flex items-center justify-center leading-none text-primary">
              {children}
            </span>
          </div>
        </div>
        {icon && (
          <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110">
            {icon}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      {/* Colorful Decorative Background Elements - Cursor Responsive */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Indigo orb */}
        <div
          ref={(el) => {
            orbRefs.current[0] = el;
          }}
          className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-indigo-500/15 rounded-full blur-[120px] opacity-40"
        />
        {/* Violet orb */}
        <div
          ref={(el) => {
            orbRefs.current[1] = el;
          }}
          className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-violet-500/15 rounded-full blur-[100px] opacity-30"
        />
        {/* Slate orb */}
        <div
          ref={(el) => {
            orbRefs.current[2] = el;
          }}
          className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] bg-slate-500/10 rounded-full blur-[120px] opacity-30"
        />
        {/* Subtle purple orb */}
        <div
          ref={(el) => {
            orbRefs.current[3] = el;
          }}
          className="absolute bottom-[-10%] right-[20%] w-[25%] h-[25%] bg-purple-500/10 rounded-full blur-[100px] opacity-25"
        />
        {/* Grain texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay" />
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
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link href="/register">
              <AnimatedButton>Join Now</AnimatedButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-28 sm:pt-40 pb-10 sm:pb-20 container mx-auto px-4 sm:px-6">
        <div
          ref={heroRef}
          className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-10 mb-10 sm:mb-20"
        >
          {/* Floating decorative shapes - hidden on mobile */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
            <div className="absolute top-20 left-10 w-3 h-3 rounded-full bg-indigo-500/40" />
            <div className="absolute top-40 right-20 w-2 h-2 rounded-full bg-violet-500/30" />
            <div className="absolute bottom-40 left-1/4 w-2 h-2 rounded-full bg-slate-500/30" />
            <div className="absolute top-60 right-1/3 w-1.5 h-1.5 rounded-full bg-indigo-400/25" />
          </div>

          <div className="hero-badge inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-muted/50 border border-border text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground mb-2">
            <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>Next-Gen Task Intelligence</span>
            <Rocket className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </div>

          <h1
            className="hero-title text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] sm:leading-[0.9] text-foreground"
            style={{ perspective: "1000px" }}
          >
            <span className="word inline-block">Workflow</span> <br />
            <span className="word inline-block">Redefined by</span> <br />
            <span className="word inline-block text-gradient-rainbow">
              Priorities.
            </span>
          </h1>

          <p className="hero-subtitle text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium px-4 sm:px-0">
            The only task management system that separates your{" "}
            <span className="text-foreground font-bold">Solo Missions</span>{" "}
            from{" "}
            <span className="text-foreground font-bold">Team Objectives</span>{" "}
            while keeping priority at the absolute center.
          </p>

          <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
            <Link href="/register">
              <AnimatedButton
                size="lg"
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Commence Mission
              </AnimatedButton>
            </Link>
            <Link href="/login">
              <AnimatedButton size="lg" variant="outline">
                Explore Dashboard
              </AnimatedButton>
            </Link>
          </div>
        </div>

        {/* Dashboard Preview - Interactive with Cursor Ball */}
        <div className="hero-preview relative max-w-6xl mx-auto">
          <div className="absolute inset-0 bg-indigo-500/10 blur-[150px] -z-10 opacity-40" />
          <div
            ref={mockupRef}
            className="glass rounded-2xl sm:rounded-[2.5rem] p-2 sm:p-4 border-2 border-border shadow-2xl dark:border-border/50 dark:shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden relative bg-card"
          >
            {/* Cursor-following ball inside mockup */}
            <div
              ref={mockupBallRef}
              className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 blur-xl pointer-events-none hidden md:block"
              style={{ transform: "translate(-50%, -50%)" }}
            />

            <div className="h-8 sm:h-10 flex items-center px-2 sm:px-4 gap-2 border-b border-border mb-2 sm:mb-4">
              <div className="flex gap-1 sm:gap-1.5">
                <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-red-500" />
                <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center">
                <div className="h-4 sm:h-5 w-32 sm:w-48 bg-muted-foreground/20 rounded mx-auto" />
              </div>
            </div>

            <div className="aspect-[16/10] sm:aspect-video bg-muted/50 dark:bg-background rounded-xl sm:rounded-[1.5rem] overflow-hidden flex shadow-inner border-2 border-border dark:border-border">
              <div className="w-10 sm:w-16 border-r border-border flex flex-col items-center py-3 sm:py-6 gap-3 sm:gap-6 bg-muted/30">
                <div className="h-4 w-4 sm:h-6 sm:w-6 rounded bg-foreground/20" />
                <div className="h-4 w-4 sm:h-6 sm:w-6 rounded bg-muted" />
                <div className="h-4 w-4 sm:h-6 sm:w-6 rounded bg-muted" />
              </div>
              <div className="flex-1 p-3 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 overflow-hidden">
                {[
                  { name: "Urgent", color: "bg-red-500" },
                  { name: "High", color: "bg-orange-500" },
                  { name: "Medium", color: "bg-blue-500" },
                  { name: "Low", color: "bg-green-500" },
                ].map((p, i) => (
                  <div
                    key={p.name}
                    className="space-y-2 sm:space-y-4 group/col"
                  >
                    <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-6">
                      <div
                        className={cn(
                          "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full",
                          p.color
                        )}
                      />
                      <div className="h-2 sm:h-3 w-10 sm:w-16 bg-foreground/20 rounded" />
                    </div>
                    <div
                      className="h-20 sm:h-32 bg-card rounded-xl sm:rounded-2xl border-2 border-border p-2 sm:p-4 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 cursor-pointer"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="h-1.5 sm:h-2 w-full bg-foreground/10 rounded mb-1 sm:mb-2" />
                      <div className="h-1.5 sm:h-2 w-3/4 bg-foreground/5 rounded" />
                      <div className="mt-4 sm:mt-8 flex justify-between items-center">
                        <div
                          className={cn(
                            "h-3 w-3 sm:h-4 sm:w-4 rounded",
                            p.color
                          )}
                        />
                        <div className="h-3 sm:h-4 w-8 sm:w-12 bg-foreground/10 rounded" />
                      </div>
                    </div>
                    <div className="h-16 sm:h-24 bg-card/80 rounded-xl sm:rounded-2xl border border-border p-2 sm:p-4 opacity-50 hover:opacity-80 transition-opacity cursor-pointer hidden sm:block">
                      <div className="h-2 w-full bg-foreground/10 rounded mb-2" />
                      <div className="h-2 w-1/2 bg-foreground/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div
          ref={featuresRef}
          id="features"
          className="mt-20 sm:mt-40 md:mt-60 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
        >
          {[
            {
              icon: LayoutDashboard,
              title: "Priority Board",
              desc: "A vertical sorting system designed to let you tackle what matters most, without the noise.",
              highlight: "Smart prioritization",
            },
            {
              icon: Users,
              title: "Enterprise Teams",
              desc: "Multi-tenant company structures with Admin, Officer, and Member roles for perfect governance.",
              highlight: "Role-based access",
            },
            {
              icon: Lock,
              title: "Private Space",
              desc: "One-click switch between team objectives and your own personal solo missions.",
              highlight: "Complete privacy",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="feature-card group relative glass rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 border-border/50 hover:border-foreground/10 transition-all hover:-translate-y-2 duration-500 overflow-hidden"
            >
              {/* Subtle gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 bg-foreground/5 border border-border transition-all duration-300 group-hover:bg-foreground/10 group-hover:scale-110 group-hover:border-foreground/20">
                  <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
                </div>

                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-2 sm:mb-3">
                  {feature.highlight}
                </span>

                <h3 className="text-xl sm:text-2xl font-black mb-2 sm:mb-4 tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <FAQ />

        {/* Systems Section */}
        <div
          ref={teamsRef}
          id="teams"
          className="mt-20 sm:mt-40 grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-20 items-center"
        >
          <div className="teams-content space-y-4 sm:space-y-8">
            <div className="h-1 w-16 sm:w-20 bg-foreground rounded-full" />
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-foreground">
              Unified Team <br />
              <span className="text-gradient-purple">Intelligence.</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-lg leading-relaxed font-medium">
              Managing multiple companies? Prioritize allows you to switch
              between different workspaces instantly. Each workspace carries its
              own permissions, members, and public task boards.
            </p>
            <div className="space-y-3 sm:space-y-4">
              {[
                "Role-based access (Admin, Officer, User)",
                "Company-wide public task boards",
                "Dedicated personal task spaces",
                "Audit-ready member activity",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 group">
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-foreground/60" />
                  <span className="text-xs sm:text-sm font-bold text-foreground/80 group-hover:text-foreground transition-colors">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="teams-card relative group">
            <div className="absolute inset-0 bg-indigo-500/5 blur-[80px] -z-10 group-hover:opacity-75 transition-all duration-700" />
            <div className="glass rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 border-border/50 sm:rotate-3 group-hover:rotate-0 transition-transform duration-700">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Globe2 className="h-4 w-4 sm:h-5 sm:w-5 text-foreground/60" />
                    <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                      Teams / Global Hub
                    </span>
                  </div>
                  <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="h-px bg-border" />
                <div className="space-y-2 sm:space-y-3">
                  {[
                    { name: "Engineering", count: 12 },
                    { name: "Strategy", count: 4 },
                    { name: "Operations", count: 8 },
                  ].map((t) => (
                    <div
                      key={t.name}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/50 border border-border/50 hover:bg-muted hover:border-foreground/10 transition-all cursor-pointer group/item text-foreground"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-foreground/30" />
                        <span className="text-xs sm:text-sm font-bold">
                          {t.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground group-hover/item:text-foreground transition-colors">
                        <span className="text-[10px] sm:text-xs">
                          {t.count} Active
                        </span>
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div
          ref={ctaRef}
          className="mt-20 sm:mt-40 md:mt-60 mb-10 sm:mb-20 text-center"
        >
          <div className="glass rounded-2xl sm:rounded-[4rem] p-8 sm:p-12 md:p-20 border-border relative overflow-hidden">
            {/* Background subtle orbs */}
            <div className="absolute top-0 left-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-indigo-500/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-violet-500/10 rounded-full blur-[100px] -z-10" />

            <div className="absolute top-0 right-0 p-10 sm:p-20 opacity-5 pointer-events-none hidden sm:block">
              <Zap className="h-48 w-48 sm:h-96 sm:w-96 -mr-20 sm:-mr-40 -mt-10 sm:-mt-20 text-foreground" />
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4 sm:mb-8 max-w-2xl mx-auto text-foreground">
              Ready to command your{" "}
              <span className="text-gradient-purple">workflow?</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-lg mb-6 sm:mb-10 max-w-xl mx-auto font-medium">
              Join thousands of high-performing teams already using Prioritize
              to master their objectives.
            </p>
            <div className="flex justify-center">
              <Link href="/register">
                <AnimatedButton size="xl">
                  Establish Base of Operations
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 sm:mt-40 pt-6 sm:pt-10 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 opacity-60 pb-8">
          <div className="flex items-center gap-2 text-foreground">
            <Logo w={40} h={40} />
            <span className="text-xs sm:text-sm font-black tracking-tighter">
              Prioritize &copy; 2024
            </span>
          </div>
          <div className="flex gap-4 sm:gap-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Support
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
