"use client";

import { useState, useEffect } from "react";
import { Task, Status, Priority } from "@/lib/types";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface TaskListProps {
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  refreshTrigger?: number;
}

export function TaskList({
  onEditTask,
  onDeleteTask,
  refreshTrigger,
}: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response: any = await api.tasks.list({
        page,
        limit: 12,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: search || undefined,
      });
      setTasks(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, statusFilter, priorityFilter, refreshTrigger]);

  const handleSearch = () => {
    setPage(1);
    fetchTasks();
  };

  const handleStatusChange = async (taskId: string, status: Status) => {
    try {
      await api.tasks.update(taskId, { status });
      fetchTasks();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <select
          className="px-4 py-2 rounded-md border border-input bg-background"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as Status | "");
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          className="px-4 py-2 rounded-md border border-input bg-background"
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value as Priority | "");
            setPage(1);
          }}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No tasks found. Create your first task to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
