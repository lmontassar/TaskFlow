"use client"

import { useEffect, useState } from "react"
import { TasksHeader } from "@/components/tasks/tasks-header"
import { TasksBoard } from "@/components/tasks/tasks-board"
import { TasksList } from "@/components/tasks/tasks-list"
import { TaskDetails } from "@/components/tasks/task-details"
import { useMediaQuery } from "@/hooks/use-mobile"
import { TaskCreateModal } from "@/components/tasks/task-create-modal"
import useTasks from "../../hooks/useTasks"

export type ViewMode = "board" | "list"
export type GroupBy = "status" | "priority" | "assignee" | "project"
export type SortBy = "dueDate" | "priority" | "createdAt" | "name"
export type SortOrder = "asc" | "desc"
export type Priority = "low" | "medium" | "high" | "urgent"
export type Status = "TODO" | "PROGRESS" | "REVIEW" | "DONE"

export interface TaskAssignee {
  id: string
  name: string
  avatar: string
  initials: string
}

export interface TaskAttachment {
  id: string
  name: string
  size: string
  type: string
  uploadedAt: string
  url: string
}

export interface TaskComment {
  id: string
  user: TaskAssignee
  content: string
  createdAt: string
  attachments?: TaskAttachment[]
}

export interface TaskProject {
  id: string
  name: string
}

export interface Task {
  id: string
  nomTache: string
  description?: string
  statut: Status
  qualite?: number // 1-5
  difficulte: string // easy normal hard
  dateCreation: string
  dateDebut?: string
  dateFinEstime?: string
  dataFin?: string
  duree: number
  marge: 0
  assignee: TaskAssignee[]
  attachments: TaskAttachment[]
  comments: TaskComment[]
  project: TaskProject
  parent?: string
}

