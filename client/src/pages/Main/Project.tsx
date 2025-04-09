import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectOverview } from "@/components/projects/project-overview";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { useNavigate, useParams } from "react-router-dom";
import useGetProjectById from "../../hooks/useGetProjectById";
import useProject from "../../hooks/useProject";
import { useEffect } from "react";

export default function ProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  if (!id) {
    return;
  }
  const { project, isLoading, error, setProject, getProjectById } =
    useProject();

  useEffect(() => {
    getProjectById(id);
  }, [id]);

  if (error) {
    return navigate(-1);
  }
  return (
    <>
      <ProjectHeader projects={project} setProject={setProject} />
      <ProjectOverview projects={project} setProject={setProject} />
      <ProjectTabs projects={project} setProject={setProject} />
    </>
  );
}
