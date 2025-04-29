"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import type { DateRange } from "react-day-picker"
import { useTranslation } from "react-i18next"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {Loader2 } from "lucide-react"
import DurationInput from "../ui/divided-duration-input"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"

interface TaskCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTask: (task: any) => boolean
  existingTasks: any[],
  addTaskError: "",
  setAddTaskError: (error: String) => void,
  project :any , 

}

export function TaskCreateModal({
  project,
  isOpen,
  onClose,
  onCreateTask,
  existingTasks,
  addTaskError,
  setAddTaskError,
  
}: TaskCreateModalProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [taskName, setTaskName] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [budget, setBudget] = useState("")
  const [taskDifficulty, setTaskDifficulty] = useState<string>("normal")
  const [duration, setDuration] = useState("")
  const [marge, setMarge] = useState("")
  const { t } = useTranslation()
  const [isLoading, setIsLoading ] = useState(false);
  // Get all unique projects from existing tasks

  const handleCreateTask = async () => {
    setIsLoading(true);
    if (!taskName.trim()) return

    const newTask: any = {
      nomTache: taskName,
      description: taskDescription,
      budgetEstime: budget,
      project: project,
      difficulte: taskDifficulty as any,
      dateDebut: dateRange?.from ?? null,
      dateFinEstime: dateRange?.to ?? null,
      duree: duration,
      marge: marge,
    }

    const ok: any = await onCreateTask(newTask);
    
    if (ok == true) {
      handleClose();
    }
    setIsLoading(false);
  }

  const resetForm = () => {
    setTaskName("")
    setTaskDescription("")
    setTaskDifficulty("normal"), setAddTaskError("")
    setDateRange(undefined)
    setBudget("")
    setDuration("")
    setMarge("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("tasks.create_modal.title", "Create New Task")}</DialogTitle>
          <DialogDescription>{t("tasks.create_modal.subtitle", "Add a new task to your project.")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {addTaskError !== "" && (
            <Alert variant="destructive" className="mb-4 border border-destructive-foreground">
              <AlertTitle>{t("tasks.create_modal.error_title", "Error")}</AlertTitle>
              <AlertDescription> {addTaskError} </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t("tasks.create_modal.task_name", "Task Name")}</Label>
            <Input
              id="name"
              value={taskName}
              onChange={(e: any) => setTaskName(e.target.value)}
              placeholder="Enter task name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("tasks.create_modal.description", "Description")}</Label>
            <Textarea
              id="description"
              value={taskDescription}
              onChange={(e: any) => setTaskDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">{t("tasks.create_modal.budget", "Budget Estimé")}</Label>
            <Input
              min="0"
              type="number"
              id="budget"
              value={budget}
              onChange={(e: any) => setBudget(e.target.value)}
              placeholder="Enter budget Estimé"
            />
          </div>
          <div className="flex gap-2 w-full">
            <div className="flex-1 space-y-2">
              <Label htmlFor="status">{t("tasks.create_modal.date_range", "Date Debut - Date Estimé")}</Label>
              <DatePickerWithRange onChange={setDateRange} className="w-full" />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="Difficulty">{t("tasks.create_modal.difficulty", "Difficulty")}</Label>
              <Select value={taskDifficulty} onValueChange={setTaskDifficulty} className="w-full">
                <SelectTrigger id="Difficulty" className="w-full">
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="hard">{t("tasks.tasks-list.difficulty.hard", "Hard")}</SelectItem>
                  <SelectItem value="normal">{t("tasks.tasks-list.difficulty.normal", "Normal")}</SelectItem>
                  <SelectItem value="easy">{t("tasks.tasks-list.difficulty.easy", "Easy")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 w-full">
            <div className="space-y-2">
              <Label htmlFor="status">{t("tasks.create_modal.duration", "Durée Estimé")}</Label>
              <DurationInput value={duration} onChange={setDuration} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t("tasks.create_modal.margin", "Marges")}</Label>
              <DurationInput value={marge} onChange={setMarge} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("tasks.create_modal.cancel", "Cancel")}
          </Button>
          <Button onClick={handleCreateTask} disabled={!taskName.trim()}>
          { isLoading && (
                      <Loader2 className="animate-spin" />
                    ) || (
                      <>
                      {t("tasks.create_modal.create", "Create Task")}
                      </>
                    ) 
          }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}