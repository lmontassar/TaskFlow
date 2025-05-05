import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectOverview } from "@/components/projects/project-overview";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { useNavigate, useParams } from "react-router-dom";
import useGetProjectById from "../../hooks/useGetProjectById";
import useProject from "../../hooks/useProject";
import { useEffect, useState } from "react";

export default function ProjectPage() {
  const navigate = useNavigate();
  const [isProjectEditing, setIsProjectEditing] = useState(false);
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
      <ProjectHeader
        projects={project}
        setProject={setProject}
        isProjectEditing={isProjectEditing}
        setIsProjectEditing={setIsProjectEditing}
      />
      <ProjectOverview
        projects={project}
        setProject={setProject}
        isProjectEditing={isProjectEditing}
        setIsProjectEditing={setIsProjectEditing}
      />
      <ProjectTabs
        projects={project}
        setProject={setProject}
        isLoading={isLoading}
      />
    </>
  );
}
