"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: "How does priority-based task management work?",
    answer:
      "Tasks are automatically organized into four priority levels: Urgent, High, Medium, and Low. This vertical sorting system ensures you always focus on what matters most, with visual indicators and smart defaults to keep you on track.",
  },
  {
    question: "Can I manage multiple teams and companies?",
    answer:
      "Yes! Prioritize supports multi-tenant workspaces. Each workspace has its own permissions, members, and task boards. Switch between companies instantly while maintaining complete separation of data.",
  },
  {
    question: "What roles are available for team members?",
    answer:
      "We offer three role levels: Admin (full control), Officer (manage tasks and members), and User (create and manage own tasks). This ensures proper governance while maintaining flexibility.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Absolutely. All data is encrypted at rest and in transit. Your personal solo missions remain private by default, and team tasks are only visible to workspace members with appropriate permissions.",
  },
  {
    question: "How do I get started with my team?",
    answer:
      "Simply create an account, set up your first workspace, and invite team members via email. They'll receive an invitation to join your workspace and can start collaborating immediately.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const contentRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      itemsRef.current.forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
            delay: i * 0.1,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggleItem = (index: number) => {
    const contentEl = contentRefs.current[index];
    if (!contentEl) return;

    if (openIndex === index) {
      // Close
      gsap.to(contentEl, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
      setOpenIndex(null);
    } else {
      // Close previous
      if (openIndex !== null && contentRefs.current[openIndex]) {
        gsap.to(contentRefs.current[openIndex], {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
        });
      }
      // Open new
      gsap.set(contentEl, { height: "auto", opacity: 1 });
      const height = contentEl.offsetHeight;
      gsap.fromTo(
        contentEl,
        { height: 0, opacity: 0 },
        { height, opacity: 1, duration: 0.3, ease: "power2.inOut" }
      );
      setOpenIndex(index);
    }
  };

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border mb-6">
            <HelpCircle className="h-4 w-4 text-foreground/60" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Common Questions
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 md:mb-6">
            Frequently Asked{" "}
            <span className="text-gradient-purple">Questions</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about Prioritize
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-3 md:space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) itemsRef.current[i] = el;
              }}
              className={cn(
                "group rounded-2xl md:rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm",
                openIndex === i
                  ? "bg-card border-primary/20 shadow-lg dark:bg-muted/50 dark:border-foreground/10"
                  : "bg-card border-border hover:border-primary/10 hover:shadow-md dark:bg-background dark:border-border/50 dark:hover:border-foreground/5 dark:hover:bg-muted/30"
              )}
            >
              <button
                onClick={() => toggleItem(i)}
                className="w-full flex items-center justify-between p-4 md:p-6 text-left cursor-pointer group/btn"
              >
                <span className="text-sm md:text-base font-bold pr-4 text-foreground group-hover/btn:text-foreground/90 transition-colors">
                  {faq.question}
                </span>
                <div
                  className={cn(
                    "flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center transition-all duration-300",
                    openIndex === i
                      ? "bg-foreground text-background rotate-180 scale-100"
                      : "bg-muted text-foreground group-hover/btn:bg-foreground group-hover/btn:text-background group-hover/btn:scale-110"
                  )}
                >
                  {openIndex === i ? (
                    <Minus className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300" />
                  ) : (
                    <Plus className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover/btn:rotate-90" />
                  )}
                </div>
              </button>
              <div
                ref={(el) => {
                  if (el) contentRefs.current[i] = el;
                }}
                className="overflow-hidden"
                style={{
                  height: i === 0 ? "auto" : 0,
                  opacity: i === 0 ? 1 : 0,
                }}
              >
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
