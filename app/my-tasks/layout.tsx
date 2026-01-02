import { DashboardLayout } from "@/components/DashboardLayout";

export default function MyTasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
