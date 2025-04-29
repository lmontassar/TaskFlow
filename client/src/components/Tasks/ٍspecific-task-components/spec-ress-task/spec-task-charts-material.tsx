"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Gantt, type Task, ViewMode } from "gantt-task-react"
import "gantt-task-react/dist/index.css"
import { format, parseISO, isValid } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"

// Define proper types for our data
interface Resource {
    ress: {
        id: string
        nom: string
        type: string
        categorie: string
        coutUnitaire: number
        unitMeasure?: string
        notes: string
        status: string
    }
    qte: number
    consommation: number
    dateDebut: string | null
    dateFin: string | null
}

interface TaskData {
    id: string
    nomTache: string
    ressources: Resource[]
}

// Custom tooltip component

export default function TaskResourceStatisticMaterial({ task }: { task: TaskData }) {
    const [ganttTasks, setGanttTasks] = useState<Task[]>([])
    const [hasResources, setHasResources] = useState(false)
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
        start: null,
        end: null,
    })
    const [importantDates, setImportantDates] = useState<Set<number>>(new Set())
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week)
    const { t } = useTranslation()

    const CustomTooltipContent = ({ task }: any) => {
        const resource = (task as any).resource as Resource
        if (!resource) return null

        return (
            <div className="p-3 bg-card border rounded-md shadow-md max-w-xs">
                <h3 className="font-bold text-sm mb-2">{resource.ress.nom}</h3>
                <div className="text-xs space-y-1">
                    <p>
                        <span className="font-medium">{t("task.chart_material.type", "Type")}:</span> {resource.ress.type}
                    </p>
                    <p>
                        <span className="font-medium">{t("task.chart_material.category", "Category")}:</span> {resource.ress.categorie || "N/A"}
                    </p>
                    <p>
                        <span className="font-medium">{t("task.chart_material.quantity", "Quantity")}:</span> {resource.qte}
                    </p>
                    {resource.ress.unitMeasure && (
                        <p>
                            <span className="font-medium">{t("task.chart_material.unit", "Unit")}:</span> {resource.ress.unitMeasure}
                        </p>
                    )}
                    <p>
                        <span className="font-medium">{t("task.chart_material.cost", "Cost")}:</span> {resource.ress.coutUnitaire}
                    </p>
                    <p>
                        <span className="font-medium">{t("task.chart_material.start", "Start")}:</span> {format(task.start, "MMM dd, yyyy HH:mm")}
                    </p>
                    <p>
                        <span className="font-medium">{t("task.chart_material.end", "End")}:</span> {format(task.end, "MMM dd, yyyy HH:mm")}
                    </p>
                    {resource.ress.notes && (
                        <p>
                            <span className="font-medium">{t("task.chart_material.notes", "Notes")}:</span> {resource.ress.notes}
                        </p>
                    )}
                </div>
            </div>
        )
    }

    useEffect(() => {
        if (!task?.ressources?.length) {
            setHasResources(false)
            setLoading(false)
            return
        }

        const valid = task.ressources.filter(
            (r) => r.dateDebut && r.dateFin && isValid(parseISO(r.dateDebut)) && isValid(parseISO(r.dateFin)),
        )

        setHasResources(valid.length > 0)
        if (!valid.length) {
            setLoading(false)
            return
        }

        // Find the earliest start date and latest end date
        const startDates = valid
            .map((res) => res.dateDebut)
            .filter((date): date is string => !!date)
            .map((date) => parseISO(date))
            .filter((date) => isValid(date))

        const endDates = valid
            .map((res) => res.dateFin)
            .filter((date): date is string => !!date)
            .map((date) => parseISO(date))
            .filter((date) => isValid(date))

        if (startDates.length > 0 && endDates.length > 0) {
            const earliestStart = new Date(Math.min(...startDates.map((d) => d.getTime())))
            const latestEnd = new Date(Math.max(...endDates.map((d) => d.getTime())))

            setDateRange({
                start: earliestStart,
                end: latestEnd,
            })
        }

        // Sort resources by start date
        const tasks: any[] = valid
            .sort((a, b) => new Date(a.dateDebut!).getTime() - new Date(b.dateDebut!).getTime())
            .map((r, i) => ({
                id: `${r.ress.id}-${i}`,
                name: r.ress.nom,
                start: parseISO(r.dateDebut!),
                end: parseISO(r.dateFin!),
                progress: 100,
                type: "task",
                isDisabled: true,
                styles: {
                    backgroundColor: "#6049e7",
                    backgroundSelectedColor: "#6049e7",
                    progressColor: "#6049e7",
                    progressSelectedColor: "#6049e7",
                },
                resource: r,
            }))

        const datesSet = new Set<number>()
        tasks.forEach((t) => {
            datesSet.add(t.start.getTime())
            datesSet.add(t.end.getTime())
        })

        console.log(tasks)
        setImportantDates(datesSet)
        setGanttTasks(tasks)
        setLoading(false)
    }, [task])

    const wrapperRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const container = wrapperRef.current
        if (!container || !ganttTasks.length) return

        const gridEl = container.querySelector(".gantt-date-grid")
        const headerEl = container.querySelector(".gantt-calendar-header")

        if (!gridEl || !headerEl) return

        const showOnlyImportantDates = () => {
            const dayCells = container.querySelectorAll<HTMLDivElement>("[data-date]")
            dayCells.forEach((cell) => {
                const dateStr = cell.getAttribute("data-date")
                const ts = dateStr ? new Date(dateStr).setHours(0, 0, 0, 0) : Number.NaN
                if (importantDates.has(ts)) {
                    cell.style.display = "" // Show important dates
                }
            })

            const headerCells = container.querySelectorAll<HTMLDivElement>(".gantt-calendar-day")
            headerCells.forEach((cell) => {
                const dateStr = cell.textContent?.trim()
                if (!dateStr) return

                const parts = dateStr.split("/")
                if (parts.length !== 3) return // Expecting format like DD/MM/YYYY

                const [day, month, year] = parts.map(Number)
                const ts = new Date(year, month - 1, day).setHours(0, 0, 0, 0)
                if (importantDates.has(ts)) {
                    cell.style.display = "" // Show important header dates
                }
            })
        }

        showOnlyImportantDates()

        const mo = new MutationObserver(showOnlyImportantDates)
        mo.observe(gridEl, { childList: true, subtree: true })
        mo.observe(headerEl, { childList: true, subtree: true })

        return () => mo.disconnect()
    }, [ganttTasks, importantDates])

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t("task.chart_material.material_resources_timeline", "Material Resources Timeline")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!hasResources) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t("task.chart_material.material_resources_timeline", "Material Resources Timeline")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        {t("task.chart_material.no_resources", "No resources with scheduled dates available. Please assign start and end dates to your resources.")}
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <span>{t("task.chart_material.material_resources_timeline", "Material Resources Timeline")}</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                    <p>{t("task.chart_material.tooltip", "Hover over resource bars to see detailed information")}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardTitle>
                    <Select
                        defaultValue={ViewMode.Week}
                        value={viewMode}
                        onValueChange={(value) => setViewMode(value as ViewMode)}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder={t("task.chart_material.view_mode", "View Mode")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ViewMode.Day}>{t("task.chart_material.day", "Day")}</SelectItem>
                            <SelectItem value={ViewMode.Week}>{t("task.chart_material.week", "Week")}</SelectItem>
                            <SelectItem value={ViewMode.Month}>{t("task.chart_material.month", "Month")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div ref={wrapperRef} className="w-full overflow-x-auto">
                    <div className="min-w-full">
                        <Gantt
                            tasks={ganttTasks}
                            viewMode={viewMode}
                            locale="fr"
                            listCellWidth="155px"
                            columnWidth={70}
                            rowHeight={70}
                            barCornerRadius={4}
                            TooltipContent={CustomTooltipContent}
                            onDateChange={() => { }}
                            onProgressChange={() => { }}
                            onDoubleClick={() => { }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
