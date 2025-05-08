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
      {!isLoading && (
        <div className="fixed bottom-4 left-4 z-999 bg-primary rounded-full shadow-xl p-1 transition-transform duration-300 ease-in-out hover:scale-105 hover:content-[ASK-AI]">
          <Link to={`/ask-ai/${id}`} className="flex items-center gap-2 p-2">
            <Sparkles className="text-white" />
          </Link>
        </div>
      )}
    </>
  );
}
