"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectTasks } from "@/components/projects/project-tabs/project-tasks";
import { ProjectTimeline } from "@/components/projects/project-tabs/project-timeline";
import { ProjectFiles } from "@/components/projects/project-tabs/project-files";
import { ProjectActivity } from "@/components/projects/project-tabs/project-activity";
import { ProjectDiscussions } from "@/components/projects/project-tabs/project-discussions";
import useGetProject from "../../hooks/useGetProjects";

interface ProjectTabsProps {
  projectId: string;
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState("tasks");
  const { projects, isLoading, error, setProjects } = useGetProject();

  return (
    <Tabs defaultValue="tasks" className="mt-6" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="discussions">Discussions</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="tasks" className="mt-6">
        <ProjectTasks projectId={projects?.id} />
      </TabsContent>
      <TabsContent value="timeline" className="mt-6">
        <ProjectTimeline projectId={projectId} />
      </TabsContent>
      <TabsContent value="members" className="mt-6">
        <ProjectFiles projectId={projectId} />
      </TabsContent>
      <TabsContent value="discussions" className="mt-6">
        <ProjectDiscussions projectId={projectId} />
      </TabsContent>
      <TabsContent value="activity" className="mt-6">
        <ProjectActivity projectId={projectId} />
      </TabsContent>
    </Tabs>
  );
}
