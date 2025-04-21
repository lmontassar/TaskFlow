"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Clock, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Task, GroupBy } from "./tasks-interface"
import useTasks from "../../hooks/useTasks"
import { useTranslation } from "react-i18next"
import { enUS, fr, ar, es } from 'date-fns/locale'


interface TasksBoardProps {
  groupedTasks: Record<string, any[]>
  groupBy: GroupBy
  onTaskClick: (task: Task) => void
  onDragEnd: (result: DropResult) => void
}

export function TasksBoard({ groupedTasks, groupBy, onTaskClick, onDragEnd }: TasksBoardProps) {
  const localeMap: Record<string, Locale> = {
    en: enUS,
    fr: fr,
    ar: ar,
    es: es,
  }
  const { t , i18n  } = useTranslation()
  const {
    checkIfAssigneeTask,
    checkIfCreatorOfProject,
    getDifficulteBadge: getDifficulteIcon,
  } = useTasks();
  const getColumnTitle = (key: string): string => {
    if (groupBy === "status") {
      switch (key) {
        case "TODO":
          return t("tasks.tasks-list.status.todo", "To Do")
        case "PROGRESS":
          return t("tasks.tasks-list.status.progress", "In Progress")
        case "REVIEW":
          return t("tasks.tasks-list.status.review", "Review")
        case "DONE":
          return t("tasks.tasks-list.status.done", "Done")
        default:
          return key
      }
    } else if (groupBy === "priority") {
      switch (key) {
        case "easy":
          return t("tasks.tasks-list.difficulty.easy", "Easy")
        case "normal":
          return t("tasks.tasks-list.difficulty.normal", "Normal")
        case "hard":
          return t("tasks.tasks-list.difficulty.hard", "Hard")
        default:
          return key
      }
    } else if (groupBy === "assignee") {
      if (key === "unassigned") return "Unassigned"

      // Find the first task with this assignee to get the name
      for (const taskList of Object.values(groupedTasks)) {
        for (const task of taskList) {
          const assignee = task.assignee.find((a) => a.id === key)
          if (assignee) return assignee.name
        }
      }
      return "Unknown Assignee"
    } else if (groupBy === "project") {
      // Find the first task with this project to get the name
      for (const taskList of Object.values(groupedTasks)) {
        for (const task of taskList) {
          if (task.project.id === key) return task.project.name
        }
      }
      return "Unknown Project"
    }
    return key
  }

  const getColumnColor = (key: string): string => {
    if (groupBy === "status") {
      switch (key) {
        case "TODO":
          return "bg-slate-100"
        case "PROGRESS":
          return "bg-blue-50"
        case "REVIEW":
          return "bg-yellow-50"
        case "DONE":
          return "bg-green-50"
        default:
          return "bg-slate-50"
      }
    } else if (groupBy === "priority") {
      switch (key) {
        case "hard":
          return "bg-red-50"
        case "normal":
          return "bg-yellow-50"
        case "easy":
          return "bg-slate-50"
        default:
          return "bg-slate-50"
      }
    }

    return "bg-slate-50"
  }

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null
    try {
      const dueDate = new Date(dateString)
      const locale = localeMap[i18n.language] || enUS
      return formatDistanceToNow(dueDate, { addSuffix: true, locale })
    } catch (error) {
      return null
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 w-full">
        {Object.entries(groupedTasks).map(([columnId, tasks]) => (
          <div key={columnId} className="flex flex-col rounded-lg border bg-background h-full">
            <div className={`flex items-center justify-between rounded-t-lg p-3 ${getColumnColor(columnId)}`}>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{getColumnTitle(columnId)}</h3>
                <Badge variant="outline">{tasks.length}</Badge>
              </div>
            </div>

            <Droppable droppableId={columnId} isDropDisabled={false}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-hidden">
                  <ScrollArea className="h-[calc(100vh-16rem)] w-full ">
                    <div className="space-y-2 p-3 overflow-hidden">
                      {tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                          isDragDisabled={
                            checkIfAssigneeTask(task) === false && checkIfCreatorOfProject(task?.project) === false
                          }
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`w-full select-none ${
                                !checkIfAssigneeTask(task) && !checkIfCreatorOfProject(task?.project)
                                  ? "cursor-not-allowed"
                                  : snapshot.isDragging
                                    ? "cursor-grabbing"
                                    : "cursor-grab"
                              }`}
                            >
                            <Card
                              className={`overflow-hidden w-full max-w-full rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 ${
                                !checkIfAssigneeTask(task) && !checkIfCreatorOfProject(task?.project)
                                  ? "bg-gray-100 text-gray-500 red-l-red-400 border-red-400 cursor-not-allowed"
                                  : "bg-white border-l-green-400 hover:bg-gray-50 border-green-400 cursor-pointer"
                              }`}
                              onClick={() => onTaskClick(task)} >

                                <CardContent className="p-3">
                                  <div className="space-y-2">
                                    <div className=" flex items-start justify-between gap-2">
                                      <h4
                                        className="flex-1 font-medium break-words whitespace-normal line-clamp-2"
                                        title={task.nomTache}
                                      >
                                        {task.nomTache}
                                      </h4>
                                      {getDifficulteIcon(task.difficulte)}
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <div className="flex -space-x-2">
                                        {task.assignee.map((assignee: any) => (
                                          <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                                            <AvatarImage
                                              src={assignee.avatar || "/placeholder.svg"}
                                              alt={assignee.nom}
                                            />
                                            <AvatarFallback className="text-[10px]">{assignee.initials}</AvatarFallback>
                                          </Avatar>
                                        ))}
                                      </div>

                                      {task.dateFinEstime && (
                                        <div className="flex items-center text-xs text-muted-foreground">
                                          <Clock className="mr-1 h-3 w-3" />
                                          {formatDueDate(task.dateFinEstime)}
                                        </div>
                                      )}
                                    </div>

                                    {task.project && groupBy !== "project" && (
                                      <div className="flex items-center">
                                        <Badge
                                          variant="outline"
                                          className="truncate max-w-full"
                                          title={task.project.nom}
                                        >
                                          {task.project.nom}
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
