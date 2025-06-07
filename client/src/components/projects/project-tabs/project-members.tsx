"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useProject from "../../../hooks/useProject";
import Loading from "../../ui/loading";
import MemberTable from "../../ui/MemberTable";
import { Search } from "lucide-react";
import { Input } from "../../ui/input";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useMemo, useState } from "react";
import { Badge } from "../../ui/badge";
import hasPermission from "../../../utils/authz";
import { Context } from "../../../App";

export function ProjectMembers({ project, isLoading }: any) {
  const [collaborators, setCollaborators] = useState(
    project?.listeCollaborateur || []
  );
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredMembers = useMemo(() => {
    return collaborators.filter((collaborator: any) => {
      const matchesSearch =
        collaborator.user.nom
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (collaborator.user.prenom || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (collaborator.user.email || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [collaborators, searchQuery]);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [deleteTrigger, setDeleteTrigger] = useState(false);
  const { removeCollaborator, addSkill, removeSkill } = useProject();
  const { user } = useContext(Context);
  let isAllowedToModifieMembers = false;
  let role = "memeber";
  if (project?.createur?.id === user?.id) {
    role = "creator";
  }
  if (hasPermission(role, "edit", "collaborator")) {
    isAllowedToModifieMembers = true;
  }
  const handleDelete = async () => {
    if (!currentMember) return;
    const updatedProject = await removeCollaborator(
      project.id,
      currentMember?.id
    );
    setCollaborators(
      collaborators.filter((c: any) => c.id !== currentMember.id)
    );
    setCurrentMember(null);
    setDeleteTrigger(false);
  };
  const handleAddSkill = async (skill: string, level: number, id?: string) => {
    if (!currentMember) return;
    const update = await addSkill(
      project.id,
      currentMember?.user?.id,
      skill,
      level,
      id
    );
    const updatedCollaborator = await update?.find(
      (c: any) => c.user.id === currentMember?.user?.id
    );
    setCurrentMember(updatedCollaborator);
  };
  const handleRemoveSkill = async (skillId: string) => {
    if (!currentMember) return;
    const update = await removeSkill(
      project.id,
      skillId,
      currentMember?.user?.id
    );
    const updatedCollaborator = await update?.find(
      (c: any) => c.user.id === currentMember?.user?.id
    );

    setCurrentMember(updatedCollaborator);
  };
  if (isLoading) {
    return <Loading />;
  }
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return (
          <Badge className="h-4 bg-transparent border-red-500 text-red-500">
            {t("member.role.project_owner")}
          </Badge>
        );

      default:
        return (
          <Badge className="h-4 bg-transparent border-green-500 text-green-500">
            {t("member.role.employee")}
          </Badge>
        );
    }
  };
  useEffect(() => {
    setCollaborators(project?.listeCollaborateur || []);
  }, [project]);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("member.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("member.search")}
                className="w-full pl-8 sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Resources Table */}
        <MemberTable
          isAllowedToModifieMembers={isAllowedToModifieMembers}
          filteredMembers={filteredMembers}
          t={t}
          getRoleBadge={getRoleBadge}
          setDeleteTrigger={setDeleteTrigger}
          setCurrentMember={setCurrentMember}
          deleteTrigger={deleteTrigger}
          currentMember={currentMember}
          handleDelete={handleDelete}
          handleAddSkill={handleAddSkill}
          handleRemoveSkill={handleRemoveSkill}
        />
      </CardContent>
    </Card>
  );
}
