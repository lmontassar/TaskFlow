import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, CheckCircle2, Circle } from "lucide-react";

interface ProjectTimelineProps {
  projectId: string;
}

export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  // In a real app, you would fetch the timeline data based on the project ID
  const milestones = [
    {
      id: 1,
      title: "Project Kickoff",
      date: "Mar 1, 2025",
      description: "Initial meeting to define project scope and goals",
      isComplete: true,
      assignee: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "AJ",
      },
    },
    {
      id: 2,
      title: "Design Phase Completion",
      date: "Mar 15, 2025",
      description: "Finalize all design mockups and get client approval",
      isComplete: false,
      assignee: {
        name: "Sarah Miller",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SM",
      },
    },
    {
      id: 3,
      title: "Development Handoff",
      date: "Mar 16, 2025",
      description: "Transfer design assets to development team",
      isComplete: false,
      assignee: {
        name: "Sarah Miller",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SM",
      },
    },
    {
      id: 4,
      title: "Frontend Implementation",
      date: "Mar 25, 2025",
      description: "Complete all frontend development tasks",
      isComplete: false,
      assignee: {
        name: "David Chen",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "DC",
      },
    },
    {
      id: 5,
      title: "Testing & QA",
      date: "Mar 28, 2025",
      description: "Conduct thorough testing and quality assurance",
      isComplete: false,
      assignee: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "AJ",
      },
    },
    {
      id: 6,
      title: "Project Launch",
      date: "Mar 30, 2025",
      description: "Deploy the website to production",
      isComplete: false,
      assignee: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "AJ",
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-8">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="relative pl-10">
                <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                  {milestone.isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{milestone.title}</h3>
                    <Badge
                      variant={milestone.isComplete ? "default" : "outline"}
                    >
                      {milestone.isComplete ? "Completed" : "Upcoming"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {milestone.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      <span>{milestone.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Owner:
                      </span>
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={milestone.assignee.avatar}
                          alt={milestone.assignee.name}
                        />
                        <AvatarFallback>
                          {milestone.assignee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{milestone.assignee.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
