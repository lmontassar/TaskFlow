import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, CalendarIcon, Clock } from "lucide-react";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InputNumber from "../InputNumber";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format, parseISO } from "date-fns";
import { Calendar } from "../ui/calendar";
import Textarea03 from "../Textarea-helper";
import { toast } from "sonner";
import { id } from "date-fns/locale";

interface ProjectOverviewProps {
  projects: any;
  setProject: (projects: any) => void;
  isProjectEditing: boolean;
  setIsProjectEditing: (value: boolean) => void;
}

export function ProjectOverview({
  projects,
  setProject,
  isProjectEditing,
  setIsProjectEditing,
}: ProjectOverviewProps) {
  const { t } = useTranslation();
  const token = localStorage.getItem("authToken");
  const [editForm, setEditForm] = useState({});
  useEffect(() => {
    setEditForm({
      id: projects?.id || "",
      nom: projects?.nom || "",
      description: projects?.description || "",
      tags: projects?.tags || [],
      budgetEstime: projects?.budgetEstime || 0,
      dateDebut: projects?.dateDebut || "",
      dateFinEstime: projects?.dateFinEstime || "",
    });
  }, [projects]);
  const handleSubmit = async () => {
    if (!editForm.nom) {
      toast.error("Project name is required");
      return;
    }
    if (!editForm.description) {
      toast.error("Project description is required");
      return;
    }
    if (!editForm.budgetEstime) {
      toast.error("Project budget is required");
      return;
    }
    if (!editForm.dateDebut) {
      toast.error("Project start date is required");
      return;
    }
    if (!editForm.dateFinEstime) {
      toast.error("Project end date is required");
      return;
    }
    if (new Date(editForm.dateDebut) > new Date(editForm.dateFinEstime)) {
      toast.error("End date must be after start date");
      return;
    }
    const form = new FormData();
    form.append("id", editForm.id);
    form.append("nom", editForm.nom);
    form.append("description", editForm.description);
    form.append("tags", JSON.stringify(editForm.tags));
    form.append("budgetEstime", editForm.budgetEstime.toString());
    form.append("dateDebut", editForm.dateDebut);
    form.append("dateFinEstime", editForm.dateFinEstime);

    console.log(editForm);

    const res = await fetch("/api/project/update", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // Ensure the content type is set to application/json
      },
      body: JSON.stringify({
        id: editForm.id,
        nom: editForm.nom,
        description: editForm.description,
        budgetEstime: parseFloat(editForm.budgetEstime),
        dateDebut: editForm.dateDebut,
        dateFinEstime: editForm.dateFinEstime,
      }),
    });

    if (!res.ok) {
      console.error(res.statusText);
      return;
    }
    const data = await res.json();
    setProject(data); // Update the project state with the new data

    toast.success("Project updated successfully");
    setIsProjectEditing(false);
  };

  const handleCancel = () => {
    setIsProjectEditing(false);
    // Optionally: reset form
    setEditForm({
      nom: projects?.nom || "",
      description: projects?.description || "",
      tags: projects?.tags || [],
      budgetEstime: projects?.budgetEstime || 0,
      dateDebut: projects?.dateDebut || "",
      dateFinEstime: projects?.dateFinEstime || "",
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = parseISO(dateString);
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return null;
    }
  };

  const handleDateChange = (range: { from?: Date; to?: Date }) => {
    setEditForm({
      ...editForm,
      dateDebut: range.from ? range.from.toISOString() : "",
      dateFinEstime: range.to ? range.to.toISOString() : "",
    });
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        {!isProjectEditing ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("project.creation_form.description")}
              </h3>
              <p>{projects?.description || "No description"}</p>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("project.creation_form.timeline")}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>
                  {t("project.creation_form.start_date")}:{" "}
                  {projects?.dateDebut
                    ? new Date(projects.dateDebut).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {t("project.creation_form.estimated_end_date")}:{" "}
                  {projects?.dateFinEstime
                    ? new Date(projects.dateFinEstime).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Members */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("project.creation_form.members")}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {projects?.listeCollaborateur?.map(
                    (member: any, i: number) => (
                      <Avatar
                        key={i}
                        className="border-2 border-background h-8 w-8"
                      >
                        <AvatarImage
                          src={member?.user?.avatar}
                          alt={member?.user?.nom}
                        />
                        <AvatarFallback>
                          {member?.user?.nom?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                    )
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {projects?.listeCollaborateur?.length
                    ? `${projects.listeCollaborateur.length} members`
                    : "No members"}
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("project.creation_form.progress")}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {projects?.tasks?.completed || 0} of{" "}
                    {projects?.tasks?.total || 0} tasks completed
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
                <Progress value={projects?.progress || 0} className="h-2" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Edit Mode */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t("project.creation_form.project_name")}
                </h3>
                <Input
                  type="text"
                  value={editForm.nom}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nom: e.target.value })
                  }
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t("project.creation_form.description")}
                </h3>
                <Textarea03
                  helperText={t(
                    "project.creation_form.description_helper_text"
                  )}
                  placeholder={t(
                    "project.creation_form.description_placeholder"
                  )}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t(
                    "project.creation_form.estimated_budget",
                    "Estimated Budget"
                  )}
                </h3>
                <InputNumber
                  min={0}
                  budget={editForm.budgetEstime}
                  setBudget={(budget: number) =>
                    setEditForm({ ...editForm, budgetEstime: budget })
                  }
                />
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t("project.creation_form.timeline")}
                </h3>
                {/* Start Date */}
                <div className="flex items-center gap-2 text-sm">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editForm.dateDebut
                          ? formatDate(editForm.dateDebut)
                          : t("Pick a date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          editForm.dateDebut
                            ? parseISO(editForm.dateDebut)
                            : undefined
                        }
                        onSelect={(date) =>
                          handleDateChange({
                            from: date || undefined,
                            to: editForm.dateFinEstime
                              ? parseISO(editForm.dateFinEstime)
                              : undefined,
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {/* End Date */}
                <div className="flex items-center gap-2 text-sm">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editForm.dateFinEstime
                          ? formatDate(editForm.dateFinEstime)
                          : t("Pick a date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          editForm.dateFinEstime
                            ? parseISO(editForm.dateFinEstime)
                            : undefined
                        }
                        onSelect={(date) =>
                          handleDateChange({
                            from: editForm.dateDebut
                              ? parseISO(editForm.dateDebut)
                              : undefined,
                            to: date || undefined,
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-4">
              <Button variant="outline" onClick={handleCancel}>
                {t("project.creation_form.cancel")}
              </Button>
              <Button onClick={handleSubmit}>
                {t("project.creation_form.save")}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
