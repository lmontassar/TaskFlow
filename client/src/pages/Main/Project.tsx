import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectOverview } from "@/components/projects/project-overview";
import { ProjectTabs } from "@/components/projects/project-tabs";

export default function ProjectPage() {
  return (
    <>
      <ProjectHeader />
      <ProjectOverview />
      <ProjectTabs />
    </>
  );
}
