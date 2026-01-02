"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { api } from "@/lib/api";
import { User, Task } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  stats: {
    teamCount: number;
    taskCount: number;
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  refetchUser: () => Promise<void>;
  refetchStats: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    teamCount: 0,
    taskCount: 0,
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const hasFetched = useRef(false);

  const fetchUser = async () => {
    try {
      const response: any = await api.auth.me();
      setUser(response.data);
      return response.data;
    } catch (error) {
      // Silent fail: User is not logged in (expected for public pages)
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const tasksRes: any = await api.tasks.list({});
      const tasks = tasksRes.data || [];
      setStats({
        teamCount: user?.memberships?.length || 0,
        taskCount: tasks.length,
        urgent: tasks.filter((t: Task) => t.priority === "URGENT").length,
        high: tasks.filter((t: Task) => t.priority === "HIGH").length,
        medium: tasks.filter((t: Task) => t.priority === "MEDIUM").length,
        low: tasks.filter((t: Task) => t.priority === "LOW").length,
      });
    } catch (error) {
      console.error("Failed to fetch stats");
    }
  };

  useEffect(() => {
    // Only fetch once on app mount
    if (hasFetched.current) return;
    hasFetched.current = true;

    const init = async () => {
      const userData = await fetchUser();
      if (userData) {
        // Fetch stats after user is loaded
        try {
          const tasksRes: any = await api.tasks.list({});
          const tasks = tasksRes.data || [];
          setStats({
            teamCount: userData.memberships?.length || 0,
            taskCount: tasks.length,
            urgent: tasks.filter((t: Task) => t.priority === "URGENT").length,
            high: tasks.filter((t: Task) => t.priority === "HIGH").length,
            medium: tasks.filter((t: Task) => t.priority === "MEDIUM").length,
            low: tasks.filter((t: Task) => t.priority === "LOW").length,
          });
        } catch (error) {
          console.error("Failed to fetch stats");
        }
      }
    };

    init();
  }, []);

  const refetchUser = async () => {
    await fetchUser();
  };

  const refetchStats = async () => {
    await fetchStats();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, stats, refetchUser, refetchStats }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
