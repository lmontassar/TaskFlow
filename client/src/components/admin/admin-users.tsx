"use client";

import { useContext, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Download,
  Unlock,
  Users,
} from "lucide-react";

import useStatistics from "../../hooks/useStatistics";
import Loading from "../ui/loading";
import { Context } from "../../App";
import { useTranslation } from "react-i18next";

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: "ADMIN" | "USER" | "member" | "viewer";
  activation: boolean;
  creationDate: string;
  projects: number;
  avatar?: string;
  block: boolean;
}

const exportToCSV = (data: User[], filename: string) => {
  const headers = [
    "ID",
    "First Name",
    "Last Name",
    "Email",
    "Role",
    "Email Activation",
    "Blocked",
    "Projects",
    "Creation Date",
  ];

  const csvContent = [
    headers.join(","),
    ...data.map((user) =>
      [
        user.id,
        `"${user.nom}"`,
        `"${user.prenom}"`,
        `"${user.email}"`,
        user.role,
        user.activation ? "Active" : "Inactive",
        user.block ? "Blocked" : "Active",
        user.projects,
        `"${user.creationDate}"`,
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export function AdminUsers() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useContext(Context);
  const { users, loading, blockUser, unblockUser } = useStatistics();

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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      user.activation ===
        (statusFilter === "active"
          ? true
          : statusFilter === "inactive"
          ? false
          : user.activation);

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.users.total_users")}
            </CardTitle>
            <Users className={`h-4 w-4 text-blue-500`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.users.active_users")}
            </CardTitle>
            <CheckCircle className={`h-4 w-4 text-green-600`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.block === false).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.users.blocked_users")}
            </CardTitle>
            <Ban className={`h-4 w-4 text-red-500`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.block === true).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.users.new_this_month")}
            </CardTitle>
            <Users className={`h-4 w-4 text-blue-500`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {" "}
              {
                users.filter(
                  (u) =>
                    new Date(u.creationDate).getMonth() ===
                    new Date().getMonth()
                ).length
              }{" "}
            </div>
            <p className="text-xs text-muted-foreground">
              +
              {(users.filter(
                (u) =>
                  new Date(u.creationDate).getMonth() === new Date().getMonth()
              ).length *
                100) /
                users.length}
              % {t("admin.users.from_last_month")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle> {t("admin.users.title")} </CardTitle>
              <CardDescription>{t("admin.users.description")}</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                exportToCSV(
                  filteredUsers,
                  `users-export-${new Date().toISOString().split("T")[0]}.csv`
                )
              }
            >
              <Download className="mr-2 h-4 w-4" />
              {t("admin.overview.export_report")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("admin.users.search")}
                  value={searchTerm}
                  onChange={(e: any) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("admin.users.roles.all")}
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    {t("admin.users.roles.admin")}
                  </SelectItem>
                  <SelectItem value="USER">
                    {t("admin.users.roles.user")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("admin.users.status.all")}
                  </SelectItem>
                  <SelectItem value="active">
                    {t("admin.users.status.active")}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t("admin.users.status.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.users.user")}</TableHead>
                <TableHead>{t("admin.users.role")}</TableHead>
                <TableHead>{t("admin.users.email_activation")}</TableHead>
                <TableHead>{t("admin.users.blocked")}</TableHead>
                <TableHead>{t("admin.users.projects")}</TableHead>
                <TableHead>{t("admin.users.creation_date")}</TableHead>
                <TableHead className="text-right">
                  {t("admin.users.actions")}
                </TableHead>
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
                    {u.creationDate}
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
                              {t("admin.users.unblock_user")}
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
                              <span className="text-red-500">
                                {t("admin.users.block_user")}
                              </span>
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
    </div>
  );
}
