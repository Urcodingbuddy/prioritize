"use client";

import { useState, useEffect } from "react";
import { PriorityBoard } from "@/components/PriorityBoard";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Globe2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeamPublicPage() {
  const { id } = useParams();
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (id) {
      api.companies.switch(id as string).catch(console.error);
    }
  }, [id]);

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-5 bg-primary/10 rounded flex items-center justify-center">
              <Globe2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
              Shared Objectives
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Public Board
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium max-w-lg">
            Company-wide visibility for shared goals and cross-functional
            projects.
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={() => router.push(`/teams/${id}/tasks`)}
          className="h-10 px-4 font-bold text-xs uppercase tracking-widest text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          My Team Tasks
        </Button>
      </div>

      <PriorityBoard
        onEditTask={() => {}}
        onDeleteTask={() => {}}
        onCreateTask={() => {}}
        refreshTrigger={refreshTrigger}
        publicOnly={true}
      />
    </div>
  );
}
