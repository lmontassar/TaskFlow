import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import useTasks from "../../../hooks/useTasks"
import { useTranslation } from "react-i18next"
import { format, formatDate, parseISO } from "date-fns"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Cloud, CloudUpload, CloudCog, CheckCircleIcon } from "lucide-react"

// Import DHTMLX Gantt
import "dhtmlx-gantt/codebase/dhtmlxgantt.css"
import { Link } from "react-router-dom"
import { Badge } from "../../ui/badge"
import { Clock, StarIcon } from "lucide-react"
import { toLocalISOString } from "../../../lib/utils"
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Button } from "../../ui/button"


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
  const { tasks: apiTasks,
    getTasksByProjectID,
    getMyTasks,
    getStatusBadge,
    formatDurationReact,
    getDifficulteBadge,
    handleResizeTask,
    DeleteParallelTask,
    DeletePrecTask
  } = useTasks();
  type Status = "loading" | "done" | "idle"
  const [dep, setDep] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cloud, setCloud] = useState<Status>("idle");
  const [linkToDelete, setLinkToDelete] = useState<null | { id: string; link: any }>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const ganttRef = useRef<any>(null);


  useEffect(() => {
    if (cloud === "done") {
      const timer = setTimeout(() => {
        setCloud("idle")
      }, 3 * 1000);

      return () => {
        clearTimeout(timer)
      }
    }
  }, [cloud])

  function CloudStatusIcon({ status }: any) {

    const variants: any = {
      loading: { bg: "bg-blue-100", text: "text-blue-800" },
      done: { bg: "bg-green-100", text: "text-green-800" },
      idle: { bg: "bg-gray-100", text: "text-gray-800" },
    }
    const { bg, text } = variants[status]

    let Icon: React.ComponentType<{ size?: number; className?: string }>
    let label: string
    switch (status) {
      case "loading":
        Icon = CloudUpload
        label = "Syncing..."
        break
      case "done":
        Icon = CheckCircleIcon
        label = "Done"
        break
      default:
        Icon = Cloud
        label = "Synced"
    }
    return (
      <div
        className={`
        inline-flex items-center space-x-1 px-2 py-1 rounded-lg
        text-sm font-medium shadow-sm ${bg} ${text}
      `}
      >
        <Icon
          size={16}
          className={status === "loading" ? "animate-spin" : undefined}
        />
        <span>{label}</span>
      </div>
    )


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

  useEffect(() => {
    import("dhtmlx-gantt").then(({ gantt }) => {



      const originalConsoleError = console.error
      console.error = (...args) => {
        if (args[0] && typeof args[0] === "string" && args[0].includes("Invalid link type")) {
          return
        }
        originalConsoleError(...args)
      }
      configureGantt(gantt)
      const styleEl = document.createElement('style')
      styleEl.textContent = customStyles
      document.head.appendChild(styleEl)
      if (ganttContainer.current && !ganttInitialized) {
        ganttRef.current = gantt;
        gantt.init(ganttContainer.current)
        setGanttInitialized(true)
        setupGanttEvents(gantt)
        loadTasks()
      }
      return () => {
        document.head.removeChild(styleEl)
        console.error = originalConsoleError
        gantt.clearAll();
      }
    })
  }, [ganttInitialized, project])

  useEffect(() => {
    if (apiTasks && apiTasks.length > 0 && ganttInitialized) {
      console.log("Raw tasks data:", apiTasks)

      import("dhtmlx-gantt").then(({ gantt }) => {
        try {
          const formattedData = formatTasksForGantt(apiTasks)

          const allDates = apiTasks.flatMap( (task:any) => [
            task.dateDebut ? new Date(task.dateDebut) : null,
            task.dateFinEstime ? new Date(task.dateFinEstime) : null
          ]).filter((d): d is Date => !!d);

          if (allDates.length) {
            // 2) find min & max
            const minTime = Math.min(...allDates.map(d => d.getTime()));
            const maxTime = Math.max(...allDates.map(d => d.getTime()));

            // 3) optionally pad by a couple days for breathing room
            const pad = 10 * 24 * 60 * 60 * 1000; // two days in ms

            gantt.config.start_date = new Date(minTime - pad);
            gantt.config.end_date = new Date(maxTime + pad);
          }


          gantt.attachEvent("onTaskDblClick", (id: string) => {
            const task = apiTasks.find((t: any) => t.id == id);
            setSelectedTask(task);
            setDialogOpen(true);
            return false;
          })
          let _oldDates: Record<string, { start: Date; end: Date }> = {};
          gantt.attachEvent("onBeforeTaskDrag", (id: string, mode: string) => {
            if (mode === "move" || mode === "resize") {
              const t: any = gantt.getTask(id);
              _oldDates[id] = {
                start: new Date(t.start_date),
                end: new Date(t.end_date),
              };
            }
            return true;
          });

          gantt.attachEvent("onAfterTaskDrag", async (id: string, mode: string) => {
            if (mode === "move" || mode === "resize") {
              setCloud("loading");
              const updated: any = gantt.getTask(id);
              const t = {
                id,
                dateDebut: toLocalISOString(updated.start_date),
                dateFinEstime: toLocalISOString(updated.end_date),
              };
              const res: any = await handleResizeTask(t);
              if (res.result !== true) {
                const task = gantt.getTask(id);
                const old = _oldDates[id];
                task.start_date = old.start;
                task.end_date = old.end;
                gantt.updateTask(id);
                gantt.refreshTask(id);
                gantt.render();
                setCloud("idle");
              } else {
                const orig: any = apiTasks.find((x: any) => x.id === id);
                orig!.dateDebut = t.dateDebut;
                orig!.dateFinEstime = t.dateFinEstime;
                setCloud("done");
              }
            }
          });


          gantt.attachEvent("onLinkDblClick", (linkId: string) => {
            const link = gantt.getLink(linkId);
            setLinkToDelete({ id: linkId, link });
            setDeleteDialogOpen(true);
            return false;
          });


          gantt.attachEvent("onBeforeLinkDelete", (id, link) => {
            console.log("allowing delete of link", id);

            return true;
          });

          gantt.attachEvent("onAfterLinkDelete", async (id, link) => {
            if (dep == true) return
            if (link.type == "1") {
              const res: any = await DeleteParallelTask(link.source, link.target, false);
              if (res == false) {

              }
            } else {
              const res: any = await DeletePrecTask(link.target, link.source, false);
              if (res == false) {

              }
            }

          });

          gantt.clearAll()
          gantt.parse(formattedData)

          if (sortByStartDate) {
            gantt.sort("start_date", false)
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
  useEffect(() => {
    if (ganttInitialized) {
      import("dhtmlx-gantt").then(({ gantt }) => {
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

    gantt.confirm = (_: string, cb?: () => void): boolean => {
      if (typeof cb === "function") cb();
      return true;
    };
    gantt.locale.labels.confirm_link_deleting = "";

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
    gantt.config.sort = true

    gantt.config.scales = [
      { unit: "month", step: 1, format: "%F %Y" },
      { unit: "week", step: 1, format: "%W" },
    ]

    gantt.config.types = {
      task: "task",
      project: "project",
      milestone: "milestone",
    }

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
      }
    ]

    gantt.config.drag_links = false
    gantt.config.show_links = true

    // gantt.config.show_errors = false;
    // gantt.config.show_confirm = false;

    gantt.config.links = {
      finish_to_start: 0,
      start_to_start: 1,
      finish_to_finish: 2,
      start_to_finish: 3,
    }

    gantt.config.auto_types = false
    gantt.config.show_errors = false

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

    gantt.templates.task_class = (start: Date, end: Date, task: any) => {
      const classes = []

      if (task.difficulty === "hard") classes.push("task-hard")
      else if (task.difficulty === "normal") classes.push("task-normal")
      else classes.push("task-easy")

      if (task.type === "project") classes.push("parent-task")
      else if (task.parent && task.parent !== 0) classes.push("child-task")

      return classes.join(" ")
    }

    gantt.templates.tooltip_text = (start: Date, end: Date, task: any) => {
      let tooltip = `<b>${task.text}</b><br/>
                    ${t("Start")}: ${format(start, "dd/MM/yyyy")}<br/>
                    ${t("End")}: ${format(end, "dd/MM/yyyy")}<br/>
                    ${t("Progress")}: ${Math.round(task.progress * 100)}%<br/>
                    ${t("Difficulty")}: ${task.difficulty || "easy"}`

      if (task.parent && task.parent !== 0) {
        const parent = gantt.getTask(task.parent)
        if (parent) {
          tooltip += `<br/>${t("Parent")}: ${parent.text}`
        }
      }

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

    gantt.templates.today_class = () => {
      return "today"
    }

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

    gantt.config.details_on_dblclick = false;
    gantt.attachEvent("onError", (errorMessage: string) => {
      if (errorMessage.includes("Invalid link type")) {
        return true
      }
      return true
    })

    gantt.attachEvent("onTaskClick", (id: string) => {
      console.log("Task clicked:", gantt.getTask(id))
      return true
    })

    gantt.attachEvent("onLinkCreated", (link: any) => {
      console.log("Link created:", link)
      return true
    })

    gantt.attachEvent("onBeforeLinkAdd", (id, link) => {
      const sourceTask = gantt.getTask(link.source)
      const targetTask = gantt.getTask(link.target)

      console.log(`Creating link from "${sourceTask.text}" to "${targetTask.text}"`)
      return true
    })

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
    const taskMap = new Map()
    const tasks = taskList.map((task) => {

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


      let startDate: Date
      let endDate: Date

      try {
        startDate = task.dateDebut ? new Date(task.dateDebut) : new Date()
        endDate = task.dateFinEstime ? new Date(task.dateFinEstime) : new Date(Date.now() + 86400000)
      } catch (error) {
        console.error("Error formatting dates for task:", task.nomTache, error)

        startDate = new Date()
        endDate = new Date(Date.now() + 86400000)
      }

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

      taskMap.set(formattedTask.id, formattedTask)

      return formattedTask
    })


    tasks.forEach((task) => {
      if (task.parent && task.parent !== 0) {
        const parentTask = taskMap.get(task.parent)
        if (parentTask) {
          parentTask.type = "project"
        }
      }
    })


    const links = []

    for (const task of taskList) {
      if (task.precedentes?.length) {
        for (const pred of task.precedentes) {
          links.push({
            id: `fs-${pred.id}-${task.id}`,
            source: pred.id,
            target: task.id,
            type: 0,
          });
        }
      }


      if (task.paralleles?.length) {
        for (const par of task.paralleles) {
          if(   links.some(
              (l: any) =>
                l.id === `ss-${par.id}-${task.id}` || l.id === `ss-${task.id}-${par.id}`
            ))  
            continue;
          else 
          links.push({
            id: `ss-${par.id}-${task.id}`,
            source: par.id,
            target: task.id,
            type: 1,
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
        gantt.sort(null, null)
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

          <div className="flex items-center justify-between rounded-md p-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{t("View")}:</span>
                <Select value={viewMode} onValueChange={(value) => handleViewModeChange(value as "day" | "week" | "month")}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder={t("Select view")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">{t("Day")}</SelectItem>
                    <SelectItem value="week">{t("Week")}</SelectItem>
                    <SelectItem value="month">{t("Month")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CloudStatusIcon status={cloud} />
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

      {
        selectedTask && (
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this dependency?
          </DialogDescription>

          {/* rest of your buttons… */}
          <div className="flex justify-end gap-2 mt-4">

            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setLinkToDelete(null)
              }}
            >
              Cancel
            </Button>


            <Button
              variant="destructive"
              onClick={() => {
                if (linkToDelete) {
                  console.log(linkToDelete)
                  if (linkToDelete.link.type == 1) {
                    ganttRef.current!.deleteLink(linkToDelete.id);
                    setDep(true);
                    const [type, source, target] = linkToDelete.id.split("-");
                    const rev = `${type}-${target}-${source}`;
                    ganttRef.current!.deleteLink(rev);
                    setDep(false);
                  } else {
                    ganttRef.current!.deleteLink(linkToDelete.id);
                  }
                  // ganttRef.current!.deleteLink(linkToDelete.id);
                  // setDep(true);
                  // gantt.
                  // setDep(true);
                }
                setDeleteDialogOpen(false)
                setLinkToDelete(null)
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </Card >
  )
}