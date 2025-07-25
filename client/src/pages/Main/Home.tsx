import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WelcomeHero } from "@/components/home/welcome-hero";
import { QuickActions } from "@/components/home/quick-actions";
import { ProjectSummary } from "@/components/home/project-summary";
import { ActivityFeed } from "@/components/home/activity-feed";
import { TeamUpdates } from "@/components/home/team-updates";
import { CompanyNews } from "@/components/home/company-news";
import { useContext, useEffect } from "react";
import { Context } from "../../App";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = "TaskFlow - " + t("sidebar.home");
  }, [t]);
  const { user } = useContext(Context);
  return (
    <div className="space-y-8">
      <WelcomeHero nom={user?.nom} />

      <ProjectSummary className="lg:col-span-2" userId={user?.id} />

      {/* <div className="grid gap-6 md:grid-cols-2">
        <TeamUpdates />
        <CompanyNews />
      </div> */}
    </div>
  );
}
