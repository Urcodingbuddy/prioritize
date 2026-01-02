"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, Quote } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager",
    company: "TechFlow",
    content:
      "Prioritize completely transformed how our team handles sprints. The priority-first approach is genius!",
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "Engineering Lead",
    company: "DataSync",
    content:
      "Finally, a task manager that understands urgency levels. Our productivity jumped 40% in the first month.",
    avatar: "MJ",
  },
  {
    name: "Emma Williams",
    role: "Startup Founder",
    company: "GrowthLabs",
    content:
      "The team collaboration features are incredible. Multi-workspace support is a game changer for agencies.",
    avatar: "EW",
  },
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "500+", label: "Teams" },
  { value: "2M+", label: "Tasks Completed" },
  { value: "99.9%", label: "Uptime" },
];

export function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const statsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate testimonial cards
      cardsRef.current.forEach((card, i) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 80,
            rotateX: -15,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
            delay: i * 0.15,
          }
        );
      });

      // Animate stats with counter
      statsRef.current.forEach((stat, i) => {
        gsap.fromTo(
          stat,
          { opacity: 0, scale: 0.5 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: stat,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
            delay: i * 0.1,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Subtle background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border mb-6">
            <Star className="h-4 w-4 text-foreground/60" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Loved by Teams
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">
            What People Are <span className="text-gradient-purple">Saying</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Join thousands of high-performing teams already using Prioritize
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) statsRef.current[i] = el;
              }}
              className="glass rounded-3xl p-6 text-center group hover:scale-105 transition-transform duration-300 cursor-default border-border/50"
            >
              <div className="text-4xl md:text-5xl font-black mb-2 text-foreground">
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="group relative glass rounded-[2rem] p-8 border-border/50 hover:border-foreground/10 transition-all duration-500 hover:-translate-y-2"
              style={{ perspective: "1000px" }}
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-5">
                <Quote className="h-16 w-16" />
              </div>

              {/* Content */}
              <p className="text-foreground/80 text-base leading-relaxed mb-8 relative z-10">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground font-black text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>

              {/* Subtle hover effect */}
              <div className="absolute inset-0 bg-foreground/[0.02] opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
