"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Clock, Edit, Star, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import useTasks from "@/hooks/useTasks";
import type { Task } from "@/components/tasks/tasks-interface";
import { TaskEditForm } from "@/components/tasks/task-edit-form";

export default function TaskPage({ params }: { params: { taskId: string } }) {
  const router = useRouter();
  const { tasks, handleFindAllTasks, handleUpdateTask, handleDeleteTask } =
    useTasks();
  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await handleFindAllTasks();
      setIsLoading(false);
    };
    fetchData();
  }, [handleFindAllTasks]);

  useEffect(() => {
    if (!isLoading) {
      const foundTask = tasks.find((t) => t.id === params.taskId);
      setTask(foundTask || null);
    }
  }, [tasks, params.taskId, isLoading]);

  const handleUpdate = (updatedTask: Task) => {
    handleUpdateTask(updatedTask);
    setTask(updatedTask);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (task) {
      handleDeleteTask(task.id);
      router.push("/tasks");
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TODO":
        return (
          <Badge variant="outline" className="bg-slate-50">
            To Do
          </Badge>
        );
      case "PROGRESS":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            In Progress
          </Badge>
        );
      case "REVIEW":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Review
          </Badge>
        );
      case "DONE":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Done
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDifficulteBadge = (difficulte: string) => {
    switch (difficulte.toLowerCase()) {
      case "hard":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Hard
          </Badge>
        );
      case "normal":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Normal
          </Badge>
        );
      case "easy":
        return (
          <Badge variant="outline" className="bg-slate-50">
            Easy
          </Badge>
        );
      default:
        return <Badge variant="outline">{difficulte}</Badge>;
    }
  };

  function formatDurationReact(duration: number | string): string {
    if (typeof duration === "string") {
      return duration;
    }

    const units = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ];

    let remaining = duration;
    const parts: string[] = [];

    for (const unit of units) {
      const count = Math.floor(remaining / unit.seconds);
      if (count > 0) {
        parts.push(`${count} ${unit.label}${count > 1 ? "s" : ""}`);
        remaining %= unit.seconds;
      }
    }

    return parts.slice(0, 2).join(" and ") || "0 minutes";
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <h2 className="text-2xl font-bold">Task not found</h2>
          <p className="text-muted-foreground">
            The task you're looking for doesn't exist or has been deleted.
          </p>
          <Button asChild>
            <Link href="/tasks">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tasks
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this task?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              task and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Task Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Task</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskEditForm
              task={task}
              onSave={handleUpdate}
              onCancel={() => setIsEditing(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-2">
                  {getStatusBadge(task.statut)}
                  {getDifficulteBadge(task.difficulte)}
                  {task.dateFinEstime && (
                    <Badge
                      variant="outline"
                      className="flex gap-1 bg-red-100 border-1 border-red-200 text-red-700"
                    >
                      <Calendar className="h-3 w-3" />
                      {formatDate(task.dateFinEstime)}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{task.nomTache}</CardTitle>
              </CardHeader>
              <CardContent>
                {task.description ? (
                  <div className="prose max-w-none">
                    <p>{task.description}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    No description provided
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-1">Created</h4>
                    <p className="text-muted-foreground">
                      {formatDate(task.dateCreation)}
                    </p>
                  </div>
                  {task.dateDebut && (
                    <div>
                      <h4 className="font-medium mb-1">Started</h4>
                      <p className="text-muted-foreground">
                        {formatDate(task.dateDebut)}
                      </p>
                    </div>
                  )}
                  {task.dateFinEstime && (
                    <div>
                      <h4 className="font-medium mb-1">Due Date</h4>
                      <p className="text-muted-foreground">
                        {formatDate(task.dateFinEstime)}
                      </p>
                    </div>
                  )}
                  {task.dataFin && (
                    <div>
                      <h4 className="font-medium mb-1">Completed</h4>
                      <p className="text-muted-foreground">
                        {formatDate(task.dataFin)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="assignees">
              <TabsList className="w-full">
                <TabsTrigger value="assignees" className="flex-1">
                  Assignees
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex-1">
                  Comments
                </TabsTrigger>
                <TabsTrigger value="attachments" className="flex-1">
                  Attachments
                </TabsTrigger>
              </TabsList>
              <TabsContent value="assignees">
                <Card>
                  <CardContent className="pt-6">
                    {task.assignee.length > 0 ? (
                      <div className="space-y-4">
                        {task.assignee.map((assignee) => (
                          <div
                            key={assignee.id}
                            className="flex items-center gap-3"
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={assignee.avatar}
                                alt={
                                  assignee.name ||
                                  `${assignee.prenom} ${assignee.nom}`
                                }
                              />
                              <AvatarFallback>
                                {assignee.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {assignee.name ||
                                  `${assignee.prenom} ${assignee.nom}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No assignees for this task
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="comments">
                <Card>
                  <CardContent className="pt-6">
                    {task.comments && task.comments.length > 0 ? (
                      <div className="space-y-4">
                        {task.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={comment.user.avatar}
                                alt={comment.user.name}
                              />
                              <AvatarFallback>
                                {comment.user.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {comment.user.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(comment.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No comments yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="attachments">
                <Card>
                  <CardContent className="pt-6">
                    {task.attachments && task.attachments.length > 0 ? (
                      <div className="space-y-2">
                        {task.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between rounded-md border p-2"
                          >
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-medium">
                                  {attachment.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {attachment.size} ·{" "}
                                  {formatDate(attachment.uploadedAt)}
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No attachments yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Project</h4>
                  <Badge variant="outline" className="mt-1">
                    {task.project.name || task.project.nom}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-1">Quality</h4>
                  {task.qualite !== 0 && task.qualite !== undefined ? (
                    <div className="flex items-center mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < (task.qualite || 0)
                              ? "text-blue-500 fill-blue-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Not rated</p>
                  )}
                </div>

                {task.budgetEstime && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-1">Budget</h4>
                      <p>{task.budgetEstime}</p>
                    </div>
                  </>
                )}

                {task.duree && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-1">Duration</h4>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {typeof task.duree === "number"
                            ? formatDurationReact(task.duree)
                            : task.duree}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {task.marge && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-1">Marge</h4>
                      <p>
                        {typeof task.marge === "number"
                          ? formatDurationReact(task.marge)
                          : task.marge}
                      </p>
                    </div>
                  </>
                )}

                {task.rapporteur && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-1">Rapporteur</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={task.rapporteur.avatar}
                            alt={task.rapporteur.prenom}
                          />
                          <AvatarFallback>
                            {task.rapporteur.nom[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {task.rapporteur.prenom.charAt(0).toUpperCase() +
                            task.rapporteur.prenom.slice(1)}{" "}
                          {task.rapporteur.nom.charAt(0).toUpperCase() +
                            task.rapporteur.nom.slice(1)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
