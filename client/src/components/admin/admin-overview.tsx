import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Users,
  FolderKanban,
  CheckSquare,
  MoreHorizontal,
  Unlock,
  Ban,
  Calendar,
} from "lucide-react";
import useStatistics from "../../hooks/useStatistics";
import { useContext, useEffect, useState } from "react";
import Loading from "../ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Context } from "../../App";
import { useTranslation } from "react-i18next";

export function AdminOverview() {
  const { t } = useTranslation();
  const {
    loading,

    overview: overviewData,
    setOverview: setOverviewData,
    users,
    blockUser,
    unblockUser,

    prjcts,
  } = useStatistics();
  if (loading) {
    return <Loading />;
  }
  const { user } = useContext(Context);
  const systemStats = [
    {
      title: "Total Users",
      value: overviewData?.user ?? "N/A",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Projects",
      value: overviewData?.project?.inProgress ?? "N/A",
      change: "0%",
      icon: FolderKanban,
      color: "text-green-600",
    },
    {
      title: "Completed Tasks",
      value: overviewData?.task?.completed ?? "N/A",
      change: "0%",
      icon: CheckSquare,
      color: "text-purple-600",
    },
  ];
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "USER":
        return "bg-blue-100 text-blue-800";
      case "member":
        return "bg-green-100 text-green-800";
      case "viewer":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getStatusBadgeColor = (status: boolean) => {
    switch (status) {
      case true:
        return "bg-green-100 text-green-800";
      case false:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const filteredProjects = prjcts
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) // newest first
    .slice(0, 5);
  const filteredUsers = users
    .sort(
      (a, b) =>
        new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
    ) // newest first
    .slice(0, 5);

  const getStatusDisplayName = (status: string) => {
    return t(`project.${status}`) || status; // Fallback to status if translation not found
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  return (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {systemStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last
                month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Overall the recent 5 users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email Activation</TableHead>
                <TableHead>Blocked</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Creation Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={u.avatar || "/placeholder.svg"}
                          alt={u.nom}
                        />
                        <AvatarFallback>
                          {u.nom
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {u.nom + " " + u.prenom}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(u.role)}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(u.activation)}>
                      {u.activation ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(!u.block)}>
                      {!u.block ? "Active" : "Blocked"}
                    </Badge>
                  </TableCell>
                  <TableCell>{u.projects}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(u.creationDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    {user?.id !== u.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {u.block ? (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                unblockUser(u.id);
                                u.block = false;
                              }}
                            >
                              <Unlock className="mr-2 h-4 w-4" />
                              Unblock User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-red-500 cursor-pointer"
                              onClick={() => {
                                blockUser(u.id);
                                u.block = true;
                              }}
                            >
                              <Ban className="mr-2 h-4 w-4 text-red-500" />
                              <span className="text-red-500">Block User</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Overall the recent 5 projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                {/* <TableHead className="text-right">Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project: any) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.nom}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(project.status)}>
                      {getStatusDisplayName(project.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={project?.createur?.avatar}
                          alt={`${project.createur?.prenom} ${project?.createur?.nom}`}
                        />
                        <AvatarFallback>
                          {project?.createur?.prenom[0]}
                          {project?.createur?.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">
                          {project?.createur?.prenom} {project?.createur?.nom}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {project?.createur?.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {project.budgetEstime > 0
                      ? formatCurrency(project.budgetEstime)
                      : "Not set"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(project.dateDebut)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(project.dateFinEstime)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProjects.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No projects found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
