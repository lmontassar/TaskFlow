import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Clock } from "lucide-react";
import useGetProject from "../../hooks/useGetProjects";

export function ProjectOverview() {
  // In a real app, you would fetch the project data based on the ID
  const { projects, isLoading, error, setProjects } = useGetProject();
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Description
            </h3>
            <p>{projects?.description}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Timeline
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>
                Start:{" "}
                {projects
                  ? new Date(projects.dateDebut).toLocaleString()
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                Due:{" "}
                {projects
                  ? new Date(projects.dateFinEstime).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Members
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {projects?.listeCollaborateur.map((member, i) => (
                  <Avatar
                    key={i}
                    className="border-2 border-background h-8 w-8"
                  >
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {projects?.listeCollaborateur?.length
                  ? `${projects.listeCollaborateur.length} members`
                  : "No members"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Progress
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {projects?.tasks?.completed || "0"} of{" "}
                  {projects?.tasks?.total || "0"} tasks completed
                </span>
                <span className="font-medium">
                  {projects?.tasks?.total
                    ? `${(
                        (projects.tasks.completed / projects.tasks.total) *
                        100
                      ).toFixed(2)}%`
                    : "0%"}
                </span>
              </div>
              <Progress value={projects?.progress} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
