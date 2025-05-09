"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Trash2,
  X,
  Edit,
  StarIcon,
  Paperclip,
  Send,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Task } from "./tasks-interface";
import _ from "lodash";
import { Input } from "../ui/input";

import DurationInput from "../ui/divided-duration-input";
import { UserSearch } from "../ui/assigneeSearch";
import useTasks from "../../hooks/useTasks";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { toLocalISOString } from "../../lib/utils";

import { AttachmentsTab } from "../attachments/attachments-tab";
import { Separator } from "../ui/separator";
import TaskComments from "./task-comments";
import { AnyAaaaRecord } from "dns";
import useTaskComment from "../../hooks/useTaskComment";

interface TaskDetailsProps {
  taskToEdit: any;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  allTasks: Task[];
  thisUserIsACreator: () => boolean;
  handleDeleteAssignee: any;
}

export function TaskDetails({
  taskToEdit,
  onClose,
  onUpdate,
  onDelete,
  allTasks,
  handleDeleteAssignee,
}: TaskDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>({ ...taskToEdit });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [assigneeToDelete, setAssigneeToDelete] = useState<any>(null);
  const [marge, setMarge] = useState(editedTask.marge);
  const [duration, setDuration] = useState(editedTask.duree);
  const [assigneeToAdd, setAssigneeToAdd] = useState<any>(null);
  const { checkIfCreatorOfProject, checkIfAssigneeTask } = useTasks();
  const [task, setTask] = useState(taskToEdit);
  const [editError, setEditError] = useState("");
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { comments, addComment } = useTaskComment(task.id);
  useEffect(() => {
    setTask(allTasks.filter((t) => t.id == taskToEdit.id)[0]);
  }, [allTasks, taskToEdit]);

  const handleTaskUpdate = (field: string, value: any) => {
    setEditedTask({
      ...editedTask,
      [field]: value,
    });
  };

  const { getStatusBadge, formatDurationReact, getDifficulteBadge } =
    useTasks();

  const DeleteAssignee = (taskID: any, userID: any) => {
    handleDeleteAssignee(taskID, userID);
    task.assignee = task.assignee.filter((assignee) => assignee.id != userID);
  };

  const saveChanges = async () => {
    setEditError("");
    const result: any = await onUpdate({
      ...editedTask,
      ["duree"]: duration,
      ["marge"]: Number(marge),
    });
    console.log(result);
    if (result.result == false) {
      setEditError(result.message);
      return;
    }
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
  };

  const handleAddComment = async (commentText: string, setCommentText: any) => {
    await addComment(commentText);
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

  // Get all unique assignees from all tasks for the dropdown
  const allAssignees = new Map();
  allTasks.forEach((t) => {
    t.assignee.forEach((assignee) => {
      if (!allAssignees.has(assignee.id)) {
        allAssignees.set(assignee.id, assignee);
      }
    });
  });

  // Get all unique projects from all tasks for the dropdown
  const allProjects = new Map();
  allTasks.forEach((t) => {
    if (!allProjects.has(t.project.id)) {
      allProjects.set(t.project.id, t.project);
    }
  });

  return (
    <div className="border-l w-[400px] flex flex-col">
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(
                "tasks.details.delete_confirm.title",
                "Are you sure you want to delete this task?"
              )}
            </DialogTitle>
            <DialogDescription>
              {t(
                "tasks.details.delete_confirm.description",
                "This action cannot be undone. This will permanently delete the task and all associated data."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(task.id);

                setConfirmDelete(false);
              }}
            >
              {t("common.delete", "Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={assigneeToDelete != null}
        onOpenChange={setAssigneeToDelete}
      >
        {assigneeToDelete && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t(
                  "tasks.details.remove_assignee.title",
                  "Are you sure you want to remove this assignee?"
                )}
              </DialogTitle>
              <DialogDescription>
                {assigneeToDelete.prenom} {assigneeToDelete.nom}{" "}
                {t(
                  "tasks.details.remove_assignee.description",
                  "won't be able to change the status of this task anymore, but you can add them again."
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAssigneeToDelete(null)}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  DeleteAssignee(task.id, assigneeToDelete.id);
                  setAssigneeToDelete(null);
                }}
              >
                {t("common.delete", "Delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <h3 className="font-medium">
            {t("tasks.details.title", "Task Details")}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={!checkIfCreatorOfProject(task.project)}
                onClick={() =>
                  setIsEditing(checkIfCreatorOfProject(task.project))
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                {t("tasks.details.edit_task", "Edit Task")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={!checkIfCreatorOfProject(task.project)}
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  setConfirmDelete(checkIfCreatorOfProject(task.project));
                  setMenuOpen(false);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete", "Delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="overflow-auto flex-1">
        <div className="p-4">
          {isEditing ? (
            <div className="space-y-4">
              {editError !== "" && (
                <Alert
                  variant="destructive"
                  className="mb-4 border border-destructive-foreground"
                >
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription> {editError} </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="task-name">
                  {t("tasks.details.form.task_name", "Task Name")}
                </Label>
                <Textarea
                  id="task-name"
                  value={editedTask.nomTache}
                  onChange={(e) => handleTaskUpdate("nomTache", e.target.value)}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">
                  {t("tasks.details.form.description", "Description")}
                </Label>
                <Textarea
                  id="task-description"
                  value={editedTask.description || ""}
                  onChange={(e) =>
                    handleTaskUpdate("description", e.target.value)
                  }
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-status">
                    {t("tasks.details.form.status", "Status")}
                  </Label>
                  <Select
                    value={editedTask.statut}
                    onValueChange={(value: any) =>
                      handleTaskUpdate("statut", value)
                    }
                  >
                    <SelectTrigger id="task-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">
                        {t(`tasks.tasks-list.status.todo`)}
                      </SelectItem>
                      <SelectItem value="PROGRESS">
                        {t(`tasks.tasks-list.status.progress`)}
                      </SelectItem>
                      <SelectItem value="REVIEW">
                        {t(`tasks.tasks-list.status.review`)}
                      </SelectItem>
                      <SelectItem value="DONE">
                        {t(`tasks.tasks-list.status.done`)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-difficulte">
                    {t("tasks.details.form.difficulty", "Difficulty")}
                  </Label>
                  <Select
                    value={editedTask.difficulte.toString().trim()}
                    onValueChange={(value: any) => {
                      handleTaskUpdate("difficulte", value);
                    }}
                  >
                    <SelectTrigger id="task-difficulte">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">
                        {t(`tasks.tasks-list.difficulty.easy`)}
                      </SelectItem>
                      <SelectItem value="normal">
                        {t(`tasks.tasks-list.difficulty.normal`)}
                      </SelectItem>
                      <SelectItem value="hard">
                        {t(`tasks.tasks-list.difficulty.hard`)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-budget">
                    {t("tasks.details.form.budget", "Budget Estimé")}
                  </Label>
                  <Input
                    type="number"
                    id="task-budget"
                    value={editedTask.budgetEstime || ""}
                    onChange={(e) =>
                      handleTaskUpdate("budgetEstime", e.target.value)
                    }
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-qualite">
                    {t("tasks.details.form.quality", "Quality")} (0-5)
                  </Label>
                  <Select
                    value={(editedTask.qualite || 0).toString()}
                    onValueChange={(value) =>
                      handleTaskUpdate("qualite", Number.parseInt(value))
                    }
                  >
                    <SelectTrigger id="task-qualite">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">
                        0 - {t("tasks.details.qualit.zero", "Not rated")}
                      </SelectItem>
                      <SelectItem value="1">
                        1 - {t("tasks.details.qualit.one", "Poor")}
                      </SelectItem>
                      <SelectItem value="2">
                        2 - {t("tasks.details.qualit.two", "Fair")}
                      </SelectItem>
                      <SelectItem value="3">
                        3 - {t("tasks.details.qualit.three", "Good")}
                      </SelectItem>
                      <SelectItem value="4">
                        4 - {t("tasks.details.qualit.four", "Very Good")}
                      </SelectItem>
                      <SelectItem value="5">
                        5 - {t("tasks.details.qualit.five", "Excellent")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-duree">
                  {t("tasks.details.form.duration", "Duration")}
                </Label>
                <DurationInput value={duration} onChange={setDuration} />

                {/* <Textarea
                    id="task-duree"
                    value={editedTask.duree || ""}
                    onChange={(e) => handleTaskUpdate("duree", e.target.value)}
                    className="resize-none"
                  /> */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-marge">
                  {t("tasks.details.form.margin", "Marge")}
                </Label>
                <DurationInput value={marge} onChange={setMarge} />

                {/* <Textarea
                    id="task-marge"
                    value={editedTask.marge || ""}
                    onChange={(e) => handleTaskUpdate("marge", e.target.value)}
                    className="resize-none"
                  /> */}
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-start-date">
                  {t("tasks.details.form.start_date", "Start Date")}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="task-start-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTask.dateDebut ? (
                        formatDate(editedTask.dateDebut)
                      ) : (
                        <span>
                          {t("tasks.details.form.pick_date", "Pick a date")}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        editedTask.dateDebut
                          ? parseISO(editedTask.dateDebut)
                          : undefined
                      }
                      onSelect={(date: any) =>
                        handleTaskUpdate(
                          "dateDebut",
                          date ? toLocalISOString(date) : undefined
                        )
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-due-date">
                  {t("tasks.details.form.due_date", "Due Date")}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="task-due-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTask.dateFinEstime ? (
                        formatDate(editedTask.dateFinEstime)
                      ) : (
                        <span>
                          {t("tasks.details.form.pick_date", "error")}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        editedTask.dateFinEstime
                          ? parseISO(editedTask.dateFinEstime)
                          : undefined
                      }
                      onSelect={(date: any) =>
                        handleTaskUpdate(
                          "dateFinEstime",
                          date ? toLocalISOString(date) : undefined
                        )
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex w-full gap-1 space-y-4">
                <Button className="flex-1 w-full" onClick={saveChanges}>
                  {t("tasks.specific.buttons.save_changes", "error")}
                </Button>
                <Button variant="outline" onClick={cancelEditing}>
                  {t("tasks.specific.buttons.cancel", "error")}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold underline">
                    <Link to={`/task/${task.id}`}>{task.nomTache}</Link>
                  </h2>
                </div>

                <div className="flex flex-wrap justify-between gap-2">
                  <div className="flex gap-2">
                    {getStatusBadge(task.statut)}
                    {getDifficulteBadge(task.difficulte)}
                  </div>
                  {task.dateFinEstime && (
                    <Badge
                      variant="outline"
                      className="flex gap-1 bg-red-100 border-1 border-red-200 text-red-700"
                    >
                      <Clock className="h-3 w-3" />
                      {formatDate(task.dateFinEstime)}
                    </Badge>
                  )}
                </div>

                {task.description && (
                  <div className="rounded-md border p-3">
                    <p className="whitespace-pre-wrap text-sm">
                      {task.description}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="mb-2 text-sm font-medium">
                    {t("tasks.details.form.project", "Project")}
                  </h4>
                  <Badge variant="outline">{task.project.nom}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1 text-sm font-medium">
                    {t("tasks.details.form.quality", "Quality")}
                  </h4>
                  <div className="flex items-center">
                    {(task.qualite != 0 && (
                      <>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < (task.qualite || 0)
                                ? "text-blue-500 fill-blue-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </>
                    )) || (
                      <span className="text-sm">
                        {t("tasks.details.qualit.zero", "Not Rated")}
                      </span>
                    )}
                  </div>
                </div>
                {task.budgetEstime != 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">
                      {t("tasks.details.form.budget", "Budget")}
                    </h4>
                    <span className="text-sm">{task.budgetEstime}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <h4 className="mb-1 text-sm font-medium">
                    {t("tasks.details.createdat", "Created At")}
                  </h4>
                  <span className="text-sm">
                    {formatDate(task.dateCreation)}
                  </span>
                </div>
                {task.dateFin && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">
                      {t("tasks.details.finishedat", "Finished At")}
                    </h4>
                    <span className="text-sm">{formatDate(task.dateFin)}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                {task.dateDebut && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">
                      {t("tasks.details.started", "Start Date")}
                    </h4>
                    <span className="text-sm">
                      {formatDate(task.dateDebut)}
                    </span>
                  </div>
                )}

                {task.dateFinEstime && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">
                      {t("tasks.details.form.due_date", "Due Date")}
                    </h4>
                    <span className="text-sm">
                      {formatDate(task.dateFinEstime)}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                {task.duree != 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">
                      {t("tasks.details.form.duration", "Duration")}
                    </h4>
                    <span className="text-sm">
                      {formatDurationReact(task.duree)}
                    </span>
                  </div>
                )}
                {task.marge != 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">
                      {t("tasks.details.form.margin", "Marge")}
                    </h4>
                    <span className="text-sm">
                      {formatDurationReact(task.marge)}
                    </span>
                  </div>
                )}
              </div>

              <Tabs className="mt-4" defaultValue="assignees">
                <TabsList className="w-full">
                  <TabsTrigger value="assignees" className="flex-1">
                    {t("tasks.details.tabs.assignees", "Assignees")}
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="flex-1">
                    {t("tasks.details.tabs.comments", "Comments")}
                  </TabsTrigger>
                  {(checkIfCreatorOfProject(task?.project) ||
                    checkIfAssigneeTask(task)) && (
                    <TabsTrigger value="attachments" className="flex-1">
                      {t("tasks.specific.tabs.attachments", "Attachments")}
                    </TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="comments" className="space-y-4 pt-4">
                  <TaskComments
                    comments={comments}
                    handleAddComment={handleAddComment}
                  />
                </TabsContent>
                <TabsContent value="assignees" className="pt-2">
                  <div className="text-center text-sm text-muted-foreground">
                    <div className="grid gap-3 pl-3">
                      {checkIfCreatorOfProject(task.project) && (
                        <UserSearch
                          key={task.id}
                          onUserSelect={setAssigneeToAdd}
                          alreadyincluded={task.assignee}
                          selectedUsers={task.project.listeCollaborateur}
                          task={task}
                        />
                      )}

                      {task.assignee.length > 0 ? (
                        task.assignee.map((assignee) => (
                          <div
                            key={assignee.id}
                            className="flex items-center gap-2"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={assignee.avatar}
                                alt={assignee.nom}
                              />
                              <AvatarFallback>
                                {assignee.initials}
                              </AvatarFallback>
                            </Avatar>

                            <span className="text-sm font-medium text-gray-800">
                              {_.startCase(assignee.nom)}{" "}
                              {_.startCase(assignee.prenom)}
                            </span>

                            {checkIfCreatorOfProject(task.project) && (
                              <Trash2
                                onClick={() => setAssigneeToDelete(assignee)}
                                className="cursor-pointer mr-2 h-4 w-4 ml-auto"
                              />
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {t("tasks.details.no_assignees", "No Assignees")}
                        </span>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {(checkIfCreatorOfProject(task?.project) ||
                  checkIfAssigneeTask(task)) && (
                  <TabsContent value="attachments" className="pt-2">
                    <AttachmentsTab task={task} />
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
