"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectTasks } from "@/components/projects/project-tabs/project-tasks";
import { ProjectTimeline } from "@/components/projects/project-tabs/project-timeline";
import { ProjectActivity } from "@/components/projects/project-tabs/project-activity";
import { ProjectDiscussions } from "@/components/projects/project-tabs/project-discussions";
import { ProjectMembers } from "./project-tabs/project-members";
import { ProjectResources } from "./project-tabs/project-resources";

export function ProjectTabs({ projects, isLoading, setProject }: any) {
  const [activeTab, setActiveTab] = useState("tasks");

  return (
    <Tabs defaultValue="discussions" className="mt-6" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="resources">Resources</TabsTrigger>
        <TabsTrigger value="discussions">Discussions</TabsTrigger>
      </TabsList>
      <TabsContent value="tasks" className="mt-6">
        <ProjectTasks project={projects} />
      </TabsContent>
      <TabsContent value="timeline" className="mt-6">
        <ProjectTimeline />
      </TabsContent>
      <TabsContent value="members" className="mt-6">
        <ProjectMembers
          project={projects}
          isLoading={isLoading}
          setProject={setProject}
        />
      </TabsContent>
      <TabsContent value="resources" className="mt-6">
        <ProjectResources project={projects} />
      </TabsContent>
      <TabsContent value="discussions" className="mt-6">
        <ProjectDiscussions project={projects}  />
      </TabsContent>
    </Tabs>
  );
}
