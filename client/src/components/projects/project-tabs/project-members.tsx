"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "../../DataTable";
import useGetProject from "../../../hooks/useGetProjects";

export function ProjectMembers() {
  const { projects, isLoading, error, setProjects } = useGetProject();
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
          <DataTable data={projects.listeCollaborateur} />
        </div>
      </CardContent>
    </Card>
  );
}
