import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Outlet } from "react-router-dom";

export default function Page() {
  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}
