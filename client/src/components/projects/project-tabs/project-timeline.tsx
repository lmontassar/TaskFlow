import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import useTasks from "../../../hooks/useTasks"
import { useTranslation } from "react-i18next"
import { format, formatDate, parseISO } from "date-fns"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";


// Import DHTMLX Gantt
import "dhtmlx-gantt/codebase/dhtmlxgantt.css"
import { TaskDetails } from "../../Tasks/task-details"
import { Link } from "react-router-dom"
import { Badge } from "../../ui/badge"
import { Clock, StarIcon } from "lucide-react"
import { toLocalISOString } from "../../../lib/utils"

// Add custom CSS for link styling
const customStyles = `
  /* Task styling */
  .gantt_task_line {
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    border: none;
  }
  
  .gantt_task_content {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 100% !important;
    padding: 0 4px;
    font-size: 12px;
    font-weight: 500;
  }
`;

export function ProjectTimeline({ project }: any) {
  const { t } = useTranslation()
  const ganttContainer = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<string>("week")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [ganttInitialized, setGanttInitialized] = useState<boolean>(false)
  const [sortByStartDate, setSortByStartDate] = useState<boolean>(true)
  const { tasks: apiTasks, getTasksByProjectID, getMyTasks, getStatusBadge, formatDurationReact, getDifficulteBadge, handleResizeTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleResize = async (t: any) =>{
    console.log("start task: ",t.dateDebut)
    console.log("start task: ",t.dateFinEstime)
    const res = await handleResizeTask(t);
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;

    try {
      const date = parseISO(dateString);
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return null;
    }
  };



  // Initialize gantt on component mount
  useEffect(() => {
    // Dynamic import to avoid SSR issues
    import("dhtmlx-gantt").then(({ gantt }) => {
      // Disable console errors from DHTMLX Gantt
      const originalConsoleError = console.error
      console.error = (...args) => {
        // Filter out DHTMLX Gantt link type errors
        if (args[0] && typeof args[0] === "string" && args[0].includes("Invalid link type")) {
          return
        }
        originalConsoleError(...args)
      }

      // Configure gantt
      configureGantt(gantt)

      // Add custom styles
      const styleEl = document.createElement('style')
      styleEl.textContent = customStyles
      document.head.appendChild(styleEl)

      // Initialize gantt
      if (ganttContainer.current && !ganttInitialized) {
        gantt.init(ganttContainer.current)
        setGanttInitialized(true)

        // Set up event handlers
        setupGanttEvents(gantt)

        // Load tasks
        loadTasks()
      }

      // Clean up styles on unmount
      return () => {
        document.head.removeChild(styleEl)
        console.error = originalConsoleError
        gantt.clearAll();
      }
    })
  }, [ganttInitialized, project])

  
  // Update gantt when tasks change
  useEffect(() => {
    if (apiTasks && apiTasks.length > 0 && ganttInitialized) {
      console.log("Raw tasks data:", apiTasks)

      import("dhtmlx-gantt").then(({ gantt }) => {
        try {
          const formattedData = formatTasksForGantt(apiTasks)
          console.log("▶︎ Gantt Data ▶︎", formattedData.data);
          console.log("▶︎ Gantt Links ▶︎", formattedData.links);


          gantt.attachEvent("onTaskDblClick", (id: string) => {
            const task = apiTasks.find((t: any) => t.id == id);
            setSelectedTask(task);
            setDialogOpen(true);
            return false;
          })

          gantt.attachEvent("onAfterTaskDrag", (id: string, mode: string) => {
            const updatedtask = gantt.getTask(id)
            console.log("Task dragged:", updatedtask, "Mode:", mode)
            const task: any = apiTasks.find((t: any) => t.id == id);
            if (mode == "resize" || mode == "move") {
              task.dateDebut = toLocalISOString(new Date(updatedtask.start_date))
              task.dateFinEstime = toLocalISOString(new Date(updatedtask.end_date))
              handleResize(task);
            }
          })


          gantt.clearAll()
          gantt.parse(formattedData)
          // Apply sorting if enabled
          if (sortByStartDate) {
            gantt.sort("start_date", false) // Sort by start date ascending

            // Force re-render to ensure dependencies are displayed correctly
            setTimeout(() => {
              gantt.render()
            }, 100)
          }
        } catch (error) {
          console.log("Error parsing tasks:", error)
        } finally {
          setIsLoading(false)
        }
      })
    }
  }, [apiTasks, ganttInitialized, sortByStartDate])

  // Update view mode when it changes
  useEffect(() => {
    if (ganttInitialized) {
      import("dhtmlx-gantt").then(({ gantt }) => {
        // Using the modern scales configuration
        switch (viewMode) {
          case "day":
            gantt.config.scales = [
              { unit: "day", step: 1, format: "%d %M" },
              { unit: "hour", step: 1, format: "%H:%i" },
            ]
            gantt.config.scale_height = 60
            gantt.config.min_column_width = 30
            break
          case "week":
            gantt.config.scales = [
              { unit: "week", step: 1, format: "%W" },
              { unit: "day", step: 1, format: "%d %M" },
            ]
            gantt.config.scale_height = 60
            gantt.config.min_column_width = 70
            break
          case "month":
          default:
            gantt.config.scales = [
              { unit: "month", step: 1, format: "%F %Y" },
              { unit: "week", step: 1, format: "%W" },
            ]
            gantt.config.scale_height = 60
            gantt.config.min_column_width = 120
            break
        }

        gantt.render()
      })
    }
  }, [viewMode, ganttInitialized])

  const configureGantt = (gantt: any) => {



    // General configuration
    gantt.config.date_format = "%Y-%m-%d %H:%i"
    gantt.config.drag_links = true
    gantt.config.drag_progress = false
    gantt.config.drag_resize = true
    gantt.config.drag_move = true
    gantt.config.auto_scheduling = false
    gantt.config.auto_scheduling_strict = false
    gantt.config.work_time = false
    gantt.config.skip_off_time = false
    gantt.config.show_progress = false
    gantt.config.fit_tasks = false
    gantt.config.row_height = 30;
    gantt.config.bar_height = 40;

    // Enable sorting
    gantt.config.sort = true

    // Initial scales configuration (will be updated when view mode changes)
    gantt.config.scales = [
      { unit: "month", step: 1, format: "%F %Y" },
      { unit: "week", step: 1, format: "%W" },
    ]

    // Enable task types (project, milestone, task)
    gantt.config.types = {
      task: "task",
      project: "project",
      milestone: "milestone",
    }

    // Configure columns
    gantt.config.columns = [
      { name: "text", label: t("Task Name"), tree: true, width: 200 },
      {
        name: "start_date",
        label: t("Start Date"),
        align: "center",
        width: 100,
        template: (task: any) => {
          return format(task.start_date, "dd/MM/yyyy")
        },
      },
      {
        name: "end_date",
        label: t("End Date"),
        align: "center",
        width: 100,
        template: (task: any) => {
          return format(task.end_date, "dd/MM/yyyy")
        },
      },
      { name: "duration", label: t("Duration"), align: "center", width: 60 }
    ]

    // Enable link creation and editing
    gantt.config.drag_links = false
    gantt.config.show_links = true

    // Configure link types
    gantt.config.links = {
      finish_to_start: 0,   // dependent can’t start until source ends
      start_to_start: 1,   // dependent can’t start until source starts
      finish_to_finish: 2,   // dependent can’t finish until source ends
      start_to_finish: 3,   // dependent can’t finish until source starts
    }

    // Disable link validation to prevent errors
    gantt.config.auto_types = false
    gantt.config.show_errors = false

    // Improve link rendering
    gantt.config.links_width = 2
    gantt.config.link_arrow_size = 6
    gantt.config.link_line_width = 2


    gantt.templates.link_class = (link: any) => {
      switch (link.type) {
        case gantt.config.links.finish_to_start: return "finish_to_start";
        case gantt.config.links.start_to_start: return "start_to_start";
        case gantt.config.links.finish_to_finish: return "finish_to_finish";
        case gantt.config.links.start_to_finish: return "start_to_finish";
        default: return "";
      }
    }

    gantt.templates.link_class = (link: any) => {
      switch (link.type) {
        case gantt.config.links.finish_to_start: return "finish_to_start";
        case gantt.config.links.start_to_start: return "start_to_start";
        case gantt.config.links.finish_to_finish: return "finish_to_finish";
        case gantt.config.links.start_to_finish: return "start_to_finish";
        default: return "";
      }
    };

    // Custom task styling based on difficulty
    gantt.templates.task_class = (start: Date, end: Date, task: any) => {
      const classes = []

      // Add difficulty class
      if (task.difficulty === "hard") classes.push("task-hard")
      else if (task.difficulty === "normal") classes.push("task-normal")
      else classes.push("task-easy")

      // Add parent/child class
      if (task.type === "project") classes.push("parent-task")
      else if (task.parent && task.parent !== 0) classes.push("child-task")

      return classes.join(" ")
    }

    // Custom tooltip
    gantt.templates.tooltip_text = (start: Date, end: Date, task: any) => {
      let tooltip = `<b>${task.text}</b><br/>
                    ${t("Start")}: ${format(start, "dd/MM/yyyy")}<br/>
                    ${t("End")}: ${format(end, "dd/MM/yyyy")}<br/>
                    ${t("Progress")}: ${Math.round(task.progress * 100)}%<br/>
                    ${t("Difficulty")}: ${task.difficulty || "easy"}`

      // Add parent info if it's a subtask
      if (task.parent && task.parent !== 0) {
        const parent = gantt.getTask(task.parent)
        if (parent) {
          tooltip += `<br/>${t("Parent")}: ${parent.text}`
        }
      }

      // Add dependency info - use getLinks() and filter instead of getTaskLinks
      const allLinks = gantt.getLinks()
      const taskLinks = allLinks.filter((link) => link.source === task.id || link.target === task.id)

      if (taskLinks && taskLinks.length > 0) {
        tooltip += `<br/><br/>${t("Dependencies")}:`
        taskLinks.forEach((link) => {
          const sourceTask = gantt.getTask(link.source)
          const targetTask = gantt.getTask(link.target)
          const linkType =
            link.type === "0"
              ? "Finish-to-Start"
              : link.type === "1"
                ? "Start-to-Start"
                : link.type === "2"
                  ? "Finish-to-Finish"
                  : "Start-to-Finish"

          if (link.source === task.id) {
            tooltip += `<br/>- ${t("Successor")}: ${targetTask.text} (${t(linkType)})`
          } else {
            tooltip += `<br/>- ${t("Predecessor")}: ${sourceTask.text} (${t(linkType)})`
          }
        })
      }

      return tooltip
    }

    // Highlight today
    gantt.templates.today_class = () => {
      return "today"
    }

    // Highlight weekends
    gantt.templates.scale_cell_class = (date: Date) => {
      if (date.getDay() === 0 || date.getDay() === 6) {
        return "weekend"
      }
      return ""
    }

    gantt.templates.timeline_cell_class = (task: any, date: Date) => {
      if (date.getDay() === 0 || date.getDay() === 6) {
        return "weekend"
      }
      return ""
    }
  }

  const setupGanttEvents = (gantt: any) => {
    // Prevent link errors from showing toasts

    gantt.config.details_on_dblclick = false;
    gantt.attachEvent("onError", (errorMessage: string) => {
      if (errorMessage.includes("Invalid link type")) {
        return true // Prevent default error handling
      }
      return true
    })

    // Task click event
    gantt.attachEvent("onTaskClick", (id: string) => {
      console.log("Task clicked:", gantt.getTask(id))
      return true // Return true to allow default action
    })

    // Task double click event


    // Link creation event
    gantt.attachEvent("onLinkCreated", (link: any) => {
      console.log("Link created:", link)
      return true // Return true to allow link creation
    })

    // Add UI for selecting link type when creating links
    gantt.attachEvent("onBeforeLinkAdd", (id, link) => {
      const sourceTask = gantt.getTask(link.source)
      const targetTask = gantt.getTask(link.target)

      console.log(`Creating link from "${sourceTask.text}" to "${targetTask.text}"`)
      return true // Allow link creation
    })

    // Task drag event



  }

  const loadTasks = async () => {
    setIsLoading(true)
    if (project) {
      await getTasksByProjectID(project?.id)
    } else {
      await getMyTasks()
    }
  }

  const formatTasksForGantt = (taskList: any[]) => {
    // First, create a map of tasks by ID for easier parent-child relationship setup
    const taskMap = new Map()

    // Process tasks first
    const tasks = taskList.map((task) => {
      // Calculate progress based on status
      let progress = 0
      if (task.statut === "DONE") {
        progress = 1
      } else if (task.statut === "IN_PROGRESS" || task.statut === "PROGRESS") {
        progress = 0.5
      } else if (task.statut === "REVIEW") {
        progress = 0.75
      } else if (task.statut === "TODO") {
        progress = 0
      }

      // Format dates for Gantt - ensure we have valid dates
      let startDate: Date
      let endDate: Date

      try {
        startDate = task.dateDebut ? new Date(task.dateDebut) : new Date()
        endDate = task.dateFinEstime ? new Date(task.dateFinEstime) : new Date(Date.now() + 86400000)
      } catch (error) {
        console.error("Error formatting dates for task:", task.nomTache, error)
        // Fallback to today and tomorrow if date parsing fails
        startDate = new Date()
        endDate = new Date(Date.now() + 86400000)
      }

      // Determine task type - if it has a parent, it's a task, otherwise it's a project
      const type = task.parent ? "task" : "project"

      const formattedTask = {
        id: task.id || `task-${Math.random().toString(36).substring(2, 11)}`,
        text: typeof task.nomTache === "string" && task.nomTache.trim() !== "" ? task.nomTache : "Unnamed Task",
        start_date: startDate,
        end_date: endDate,
        progress: progress,
        parent: task.parent?.id || 0,
        type: type,
        difficulty: task.difficulte || "easy",
        open: true,
      }

      // Add to map for later reference
      taskMap.set(formattedTask.id, formattedTask)

      return formattedTask
    })

    // Now process parent-child relationships
    tasks.forEach((task) => {
      if (task.parent && task.parent !== 0) {
        const parentTask = taskMap.get(task.parent)
        if (parentTask) {
          // Ensure parent is marked as a project
          parentTask.type = "project"
        }
      }
    })

    
    const links = []

    for (const task of taskList) {

      // Process precedentes (Finish-to-Start dependencies)
      if (task.precedentes?.length) {
        for (const pred of task.precedentes) {
          links.push({
            id: `fs-${pred.id}-${task.id}`,
            source: pred.id,      // ← predecessor first
            target: task.id,      // ← dependent second
            type: 0,              // ← numeric 0, not the string "0"
          });
        }
      }

      // Process paralleles (Start-to-Start dependencies)
      if (task.paralleles?.length) {
        for (const par of task.paralleles) {
          links.push({
            id: `ss-${par.id}-${task.id}`,
            source: par.id,
            target: task.id,
            type: 1,              // ← numeric 1
          });
        }
      }
    }

    return { data: tasks, links: links }
  }

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode)
  }

  const toggleSorting = () => {
    import("dhtmlx-gantt").then(({ gantt }) => {
      setSortByStartDate(!sortByStartDate)
      if (!sortByStartDate) {
        gantt.sort("start_date", false)
      } else {
        gantt.sort(null, null) // Remove sorting
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Project Timeline")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="gantt-container">
          <div className="gantt-toolbar mb-4">
            <div className="flex justify-between">
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 rounded ${viewMode === "day" ? "bg-primary text-white" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  onClick={() => handleViewModeChange("day")}
                >
                  {t("Day")}
                </button>
                <button
                  className={`px-3 py-1 rounded ${viewMode === "week" ? "bg-primary text-white" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  onClick={() => handleViewModeChange("week")}
                >
                  {t("Week")}
                </button>
                <button
                  className={`px-3 py-1 rounded ${viewMode === "month" ? "bg-primary text-white" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  onClick={() => handleViewModeChange("month")}
                >
                  {t("Month")}
                </button>
              </div>

              <button
                className={`px-3 py-1 rounded ${sortByStartDate ? "bg-primary text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                onClick={toggleSorting}
              >
                {sortByStartDate ? t("Sorted by Start Date") : t("Sort by Start Date")}
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          <div ref={ganttContainer} className="gantt-chart" style={{ height: "500px", width: "100%" }}></div>

          {/* Update the legend section */}
          <div className="gantt-legend mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="gantt-legend-item flex items-center">
              <div className="gantt-legend-color w-4 h-4 mr-2 bg-blue-500"></div>
              <span>{t("Finish-to-Start (Precedent)")}</span>
            </div>
            <div className="gantt-legend-item flex items-center">
              <div className="gantt-legend-color w-4 h-4 mr-2 bg-green-500 border border-dashed"></div>
              <span>{t("Start-to-Start (Parallel)")}</span>
            </div>


          </div>
        </div>
      </CardContent>

      {/* You don’t need a DialogTrigger here, since we open it programmatically */}
      {selectedTask && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">

            <div>
              <div className="mb-6 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold underline">
                    <Link to={`/task/${selectedTask.id}`}>{selectedTask.nomTache}</Link>
                  </h2>
                </div>

                <div className="flex flex-wrap justify-between gap-2">
                  <div className="flex gap-2">
                    {getStatusBadge(selectedTask.statut)}
                    {getDifficulteBadge(selectedTask.difficulte)}
                  </div>
                  {selectedTask.dateFinEstime && (
                    <Badge
                      variant="outline"
                      className="flex gap-1 bg-red-100 border-1 border-red-200 text-red-700"
                    >
                      <Clock className="h-3 w-3" />
                      {formatDate(selectedTask.dateFinEstime)}
                    </Badge>
                  )}
                </div>

                {selectedTask.description && (
                  <div className="rounded-md border p-3">
                    <p className="whitespace-pre-wrap text-sm">
                      {selectedTask.description}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="mb-2 text-sm font-medium">
                    {t("tasks.details.form.project", "Project")}
                  </h4>
                  <Badge variant="outline">{selectedTask.project.nom}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1 text-sm font-medium">
                    {t("tasks.details.form.quality", "Quality")}
                  </h4>
                  <div className="flex items-center">
                    {(selectedTask.qualite != 0 && (
                      <>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${i < (selectedTask.qualite || 0)
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
                {selectedTask.budgetEstime != 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">
                      {t("tasks.details.form.budget", "Budget")}
                    </h4>
                    <span className="text-sm">{selectedTask.budgetEstime}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <h4 className="mb-1 text-sm font-medium">
                    {t("tasks.details.createdat", "Created At")}
                  </h4>
                  <span className="text-sm">
                    {formatDate(selectedTask.dateCreation)}
                  </span>
                </div>
                {selectedTask.dateFin && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">
                      {t("tasks.details.finishedat", "Finished At")}
                    </h4>
                    <span className="text-sm">{formatDate(selectedTask.dateFin)}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                {selectedTask.dateDebut && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">
                      {t("tasks.details.started", "Start Date")}
                    </h4>
                    <span className="text-sm">
                      {formatDate(selectedTask.dateDebut)}
                    </span>
                  </div>
                )}

                {selectedTask.dateFinEstime && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">
                      {t("tasks.details.form.due_date", "Due Date")}
                    </h4>
                    <span className="text-sm">
                      {formatDate(selectedTask.dateFinEstime)}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                {selectedTask.duree != 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">
                      {t("tasks.details.form.duration", "Duration")}
                    </h4>
                    <span className="text-sm">
                      {formatDurationReact(selectedTask.duree)}
                    </span>
                  </div>
                )}
                {selectedTask.marge != 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">
                      {t("tasks.details.form.margin", "Marge")}
                    </h4>
                    <span className="text-sm">
                      {formatDurationReact(selectedTask.marge)}
                    </span>
                  </div>
                )}
              </div>

            </div>
          </DialogContent>
        </Dialog>
      )
      }

    </Card>
  )
}
