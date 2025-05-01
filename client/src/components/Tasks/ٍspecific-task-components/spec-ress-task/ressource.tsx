"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"

import { Popover, PopoverTrigger } from "@/components/ui/popover"
import * as PopoverPrimitive from "@radix-ui/react-popover"

const { PopoverContent } = PopoverPrimitive

import { Search, Plus, CalendarIcon, Zap, Clock, Box, Filter, Pencil, Trash2, Database } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../../ui/alert-dialog"
import useTasks from "../../../../hooks/useTasks"
import { useTranslation } from "react-i18next"
import { toLocalISOString } from "../../../../lib/utils"
import TaskResourceStatisticEnergitic from "./spec-task-charts-energ"
import TaskResourceStatisticMaterial from "./spec-task-charts-material"

interface Props {
    task: any
    setTask: (task: any) => void
}

export default function RessourceSpecifiTask({ task, setTask }: Props) {
    // States for resource management
    const [resources, setResources] = useState<any[]>([])
    const [filteredResources, setFilteredResources] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [assignedResources, setAssignedResources] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    // States for resource assignment form
    const [selectedResource, setSelectedResource] = useState<any>(null)
    const [quantity, setQuantity] = useState<number | string>("")
    const [consumption, setConsumption] = useState<number | string>("")
    const [startDate, setStartDate] = useState<any>(undefined)
    const [endDate, setEndDate] = useState<any>(undefined)
    const { t } = useTranslation()
    // States for edit mode
    const [isEditing, setIsEditing] = useState(false)
    const [editingResource, setEditingResource] = useState<any>(null)

    // State for delete confirmation
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [resourceToDelete, setResourceToDelete] = useState<any>(null)

    const { addAssignResource, deleteAssignResource, editAssignResource } = useTasks()

    // Resource type icons
    const RESOURCE_TYPE_ICONS = {
        Material: <Box className="h-4 w-4" />,
        Temporal: <Clock className="h-4 w-4" />,
        Energetic: <Zap className="h-4 w-4" />,
    }

    // Load resources from task project
    useEffect(() => {
        if (task?.project?.listeRessource) {
            setResources(task.project.listeRessource)
            setFilteredResources(task.project.listeRessource)
        }
        if (task?.ressources) {
            setAssignedResources(task.ressources)
        }
    }, [task])

    // Filter resources based on search and type
    useEffect(() => {
        let filtered = resources

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(
                (resource) =>
                    resource.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    resource.categorie.toLowerCase().includes(searchQuery.toLowerCase()),
            )
        }

        // Filter by type
        if (typeFilter !== "all") {
            filtered = filtered.filter((resource) => resource.type === typeFilter)
        }

        setFilteredResources(filtered)
    }, [searchQuery, typeFilter, resources])

    // Handle resource selection
    const handleSelectResource = (resource: any) => {
        setSelectedResource(resource)
        setQuantity("")
        setConsumption("")
        setStartDate(undefined)
        setEndDate(undefined)
        setError("")
        setIsEditing(false)
    }

    // Reset form
    const resetForm = () => {
        setSelectedResource(null)
        setEditingResource(null)
        setQuantity("")
        setConsumption("")
        setStartDate(undefined)
        setEndDate(undefined)
        setError("")
        setIsEditing(false)
    }

    // Validate form based on resource type
    const validateForm = () => {
        const resourceToValidate = isEditing ? editingResource.ress : selectedResource

        if (!resourceToValidate) {
            setError("Please select a resource")
            return false
        }

        switch (resourceToValidate.type) {
            case "Material":
                if (!quantity || Number(quantity) <= 0) {
                    setError(t("task.ressource.invalid_quantity", "Please enter a valid quantity"));
                    return false;
                }
                if (!startDate || !endDate) {
                    setError(t("task.ressource.select_dates", "Please select start and end dates"));
                    return false;
                }
                if (endDate < startDate) {
                    setError(t("task.ressource.invalid_dates", "End date must be after start date"));
                    return false;
                }
                break;
            case "Temporal":
                if (!quantity || Number(quantity) <= 0) {
                    setError(t("task.ressource.invalid_quantity", "Please enter a valid quantity"));
                    return false;
                }
                break;
            case "Energetic":
                if (!consumption || Number(consumption) <= 0) {
                    setError(t("task.ressource.invalid_consumption", "Please enter a valid consumption value"));
                    return false;
                }
                break;
        }
        return true
    }

    // Handle resource assignment
    const handleAssignResource = async () => {
        if (!validateForm()) return

        setLoading(true)
        setError("")

        const formData = new FormData()
        formData.append("taskID", task.id)
        formData.append("ressourceID", selectedResource.id)

        if (selectedResource.type === "Material" || selectedResource.type === "Temporal") {
            formData.append("qte", quantity.toString())
        }

        if (selectedResource.type === "Energetic") {
            formData.append("consommation", consumption.toString())
        }

        if (selectedResource.type === "Material") {
            formData.append("dateDebut", toLocalISOString(startDate))
            formData.append("dateFin", toLocalISOString(endDate) || "")
        }

        // Make API call
        const response: any = await addAssignResource(formData)
        if (response == null) {
            setError(t("task.ressource.general_error", "An error occurred. Please try again."));
            return
        }

        if (response.status === 200) {
            const updatedTask = await response.json()
            setTask(updatedTask)
            setAssignedResources(updatedTask.ressources || [])
            setSuccess(t("task.ressource.success_assigned", {resource : selectedResource.nom} ));
            resetForm()
        } else if (response.status === 406) {
            // Not acceptable - resource limit exceeded
            const availableAmount = await response.text()
            setError(t("task.ressource.insufficient_resources", `Not enough resources available. Maximum available: ${availableAmount}`));
        } else {
            setError(t("task.ressource.assign_failed", "Failed to assign resource. Please try again."));
        }
        setLoading(false)

        // Clear success message after 3 seconds
        if (success) {
            setTimeout(() => setSuccess(""), 3000)
        }
    }

    // Handle edit resource button click
    const handleEditClick = (assignment: any) => {
        setEditingResource(assignment)
        setIsEditing(true)

        // Set form values based on the resource being edited
        if (assignment.ress.type === "Material" || assignment.ress.type === "Temporal") {
            setQuantity(assignment.qte)
        }

        if (assignment.ress.type === "Energetic") {
            setConsumption(assignment.consommation)
        }

        if (assignment.ress.type === "Material" && assignment.dateDebut && assignment.dateFin) {
            setStartDate(new Date(assignment.dateDebut))
            setEndDate(new Date(assignment.dateFin))
        }
    }

    // Handle resource edit submission
    const handleEditResource = async () => {
        if (!validateForm()) return

        setLoading(true)
        setError("")

        const formData = new FormData()
        formData.append("taskID", task.id)
        formData.append("ressourceID", editingResource.ress.id)

        if (editingResource.ress.type === "Material" || editingResource.ress.type === "Temporal") {
            formData.append("qte", quantity.toString())
        }

        if (editingResource.ress.type === "Energetic") {
            formData.append("consommation", consumption.toString())
        }

        if (editingResource.ress.type === "Material") {
            formData.append("dateDebut", toLocalISOString(startDate) || "")
            formData.append("dateFin", toLocalISOString(endDate) || "")
        }

        // Make API call
        const response: any = await editAssignResource(formData)
        if (response == null) {
            setError(t("task.ressource.general_error", "An error occurred. Please try again."));
            return
        }

        if (response.status === 200) {
            const updatedTask = await response.json()
            setTask(updatedTask)
            setAssignedResources(updatedTask.ressources || [])
            setSuccess(t("task.ressource.success_updated",  {resource : editingResource.ress.nom}));

            resetForm()
        } else if (response.status === 406) {
            // Not acceptable - resource limit exceeded
            const availableAmount = await response.text()
            setError(t("task.ressource.insufficient_resources", `Not enough resources available. Maximum available: ${availableAmount}`));
        } else if (response.status === 404) {
            setError(t("task.ressource.resource_not_found", "Resource not found. It may have been deleted."));
        } else {
            setError(t("task.ressource.update_failed", "Failed to update resource. Please try again."));
        }
        setLoading(false)

        // Clear success message after 3 seconds
        if (success) {
            setTimeout(() => setSuccess(""), 3000)
        }
    }

    // Handle delete resource button click
    const handleDeleteClick = (assignment: any) => {
        setResourceToDelete(assignment)
        setDeleteConfirmOpen(true)
    }

    // Handle resource deletion confirmation
    const handleDeleteResource = async () => {
        if (!resourceToDelete) return

        setLoading(true)

        const formData = new FormData()
        formData.append("taskID", task.id)
        formData.append("ressourceID", resourceToDelete.ress.id)
        if (resourceToDelete.ress.type == "Material") {
            formData.append("dateDebut", resourceToDelete.dateDebut)
            formData.append("dateFin", resourceToDelete.dateFin)
        }
        console.log(resourceToDelete.dateDebut)

        // Make API call
        const response: any = await deleteAssignResource(formData)

        if (response && response.status === 200) {
            const updatedTask = await response.json()
            setTask(updatedTask)
            setAssignedResources(updatedTask.ressources || [])
            setSuccess(t("task.ressource.success_removed", {resource : resourceToDelete.ress.nom}));
        } else {
            setError(t("task.ressource.delete_failed", "Failed to delete resource. Please try again."));
        }
        setResourceToDelete(null)
        setDeleteConfirmOpen(false)
        setLoading(false)

        // Clear success message after 3 seconds
        if (success) {
            setTimeout(() => setSuccess(""), 3000)
        }
    }

    // Get available quantity for material resources
    const getAvailableQuantity = (resource: any) => {
        if (resource.type === "Material") {
            return resource.qteDisponibilite
        } else if (resource.type === "Temporal") {
            return resource.qte
        } else if (resource.type === "Energetic") {
            return resource.consommationMax - resource.consommationTotale
        }
        return 0
    }


    return (
        <Card className="p-0">
            <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100 pt-4 pb-4">
                <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg text-blue-800">
                        {t("task.ressource.title", "Resources")}
                    </CardTitle>
                </div>
                <CardDescription>
                    {t("task.ressource.assign_description", "Assign resources to this task based on your project's available resources")}
                </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
                {success && (
                    <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                {error && !selectedResource && !editingResource && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="assigned" className="w-full">
                    <TabsList className="mb-4 w-full">
                        <TabsTrigger value="assigned">
                            {t("task.ressource.tabs.assigned", "Assigned Resources")}
                        </TabsTrigger>
                        <TabsTrigger value="available">
                            {t("task.ressource.tabs.available", "Available Resources")}
                        </TabsTrigger>
                        <TabsTrigger value="statistic">
                            {t("task.ressource.tabs.statistic", "Energetic Allocation")}
                        </TabsTrigger>
                        <TabsTrigger value="timeline">
                            {t("task.ressource.tabs.timeline", "Material Timeline")}
                        </TabsTrigger>
                    </TabsList>



                    <TabsContent value="statistic" className="space-y-4">

                        <div>
                            <TaskResourceStatisticEnergitic
                                task={task}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="timeline" className="space-y-4">
                        <div>
                            <TaskResourceStatisticMaterial
                                task={task}
                            />
                        </div>
                    </TabsContent>


                    <TabsContent value="available" className="space-y-4">
                        {/* Search and filter */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search resources..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e: any) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <select
                                    className="border rounded p-2 text-sm"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="all">{t("task.ressource.filters.all_types", "All Types")}</option>
                                    <option value="Material">{t("task.ressource.filters.material", "Material")}</option>
                                    <option value="Temporal">{t("task.ressource.filters.temporal", "Temporal")}</option>
                                    <option value="Energetic">{t("task.ressource.filters.energetic", "Energetic")}</option>

                                </select>
                            </div>
                        </div>

                        {/* Resources list */}
                        {filteredResources.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border rounded-md bg-slate-50">
                                {t("task.ressource.no_matching_resources", "No resources found matching your criteria")}
                            </div>
                        ) : (
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t("task.ressource.table.name", "Name")}</TableHead>
                                            <TableHead>{t("task.ressource.table.type", "Type")}</TableHead>
                                            <TableHead>{t("task.ressource.table.category", "Category")}</TableHead>
                                            <TableHead>{t("task.ressource.table.available", "Available")}</TableHead>
                                            <TableHead>{t("task.ressource.table.unit_cost", "Unit Cost")}</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredResources.map((resource) => (
                                            <TableRow key={resource.id} className={selectedResource?.id === resource.id ? "bg-blue-50" : ""}>
                                                <TableCell className="font-medium">{resource.nom}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                                        {RESOURCE_TYPE_ICONS[resource.type as keyof typeof RESOURCE_TYPE_ICONS]}
                                                        {resource.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{resource.categorie}</TableCell>
                                                <TableCell>
                                                    {resource.type === "Energetic"
                                                        ? `${resource.consommationMax - resource.consommationTotale} ${resource.unitMeasure}`
                                                        : resource.type === "Material"
                                                            ? `${resource.qteDisponibilite} units`
                                                            : `${resource.qte} ${resource.unitMeasure}`}
                                                </TableCell>
                                                <TableCell>{resource.coutUnitaire}</TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm" onClick={() => handleSelectResource(resource)}>
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Select
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Resource Assignment Dialog */}
                        <Dialog open={!!selectedResource} onOpenChange={(open) => !open && resetForm()}>
                            <DialogContent className="sm:max-w-[500px] overflow-visible">
                                {selectedResource && (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {t("task.ressource.dialog.assign_title", { resource: selectedResource.nom })}
                                            </DialogTitle>
                                            <DialogDescription>
                                                {t("task.ressource.dialog.type", "Type")}: {selectedResource.type} | {t("task.ressource.dialog.category", "Category")}: {selectedResource.categorie}
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="py-4 space-y-4">
                                            {error && (
                                                <Alert variant="destructive">
                                                    <AlertDescription>{error}</AlertDescription>
                                                </Alert>
                                            )}

                                            {/* Quantity field for Material and Temporal */}
                                            {(selectedResource.type === "Material" || selectedResource.type === "Temporal") && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="quantity">Quantity ({selectedResource.unitMeasure || "units"})</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            id="quantity"
                                                            type="number"
                                                            min="1"
                                                            max={getAvailableQuantity(selectedResource)}
                                                            value={quantity}
                                                            onChange={(e: any) => setQuantity(e.target.value)}
                                                            placeholder={`Max: ${getAvailableQuantity(selectedResource)}`}
                                                        />
                                                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                                                            {t("task.ressource.available", "Available")}: {getAvailableQuantity(selectedResource)}{" "}
                                                            {selectedResource.unitMeasure || "units"}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Consumption field for Energetic */}
                                            {selectedResource.type === "Energetic" && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="consumption">
                                                        {t("task.ressource.consumption", { unit: selectedResource.unitMeasure })}
                                                    </Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            id="consumption"
                                                            type="number"
                                                            min="1"
                                                            max={selectedResource.consommationMax - selectedResource.consommationTotale}
                                                            value={consumption}
                                                            onChange={(e: any) => setConsumption(e.target.value)}
                                                            placeholder={`Max: ${selectedResource.consommationMax - selectedResource.consommationTotale}`}
                                                        />
                                                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                                                            {t("task.ressource.available_consumption", "Available")}: {selectedResource.consommationMax - selectedResource.consommationTotale}{" "}
                                                            {selectedResource.unitMeasure}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Date fields for Material */}
                                            {selectedResource.type === "Material" && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="startDate">
                                                            {t("task.ressource.start_date", "Start Date")}
                                                        </Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    id="startDate"
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "w-full justify-start text-left font-normal",
                                                                        !startDate && "text-muted-foreground",
                                                                    )}
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {startDate ? format(startDate, "PPP") : "Select date"}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent
                                                                side="bottom"
                                                                align="start"
                                                                className={cn(
                                                                    " bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden"
                                                                    , "w-auto p-0")}
                                                            >
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={startDate}
                                                                    onSelect={setStartDate}
                                                                    initialFocus
                                                                    disabled={(date: any) => (endDate ? date >= endDate : false)}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="endDate">
                                                            {t("task.ressource.end_date", "End Date")}
                                                        </Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    id="endDate"
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "w-full justify-start text-left font-normal",
                                                                        !endDate && "text-muted-foreground",
                                                                    )}
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {endDate ? format(endDate, "PPP") : t("task.ressource.select_date", "Select date")}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent
                                                                side="bottom"
                                                                align="start"
                                                                className={cn(
                                                                    "w-auto p-0 bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden"
                                                                    , "w-auto p-0")}
                                                            >
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={endDate}
                                                                    onSelect={(date: any) => {
                                                                        if (date) setEndDate(date)
                                                                    }}
                                                                    initialFocus
                                                                    disabled={(date: any) => (startDate ? date < startDate : false)}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <DialogFooter>
                                            <Button variant="outline" onClick={resetForm}>
                                                {t("task.ressource.cancel", "Cancel")}
                                            </Button>
                                            <Button onClick={handleAssignResource} disabled={loading}>
                                                {loading ? t("task.ressource.assigning", "Assigning...") : t("task.ressource.assign_resource", "Assign Resource")}
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    <TabsContent value="assigned">
                        {assignedResources.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border rounded-md bg-slate-50">
                                {t("task.ressource.no_resources_assigned", "No resources assigned to this task yet")}
                            </div>
                        ) : (
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t("task.ressource.table2.resource", "Resource")}</TableHead>
                                            <TableHead>{t("task.ressource.table2.type", "Type")}</TableHead>
                                            <TableHead>{t("task.ressource.table2.details", "Details")}</TableHead>
                                            <TableHead>{t("task.ressource.table2.period", "Period")}</TableHead>
                                            <TableHead className="text-right"></TableHead>

                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assignedResources.map((assignment, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{assignment.ress?.nom || "Unknown Resource"}</TableCell>
                                                <TableCell>
                                                    {assignment.ress?.type && (
                                                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                                            {RESOURCE_TYPE_ICONS[assignment.ress.type as keyof typeof RESOURCE_TYPE_ICONS]}
                                                            {assignment.ress.type}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {assignment.ress?.type === "Energetic"
                                                        ? `Consumption: ${assignment.consommation} ${assignment.ress.unitMeasure}`
                                                        : `Quantity: ${assignment.qte} ${assignment.ress.unitMeasure || "units"}`}
                                                </TableCell>
                                                <TableCell>
                                                    {assignment.dateDebut && assignment.dateFin ? (
                                                        <span>
                                                            {format(new Date(assignment.dateDebut), "MMM d, yyyy")} -{" "}
                                                            {format(new Date(assignment.dateFin), "MMM d, yyyy")}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(assignment)}>
                                                            <Pencil className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(assignment)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>

            {/* Edit Resource Dialog */}
            <Dialog open={!!editingResource} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent className="sm:max-w-[500px] overflow-visible">
                    {editingResource && (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {t("task.ressource.dialog.edit", { resource: editingResource.ress.nom })}
                                </DialogTitle>
                                <DialogDescription>
                                    {t("task.ressource.dialog.type", "Type")}: {editingResource.ress.type} | {t("task.ressource.dialog.category", "Category")}: {editingResource.ress.categorie}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="py-4 space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Quantity field for Material and Temporal */}
                                {(editingResource.ress.type === "Material" || editingResource.ress.type === "Temporal") && (
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-quantity">
                                            {t("task.ressource.dialog.quantity", { unit: editingResource.ress.unitMeasure || "units" })}
                                        </Label>
                                        <Input
                                            id="edit-quantity"
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e: any) => setQuantity(e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Consumption field for Energetic */}
                                {editingResource.ress.type === "Energetic" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-consumption">
                                            {t("task.ressource.dialog.consumption", { unit: editingResource.ress.unitMeasure })}
                                        </Label>

                                        <Input
                                            id="edit-consumption"
                                            type="number"
                                            min="1"
                                            value={consumption}
                                            onChange={(e: any) => setConsumption(e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Date fields for Material */}
                                {editingResource.ress.type === "Material" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-startDate">Start Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        id="edit-startDate"
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !startDate && "text-muted-foreground",
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {startDate ? format(startDate, "PPP") : t("task.ressource.select_date", "Select date")}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    side="bottom"
                                                    align="start"
                                                    className={cn(
                                                        "w-auto p-0 bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden"
                                                        , "w-auto p-0")}
                                                >
                                                    <Calendar
                                                        mode="single"
                                                        selected={startDate}
                                                        onSelect={(date: any) => {
                                                            if (date) setStartDate(date)
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="edit-endDate">
                                                {t("task.ressource.dialog.end_date", "End Date")}
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        id="edit-endDate"
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !endDate && "text-muted-foreground",
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {endDate ? format(endDate, "PPP") : t("task.ressource.select_date", "Select date")}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    side="bottom"
                                                    align="start"
                                                    className={cn(
                                                        "w-auto p-0 bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden"
                                                        , "w-auto p-0")}
                                                >
                                                    <Calendar
                                                        mode="single"
                                                        selected={endDate}
                                                        onSelect={(date: any) => {
                                                            if (date) setEndDate(date)
                                                        }}
                                                        initialFocus
                                                        disabled={(date: any) => (startDate ? date < startDate : false)}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={resetForm}>
                                    {t("task.ressource.cancel", "Cancel")}
                                </Button>
                                <Button onClick={handleEditResource} disabled={loading}>
                                    {loading ? t("task.ressource.updating", "Updating...") : t("task.ressource.update_resource", "Update Resource")}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("task.ressource.alert.are_you_sure", "Are you sure?")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("task.ressource.alert.remove_resource", { resource: resourceToDelete?.ress?.nom })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setResourceToDelete(null)}>{t("common.cancel", "Cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteResource}
                            disabled={loading}
                            className="bg-destructive  hover:bg-destructive/90"
                        >
                            {loading ? t("task.ressource.deleting", "Deleting...") : t("task.ressource.delete", "Delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}