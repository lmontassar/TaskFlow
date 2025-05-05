import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Database } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function NecessaryRessource(
    {
        canEdit,
        handleAddResource,
        resources,
        RESOURCE_TYPE_ICONS,
        RESOURCE_TYPES,
        handleEditResource,
        handleDeleteResource,
        isDialogOpen,
        setIsDialogOpen,
        isEditing,
        setName,
        resourceType,
        setResourceType,
        setResourceCategory,
        resourceCategory,
        qte,
        name,
        getCategoriesForType,
        setQuantity,
        handleSaveResource
    }: any
) {
    const { t } = useTranslation();
    return (
        <Card className="p-0">
            <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100 pt-4 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg text-blue-800">
                            {t("task.necessary_ressource.title", "Necessary Resources")}
                        </CardTitle>
                    </div>
                    {canEdit && (
                        <Button variant="outline" size="sm" onClick={handleAddResource} className="bg-white hover:bg-blue-50">
                            <Plus className="h-4 w-4 mr-1" />
                            {t("task.necessary_ressource.add", "Add Resource")}
                        </Button>
                    )}

                </div>
                <CardDescription>
                    {t("task.necessary_ressource.description", "Manage resources needed for this task")}
                </CardDescription>
            </CardHeader>

            <CardContent className="">
                <div className="space-y-6 mb-6">
                    <div>
                        {resources.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border rounded-md bg-slate-50">
                                {t("task.necessary_ressource.no_resources", "No resources added yet")}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("task.necessary_ressource.name", "Name")}</TableHead>
                                        <TableHead>{t("task.necessary_ressource.type", "Type")}</TableHead>
                                        <TableHead>{t("task.necessary_ressource.category", "Category")}</TableHead>
                                        <TableHead>{t("task.necessary_ressource.details", "Details")}</TableHead>
                                        {canEdit && (
                                            <TableHead className="text-right">
                                                {/* {t("task.necessary_ressource.actions", "Actions")} */}
                                            </TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {resources.map((resource: any) => (
                                        <TableRow key={resource.id}>
                                            <TableCell className="font-medium">{resource.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                                    {RESOURCE_TYPE_ICONS[resource.type]}
                                                    {t(`task.global_resource.${resource.type}`)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{resource.categorie}</TableCell>
                                            <TableCell>
                                                {resource.type === RESOURCE_TYPES.ENERGETIC
                                                    ? `${t("task.necessary_ressource.consumption", "Consumption")}: ${resource.qte}`
                                                    : `${t("task.necessary_ressource.qte", "Quantity")}: ${resource.qte}`}
                                            </TableCell>
                                            {canEdit && (
                                                <TableCell className="text-right">

                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditResource(resource)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteResource(resource.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    {/* Resource Affected section will be added later as requested */}
                </div>
            </CardContent>

            {/* Dialog for adding/editing resources */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing
                                ? t("task.necessary_ressource.edit_resource", "Edit Resource")
                                : t("task.necessary_ressource.add_resource", "Add Resource")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("task.necessary_ressource.dialog_description", "Fill in the details for this resource")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="resource-name">{t("task.necessary_ressource.name", "Name")}</Label>
                            <Input
                                id="resource-name"
                                value={name}
                                onChange={(e: any) => setName(e.target.value)}
                                placeholder={t("task.necessary_ressource.name_placeholder", "Enter resource name")}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="resource-type">{t("task.necessary_ressource.type", "Type")}</Label>
                            <Select
                                value={resourceType}
                                onValueChange={(value: any) => {
                                    setResourceType(value)
                                    setResourceCategory("")
                                }}
                            >
                                <SelectTrigger id="resource-type">
                                    <SelectValue placeholder={t("task.necessary_ressource.select_type", "Select type")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(RESOURCE_TYPES).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            <div className="flex items-center gap-2">
                                                {RESOURCE_TYPE_ICONS[type]}
                                                {t(`task.global_resource.${type}`)}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {resourceType && (
                            <div className="grid gap-2">
                                <Label htmlFor="resource-categorie">{t("task.necessary_ressource.category", "Category")}</Label>
                                <Select value={resourceCategory} onValueChange={setResourceCategory}>
                                    <SelectTrigger id="resource-categorie">
                                        <SelectValue placeholder={t("task.necessary_ressource.select_category", "Select category")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getCategoriesForType(resourceType).map((categorie: any) => (
                                            <SelectItem key={categorie} value={categorie}>
                                                {categorie}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {resourceType === RESOURCE_TYPES.ENERGETIC ? (
                            <div className="grid gap-2">
                                <Label htmlFor="resource-consumption">
                                    {t("task.necessary_ressource.total_consumption", "Total Consumption")}
                                </Label>
                                <Input
                                    id="resource-consumption"
                                    value={qte}
                                    onChange={(e: any) => setQuantity(e.target.value)}
                                    placeholder={t("task.necessary_ressource.consumption_placeholder", "e.g. 500 kWh")}
                                />
                            </div>
                        ) : (
                            resourceType && (
                                <div className="grid gap-2">
                                    <Label htmlFor="resource-qte">{t("task.necessary_ressource.qte", "Quantity")}</Label>
                                    <Input
                                        id="resource-qte"
                                        value={qte}
                                        onChange={(e: any) => setQuantity(e.target.value)}
                                        placeholder={t("task.necessary_ressource.qte_placeholder", "e.g. 10 units")}
                                    />
                                </div>
                            )
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            {t("common.cancel", "Cancel")}
                        </Button>
                        <Button
                            onClick={handleSaveResource}
                            disabled={
                                !name ||
                                !resourceType ||
                                !resourceCategory ||
                                !qte
                            }
                        >
                            {isEditing
                                ? t("task.necessary_ressource.update", "Update")
                                : t("task.necessary_ressource.save", "Save")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}