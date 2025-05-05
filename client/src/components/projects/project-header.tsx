import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Edit, Plus, Share } from "lucide-react";
import useGetProject from "../../hooks/useGetProjects";
import SearchForm from "../comp-333";
import hasPermission from "../../utils/authz";
import useGetUser from "../../hooks/useGetUser";
import { useTranslation } from "react-i18next";

export function ProjectHeader({
  projects,
  setProjects,
  isProjectEditing,
  setIsProjectEditing,
}: any) {
  // In a real app, you would fetch the project data based on the ID
  const { t } = useTranslation();
  const { user } = useGetUser();
  let isAllowedToAddCollaborator = false;
  let role = "memeber";
  if (projects?.createur?.id === user?.id) {
    role = "creator";
  }
  if (hasPermission(role, "addCollaborator", "project")) {
    isAllowedToAddCollaborator = true;
  }
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{projects?.nom}</h1>
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
              setIsProjectEditing(!isProjectEditing);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            {t("project.editProject")}
          </Button>
        </div>
      )}
    </div>
  );
}
