import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminOverview } from "./admin-overview";
import { AdminUsers } from "./admin-users";
import { AdminProjects } from "./admin-projects";
import { AdminAnalytics } from "./admin-analytics";
export function AdminTabs() {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
