"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { format, parseISO, isValid } from "date-fns"
import _ from "lodash"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"

import { Clock, CalendarIcon, Edit, Trash2, ArrowLeft, MoreHorizontal, CheckCircle2, StarIcon, AlertCircle } from 'lucide-react'
import DurationInput from "@/components/ui/divided-duration-input"
import { UserSearch } from "@/components/ui/assigneeSearch"
import useTasks from "@/hooks/useTasks"
import { DropdownMenuSeparator } from "../ui/dropdown-menu"

export default function SpecificTaskPage() {
  const navigate = useNavigate();
  const { taskId } = useParams()
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState<any>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [assigneeToDelete, setAssigneeToDelete] = useState<any>(null)
  const [duration, setDuration] = useState("")
  const [marge, setMarge] = useState("")
  const [assigneeToAdd, setAssigneeToAdd] = useState<any>(null)

  const {
    GetTask,
    handleDeleteAssignee,
    handleUpdateTask,
    handleDeleteTask,
    handleUpdateStatutTask,
    checkIfCreatorOfProject,
    handleAddAssignee,
    checkIfAssigneeTask,
  } = useTasks()

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true)
      try {
        if(task == null ){
          const taskData = await GetTask(taskId)
          setTask(taskData)
          setEditedTask(taskData)
          setDuration(taskData.duree)
          setMarge(taskData.marge)
        }
      } catch (err) {
        setError("Failed to load task details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (taskId) {
      fetchTask()
    }
  }, [taskId, GetTask])

  useEffect(() => {
    if (assigneeToAdd) {
      handleAddNewAssignee()
    }
  }, [assigneeToAdd])

  const handleAddNewAssignee = async () => {
    if (!assigneeToAdd || !task) return

    try {
      await handleAddAssignee(task.id, assigneeToAdd.id)
      // Refresh task data
      const updatedTask = await GetTask(taskId)
      setTask(updatedTask)
      setEditedTask(updatedTask)
    } catch (err) {
      console.error("Failed to add assignee:", err)
    } finally {
      setAssigneeToAdd(null)
    }
  }

  const handleRemoveAssignee = async (userId: string) => {
    if (!task) return

    try {
      await handleDeleteAssignee(task.id, userId)
      // Refresh task data
      const updatedTask = await GetTask(taskId)
      setTask(updatedTask)
      setEditedTask(updatedTask)
      setAssigneeToDelete(null)
    } catch (err) {
      console.error("Failed to remove assignee:", err)
    }
  }

  const handleTaskUpdate = (field: string, value: any) => {
    setEditedTask({
      ...editedTask,
      [field]: value,
    })
  }

  const saveChanges = async () => {
    try {
      const updatedTask = {
        ...editedTask,
        duree: duration,
        marge: marge,
      }

      await handleUpdateTask(updatedTask)

      if (updatedTask.id !== updatedTask.statut) {
        await handleUpdateStatutTask(updatedTask.id, updatedTask.statut)
      }

      // Refresh task data
      const refreshedTask = await GetTask(taskId)
      setTask(refreshedTask)
      setEditedTask(refreshedTask)
      setIsEditing(false)
    } catch (err) {
      console.error("Failed to update task:", err)
    }
  }

  const cancelEditing = () => {
    setEditedTask(task)
    setDuration(task.duree)
    setMarge(task.marge)
    setIsEditing(false)
  }

  const deleteTask = async () => {
    try {
      await handleDeleteTask(task.id)
      navigate("/tasks")
    } catch (err) {
      console.error("Failed to delete task:", err)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null

    try {
      const date = parseISO(dateString)
      if (!isValid(date)) return null
      return format(date, "MMM d, yyyy")
    } catch (error) {
      return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TODO":
        return (
          <Badge variant="outline" className="bg-slate-50">
            To Do
          </Badge>
        )
      case "PROGRESS":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            In Progress
          </Badge>
        )
      case "REVIEW":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Review
          </Badge>
        )
      case "DONE":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Done
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDifficulteBadge = (difficulte: string) => {
    switch (difficulte?.toLowerCase()) {
      case "hard":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Hard
          </Badge>
        )
      case "normal":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Normal
          </Badge>
        )
      case "easy":
        return (
          <Badge variant="outline" className="bg-slate-50">
            Easy
          </Badge>
        )
      default:
        return <Badge variant="outline">{difficulte}</Badge>
    }
  }

  const formatDurationReact = (duration: number): string => {
    const units = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ]

    let remaining = duration
    const parts: string[] = []

    for (const unit of units) {
      const count = Math.floor(remaining / unit.seconds)
      if (count > 0) {
        parts.push(`${count} ${unit.label}${count > 1 ? "s" : ""}`)
        remaining %= unit.seconds
      }
    }

    return parts.slice(0, 2).join(" and ") || "0 minutes"
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-48 ml-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Failed to load task details. Please try again."}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    )
  }

  const canEdit = checkIfCreatorOfProject(task.project)
  const canEditStatut = checkIfAssigneeTask(task) || checkIfCreatorOfProject(task.project)
  return (
    <div className="container mx-auto py-6">
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this task?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the task and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assigneeToDelete !== null} onOpenChange={() => setAssigneeToDelete(null)}>
        {assigneeToDelete && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure you want to remove this assignee?</DialogTitle>
              <DialogDescription>
                {assigneeToDelete.prenom} {assigneeToDelete.nom} won't be able to change the status of this task
                anymore, but you can add them again.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssigneeToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleRemoveAssignee(assigneeToDelete.id)}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/tasks">Tasks</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/project?id=${task.project.id}`}>{task.project.nom}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{task.nomTache}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Task Details</h1>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {/* <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
              disabled={isEditing}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Task
            </Button>
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Task
            </Button> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className=" cursor-pointer"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isEditing}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => setConfirmDelete(true)}
                  disabled={!checkIfCreatorOfProject(task.project)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled={ !checkIfCreatorOfProject(task.project) } onClick={() => setIsEditing(checkIfCreatorOfProject(task.project))}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={ !checkIfCreatorOfProject(task.project) }
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirmDelete(checkIfCreatorOfProject(task.project))}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
          </div>
        )}
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-name">Task Name</Label>
                <Input
                  id="task-name"
                  value={editedTask.nomTache}
                  onChange={(e) => handleTaskUpdate("nomTache", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={editedTask.description || ""}
                  onChange={(e) => handleTaskUpdate("description", e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-status">Status</Label>
                  <Select value={editedTask.statut} onValueChange={(value) => handleTaskUpdate("statut", value)}>
                    <SelectTrigger id="task-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="PROGRESS">In Progress</SelectItem>
                      <SelectItem value="REVIEW">Review</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-difficulte">Difficulty</Label>
                  <Select
                    value={editedTask.difficulte?.toString().trim()}
                    onValueChange={(value) => handleTaskUpdate("difficulte", value)}
                  >
                    <SelectTrigger id="task-difficulte">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-budget">Budget Estimé</Label>
                  <Input
                    type="number"
                    id="task-budget"
                    value={editedTask.budgetEstime || ""}
                    onChange={(e) => handleTaskUpdate("budgetEstime", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-qualite">Quality (0-5)</Label>
                  <Select
                    value={(editedTask.qualite || 0).toString()}
                    onValueChange={(value) => handleTaskUpdate("qualite", Number.parseInt(value))}
                  >
                    <SelectTrigger id="task-qualite">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Not rated</SelectItem>
                      <SelectItem value="1">1 - Poor</SelectItem>
                      <SelectItem value="2">2 - Fair</SelectItem>
                      <SelectItem value="3">3 - Good</SelectItem>
                      <SelectItem value="4">4 - Very Good</SelectItem>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-duree">Duration</Label>
                  <DurationInput value={duration} onChange={setDuration} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-marge">Marge</Label>
                  <DurationInput value={marge} onChange={setMarge} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-start-date">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        id="task-start-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedTask.dateDebut ? formatDate(editedTask.dateDebut) : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editedTask.dateDebut ? parseISO(editedTask.dateDebut) : undefined}
                        onSelect={(date) => handleTaskUpdate("dateDebut", date ? date.toISOString() : undefined)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-due-date">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        id="task-due-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedTask.dateFinEstime ? formatDate(editedTask.dateFinEstime) : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editedTask.dateFinEstime ? parseISO(editedTask.dateFinEstime) : undefined}
                        onSelect={(date) => handleTaskUpdate("dateFinEstime", date ? date.toISOString() : undefined)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={saveChanges}>Save Changes</Button>
                <Button variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{task.nomTache}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {getStatusBadge(task.statut)}
                  {getDifficulteBadge(task.difficulte)}
                  {task.dateFinEstime && (
                    <Badge variant="outline" className="flex gap-1 bg-red-100 border-1 border-red-200 text-red-700">
                      <Clock className="h-3 w-3" />
                      Due {formatDate(task.dateFinEstime)}
                    </Badge>
                  )}
                </div>

                {task.description && (
                  <div className="rounded-md border p-4 mt-4 bg-slate-50">
                    <p className="whitespace-pre-wrap text-sm">{task.description}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Project</h3>
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-sm">
                      {task.project.nom}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Reporter</h3>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={task.rapporteur.avatar} alt={task.rapporteur.nom} />
                      <AvatarFallback>
                        {task.rapporteur.nom[0]}
                        {task.rapporteur.prenom[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {_.startCase(task.rapporteur.prenom)} {_.startCase(task.rapporteur.nom)}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Quality</h3>
                  <div className="flex items-center">
                    {task.qualite !== 0 ? (
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${i < (task.qualite || 0) ? "text-blue-500 fill-blue-500" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm">Not Rated</span>
                    )}
                  </div>
                </div>

                {task.budgetEstime !== 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Budget</h3>
                    <span className="text-sm">{task.budgetEstime}</span>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Created</h3>
                  <span className="text-sm">{formatDate(task.dateCreation)}</span>
                </div>

                {task.dateFin && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Finished Date</h3>
                    <span className="text-sm">{formatDate(task.dateFin)}</span>
                  </div>
                )}

                {task.dateDebut && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Started</h3>
                    <span className="text-sm">{formatDate(task.dateDebut)}</span>
                  </div>
                )}

                {task.dateFinEstime && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Due Date</h3>
                    <span className="text-sm">{formatDate(task.dateFinEstime)}</span>
                  </div>
                )}

                {task.duree !== 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Duration</h3>
                    <span className="text-sm">{formatDurationReact(task.duree)}</span>
                  </div>
                )}

                {task.marge !== 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Marge</h3>
                    <span className="text-sm">{formatDurationReact(task.marge)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="assignees" className="mb-6">
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

        <TabsContent value="assignees" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {checkIfCreatorOfProject(task.project) && (
                <div className="mb-4">
                  <UserSearch
                    key={task.id}
                    onUserSelect={setAssigneeToAdd}
                    alreadyincluded={task.assignee}
                    selectedUsers={task.project.listeCollaborateur}
                    task={task}
                  />
                </div>
              )}

              <div className="space-y-4">
                {task.assignee.length > 0 ? (
                  task.assignee.map((assignee: any) => (
                    <div key={assignee.id} className="flex items-center justify-between p-2 rounded-md border">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={assignee.avatar} alt={assignee.nom} />
                          <AvatarFallback>
                            {assignee.initials || `${assignee.nom[0]}${assignee.prenom[0]}`}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {_.startCase(assignee.prenom)} {_.startCase(assignee.nom)}
                        </span>
                      </div>

                      {checkIfCreatorOfProject(task.project) && (
                        <Button variant="ghost" size="icon" onClick={() => setAssigneeToDelete(assignee)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">No assignees for this task</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-6 text-muted-foreground">Comments feature coming soon</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-6 text-muted-foreground">Attachments feature coming soon</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {canEditStatut && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Task Actions</CardTitle>
            <CardDescription>Quick actions for this task</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={task.statut === "TODO" ? "default" : "outline"}
                onClick={() => handleUpdateStatutTask(task.id, "TODO")}
              >
                Mark as To Do
              </Button>
              <Button
                variant={task.statut === "PROGRESS" ? "default" : "outline"}
                onClick={() => handleUpdateStatutTask(task.id, "PROGRESS")}
              >
                Mark as In Progress
              </Button>
              <Button
                variant={task.statut === "REVIEW" ? "default" : "outline"}
                onClick={() => handleUpdateStatutTask(task.id, "REVIEW")}
              >
                Mark as Review
              </Button>
              <Button
                variant={task.statut === "DONE" ? "default" : "outline"}
                onClick={() => handleUpdateStatutTask(task.id, "DONE")}
                className={task.statut === "DONE" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
