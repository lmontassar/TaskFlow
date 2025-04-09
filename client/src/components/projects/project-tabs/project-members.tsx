"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "../../DataTable";
import useGetProject from "../../../hooks/useGetProjects";
import useProject from "../../../hooks/useProject";

export function ProjectMembers() {
  const { project, isLoading, error, setProject } = useProject();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <DataTable project={project} setProject={setProject} />
        </div>
      </CardContent>
    </Card>
  );
}
