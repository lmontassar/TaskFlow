import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProjectCards } from "@/components/dashboard/project-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { TeamMembers } from "@/components/dashboard/team-members";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { ProjectStats } from "@/components/dashboard/project-stats";
import useGetProject from "../../hooks/useGetProjects";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { projects } = useGetProject();
  const { t } = useTranslation();
  return (
    <>
      <DashboardHeader
        heading={t("home.dashboard.title")}
        text={t("home.dashboard.description")}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ProjectStats projects={projects} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ProjectCards className="col-span-4" />
        <div className="col-span-3 grid gap-4">
          <UpcomingTasks />
          <TeamMembers projects={projects} />
        </div>
      </div>
      {/* <RecentActivity /> */}
    </>
  );
}
