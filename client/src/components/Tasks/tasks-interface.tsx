"use client";

import { useEffect, useState } from "react";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { TasksBoard } from "@/components/tasks/tasks-board";
import { TasksList } from "@/components/tasks/tasks-list";
import { TaskDetails } from "@/components/tasks/task-details";
import { useMediaQuery } from "@/hooks/use-mobile";
import { TaskCreateModal } from "@/components/tasks/task-create-modal";
import useTasks from "../../hooks/useTasks";
import { useTranslation } from "react-i18next"

export type ViewMode = "board" | "list";
export type GroupBy = "status" | "priority" | "assignee" | "project";
export type SortBy = "dueDate" | "priority" | "createdAt" | "name";
export type SortOrder = "asc" | "desc";
export type Priority = "easy" | "normal" | "hard";
export type Status = "TODO" | "PROGRESS" | "REVIEW" | "DONE";

type taskProps = {
  project?: any;
};

export function TasksInterface({ project }: taskProps) {
  const { t  } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [groupBy, setGroupBy] = useState<GroupBy>("status");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    status: [] as Status[],
    priority: [] as Priority[],
    assignee: [] as string[],
    project: [] as string[],
    label: [] as string[],
    dueDate: null as string | null,
  });

  let {
    handleDeleteAssignee,
    handleUpdateTask,
    handleDeleteTask,
    handleUpdateStatutTask,
    tasks,
    setTasks,
    handleTaskCreate,
    addTaskError,
    setAddTaskError,
    getTasksByProjectID,
    checkIfCreatorOfProject,
    getMyTasks
  } = useTasks();

  useEffect(() => {
    if(project)
      getTasksByProjectID(project?.id);
    else 
      getMyTasks()
  }, [project]);

  const thisUserIsACreator = ()=>{
    if( project == null ) return false
    return  checkIfCreatorOfProject(project) ; 
  } 

  const isValidDate = (date?: string) =>
    !!date && !isNaN(new Date(date).getTime());

  const getFilteredTasks = () => {
    let filtered = [...tasks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.nomTache.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filterOptions.status.length > 0) {
      filtered = filtered.filter((task) =>
        filterOptions.status.includes(task.statut)
      );
    }

    if (filterOptions.priority.length > 0) {
      const difficulteMap: Record<string, Priority> = {
        easy: "easy",
        normal: "normal",
        hard: "hard",
      };

      filtered = filtered.filter((task) => {
        const mappedPriority = difficulteMap[task.difficulte.toLowerCase()];
        return filterOptions.priority.includes(mappedPriority as Priority);
      });
    }

    if (filterOptions.assignee.length > 0) {
      filtered = filtered.filter((task) =>
        task.assignee.some((assignee) =>
          filterOptions.assignee.includes(assignee.id)
        )
      );
    }

    if (filterOptions.project.length > 0) {
      filtered = filtered.filter((task) =>
        filterOptions.project.includes(task.project.id)
      );
    }

    if (filterOptions.label.length > 0) {
      filtered = filtered.filter((task) =>
        task.attachments.some((label) =>
          filterOptions.label.includes(label.name)
        )
      );
    }
    
    if (filterOptions.dateFinEstime) {
      const filterDate = new Date(filterOptions.dateFinEstime).toDateString();
      filtered = filtered.filter((task) => {
        if (!task.dateFinEstime) return false;
        const taskDate = new Date(task.dateFinEstime).toDateString();
        return taskDate === filterDate;
      });
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case "dueDate":
          valueA = isValidDate(a.dateFinEstime)
          ? new Date(a.dateFinEstime!).getTime()
          : Number.POSITIVE_INFINITY;
        valueB = isValidDate(b.dateFinEstime)
          ? new Date(b.dateFinEstime!).getTime()
          : Number.POSITIVE_INFINITY;
          break;
        case "priority":
          const priorityOrder = { hard: 3, normal: 2, easy: 1 };
          valueA = priorityOrder[a.difficulte.toLowerCase()];
          valueB = priorityOrder[b.difficulte.toLowerCase()];
          break;
        case "createdAt":
          valueA = new Date(a.dateCreation).getTime();
          valueB = new Date(b.dateCreation).getTime();
          break;
        case "name":
          valueA = a.nomTache;
          valueB = b.nomTache;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    return filtered;
  };
  const filteredTasks = getFilteredTasks();
  const groupTasks = () => {
    const grouped: Record<string, any[]> = {};

    if (groupBy === "status") {
      grouped["TODO"] = filteredTasks.filter((task) => task.statut === "TODO");
      grouped["PROGRESS"] = filteredTasks.filter(
        (task) => task.statut === "PROGRESS"
      );
      grouped["REVIEW"] = filteredTasks.filter(
        (task) => task.statut === "REVIEW"
      );
      grouped["DONE"] = filteredTasks.filter((task) => task.statut === "DONE");
    } else if (groupBy === "priority") {
      grouped["easy"] = filteredTasks.filter(
        (task) => task.difficulte.toLowerCase() === "easy"
      );
      grouped["normal"] = filteredTasks.filter(
        (task) => task.difficulte.toLowerCase() === "normal"
      );
      grouped["hard"] = filteredTasks.filter(
        (task) => task.difficulte.toLowerCase() === "hard"
      );
    } else if (groupBy === "assignee") {
      const assignees = new Set<string>();
      filteredTasks.forEach((task) =>
        task.assignee.forEach((assignee) => assignees.add(assignee.id))
      );
      assignees.forEach((assigneeId) => {
        grouped[assigneeId] = [];
      });

      grouped["unassigned"] = [];

      filteredTasks.forEach((task) => {
        if (task.assignee.length === 0) {
          grouped["unassigned"].push(task);
        } else {
          task.assignee.forEach((assignee) => {
            if (grouped[assignee.id]) {
              grouped[assignee.id].push(task);
            }
          });
        }
      });
    } else if (groupBy === "project") {
      const projects = new Set<string>();
      filteredTasks.forEach((task) => projects.add(task.project.id));
      projects.forEach((projectId) => {
        grouped[projectId] = filteredTasks.filter(
          (task) => task.project.id === projectId
        );
      });
    }

    return grouped;
  };

  const [groupedTasks, setGroupedTasks] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const newGroupedTasks = groupTasks();
    setGroupedTasks(newGroupedTasks);
  }, [tasks]);
  
  const addTask = async (task :any) =>{
    const res = await handleTaskCreate(task);
    if (project) await getTasksByProjectID(project?.id);
    return res;
  }
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleTaskUpdate = async (updated: Task) => {
    await handleUpdateTask(updated);
    if(updated.id != updated.statut)
      await handleUpdateStatutTask(updated.id, updated.statut);
    if (project) await getTasksByProjectID(project?.id);
    setSelectedTask(updated);
  };

  const handleTaskDelete = async (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    await handleDeleteTask(taskId);
    if (project) getTasksByProjectID(project?.id);
    setSelectedTask(null);
    setShowTaskDetails(false);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleGroupByChange = (group: GroupBy) => {
    setGroupBy(group);
  };

  const handleSortChange = (sort: SortBy) => {
    if (sortBy === sort) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(sort);
      setSortOrder("asc");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: Partial<typeof filterOptions>) => {
    setFilterOptions({ ...filterOptions, ...newFilters });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return; // Dropped outside a valid area

    const { source, destination, draggableId } = result;

    if (source.droppableId == destination.droppableId) return;
    handleUpdateStatutTask(draggableId, destination.droppableId);
    const task = Object.values(groupedTasks)
      .flat()
      .find((t) => t.id === draggableId);

    const updatedSourceTasks = groupedTasks[source.droppableId].filter(
      (t) => t.id !== draggableId
    );

    const updatedDestinationTasks = [
      ...groupedTasks[destination.droppableId],
      { ...task, statut: destination.droppableId },
    ];

    setGroupedTasks((prev) => ({
      ...prev,
      [source.droppableId]: updatedSourceTasks,
      [destination.droppableId]: updatedDestinationTasks,
    }));

    const updatedTasks = tasks.map((task:any) =>
      task.id === draggableId ? { ...task, statut: destination.droppableId } : task
    );
    setTasks(updatedTasks);

  };

  return (
    <div className="flex h-[calc(100vh-7rem)] overflow-x-hidden rounded-lg border bg-background shadow-sm">
      <div className="flex flex-1 flex-col">
        <TasksHeader
          thisUserIsACreator={thisUserIsACreator}
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
            <TasksList project={project}  tasks={filteredTasks} setTasks={setTasks} onTaskClick={handleTaskClick} handleUpdateStatutTask={handleUpdateStatutTask} />
          )}

          {showTaskDetails && selectedTask && (
            <TaskDetails
              taskToEdit={selectedTask}
              onClose={() => setShowTaskDetails(false)}
              onUpdate={handleTaskUpdate}
              onDelete={handleTaskDelete}
              allTasks={tasks}
              thisUserIsACreator={thisUserIsACreator}
              handleDeleteAssignee={handleDeleteAssignee}
              project={project}
            />
          )}
        </div>
      </div>
        <TaskCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTask={addTask}
        existingTasks={tasks}
        addTaskError={addTaskError}
        setAddTaskError={setAddTaskError}
        project={project}
      />
      
    </div>
  );
}
