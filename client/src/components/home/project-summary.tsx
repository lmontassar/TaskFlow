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
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import CreateProjectPage from "../ui/createProject";
import useProject from "../../hooks/useProject";
import { useEffect, useState } from "react";
import Loading from "../ui/loading";
import { useTranslation } from "react-i18next";

interface ProjectSummaryProps {
  className?: string;
  userId: string;
}

export function ProjectSummary({ className, userId }: ProjectSummaryProps) {
  const { ProjectSummaryList, loadingSummary } = useProject();
  const [projectSummary, setProjectSummary] = useState([]);
  const { t } = useTranslation();
  // const projectSummary = await ProjectSummaryList(userId);
  useEffect(() => {
    const fetchProjectSummary = async () => {
      const summary = await ProjectSummaryList(userId);
      setProjectSummary(summary);
    };
    fetchProjectSummary();
  }, [userId]);
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
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Summary</CardTitle>
          <CardDescription>Overview of your active projects</CardDescription>
        </div>
        <Button variant="outline" asChild>
          <div>
            <CreateProjectPage />
          </div>
        </Button>
      </CardHeader>
      <CardContent>
        {loadingSummary ? (
          <Loading />
        ) : (
          <div className="space-y-4">
            {projectSummary.map((project: any) => (
              <div key={project?.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{project?.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Due {project?.due}</span>
                    </div>
                  </div>
                  {getStatusBadge(project?.status)}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>
                      {project.doneTasks} of {project.totalTasks} tasks
                      completed
                    </span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
