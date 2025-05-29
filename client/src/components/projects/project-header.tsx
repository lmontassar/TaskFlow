import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Download, Edit, Gauge, Plus, Share } from "lucide-react";
import useGetProject from "../../hooks/useGetProjects";
import SearchForm from "../ui/comp-333";
import hasPermission from "../../utils/authz";
import useGetUser from "../../hooks/useGetUser";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { OptimizeDialog } from "./optimize/optimize-dialog";
import { Link } from "react-router-dom";
import Loading from "../ui/loading";

export function ProjectHeader({
  projects,
  setProjects,
  isProjectEditing,
  setIsProjectEditing,
}: any) {
  const [loading, setLoading] = useState(false);
  // In a real app, you would fetch the project data based on the ID
  const { t } = useTranslation();
  const { user } = useGetUser();
  const downloadPDF = async () => {
    setLoading(true);
    const res = await fetch(`/api/pdf/project/${projects?.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/pdf",
      },
    });
    if (!res.ok) {
      setLoading(false);
      throw new Error("Failed to download PDF");
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projects?.nom}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    setLoading(false);
  };
  let isAllowedToAddCollaborator = false;
  let role = "memeber";
  if (projects?.createur?.id === user?.id) {
    role = "creator";
  }
  if (hasPermission(role, "addCollaborator", "project")) {
    isAllowedToAddCollaborator = true;
  }
  const [isOptimizeDialogOpen, setIsOptimizeDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-5 justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{projects?.nom}</h1>
          <Link to={`/ask-ai/${projects?.id}`}>
            <img src="/chat.png" alt="AI" className="h-7 w-7" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {projects?.tags.map((tag: any) => (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {tag}
            </Badge>
          ))}

          <Badge variant="default">{t(`project.${projects?.status}`)}</Badge>
        </div>
      </div>

      {isAllowedToAddCollaborator && (
        <div className="flex items-center gap-2">
          <SearchForm project={projects} setProject={setProjects}>
            <Plus className="mr-2 h-4 w-4" />
            {t("project.addCollaborator")}
          </SearchForm>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              downloadPDF();
            }}
            disabled={loading}
          >
            {loading ? (
              <Loading />
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t("project.exportPDF")}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOptimizeDialogOpen(true)}
          >
            <Gauge className="mr-2 h-4 w-4" />
            {t("project.optimizeProject")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsProjectEditing(!isProjectEditing);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            {t("project.editProject")}
          </Button>
        </div>
      )}
      <OptimizeDialog
        isOpen={isOptimizeDialogOpen}
        projectId={projects?.id}
        onClose={() => setIsOptimizeDialogOpen(false)}
      />
    </div>
  );
}