export function TasksInterface() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [groupBy, setGroupBy] = useState<GroupBy>("status")
  const [sortBy, setSortBy] = useState<SortBy>("dueDate")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterOptions, setFilterOptions] = useState({
    status: [] as Status[],
    priority: [] as Priority[],
    assignee: [] as string[],
    project: [] as string[],
    label: [] as string[],
    dueDate: null as string | null,
  })

  let {
    handleUpdateTask,
    handleDeleteTask,
    handleUpdateStatutTask,
    tasks ,
    setTasks,
    handleTaskCreate,
    addTaskError,
    setAddTaskError,
    handleFindAllTasks,
  } = useTasks()

  useEffect( ()=>{
    handleFindAllTasks();
  },[])


  // Filter tasks based on search query and filter options

  const getFilteredTasks = () => {
    let filtered = [...tasks]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.nomTache.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)),
      )
    }

    // Apply filters
    if (filterOptions.status.length > 0) {
      filtered = filtered.filter((task) => filterOptions.status.includes(task.statut))
    }

    if (filterOptions.priority.length > 0) {
      // Note: priority is not in the new Task interface, so this filter might need to be removed
      // or adapted to use a different field like difficulte
      const difficulteMap: Record<string, Priority> = {
        easy: "low",
        normal: "medium",
        hard: "high",
      }

      filtered = filtered.filter((task) => {
        const mappedPriority = difficulteMap[task.difficulte.toLowerCase()]
        return filterOptions.priority.includes(mappedPriority as Priority)
      })
    }

    if (filterOptions.assignee.length > 0) {
      filtered = filtered.filter((task) =>
        task.assignee.some((assignee) => filterOptions.assignee.includes(assignee.id)),
      )
    }

    if (filterOptions.project.length > 0) {
      filtered = filtered.filter((task) => filterOptions.project.includes(task.project.id))
    }

    if (filterOptions.label.length > 0) {
      filtered = filtered.filter((task) => task.attachments.some((label) => filterOptions.label.includes(label.name)))
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let valueA, valueB

      switch (sortBy) {
        case "dueDate":
          valueA = a.dateFinEstime ? new Date(a.dateFinEstime).getTime() : Number.POSITIVE_INFINITY
          valueB = b.dateFinEstime ? new Date(b.dateFinEstime).getTime() : Number.POSITIVE_INFINITY
          break
        case "priority":
          // Map difficulte to priority values for sorting
          const priorityOrder = { hard: 3, normal: 2, easy: 1 }
          valueA = priorityOrder[a.difficulte.toLowerCase()]
          valueB = priorityOrder[b.difficulte.toLowerCase()]
          break
        case "createdAt":
          valueA = new Date(a.dateCreation).getTime()
          valueB = new Date(b.dateCreation).getTime()
          break
        case "name":
          valueA = a.nomTache
          valueB = b.nomTache
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

    return filtered
  }

  const filteredTasks = getFilteredTasks()

  // Group tasks based on the groupBy option
  
  


  const groupTasks = () => {
    const grouped: Record<string, Task[]> = {}

    if (groupBy === "status") {
      grouped["TODO"] = filteredTasks.filter((task) => task.statut === "TODO")
      grouped["PROGRESS"] = filteredTasks.filter((task) => task.statut === "PROGRESS")
      grouped["REVIEW"] = filteredTasks.filter((task) => task.statut === "REVIEW")
      grouped["DONE"] = filteredTasks.filter((task) => task.statut === "DONE")
    } else if (groupBy === "priority") {
      // Group by difficulte instead of priority
      grouped["easy"] = filteredTasks.filter((task) => task.difficulte.toLowerCase() === "easy")
      grouped["normal"] = filteredTasks.filter((task) => task.difficulte.toLowerCase() === "normal")
      grouped["hard"] = filteredTasks.filter((task) => task.difficulte.toLowerCase() === "hard")
    } else if (groupBy === "assignee") {
      // Get unique assignees from all tasks
      const assignees = new Set<string>()
      filteredTasks.forEach((task) => task.assignee.forEach((assignee) => assignees.add(assignee.id)))

      // Initialize empty arrays for each assignee
      assignees.forEach((assigneeId) => {
        grouped[assigneeId] = []
      })

      // Add "Unassigned" group
      grouped["unassigned"] = []

      // Populate groups
      filteredTasks.forEach((task) => {
        if (task.assignee.length === 0) {
          grouped["unassigned"].push(task)
        } else {
          // Add task to each assignee's group
          task.assignee.forEach((assignee) => {
            if (grouped[assignee.id]) {
              grouped[assignee.id].push(task)
            }
          })
        }
      })
    } else if (groupBy === "project") {
      // Get unique projects from all tasks
      const projects = new Set<string>()
      filteredTasks.forEach((task) => projects.add(task.project.id))

      // Initialize and populate groups
      projects.forEach((projectId) => {
        grouped[projectId] = filteredTasks.filter((task) => task.project.id === projectId)
      })
    }

    return grouped
  }

  const [groupedTasks, setGroupedTasks] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    // If filteredTasks or groupBy changes, update groupedTasks
    const newGroupedTasks = groupTasks()
    console.log("New Grouped Tasks:", newGroupedTasks)

    // Only set state if the grouped tasks have changed
    setGroupedTasks(newGroupedTasks)
  }, [tasks]) 

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setShowTaskDetails(true)
  }

  const handleTaskUpdate = (updated: Task) => {
    handleUpdateTask(updated);
    handleUpdateStatutTask(updated.id, updated.statut);
    setTasks(tasks.map((task) => (task.id === updated.id ? updated : task)))
    setSelectedTask(updated)
  }

  const handleTaskDelete = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    handleDeleteTask(taskId);
    setSelectedTask(null)
    setShowTaskDetails(false)
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  const handleGroupByChange = (group: GroupBy) => {
    setGroupBy(group)
  }

  const handleSortChange = (sort: SortBy) => {
    if (sortBy === sort) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(sort)
      setSortOrder("asc")
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (newFilters: Partial<typeof filterOptions>) => {
    setFilterOptions({ ...filterOptions, ...newFilters })
  }

  const handleDragEnd = (result: any) => {
    
    if (!result.destination) return // Dropped outside a valid area

    const { source, destination, draggableId } = result

    if (source.droppableId == destination.droppableId) return 
    handleUpdateStatutTask(draggableId, destination.droppableId);
    const task = Object.values(groupedTasks)
    .flat()
    .find((t) => t.id === draggableId)
    console.log(task)
    
    const updatedSourceTasks = groupedTasks[source.droppableId].filter((t) => t.id !== draggableId)

    const updatedDestinationTasks = [...groupedTasks[destination.droppableId], { ...task, statut: destination.droppableId }]

    setGroupedTasks(prev => ({
      ...prev,
      [source.droppableId]: updatedSourceTasks,
      [destination.droppableId]: updatedDestinationTasks,
    }))
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] overflow-hidden rounded-lg border bg-background shadow-sm">
      <div className="flex flex-1 flex-col">
        <TasksHeader
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          groupBy={groupBy}
          onGroupByChange={handleGroupByChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onCreateTask={() => setShowCreateModal(true)}
          filterOptions={filterOptions}
          tasks={tasks}
        />

        <div className="flex flex-1 overflow-hidden">
          {viewMode === "board" ? (
            <TasksBoard
              groupedTasks={groupedTasks}
              groupBy={groupBy}
              onTaskClick={handleTaskClick}
              onDragEnd={handleDragEnd}
            />
          ) : (
            <TasksList tasks={filteredTasks} onTaskClick={handleTaskClick} />
          )}

          {showTaskDetails && selectedTask && (
            <TaskDetails
              task={selectedTask}
              onClose={() => setShowTaskDetails(false)}
              onUpdate={handleTaskUpdate}
              onDelete={handleTaskDelete}
              allTasks={tasks}
            />
          )}
        </div>
      </div>

      <TaskCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTask={handleTaskCreate}
        existingTasks={tasks}
        addTaskError={addTaskError}
        setAddTaskError={setAddTaskError}
      />
    </div>
  )
}

