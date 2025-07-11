import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectOverview } from "@/components/projects/project-overview";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { Link, useNavigate, useParams } from "react-router-dom";
import useGetProjectById from "../../hooks/useGetProjectById";
import useProject from "../../hooks/useProject";
import { useEffect, useState } from "react";
import { MessageCircle, Sparkle, Sparkles } from "lucide-react";

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

  useEffect(() => {
    document.title = "TaskFlow - " + project?.nom;
  }, [project]);
  if (error) {
    return navigate("/home");
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
