import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectOverview } from "@/components/projects/project-overview";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { useNavigate, useParams } from "react-router-dom";
import useGetProjectById from "../../hooks/useGetProjectById";

export default function ProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  if (!id) {
    return;
  }
  const { projects, isLoading, error, setProjects } = useGetProjectById(id);

  if (error) {
    return navigate(-1);
  }
  return (
    <>
      <ProjectHeader projects={projects} setProject={setProjects} />
      <ProjectOverview projects={projects} setProject={setProjects} />
      <ProjectTabs projects={projects} setProject={setProjects} />
    </>
  );
}
