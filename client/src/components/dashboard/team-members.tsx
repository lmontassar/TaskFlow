import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import useGetProject from "../../hooks/useGetProjects";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../App";
import { useTranslation } from "react-i18next";

export function TeamMembers({ projects }: { projects: any[] }) {
  type Member = {
    id: string;
    name: string;
    role: any;
    avatar: string;
    initials: string;
    status: any;
  };
  const { t } = useTranslation();
  const [members, setMembers] = useState<Member[]>([]);
  const { user } = useContext(Context);
  // Update members when projects change
  useEffect(() => {
    const uniqueMembers: Member[] = [];
    projects.forEach((project: any) => {
      if (project.listeCollaborateur) {
        project.listeCollaborateur.forEach((collaborator: any) => {
          if (
            collaborator.user &&
            collaborator.user.id !== user?.id && // Exclude the current user
            !uniqueMembers.some((m) => m.id === collaborator.user.id)
          ) {
            uniqueMembers.push({
              id: collaborator.user.id,
              name: `${collaborator?.user?.prenom ?? ""} ${
                collaborator?.user?.nom ?? ""
              }`.trim(),
              role: collaborator.role,
              avatar:
                collaborator.user.avatar ||
                "/placeholder.svg?height=40&width=40",
              initials: `${collaborator.user.prenom?.charAt(0) ?? ""}${
                collaborator.user.nom?.charAt(0) ?? ""
              }`,
              status: project.nom,
            });
          }
        });
      }
    });
    setMembers(uniqueMembers);
  }, [projects]);

  return (
    <Card className="overflow-y-scroll max-h-[400px]">
      <CardHeader>
        <CardTitle>{t("home.dashboard.collaborators")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium leading-none">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <Badge variant={"default"} className="capitalize">
                {member.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
