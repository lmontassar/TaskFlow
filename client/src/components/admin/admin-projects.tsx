"use client";

import { useEffect, useState } from "react";
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
  Archive,
  Eye,
  Download,
  FolderKanban,
  Calendar,
  DollarSign,
} from "lucide-react";
import useStatistics from "../../hooks/useStatistics";
import Loading from "../ui/loading";
import { useTranslation } from "react-i18next";

interface Project {
  id: string;
  nom: string;
  description: string;
  budgetEstime: number;
  dateDebut: string;
  dateFinEstime: string;
  status: string;
  createur: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    avatar: string;
  };
  dateCreation: string;
}

interface Stats {
  projects: number;
  notStartedProjects: number;
  activeProjects: number;
  completedProjects: number;
  createdThisMonth: number;
  budgets: number;
}

export function AdminProjects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { prjcts, stats } = useStatistics();
  const { t } = useTranslation();
  // Mock data based on your provided structure
  useEffect(() => {
    // Simulate API call with your data

    setLoading(false);
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "NOT_STARTED":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "In Progress";
      case "NOT_STARTED":
        return "Not Started";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const filteredProjects = prjcts.filter((project) => {
    const matchesSearch =
      project.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const exportToCSV = () => {
    // Define CSV headers
    const headers = [
      "Project Name",
      "Description",
      "Status",
      "Creator Name",
      "Creator Email",
      "Budget",
      "Start Date",
      "End Date",
      "Date Created",
    ];

    // Convert filtered projects to CSV rows
    const csvData = filteredProjects.map((project) => [
      project.nom,
      project.description,
      getStatusDisplayName(project.status),
      `${project.createur.prenom} ${project.createur.nom}`,
      project.createur.email,
      project.budgetEstime > 0 ? project.budgetEstime.toString() : "Not set",
      formatDate(project.dateDebut),
      formatDate(project.dateFinEstime),
      formatDate(project.dateCreation),
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `projects_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              {t("admin.projects.total_projects")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.projects || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.projects.active_projects")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.activeProjects || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.projects.completed_projects")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.completedProjects || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.projects.not_started_projects")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.notStartedProjects || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t("admin.projects.total_budget")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.budgets || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("admin.projects.title")}</CardTitle>
              <CardDescription>
                {t("admin.projects.description")}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={exportToCSV}>
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
                  placeholder={t("admin.projects.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {" "}
                    {t("admin.projects.statusList.all")}
                  </SelectItem>
                  <SelectItem value="IN_PROGRESS">
                    {t("admin.projects.statusList.in_progress")}
                  </SelectItem>
                  <SelectItem value="COMPLETED">
                    {t("admin.projects.statusList.completed")}
                  </SelectItem>
                  <SelectItem value="NOT_STARTED">
                    {t("admin.projects.statusList.not_started")}
                  </SelectItem>
                  <SelectItem value="CANCELLED">
                    {t("admin.projects.statusList.canceled")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Projects Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.projects.project")}</TableHead>
                <TableHead>{t("admin.projects.status")}</TableHead>
                <TableHead>{t("admin.projects.owner")}</TableHead>
                <TableHead>{t("admin.projects.budget")}</TableHead>
                <TableHead>{t("admin.projects.start_date")}</TableHead>
                <TableHead>{t("admin.projects.end_date")}</TableHead>
                {/* <TableHead className="text-right">Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.nom}</div>
                      <div className="text-sm text-muted-foreground max-w-2xl whitespace-normal break-words">
                        {project.description}
                      </div>
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
                          src={
                            project.createur.avatar.startsWith("http")
                              ? project.createur.avatar
                              : `/avatars/${project.createur.avatar}`
                          }
                          alt={`${project.createur.prenom} ${project.createur.nom}`}
                        />
                        <AvatarFallback>
                          {project.createur.prenom[0]}
                          {project.createur.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">
                          {project.createur.prenom} {project.createur.nom}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {project.createur.email}
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

                  {/* <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive Project
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell> */}
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
