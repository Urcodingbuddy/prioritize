"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import {
  CheckCircle2,
  Building2,
  User,
  ArrowRight,
  Sparkles,
  Globe,
  Circle,
  Orbit,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./Logo";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { refetchUser, refetchStats } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isAdminRegistration, setIsAdminRegistration] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await api.auth.register(
          email,
          password,
          name,
          isAdminRegistration ? companyName : undefined
        );
      } else {
        await api.auth.login(email, password);
      }

      // Update global auth state immediately
      await refetchUser();
      await refetchStats();

      router.push("/home");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.2fr_1fr] bg-background text-foreground">
      {/* Decorative Background for Left side */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 hidden lg:block">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[150px]" />
      </div>

      {/* Left Column - Form */}
      <div className="flex items-center justify-center p-8 lg:p-24 relative z-10">
        <Card className="w-full max-w-md reveal-up border-2 border-foreground bg-card shadow-2xl">
          <CardHeader className="space-y-4">
            <div
              className="flex items-center justify-center gap-3 mb-6 group cursor-pointer"
              onClick={() => router.push("/")}
            >
              <Logo w={100} h={100} />
            </div>

            <CardTitle className="text-4xl md:text-5xl font-black tracking-tighter text-foreground text-center">
              {mode === "login" ? "Welcome Back." : "Join the Elite."}
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium leading-relaxed text-center">
              {mode === "login"
                ? "Resuming mission. Enter your secure credentials to proceed."
                : "Establish your profile or command center and start mastering your workflow today."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === "register" && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-2xl border-2 border-foreground">
                  <button
                    type="button"
                    onClick={() => setIsAdminRegistration(false)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border-2",
                      !isAdminRegistration
                        ? "bg-foreground text-background border-foreground shadow-xl"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    )}
                  >
                    <User className="h-4 w-4 stroke-[2.5px]" />
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdminRegistration(true)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border-2",
                      isAdminRegistration
                        ? "bg-foreground text-background border-foreground shadow-xl"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    )}
                  >
                    <Building2 className="h-4 w-4 stroke-[2.5px]" />
                    Admin / Team
                  </button>
                </div>
              )}

              <div className="space-y-5">
                {mode === "register" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="E.g. John Wick"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-14 bg-muted/50 border-border focus:border-primary/50 transition-all rounded-2xl text-sm font-medium"
                    />
                  </div>
                )}

                {mode === "register" && isAdminRegistration && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="companyName"
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1"
                    >
                      Workspace Name
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Acme Global Ops."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="h-14 bg-primary/10 border-primary/20 focus:border-primary/40 transition-all rounded-2xl text-sm font-medium text-foreground placeholder:text-primary/30"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="commander@prioritize.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 bg-muted/50 border-border focus:border-primary/50 transition-all rounded-2xl text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1"
                  >
                    Access Code
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 bg-muted/50 border-border focus:border-primary/50 transition-all rounded-2xl text-sm font-medium"
                  />
                </div>
              </div>

              {error && (
                <div className="text-[11px] font-bold text-red-400 bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 text-xs font-black uppercase tracking-[0.2em] rounded-2xl bg-primary text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20 group"
                disabled={loading}
              >
                {loading ? (
                  "Authorizing..."
                ) : (
                  <span className="flex items-center gap-2">
                    {mode === "login"
                      ? "Enter Command Center"
                      : "Initialize Workspace"}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/10 p-6">
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span className="text-muted-foreground">
                {mode === "login"
                  ? "New to the system?"
                  : "Already established?"}
              </span>
              <button
                type="button"
                onClick={() =>
                  router.push(mode === "login" ? "/register" : "/login")
                }
                className="text-foreground hover:text-primary transition-colors uppercase tracking-widest border-b border-border hover:border-primary pb-0.5"
              >
                {mode === "login" ? "Create Profile" : "Secure Login"}
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Right Column - Premium Visualization */}

      <div className="hidden lg:flex flex-col items-center justify-center p-20 relative overflow-hidden border-l border-border bg-muted/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />

        <div className="relative w-full h-full flex items-center justify-center">
          {/* OUTER ORBIT */}
          <div
            className="absolute w-[520px] h-[520px] rounded-full 
  border border-white/10 
  shadow-[0_0_40px_rgba(255,255,255,0.04)]
  animate-[spin_30s_linear_infinite]"
          >
            <div className="absolute top-1/2 -translate-y-1/2 -right-3">
              <Globe className="text-primary/70" size={22} />
            </div>
          </div>

          {/* MID ORBIT */}
          <div
            className="absolute w-[380px] h-[380px] rounded-full 
  border border-white/12 
  shadow-[0_0_30px_rgba(255,255,255,0.05)]
  animate-[spin_22s_linear_infinite_reverse]"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <Circle className="text-muted-foreground/70" size={20} />
            </div>

            <div className="absolute bottom-6 right-6">
              <Star className="text-primary/50" size={24} />
            </div>
          </div>

          {/* INNER ORBIT */}
          <div
            className="absolute w-[240px] h-[240px] rounded-full 
  border border-white/15 
  shadow-[0_0_20px_rgba(255,255,255,0.06)]
  animate-[spin_16s_linear_infinite]"
          >
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <Orbit className="text-muted-foreground/60" size={22} />
            </div>
          </div>

          {/* CENTER CORE */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-12 max-w-sm">
            <div className="h-24 w-24 rounded-[2.5rem] border border-white/10 bg-white/5 flex items-center justify-center shadow-2xl">
              <Sparkles className="text-primary" width={48} height={48} />
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tighter leading-tight">
                The ultimate <br />
                vantage point for <br />
                your productivity.
              </h2>

              <div className="flex flex-col items-center gap-4">
                <div className="h-px w-10 bg-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  Protocol Alpha-9 Activated
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary/30"
                />
              ))}
            </div>
          </div>
        </div>

        {/* HUD */}
        <div className="absolute top-10 right-10 flex flex-col items-end gap-2 opacity-20">
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest">
            Latency: 12ms
          </div>
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest">
            Uptime: 99.9%
          </div>
        </div>
      </div>
    </div>
  );
}
