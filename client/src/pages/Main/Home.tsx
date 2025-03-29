import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WelcomeHero } from "@/components/home/welcome-hero";
import { QuickActions } from "@/components/home/quick-actions";
import { ProjectSummary } from "@/components/home/project-summary";
import { ActivityFeed } from "@/components/home/activity-feed";
import { TeamUpdates } from "@/components/home/team-updates";
import { CompanyNews } from "@/components/home/company-news";

export default function Home() {
  return (
    <div className="space-y-8">
      <WelcomeHero />
      <QuickActions />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProjectSummary className="lg:col-span-2" />
        <ActivityFeed />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TeamUpdates />
        <CompanyNews />
      </div>
    </div>
  );
}
