import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import useProject from "../../hooks/useProject";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../App";
import i18n from "../../i18n";

interface ProjectCardsProps {
  className?: string;
}

export function ProjectCards({ className }: ProjectCardsProps) {
  const { user } = useContext(Context);

  const { ProjectSummaryList, loadingSummary } = useProject();
  const [projectSummary, setProjectSummary] = useState([]);
  const { t } = useTranslation();
  // const projectSummary = await ProjectSummaryList(userId);
  useEffect(() => {
    const fetchProjectSummary = async () => {
      const summary = await ProjectSummaryList(user?.id || "");
      setProjectSummary(summary);
    };
    fetchProjectSummary();
  }, [user?.id]);
  console.log("projects", projectSummary);
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return <Badge variant="default">{t(`project.${status}`)}</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline">{t(`project.${status}`)}</Badge>;
      case "COMPLETED":
        return <Badge variant="ghost">{t(`project.${status}`)}</Badge>;
      default:
        return <Badge variant="default">{t(`project.${status}`)}</Badge>;
    }
  };
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-4">
        {projectSummary.map((project: any) => (
          <Card key={project?.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{project?.name}</CardTitle>

                {getStatusBadge(project?.status)}
              </div>
              {/* <CardDescription>{project.description}</CardDescription> */}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t("home.dashboard.progress")}</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {t("home.project_summery.due")}{" "}
                {new Date(project?.due).toLocaleDateString(
                  i18n.language === "fr" ? "fr-FR" : "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
