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

interface ProjectSummaryProps {
  className?: string;
}

export function ProjectSummary({ className }: ProjectSummaryProps) {
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      progress: 75,
      status: "In Progress",
      dueDate: "Mar 30, 2025",
      tasks: { completed: 15, total: 20 },
    },
    {
      id: 2,
      name: "Mobile App Development",
      progress: 45,
      status: "In Progress",
      dueDate: "Apr 15, 2025",
      tasks: { completed: 9, total: 20 },
    },
    {
      id: 3,
      name: "Marketing Campaign",
      progress: 20,
      status: "Just Started",
      dueDate: "May 10, 2025",
      tasks: { completed: 4, total: 20 },
    },
  ];

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Summary</CardTitle>
          <CardDescription>Overview of your active projects</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/projects">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Due {project.dueDate}</span>
                  </div>
                </div>
                <Badge
                  variant={
                    project.status === "In Progress"
                      ? "default"
                      : project.status === "Just Started"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {project.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>
                    {project.tasks.completed} of {project.tasks.total} tasks
                    completed
                  </span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link to="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
