"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, LayoutGrid, List, Filter, SortAsc, SortDesc, Plus, X } from "lucide-react"
import { format } from "date-fns"
import type { ViewMode, GroupBy, SortBy, SortOrder, Task } from "./tasks-interface"
import { AvatarImage } from "../ui/avatar"
import { Avatar } from "@radix-ui/react-avatar"
import { useTranslation } from "react-i18next"

import _ from "lodash";
interface TasksHeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  groupBy: GroupBy
  onGroupByChange: (group: GroupBy) => void
  sortBy: SortBy
  sortOrder: SortOrder
  onSortChange: (sort: SortBy) => void
  onSearch: (query: string) => void
  onFilterChange: (filters: any) => void
  onCreateTask: () => void
  filterOptions: {
    status: string[]
    priority: string[]
    assignee: string[]
    project: string[]
    label: string[]
    dateFinEstime: string | null
  }
  tasks: Task[]
  thisUserIsACreator: () => boolean
}

export function TasksHeader({
  viewMode,
  onViewModeChange,
  groupBy,
  onGroupByChange,
  sortBy,
  sortOrder,
  onSortChange,
  onSearch,
  onFilterChange,
  onCreateTask,
  filterOptions,
  tasks,
  thisUserIsACreator,
}: TasksHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const { t } = useTranslation()
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchQuery)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery, onSearch])

  // Get unique values for filters
  const getUniqueAssignees = () => {
    const assignees = new Set<string>()
    const assigneeMap = new Map<string, { name: string; avatar: string }>()
    tasks.forEach((task) => {
      task.assignee.forEach((assignee) => {
        assignees.add(assignee.id)
        assigneeMap.set(assignee.id, {
          name: _.startCase(assignee.nom) + " " + _.startCase(assignee.prenom),
          avatar: assignee.avatar,
        })
      })
    })

    return Array.from(assignees).map((id) => ({
      id,
      ...assigneeMap.get(id)!,
    }))
  }

  const getUniqueProjects = () => {
    const projects = new Map<string, { name: string; color: string }>()

    // tasks.forEach((task) => {
    //   if (!projects.has(task.project.id)) {
    //     projects.set(task.project.id, {
    //       name: task.project.name,
    //       color: task.project.color,
    //     })
    //   }
    // })

    return Array.from(projects.entries()).map(([id, project]) => ({
      id,
      ...project,
    }))
  }

  const getUniqueDifficulties = () => {
    const difficulties = new Set<string>()

    tasks.forEach((task) => {
      difficulties.add(task.difficulte.toLowerCase())
    })

    return Array.from(difficulties)
  }

  const assignees = getUniqueAssignees()
  const projects = getUniqueProjects()
  const difficulties = getUniqueDifficulties()

  const handleFilterStatus = (status: string, checked: boolean) => {
    const newStatus = checked ? [...filterOptions.status, status] : filterOptions.status.filter((s) => s !== status)

    onFilterChange({ status: newStatus })
  }

  const handleFilterDifficulty = (difficulty: string, checked: boolean) => {
    // Map difficulty to priority for backward compatibility
    const difficultyToPriority: Record<string, string> = {
      easy: "easy",
      normal: "normal",
      hard: "hard",
    }

    const priority = difficultyToPriority[difficulty] || difficulty

    const newPriority = checked
      ? [...filterOptions.priority, priority]
      : filterOptions.priority.filter((p) => p !== priority)

    onFilterChange({ priority: newPriority })
  }

  const handleFilterAssignee = (assigneeId: string, checked: boolean) => {
    const newAssignee = checked
      ? [...filterOptions.assignee, assigneeId]
      : filterOptions.assignee.filter((a) => a !== assigneeId)

    onFilterChange({ assignee: newAssignee })
  }

  const handleFilterProject = (projectId: string, checked: boolean) => {
    const newProject = checked
      ? [...filterOptions.project, projectId]
      : filterOptions.project.filter((p) => p !== projectId)

    onFilterChange({ project: newProject })
  }

  const handleFilterDueDate = (date: Date | undefined) => {
    onFilterChange({ dateFinEstime: date ? format(date, "yyyy-MM-dd") : null })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filterOptions.status.length > 0) count++
    if (filterOptions.priority.length > 0) count++
    if (filterOptions.assignee.length > 0) count++
    if (filterOptions.project.length > 0) count++
    if (filterOptions.label.length > 0) count++
    if (filterOptions.dateFinEstime) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  const clearAllFilters = () => {
    onFilterChange({
      status: [],
      priority: [],
      assignee: [],
      project: [],
      label: [],
      dateFinEstime: null,
    })
  }

  const translateGroupByLabel = (group: string): string => {
    switch (group) {
      case "status":
        return t("tasks.header.group_by.status", "Status")
      case "priority":
        return t("tasks.header.group_by.difficulty", "Difficulty")
      case "assignee":
        return t("tasks.header.group_by.assignee", "Assignee")
      case "project":
        return t("tasks.header.group_by.project", "Project")
      default:
        return group
    }
  }

  const translateSortByLabel = (sort: string): string => {
    switch (sort) {
      case "dueDate":
        return t("tasks.header.sort_by.due_date", "Due Date")
      case "priority":
        return t("tasks.header.sort_by.difficulty", "Difficulty")
      case "createdAt":
        return t("tasks.header.sort_by.created_date", "Created Date")
      case "name":
        return t("tasks.header.sort_by.name", "Name")
      default:
        return sort
    }
  }

  return (
    <div className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Tasks</h1>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === "list" && isSearching ? (
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-8 pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => {
                  setSearchQuery("")
                  setIsSearching(false)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              {viewMode === "list" && (
                <Button variant="ghost" size="icon" onClick={() => setIsSearching(true)}>
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </>
          )}

          {viewMode === "list" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {activeFiltersCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="end">
                <div className="flex items-center justify-between pb-4">
                  <h4 className="font-medium">{t("tasks.header.filter.title", "Filter Tasks")}</h4>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-muted-foreground"
                      onClick={clearAllFilters}
                    >
                      {t("tasks.header.filter.clear_all", "Clear all")}
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="mb-2 text-sm font-medium">{t("tasks.header.filter.status", "Status")}</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="status-TODO"
                          checked={filterOptions.status.includes("TODO")}
                          onCheckedChange={(checked) => handleFilterStatus("TODO", checked as boolean)}
                        />
                        <label htmlFor="status-TODO" className="text-sm">
                          {t("tasks.tasks-list.status.todo", "To Do")}
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="status-PROGRESS"
                          checked={filterOptions.status.includes("PROGRESS")}
                          onCheckedChange={(checked) => handleFilterStatus("PROGRESS", checked as boolean)}
                        />
                        <label htmlFor="status-PROGRESS" className="text-sm">
                          {t("tasks.tasks-list.status.progress", "In Progress")}
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="status-REVIEW"
                          checked={filterOptions.status.includes("REVIEW")}
                          onCheckedChange={(checked) => handleFilterStatus("REVIEW", checked as boolean)}
                        />
                        <label htmlFor="status-REVIEW" className="text-sm">
                          Review
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="status-DONE"
                          checked={filterOptions.status.includes("DONE")}
                          onCheckedChange={(checked) => handleFilterStatus("DONE", checked as boolean)}
                        />
                        <label htmlFor="status-DONE" className="text-sm">
                          {t("tasks.tasks-list.status.done", "Done")}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="mb-2 text-sm font-medium">{t("tasks.header.filter.difficulty", "Difficulty")}</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="difficulty-hard"
                          checked={filterOptions.priority.includes("hard")}
                          onCheckedChange={(checked) => handleFilterDifficulty("hard", checked as boolean)}
                        />
                        <label htmlFor="difficulty-hard" className="text-sm">
                          {t("tasks.tasks-list.difficulty.hard", "Hard")}
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="difficulty-normal"
                          checked={filterOptions.priority.includes("normal")}
                          onCheckedChange={(checked) => handleFilterDifficulty("normal", checked as boolean)}
                        />
                        <label htmlFor="difficulty-normal" className="text-sm">
                          {t("tasks.tasks-list.difficulty.normal", "Normal")}
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="difficulty-easy"
                          checked={filterOptions.priority.includes("easy")}
                          onCheckedChange={(checked) => handleFilterDifficulty("easy", checked as boolean)}
                        />
                        <label htmlFor="difficulty-easy" className="text-sm">
                          {t("tasks.tasks-list.difficulty.easy", "Easy")}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="mb-2 text-sm font-medium">{t("tasks.header.filter.due_date", "Due Date")}</h5>
                    <Calendar
                      mode="single"
                      selected={filterOptions.dateFinEstime ? new Date(filterOptions.dateFinEstime) : undefined}
                      onSelect={handleFilterDueDate}
                      className="rounded-md border"
                    />
                  </div>

                  {assignees.length > 0 && (
                    <div>
                      <h5 className="mb-2 text-sm font-medium">{t("tasks.header.filter.assignee", "Assignee")}</h5>
                      <div className="max-h-32 space-y-2 overflow-y-auto">
                        {assignees.map((assignee) => (
                          <div key={assignee.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`assignee-${assignee.id}`}
                              checked={filterOptions.assignee.includes(assignee.id)}
                              onCheckedChange={(checked) => handleFilterAssignee(assignee.id, checked as boolean)}
                            />
                            <div className="flex -space-x-2">
                              <Avatar
                                key={assignee.id}
                                className="h-5 w-5 rounded-full border-1 border-background border-gray-200 overflow-hidden"
                              >
                                <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                              </Avatar>
                            </div>
                            {assignee.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {projects.length > 0 && (
                    <div>
                      <h5 className="mb-2 text-sm font-medium">{t("tasks.header.filter.project", "Project")}</h5>
                      <div className="max-h-32 space-y-2 overflow-y-auto">
                        {projects.map((project) => (
                          <div key={project.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`project-${project.id}`}
                              checked={filterOptions.project.includes(project.id)}
                              onCheckedChange={(checked) => handleFilterProject(project.id, checked as boolean)}
                            />
                            <label htmlFor={`project-${project.id}`} className="flex items-center gap-2 text-sm">
                              <span className={`h-3 w-3 rounded-full`}></span>
                              {project.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {viewMode === "list" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  {translateSortByLabel(sortBy)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSortChange("dueDate")}>
                  Due Date {sortBy === "dueDate" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange("priority")}>
                  Difficulty {sortBy === "priority" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange("createdAt")}>
                  Created Date {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange("name")}>
                  Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="hidden items-center rounded-md border md:flex">
            <Button
              variant="ghost"
              className={`rounded-none rounded-l-md px-3 py-2 flex items-center gap-2 ${viewMode === "board" ? "bg-accent" : ""}`}
              onClick={() => onViewModeChange("board")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>{t("tasks.header.view.board", "Board")}</span>
            </Button>
            <Button
              variant="ghost"
              className={`rounded-none rounded-r-md px-3 py-2 flex items-center gap-2 ${viewMode === "list" ? "bg-accent" : ""}`}
              onClick={() => onViewModeChange("list")}
            >
              <List className="h-4 w-4" />
              <span>{t("tasks.header.view.list", "List")}</span>
            </Button>
          </div>

          {thisUserIsACreator() && (
            <Button onClick={onCreateTask}>
              <Plus className="mr-2 h-4 w-4" />
              {t("tasks.header.add_task", "Add Task")}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
