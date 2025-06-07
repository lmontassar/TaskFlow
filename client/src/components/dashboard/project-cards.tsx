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

interface ProjectCardsProps {
  className?: string;
}

export function ProjectCards({ className }: ProjectCardsProps) {
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      description: "Redesign the company website with new branding",
      progress: 75,
      status: "In Progress",
      dueDate: "Mar 30, 2025",
      team: [
        {
          name: "Alex Johnson",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "AJ",
        },
        {
          name: "Sarah Miller",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "SM",
        },
        {
          name: "David Chen",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "DC",
        },
      ],
    },
    {
      id: 2,
      name: "Mobile App Development",
      description: "Create a new mobile app for customer engagement",
      progress: 45,
      status: "In Progress",
      dueDate: "Apr 15, 2025",
      team: [
        {
          name: "Emma Wilson",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "EW",
        },
        {
          name: "James Brown",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "JB",
        },
      ],
    },
    {
      id: 3,
      name: "Marketing Campaign",
      description: "Q2 marketing campaign for product launch",
      progress: 20,
      status: "Just Started",
      dueDate: "May 10, 2025",
      team: [
        {
          name: "Olivia Davis",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "OD",
        },
        {
          name: "Noah Smith",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "NS",
        },
        {
          name: "Sophia Lee",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "SL",
        },
      ],
    },
  ];
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

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-4">
        {projectSummary.map((project: any) => (
          <Card key={project?.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{project?.name}</CardTitle>
                <Badge
                  variant={
                    project.status === "IN_PROGRESS"
                      ? "default"
                      : project.status === "NOT_STARTED"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {project.status}
                </Badge>
              </div>
              {/* <CardDescription>{project.description}</CardDescription> */}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Due: {project.due}
              </div>
              {/* <div className="flex -space-x-2">
                {project.team.map((member, i) => (
                  <Avatar
                    key={i}
                    className="border-2 border-background h-8 w-8"
                  >
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </div> */}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
