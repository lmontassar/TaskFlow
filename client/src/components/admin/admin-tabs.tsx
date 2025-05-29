import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminOverview } from "./admin-overview";
import { AdminUsers } from "./admin-users";
import { AdminProjects } from "./admin-projects";
import { AdminAnalytics } from "./admin-analytics";
import { useTranslation } from "react-i18next";
export function AdminTabs() {
  const { t } = useTranslation();
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">{t(`admin.tabs.overview`)}</TabsTrigger>
        <TabsTrigger value="users">{t(`admin.tabs.users`)}</TabsTrigger>
        <TabsTrigger value="projects">{t(`admin.tabs.projects`)}</TabsTrigger>
        <TabsTrigger value="analytics">{t(`admin.tabs.analytics`)}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <AdminOverview />
      </TabsContent>

      <TabsContent value="users">
        <AdminUsers />
      </TabsContent>

      <TabsContent value="projects">
        <AdminProjects />
      </TabsContent>

      <TabsContent value="analytics">
        <AdminAnalytics />
      </TabsContent>
    </Tabs>
  );
}
