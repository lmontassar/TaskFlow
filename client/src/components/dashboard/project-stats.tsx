import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Users, FolderKanban } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../App";
import { set } from "lodash";
import { useTranslation } from "react-i18next";

export function ProjectStats({ projects }: { projects: any[] }) {
  const [TeamMembers, setTeamMembers] = useState<number>(0);
  const { t } = useTranslation();
  const { user } = useContext(Context);
  useEffect(() => {
    const totalMembers = projects.reduce(
      (sum, project: any) =>
        sum +
        (project.listeCollaborateur ? project.listeCollaborateur.length : 0),
      0
    );
    setTeamMembers(totalMembers);
  }, [projects]);
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("home.dashboard.total_projects")}
          </CardTitle>
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projects.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("home.dashboard.in_progress_projects")}
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {
              projects.filter((project) => project.status == "IN_PROGRESS")
                .length
            }
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("home.dashboard.completed_projects")}
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {projects.filter((project) => project.status == "COMPLETED").length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("home.dashboard.collaborators")}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{TeamMembers}</div>
        </CardContent>
      </Card>
    </>
  );
}
