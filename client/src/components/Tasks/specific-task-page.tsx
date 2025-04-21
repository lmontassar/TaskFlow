import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
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
import { useTranslation } from "react-i18next"
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

import { Clock, CalendarIcon, Edit, Trash2, ArrowLeft, MoreHorizontal, CheckCircle2, StarIcon, AlertCircle, ArrowDown, Plus, Circle, List, Layers, ArrowsUpFromLine, Minus, CircleMinus, X } from 'lucide-react'
import DurationInput from "@/components/ui/divided-duration-input"
import { UserSearch } from "@/components/ui/assigneeSearch"
import useTasks from "@/hooks/useTasks"
import { DropdownMenuSeparator } from "../ui/dropdown-menu"
import { TasksSearch } from "../ui/TasksSearch"

export default function SpecificTaskPage() {
  const navigate = useNavigate();
  const { taskId } = useParams()
  const [task, setTask] = useState<any>(null)
  const [subTasks, setSubTasks] = useState<any>(null);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState<any>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [assigneeToDelete, setAssigneeToDelete] = useState<any>(null)
  const [duration, setDuration] = useState("")
  const [marge, setMarge] = useState("")
  const [assigneeToAdd, setAssigneeToAdd] = useState<any>(null)
  const [subTaskToDelete, setSubTaskToDelete] = useState<any>(null);
  const [precTaskToDelete, setPrecTaskToDelete] = useState<any>(null);
  const [parallelTaskToDelete, setParallelTaskToDelete] = useState<any>(null);
  const [tasksToHide, setTasksToHide] = useState<any>(null);
  const { t } = useTranslation();
  const {
    getTasksCanBePrecedente,
    formatDurationReact,
    getStatusBadge,
    getDifficulteBadge,
    AddPrecTask,
    AddSubTask,
    AddParallelTask,
    DeleteParallelTask,
    DeletePrecTask,
    GetSubTasks,
    GetTask,
    handleDeleteAssignee,
    handleUpdateTask,
    handleDeleteTask,
    handleUpdateStatutTask,
    checkIfCreatorOfProject,
    handleAddAssignee,
    checkIfAssigneeTask,
    DeleteSubTask,
    getTasksByProjectID
  } = useTasks()

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true)
      try {
        const taskData = await GetTask(taskId)
        setTask(taskData)
        setEditedTask(taskData)
        setDuration(taskData.duree)
        setMarge(taskData.marge)
        const subTasks = await GetSubTasks(taskId)
        setSubTasks(subTasks)
        console.log(taskData?.precedentes, taskData?.paralleles, taskData)
        let updatedTasksToHide = [
          ...subTasks,
          taskData,

          ...(taskData?.precedentes || []),
          ...(taskData?.paralleles || []),
        ]
        if (taskData?.parent != null) updatedTasksToHide = [...updatedTasksToHide, taskData?.parent]

        setTasksToHide(updatedTasksToHide)
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
  }, [taskId])

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
      const res = await handleUpdateTask(updatedTask)
      if( res != true ) { return } 
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle2 className="cursor-pointer h-4 w-4 text-green-500" />
      case "PROGRESS":
        return <Clock className="cursor-pointer h-4 w-4 text-amber-500" />
      case "REVIEW":
        return <Circle className="cursor-pointer h-4 w-4 text-gray-400" />
      default:
        return <Circle className="cursor-pointer h-4 w-4 text-gray-400" />
    }
  }

  /************************************************************* */

  const handleAddParent = async (Parent: any) => {
    if (task?.parent != null) handleDeleteParent()
    const result = await AddSubTask(Parent.id, task.id)
    if (result == true)
      setTask((task: any) => ({
        ...task,
        parent: Parent,
      }))
    else alert("there is a problem")
    resetTasksToHide("add", Parent)
  }

  const handleDeleteParent = async () => {
    await DeleteSubTask(task.parent.id, taskId)
    resetTasksToHide("delete", task.parent)
    setTask((task: any) => ({
      ...task,
      parent: null,
    }))
  }

  const handleAddSubTask = async (subTask: any) => {
    const result = await AddSubTask(task.id, subTask.id)
    if (result == true) setSubTasks([...subTasks, subTask])
    else alert("there is a problem")
    resetTasksToHide("add", subTask)
  }

  const handleDeleteSubTask = async (subTaskID: any) => {
    await DeleteSubTask(taskId, subTaskID)
    resetTasksToHide(
      "delete",
      subTasks.find((t: any) => t.id == subTaskID),
    )
    setSubTasks(subTasks.filter((t: any) => t.id != subTaskID))
    setSubTaskToDelete(null)
  }

  const handleDeletePrecTask = async (precID: any) => {
    await DeletePrecTask(taskId, precID)
    resetTasksToHide(
      "delete",
      task.precedentes.find((t: any) => t.id == precID),
    )
    task.precedentes = task.precedentes.filter((t: any) => t.id != precID)
    setPrecTaskToDelete(null)
  }

  const handleDeleteParallelTask = async (parallelTaskID: any) => {
    await DeleteParallelTask(taskId, parallelTaskID)
    resetTasksToHide(
      "delete",
      task.paralleles.find((t: any) => t.id == parallelTaskID),
    )
    task.paralleles = task.paralleles.filter((t: any) => t.id != parallelTaskID)
    setParallelTaskToDelete(null)
  }

  const handleAddPrecTask = async (precTask: any) => {
    const result = await AddPrecTask(task.id, precTask.id)
    if (result == true)
      setTask((task: any) => ({
        ...task,
        precedentes: [...(task.precedentes || []), precTask],
      }))
    else alert("there is a problem")
    resetTasksToHide("add", precTask)
  }

  const handleAddParallelTask = async (parallelTask: any) => {
    const result = await AddParallelTask(task.id, parallelTask.id)
    if (result == true)
      setTask((task: any) => ({
        ...task,
        paralleles: [...(task.paralleles || []), parallelTask],
      }))
    else alert("there is a problem")
    resetTasksToHide("add", parallelTask)
  }

  const handleGetAllTasks = async () => {
    const tasks = await getTasksByProjectID(task.project.id)
    return tasks
  }
  const handlegetTasksCanBePrecedente = async () => {
    const tasks = await getTasksCanBePrecedente(task.id);
    console.log(tasks)
    return tasks;
  }

  const handlechangeStatut = async (taskID: any, statut: any) => {
    const res = await handleUpdateStatutTask(taskID, statut);
    if (res === true) {
        setTask({ ...task, statut })  
    }
  };

  const resetTasksToHide = (action: any, task: any) => {
    switch (action) {
      case "add": {
        setTasksToHide([...tasksToHide, task])
        break
      }
      case "delete": {
        setTasksToHide(tasksToHide.filter((t) => t.id != task.id))
        break
      }
    }
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
            <DialogTitle>
              {t("tasks.specific.delete_confirm.title", "Are you sure you want to delete this task?")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "tasks.specific.delete_confirm.description",
                "This action cannot be undone. This will permanently delete the task and all associated data.",
              )}
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
              <DialogTitle>
                {t("tasks.specific.remove_assignee.title", "Are you sure you want to remove this assignee?")}
              </DialogTitle>
              <DialogDescription>
                {assigneeToDelete.prenom} {assigneeToDelete.nom}{" "}
                {t(
                  "tasks.specific.remove_assignee.description",
                  "won't be able to change the status of this task anymore, but you can add them again.",
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssigneeToDelete(null)}>
                {t("common.cancel")}
              </Button>
              <Button variant="destructive" onClick={() => handleRemoveAssignee(assigneeToDelete.id)}>
                {t("common.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={subTaskToDelete !== null} onOpenChange={() => setSubTaskToDelete(null)}>
        {subTaskToDelete && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t(
                  "tasks.specific.remove_subtask.title",
                  "Are you sure you want to remove '{subTaskToDelete.nomTache}'' from sub-tasks?",
                  { taskName: subTaskToDelete.nomTache }
                )}
              </DialogTitle>
              <DialogDescription>
                '{subTaskToDelete.nomTache}'{" "}
                {t(
                  "tasks.specific.remove_subtask.description",
                  "will be just removed from the '{task.nomTache}' sub-tasks section.",
                  { taskName: task.nomTache }
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSubTaskToDelete(null)}>
                {t("common.cancel")}
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteSubTask(subTaskToDelete.id)}>
                {t("common.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={precTaskToDelete !== null} onOpenChange={() => setPrecTaskToDelete(null)}>
        {precTaskToDelete && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t(
                  "tasks.specific.remove_precaution.title",
                  "Are you sure you want to remove '{{taskName}}' from previous tasks?",
                  { taskName: precTaskToDelete.nomTache }
                )}
              </DialogTitle>
              <DialogDescription>
                {t(
                  "tasks.specific.remove_precaution.description",
                  "'{{precTaskName}}' will be just removed from the '{{taskName}}' previous tasks section.",
                  {
                    precTaskName: precTaskToDelete.nomTache,
                    taskName: task.nomTache,
                  }
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPrecTaskToDelete(null)}>
                {t("common.cancel")}
              </Button>
              <Button variant="destructive" onClick={() => handleDeletePrecTask(precTaskToDelete.id)}>
                {t("common.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={parallelTaskToDelete !== null} onOpenChange={() => setParallelTaskToDelete(null)}>
        {parallelTaskToDelete && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t(
                  "tasks.specific.remove_parallel.title",
                  "Are you sure you want to remove '{{taskName}}' from parallel tasks?",
                  { taskName: parallelTaskToDelete.nomTache }
                )}
              </DialogTitle>
              <DialogDescription>
                {t(
                  "tasks.specific.remove_parallel.description",
                  "'{{parallelTaskName}}' will be just removed from the '{{taskName}}' parallel tasks section.",
                  {
                    parallelTaskName: parallelTaskToDelete.nomTache,
                    taskName: task.nomTache,
                  }
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setParallelTaskToDelete(null)}>
                {t("common.cancel")}
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteParallelTask(parallelTaskToDelete.id)}>
                {t("common.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/tasks">
                {t("tasks.specific.breadcrumb.tasks", "Tasks")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink><Link to={`/projects/${task.project.id}`}> {task.project.nom}</Link>  </BreadcrumbLink>
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
          <h1 className="text-2xl font-bold">{t("tasks.specific.title", "Task Details")}</h1>
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
                  {t("tasks.specific.menu.edit", "Edit Task")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => setConfirmDelete(true)}
                  disabled={!checkIfCreatorOfProject(task.project)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("tasks.specific.menu.delete", "Delete Task")}
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

      <div className="w-full lg:mx-auto flex flex-col lg:flex-row gap-4 mb-4">
        <Card className="basis-full lg:basis-[70%] grow lg:grow-0">
          <CardContent className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task-name">{t("tasks.specific.form.task_name", "Task Name")}</Label>
                  <Input
                    id="task-name"
                    value={editedTask.nomTache}
                    onChange={(e) => handleTaskUpdate("nomTache", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-description">{t("tasks.specific.form.description", "Description")}</Label>
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
                    <Label htmlFor="task-status">{t("tasks.specific.form.status", "Status")}</Label>
                    <Select value={editedTask.statut} onValueChange={(value) => handleTaskUpdate("statut", value)}>
                      <SelectTrigger id="task-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO"> {t(`tasks.tasks-list.status.todo`)}</SelectItem>
                        <SelectItem value="PROGRESS"> {t(`tasks.tasks-list.status.progress`)}</SelectItem>
                        <SelectItem value="REVIEW"> {t(`tasks.tasks-list.status.review`)}</SelectItem>
                        <SelectItem value="DONE"> {t(`tasks.tasks-list.status.done`)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="task-difficulte">{t("tasks.specific.form.difficulty", "Difficulty")}</Label>
                    <Select
                      value={editedTask.difficulte?.toString().trim()}
                      onValueChange={(value) => handleTaskUpdate("difficulte", value)}
                    >
                      <SelectTrigger id="task-difficulte">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">{t(`tasks.tasks-list.difficulty.easy`)}</SelectItem>
                        <SelectItem value="normal">{t(`tasks.tasks-list.difficulty.normal`)}</SelectItem>
                        <SelectItem value="hard">{t(`tasks.tasks-list.difficulty.hard`)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-budget">{t("tasks.specific.form.budget", "Budget Estimé")}</Label>
                    <Input
                      type="number"
                      id="task-budget"
                      value={editedTask.budgetEstime || ""}
                      onChange={(e) => handleTaskUpdate("budgetEstime", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-qualite">{t("tasks.specific.form.quality", "Quality")} (0-5)</Label>
                    <Select
                      value={(editedTask.qualite || 0).toString()}
                      onValueChange={(value) => handleTaskUpdate("qualite", Number.parseInt(value))}
                    >
                      <SelectTrigger id="task-qualite">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 - {t("tasks.details.qualit.zero", "Not rated")}</SelectItem>
                        <SelectItem value="1">1 - {t("tasks.details.qualit.one", "Poor")}</SelectItem>
                        <SelectItem value="2">2 - {t("tasks.details.qualit.two", "Fair")}</SelectItem>
                        <SelectItem value="3">3 - {t("tasks.details.qualit.three", "Good")}</SelectItem>
                        <SelectItem value="4">4 - {t("tasks.details.qualit.four", "Very Good")}</SelectItem>
                        <SelectItem value="5">5 - {t("tasks.details.qualit.five", "Excellent")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-duree">{t("tasks.specific.form.duration", "Duration")}</Label>
                    <DurationInput value={duration} onChange={setDuration} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-marge">{t("tasks.specific.form.margin", "Marge")}</Label>
                    <DurationInput value={marge} onChange={setMarge} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-start-date">{t("tasks.specific.form.start_date", "Start Date")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="task-start-date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editedTask.dateDebut ? formatDate(editedTask.dateDebut) : <span>{t("tasks.details.form.pick_date", "Pick a date")}</span>}
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
                    <Label htmlFor="task-due-date">{t("tasks.specific.form.due_date", "Due Date")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="task-due-date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editedTask.dateFinEstime ? formatDate(editedTask.dateFinEstime) : <span>{t("tasks.details.form.pick_date", "Pick a date")}</span>}
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
                  <Button onClick={saveChanges}>
                    {t("tasks.specific.buttons.save_changes", "error")}
                  </Button>
                  <Button variant="outline" onClick={cancelEditing}>
                    {t("tasks.specific.buttons.cancel", "error")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{task.nomTache}</h2>
                  <div className="flex flex-wrap justify-between gap-2">
                    <div className="flex gap-2">
                      
                    {  (canEditStatut) && (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          {getStatusBadge(task.statut)}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-24">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handlechangeStatut(task.id, "TODO")}
                              >
                                {getStatusBadge("TODO")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  handlechangeStatut(task.id, "PROGRESS")
                                }
                              >
                                {getStatusBadge("PROGRESS")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  handlechangeStatut(task.id, "REVIEW")
                                }
                              >
                                {getStatusBadge("REVIEW")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handlechangeStatut(task.id, "DONE")}
                              >
                                {getStatusBadge("DONE")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      ) || <>{getStatusBadge(task.statut)}</>}  
                      



                      {getDifficulteBadge(task.difficulte)}
                    </div>
                    {task.dateFinEstime && (
                      <Badge variant="outline" className="flex gap-1 bg-red-100 border-1 border-red-200 text-red-700">
                        <Clock className="h-3 w-3" />
                        {formatDate(task.dateFinEstime)}
                      </Badge>
                    )}
                  </div>
                  {task.description && (
                    <div className="rounded-md border p-4 mt-4 bg-slate-50">
                      <p className="whitespace-pre-wrap text-sm">{task.description}</p>
                    </div>
                  )}
                </div>
                <div className="pl-6 pr-6"></div>

                <div className=" lg:w-1/2 md:max-w-[300px] lg:max-w-[300px]">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Parent</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 overflow-hidden">
                      <TasksSearch
                        key={`parent-search-${task.id}`}
                        placeholder={
                          task.parent
                            ? task.parent.nomTache
                            : canEdit
                            ? t("tasks.taskSearch.setParent")
                            : t("tasks.taskSearch.noParent")
                        }
                        onTaskSelect={handleAddParent}
                        fetchTasks={handleGetAllTasks}
                        tasksToHide={tasksToHide}
                        thisTask={task}
                        disabled={!canEdit}
                      />
                    </div>

                    {task.parent && canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteParent}
                        className="h-9 px-2 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4 mr-1" />
                        <span>{t("tasks.specific.remove", "Remove")}</span>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.project", "Project")}</h3>
                    <div className="flex items-center">
                      <Badge variant="outline" className="text-sm">
                        {task.project.nom}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.reporter", "Reporter")}</h3>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={task.rapporteur.avatar || "/placeholder.svg"} alt={task.rapporteur.nom} />
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
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.quality", "Quality")}</h3>
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
                        <span className="text-sm">{t("tasks.specific.not_rated", "Not Rated")}</span>
                      )}
                    </div>
                  </div>

                  {task.budgetEstime !== 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.budget", "Budget")}</h3>
                      <span className="text-sm">{task.budgetEstime}</span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.created", "Created")}</h3>
                    <span className="text-sm">{formatDate(task.dateCreation)}</span>
                  </div>

                  {task.dateFin && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.finished_date", "Finished Date")}</h3>
                      <span className="text-sm">{formatDate(task.dateFin)}</span>
                    </div>
                  )}

                  {task.dateDebut && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.started", "Started")}</h3>
                      <span className="text-sm">{formatDate(task.dateDebut)}</span>
                    </div>
                  )}

                  {task.dateFinEstime && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.due_date", "Due Date")}</h3>
                      <span className="text-sm">{formatDate(task.dateFinEstime)}</span>
                    </div>
                  )}

                  {task.duree !== 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.duration", "Duration")}</h3>
                      <span className="text-sm">{formatDurationReact(task.duree)}</span>
                    </div>
                  )}

                  {task.marge !== 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.margin", "Marge")}</h3>
                      <span className="text-sm">{formatDurationReact(task.marge)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="basis-full lg:basis-[calc(30%-1rem)] grow lg:grow-0">
          <Tabs defaultValue="assignees" className="ml-2 mr-2">
            <TabsList className="w-full">
              <TabsTrigger value="assignees" className="flex-1">
                {t("tasks.specific.tabs.assignees", "Assignees")}
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex-1">
                {t("tasks.specific.tabs.comments", "Comments")}
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex-1">
                {t("tasks.specific.tabs.attachments", "Attachments")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assignees" className="mt-2">
              {canEdit && (
                <div className="mb-2">
                  <UserSearch
                    key={task.id}
                    onUserSelect={setAssigneeToAdd}
                    alreadyincluded={task.assignee}
                    selectedUsers={task.project.listeCollaborateur}
                    task={task}
                  />
                </div>
              )}

              <div>
                {task.assignee.length > 0 ? (
                  task.assignee.map((assignee: any) => (
                    <div key={assignee.id} className="flex items-center justify-between p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.nom} />
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
                  <div className="text-center py-6 text-muted-foreground">{t("tasks.specific.no_assignees", "No assignees for this task")}</div>
                )}
              </div>
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
        </Card>
      </div>

      <Card className="">
        <CardContent>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {t("tasks.specific.dependencies", "Task Dependencies")}
              </h2>
            </div>

            <Card className="p-0">
              <CardHeader className="bg-purple-50 rounded-t-lg border-b border-purple-100 pt-4 pb-4 ">
                <div className="flex items-center gap-2 ">
                  <Layers className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg text-purple-800">
                    {t("tasks.specific.subtasks.title", "SubTasks")}
                  </CardTitle>
                </div>
                <CardDescription>
                  {t("tasks.specific.subtasks.description", "tasks that make up this task")}
                </CardDescription>
              </CardHeader>
              {canEdit && (
                <div className="pl-6 pr-6">
                  <TasksSearch
                    key={`sub-search-${task.id}`}
                    placeholder={t("tasks.taskSearch.searchAndAdd")}
                    onTaskSelect={handleAddSubTask}
                    fetchTasks={handleGetAllTasks}
                    tasksToHide={tasksToHide}
                    thisTask={task}
                  />
                </div>
              )}
              <CardContent className="pb-6 pl-6">
                <div className="space-y-4">
                  {subTasks && subTasks?.length == 0 && <div className="text-center">{t("tasks.specific.no_subtasks", "There are no subTasks")}</div>}
                  {subTasks.map((ta: any, index: any) => (
                    <div key={ta.id} className="relative">
                      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-emerald-200 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-start gap-3 relative z-10 group-hover:border-emerald-300">
                        <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold underline cursor-pointer">
                              <Link to={`/task/${ta.id}`}>{ta.nomTache}</Link>
                            </h3>
                            <div className="flex gap-2">
                              {getStatusBadge(ta.statut)}
                              {ta.dateFinEstime && (
                                <Badge
                                  variant="outline"
                                  className="flex gap-1 bg-red-100 border-1 border-red-200 text-red-700"
                                >
                                  <Clock className="h-3 w-3" />
                                  {formatDate(ta.dateFinEstime)}
                                </Badge>
                              )}
                              {canEdit && (
                                <Badge
                                  onClick={() => setSubTaskToDelete(ta)}
                                  variant="outline"
                                  className="cursor-pointer flex gap-1 bg-red-100 border-1 border-red-200 text-red-700"
                                >
                                  <span>{t("tasks.specific.remove", "Remove")}</span>
                                  <CircleMinus className="h-4 w-4 text-red-700 border-red-200" />
                                </Badge>
                              )}
                            </div>
                          </div>
                          {ta.description != "" && <p className="text-sm text-gray-600 mt-2">{ta.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="p-0">
              <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100 pt-4 pb-4 ">
                <div className="flex items-center gap-2 ">
                  <ArrowDown className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg text-blue-800">
                    {t("tasks.specific.precedent.title", "Precedent Tasks")}
                  </CardTitle>
                </div>
                <CardDescription>
                  {t("tasks.specific.precedent.description", "Tasks that must be completed before starting this task")}
                </CardDescription>
              </CardHeader>
              {canEdit && (
                <div className="pl-6 pr-6">
                  <TasksSearch
                    key={`prec-search-${task.id}`}
                    placeholder={t("tasks.taskSearch.searchAndAdd")}
                    onTaskSelect={handleAddPrecTask}
                    fetchTasks={handlegetTasksCanBePrecedente}
                    tasksToHide={tasksToHide}
                    thisTask={task}
                  />
                </div>
              )}
              <CardContent className="pb-6 pl-4">
                <div className="space-y-4">
                  {/* {task.precedentes((task, index) => ( */}
                  {task?.precedentes && task?.precedentes.length == 0 && (
                    <div className="text-center">{t("tasks.specific.no_previous_tasks", "There are no precedentes tasks")}</div>
                  )}

                  {task.precedentes.map((ta: any, index: any) => (
                    <div key={ta.id} className="relative">
                      {index < task.precedentes.length - 1 && (
                        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-blue-200 z-0" />
                      )}
                      <div className="flex items-start gap-3 relative z-10">
                        <div className="mt-1 bg-blue-100 rounded-full p-1">{getStatusIcon(ta.statut)}</div>
                        <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold underline cursor-pointer">
                              <Link to={`/task/${ta.id}`}>{ta.nomTache}</Link>
                            </h3>
                            <div className="flex gap-2">
                              {getStatusBadge(ta.statut)}
                              {ta.dateFinEstime && (
                                <Badge
                                  variant="outline"
                                  className="flex gap-1 bg-red-100 border-1 border-red-200 text-red-700"
                                >
                                  <Clock className="h-3 w-3" />
                                  {formatDate(ta.dateFinEstime)}
                                </Badge>
                              )}
                              {canEdit && (
                                <Badge
                                  onClick={() => setPrecTaskToDelete(ta)}
                                  variant="outline"
                                  className="cursor-pointer flex gap-1 bg-red-100 border-1 border-red-200 text-red-700"
                                >
                                  {t("tasks.specific.remove", "Remove")}
                                  <CircleMinus className="h-4 w-4 bg-red-50 text-red-700 border-red-200" />
                                </Badge>
                              )}
                            </div>
                          </div>
                          {ta.description != "" && <p className="text-sm text-gray-600 mt-2">{ta.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* ))} */}
                </div>
              </CardContent>
            </Card>

            <Card className="p-0">
              <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100 pt-4 pb-4 ">
                <div className="flex items-center gap-2 ">
                  <ArrowsUpFromLine className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg text-blue-800">
                    {t("tasks.specific.parallel.title", "Parallel Tasks")}
                  </CardTitle>
                </div>
                <CardDescription>
                  {t("tasks.specific.parallel.description", "Tasks that must be started with this task")}
                </CardDescription>
              </CardHeader>
              {canEdit && (
                <div className="pl-6 pr-6">
                  <TasksSearch
                    key={`parallel-search-${task.id}`}
                    placeholder={t("tasks.taskSearch.searchAndAdd")}
                    onTaskSelect={handleAddParallelTask}
                    fetchTasks={handleGetAllTasks}
                    tasksToHide={tasksToHide}
                    thisTask={task}
                  />
                </div>
              )}
              <CardContent className="pb-6 pl-4">
                <div className="space-y-4">
                  {/* {task.precedentes((task, index) => ( */}
                  {task?.paralleles && task?.paralleles.length == 0 && (
                    <div className="text-center">
                      {t("tasks.specific.no_parallel_tasks", "There is no parallel tasks")}
                    </div>
                  )}
                  {task.paralleles.map((ta: any, index: any) => (
                    <div key={ta.id} className="relative">
                      {index < task.paralleles.length - 1 && (
                        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-blue-200 z-0" />
                      )}
                      <div className="flex items-start gap-3 relative z-10">
                        <div className="mt-1 bg-blue-100 rounded-full p-1"> {getStatusIcon(ta.statut)}</div>
                        <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold underline cursor-pointer">
                              <Link to={`/task/${ta.id}`}>{ta.nomTache}</Link>
                            </h3>
                            <div className="flex gap-2">
                              {getStatusBadge(ta.statut)}
                              {ta.dateFinEstime && (
                                <Badge
                                  variant="outline"
                                  className="flex gap-1 bg-red-100 border-1 border-red-200 text-red-700"
                                >
                                  <Clock className="h-3 w-3" />
                                  {formatDate(ta.dateFinEstime)}
                                </Badge>
                              )}
                              {canEdit && (
                                <Badge
                                  onClick={() => setParallelTaskToDelete(ta)}
                                  variant="outline"
                                  className="cursor-pointer flex gap-1 bg-red-100 border-1 border-red-200 text-red-700"
                                >
                                  {t("tasks.specific.remove", "Remove")}
                                  <CircleMinus className="h-4 w-4 bg-red-50 text-red-700 border-red-200" />
                                </Badge>
                              )}
                            </div>
                          </div>
                          {ta.description != "" && <p className="text-sm text-gray-600 mt-2">{ta.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* ))} */}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* {canEditStatut && (
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
      )} */}

    </div>
  )
}
