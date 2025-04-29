"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  DollarSign,
  Users,
  Laptop,
  Briefcase,
  FileText,
  Clock,
  Search,
  Filter,
  PlusIcon,
  DoorOpen,
  Eye,
} from "lucide-react";
import useResources from "../../../hooks/useResources";
import { useTranslation } from "react-i18next";

interface Resource {
  id: string;
  nom: string;
  type: string;
  categorie: string;
  qte: number;
  unitMeasure?: string;
  unit?: string;
  coutUnitaire: number;
  notes?: string;
  newcategorie?: string;
  status: "AVAILABLE" | "ALLOCATED" | "PENDING" | "UNAVAILABLE";
  qteDisponibilite?: number;
  consommationTotale?: number;
  consommationMax?: number;
  utilisationTotale?: number;
}

const initialFormData = {
  nom: "",
  type: "",
  qte: 1,
  categorie: "",
  unitMeasure: "",
  utilisationTotale: 0,
  qteDisponibilite: 0,
  consommationTotale: 0,
  consommationMax: 0,
  coutUnitaire: 0,
  status: "AVAILABLE",
  notes: "",
  newcategorie: "",
};

export function ProjectResources({ project }: { project: any }) {
  const { t } = useTranslation();
  const [resources, setResources] = useState<Resource[]>(
    project.listeRessource || []
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [formData, setFormData] =
  useState<typeof initialFormData>(initialFormData);

  useEffect(() => {
    setResources( project.listeRessource || []);
  }, [project.listeRessource]);
  // Get unique categories using a Set
  const uniqueCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    resources.forEach((resource) => {
      if (resource.categorie) {
        categoriesSet.add(resource.categorie);
      }
    });
    return Array.from(categoriesSet);
  }, [resources]);

  
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const { createResource, editResource, deleteResource } = useResources();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: [
        "qte",
        "coutUnitaire",
        "qteDisponibilite",
        "consommationMax",
      ].includes(name)
        ? Number.parseFloat(value) || 0
        : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => setFormData(initialFormData);

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };
  const openDialog = (resource: Resource) => {
    setCurrentResource(resource);
    setIsOpenDialog(true);
  };
  const openEditDialog = (resource: Resource) => {
    setCurrentResource(resource);
    setFormData({
      ...initialFormData,
      nom: resource.nom,
      type: resource.type,
      qte: resource.qte,
      unitMeasure: resource.unitMeasure || "",
      unit: resource.unit || "",
      coutUnitaire: resource.coutUnitaire,
      categorie: resource.categorie,
      status: resource.status,
      notes: resource.notes || "",
      qteDisponibilite: resource.qteDisponibilite || 0,
      consommationMax: resource.consommationMax || 0,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (resource: Resource) => {
    setCurrentResource(resource);
    setIsDeleteDialogOpen(true);
  };
  const validateForm = () => {
    const requiredFields = ["nom", "type", "coutUnitaire"];
    if (formData.type === "Temporal" || formData.type === "Energetic") {
      requiredFields.push("unitMeasure");
    } else if (formData.type === "Material") {
      requiredFields.push("qteDisponibilite");
    }
    for (const field of requiredFields) {
      if (!formData[field]) {
        return false;
      }
    }
    return true;
  };
  const handleAddResource = async () => {
    const resourceData = {
      ...formData,
      projectId: project.id,
      categorie:
        formData.categorie === "other"
          ? formData.newcategorie
          : formData.categorie,
    };

    try {
      const newResource = await createResource(resourceData);
      if (newResource) {
        await setResources((prev) => [...prev, newResource]);

        setIsAddDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error adding resource:", error);
    }
  };
  const handleEditResource = async () => {
    if (!validateForm()) {
      return;
    }
    if (!currentResource) return;

    const updatedResource: any = {
      ...currentResource,
      ...formData,
      projectId: project.id,
      categorie:
        formData.categorie === "other"
          ? formData.newcategorie!
          : formData.categorie,
    };
    console.log("Updated Resource:", updatedResource);
    try {
      const update = await editResource(updatedResource);
      if (update) {
        setResources(
          resources.map((res) =>
            res.id === currentResource.id ? updatedResource : res
          )
        );
        setIsEditDialogOpen(false);
        setCurrentResource(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error adding resource:", error);
    }
  };

  const handleDeleteResource = async () => {
    if (!currentResource) return;
    currentResource.projectId = project.id;
    try {
      const deleted = await deleteResource(currentResource);
      if (deleted) {
        setResources(resources.filter((res) => res.id !== currentResource.id));
        setIsDeleteDialogOpen(false);
        setCurrentResource(null);
      }
    } catch (error) {
      console.error("Error adding resource:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "human":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "equipment":
        return <Laptop className="h-4 w-4 text-green-500" />;
      case "material":
        return <Briefcase className="h-4 w-4 text-orange-500" />;
      case "software":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "service":
        return <Clock className="h-4 w-4 text-red-500" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: {
        className: "bg-green-50 text-green-700 border-green-200",
        label: t("resource.available"),
      },
      allocated: {
        className: "bg-blue-50 text-blue-700 border-blue-200",
        label: t("resource.allocated"),
      },
      pending: {
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
        label: t("resource.pending"),
      },
      unavailable: {
        className: "bg-red-50 text-red-700 border-red-200",
        label: t("resource.unavailable"),
      },
    };

    const statusKey = status.toLowerCase() as keyof typeof statusMap;
    const statusInfo = statusMap[statusKey] || { className: "", label: status };

    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  // Calculate total cost
  const totalCost = useMemo(() => {
    return resources.reduce(
      (sum, resource) =>
        sum +
        resource.coutUnitaire *
          (resource?.qte ?? resource?.consommationMax ?? 0),
      0
    );
  }, [resources]);

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.notes || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesType =
        !filterType || resource.type.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [resources, searchQuery, filterType]);

  useEffect(() => {
    if (formData.categorie && formData.categorie !== "other") {
      const matchedResource = resources.find(
        (res) => res.categorie === formData.categorie
      );
      if (matchedResource?.type) {
        setFormData((prev) => ({
          ...prev,
          type: matchedResource.type,
        }));
      }
    }
  }, [formData.categorie, resources]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("resource.title")}</CardTitle>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            {t("resource.add_resource")}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("resource.search")}
                  className="w-full pl-8 sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterType(null)}>
                    {t("resource.all_types")} {!filterType && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterType("human")}>
                    {t("resource.temporal")} {filterType === "temporal" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("equipment")}>
                    {t("resource.energetic")}{" "}
                    {filterType === "energetic" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("material")}>
                    {t("resource.material")} {filterType === "material" && "✓"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("resource.total_cost")}:
              </span>
              <span className="font-medium">${totalCost.toLocaleString()}</span>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("resource.resource")}</TableHead>
                  <TableHead>{t("resource.type")}</TableHead>

                  <TableHead>{t("resource.cost_per_unit")}</TableHead>
                  <TableHead>{t("resource.total_cost")}</TableHead>
                  <TableHead>{t("resource.status")}</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <TableRow
                      key={resource.id}
                      onDoubleClick={() => openDialog(resource)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium truncate max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap">
                            {resource.nom}
                          </div>
                          {resource.notes && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap">
                              {resource.notes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(resource.type)}
                          <span className="capitalize">{resource.type}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        ${resource.coutUnitaire.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        $
                        {(
                          resource.qte * resource.coutUnitaire ||
                          resource?.consommationMax * resource.coutUnitaire
                        ).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(resource.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openDialog(resource)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openEditDialog(resource)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => openDeleteDialog(resource)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {t("resource.no_resources")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Open Resource Dialog */}
      {isOpenDialog && (
        <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl truncate max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap">
                {currentResource?.nom}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {getTypeIcon(currentResource?.type)}
                  <span className="capitalize">{currentResource?.type}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                {getStatusBadge(currentResource?.status)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-md border">
                <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Resource ID
                    </h4>
                    <p
                      className="mt-1 truncate max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap"
                      title={currentResource?.id}
                    >
                      {currentResource?.id}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Type
                    </h4>
                    <p className="mt-1 flex items-center gap-1 capitalize">
                      {getTypeIcon(currentResource?.type)}
                      {currentResource?.type}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Status
                    </h4>
                    <p className="mt-1">
                      {getStatusBadge(currentResource?.status)}
                    </p>
                  </div>
                  {currentResource.type == "Material" && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        {t("resource.allocated_quantity")}
                      </h4>
                      <p className="mt-1">
                        {currentResource?.qteDisponibilite}{" "}
                        {currentResource?.unitMeasure}
                      </p>
                    </div>
                  )}
                  {currentResource.type == "Energetic" ? (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {t("resource.add_resource_form.maximum_consumption")}
                        </h4>
                        <p className="mt-1">
                          {currentResource?.consommationMax}{" "}
                          {currentResource?.unitMeasure}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {t("resource.add_resource_form.total_consumption")}
                        </h4>
                        <p className="mt-1">
                          {currentResource?.consommationTotale}{" "}
                          {currentResource?.unitMeasure}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        {t("resource.quantity")}
                      </h4>
                      <p className="mt-1">
                        {currentResource?.qte ||
                          currentResource?.consommationMax}{" "}
                        {currentResource?.unitMeasure}
                      </p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Cost Per Unit
                    </h4>
                    <p className="mt-1">
                      ${currentResource?.coutUnitaire.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Total Cost
                    </h4>
                    <p className="mt-1 font-medium">
                      $
                      {(
                        (currentResource?.qte ||
                          currentResource?.consommationMax) *
                        currentResource?.coutUnitaire
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {currentResource.notes && (
                <div className="rounded-md border p-4">
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="break-words whitespace-pre-wrap text-sm max-w-[calc(var(--container-md)-5rem)]">
                    {currentResource.notes}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Add Resource Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("resource.add_resource_form.title")}</DialogTitle>
            <DialogDescription>
              {t("resource.add_resource_form.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2" htmlFor="categorie">
                  {t("resource.add_resource_form.categorie")}
                </Label>
                <Select
                  value={formData.categorie}
                  onValueChange={(value) =>
                    handleSelectChange("categorie", value)
                  }
                >
                  <SelectTrigger id="categorie">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">
                      <div className="flex items-center">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        {t("resource.add_resource_form.add_new_categorie")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.categorie === "other" && (
                <div>
                  <Label className="mb-2" htmlFor="newcategorie">
                    {t("resource.add_resource_form.new_categorie")}
                  </Label>
                  <Input
                    id="newcategorie"
                    name="newcategorie"
                    value={formData.newcategorie}
                    onChange={handleInputChange}
                    placeholder="Enter new category"
                  />
                </div>
              )}
              <div className="col-span-2">
                <Label className="mb-2" htmlFor="nom">
                  {t("resource.name")}
                </Label>
                <Input
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  placeholder={t("resource.add_resource_form.name_placeholder")}
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="type">
                  {t("resource.type")}
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                  disabled={
                    formData.categorie !== "other" && formData.categorie !== ""
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue
                      placeholder={t(
                        "resource.add_resource_form.type_placeholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Temporal">
                      {t("resource.temporal")}
                    </SelectItem>
                    <SelectItem value="Material">
                      {t("resource.material")}
                    </SelectItem>
                    <SelectItem value="Energetic">
                      {t("resource.energetic")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type !== "Energetic" && (
                <div>
                  <Label className="mb-2" htmlFor="qte">
                    {t("resource.quantity")}
                  </Label>
                  <Input
                    id="qte"
                    name="qte"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.qte}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              {formData.type === "Energetic" && (
                <div>
                  <Label className="mb-2" htmlFor="consommationMax">
                    {t("resource.add_resource_form.maximum_consumption")}
                  </Label>
                  <Input
                    id="consommationMax"
                    name="consommationMax"
                    value={formData.consommationMax}
                    onChange={handleInputChange}
                    placeholder="e.g., 10, 20, 30"
                    type="number"
                    min="0"
                  />
                </div>
              )}
              <div className="col-span-2">
                {(formData.type === "Temporal" ||
                  formData.type === "Energetic") && (
                  <>
                    <Label className="mb-2" htmlFor="unitMeasure">
                      {t("resource.add_resource_form.unit")}
                    </Label>
                    <Input
                      id="unitMeasure"
                      name="unitMeasure"
                      value={formData.unitMeasure}
                      onChange={handleInputChange}
                      placeholder="e.g., hours, licenses, kWh"
                    />
                  </>
                )}
              </div>

              <div className={"col-span-2"}>
                <Label className="mb-2" htmlFor="coutUnitaire">
                  {t("resource.cost_per_unit")} ($)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="coutUnitaire"
                    name="coutUnitaire"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-8"
                    value={formData.coutUnitaire}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <Label className="mb-2" htmlFor="notes">
                  {t("resource.add_resource_form.notes_optional")}
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={t(
                    "resource.add_resource_form.notes_placeholder"
                  )}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddResource}>Add Resource</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("resource.add_resource_form.edit_title")}
            </DialogTitle>
            <DialogDescription>
              {t("resource.add_resource_form.edit_description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2" htmlFor="edit-categorie">
                  {t("resource.add_resource_form.categorie")}
                </Label>
                <Select
                  value={formData.categorie}
                  onValueChange={(value) =>
                    handleSelectChange("categorie", value)
                  }
                >
                  <SelectTrigger id="edit-categorie">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">
                      <div className="flex items-center">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        {t("resource.add_resource_form.new_categorie")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.categorie === "other" && (
                <div>
                  <Label className="mb-2" htmlFor="edit-newcategorie">
                    {t("resource.add_resource_form.new_categorie")}
                  </Label>
                  <Input
                    id="edit-newcategorie"
                    name="newcategorie"
                    value={formData.newcategorie}
                    onChange={handleInputChange}
                    placeholder={t(
                      "resource.add_resource_form.new_categorie_placeholder"
                    )}
                  />
                </div>
              )}
              <div className="col-span-2">
                <Label className="mb-2" htmlFor="edit-nom">
                  {t("resource.name")}
                </Label>
                <Input
                  id="edit-nom"
                  name="nom"
                  className={formData.nom ? "" : "border-destructive"}
                  value={formData.nom}
                  onChange={handleInputChange}
                  placeholder={t("resource.add_resource_form.name_placeholder")}
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="edit-type">
                  {t("resource.type")}
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                  disabled={
                    formData.categorie !== "other" && formData.categorie !== ""
                  }
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue
                      placeholder={t(
                        "resource.add_resource_form.type_placeholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Temporal">
                      {t("resource.temporal")}
                    </SelectItem>
                    <SelectItem value="Material">
                      {t("resource.material")}
                    </SelectItem>
                    <SelectItem value="Energetic">
                      {t("resource.energetic")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2" htmlFor="edit-status">
                  {t("resource.status")}
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">
                      {t("resource.available")}
                    </SelectItem>
                    <SelectItem value="ALLOCATED">
                      {t("resource.allocated")}
                    </SelectItem>
                    <SelectItem value="PENDING">
                      {t("resource.pending")}
                    </SelectItem>
                    <SelectItem value="UNAVAILABLE">
                      {t("resource.unavailable")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type !== "Energetic" && (
                <div>
                  <Label className="mb-2" htmlFor="edit-qte">
                    {t("resource.quantity")}
                  </Label>
                  <Input
                    id="edit-qte"
                    className={formData.qte ? "" : "border-destructive"}
                    name="qte"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.qte}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              {formData.type === "Energetic" && (
                <>
                  <div>
                    <Label className="mb-2" htmlFor="edit-consommationMax">
                      {t("resource.add_resource_form.maximum_consumption")}
                    </Label>
                    <Input
                      id="edit-consommationMax"
                      name="consommationMax"
                      value={formData.consommationMax}
                      className={
                        formData.consommationMax ? "" : "border-destructive"
                      }
                      onChange={handleInputChange}
                      placeholder="e.g., 10, 20, 30"
                      type="number"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label className="mb-2" htmlFor="edit-consommationTotale">
                      {t("resource.add_resource_form.total_consumption")}
                    </Label>
                    <Input
                      id="edit-consommationTotale"
                      name="consommationTotale"
                      value={formData.consommationTotale}
                      className={
                        formData.consommationTotale ? "" : "border-destructive"
                      }
                      onChange={handleInputChange}
                      placeholder="e.g., 10, 20, 30"
                      type="number"
                      min="0"
                    />
                  </div>
                </>
              )}
              <div>
                {formData.type === "Temporal" ||
                formData.type === "Energetic" ? (
                  <>
                    <Label className="mb-2" htmlFor="edit-unitMeasure">
                      {t("resource.add_resource_form.unit")}
                    </Label>
                    <Input
                      id="edit-unitMeasure"
                      className={
                        formData.unitMeasure ? "" : "border-destructive"
                      }
                      name="unitMeasure"
                      value={formData.unitMeasure}
                      onChange={handleInputChange}
                      placeholder="e.g., hours, licenses, units"
                    />
                  </>
                ) : (
                  <>
                    <Label className="mb-2" htmlFor="edit-qteDisponibilite">
                      {t("resource.add_resource_form.available_quantity")}
                    </Label>
                    <Input
                      id="edit-qteDisponibilite"
                      name="qteDisponibilite"
                      className={
                        formData.qteDisponibilite ? "" : "border-destructive"
                      }
                      value={formData.qteDisponibilite}
                      onChange={handleInputChange}
                      placeholder="e.g., 100, 50, 25"
                      type="number"
                      min="0"
                    />
                  </>
                )}
              </div>
              <div
                className={
                  formData.type === "Material" ? "col-span-1" : "col-span-2"
                }
              >
                <Label className="mb-2" htmlFor="edit-coutUnitaire">
                  {t("resource.cost_per_unit")} ($)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-coutUnitaire"
                    unitMeasure
                    name="coutUnitaire"
                    className={`pl-8  ${
                      formData.coutUnitaire ? "" : "border-destructive"
                    }`}
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.coutUnitaire}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <Label className="mb-2" htmlFor="edit-notes">
                  {t("resource.add_resource_form.notes_optional")}
                </Label>
                <Input
                  id="edit-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={t(
                    "resource.add_resource_form.notes_placeholder"
                  )}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditResource}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Resource</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this resource? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentResource && (
              <div className="rounded-md border p-4">
                <div className="font-medium">{currentResource.nom}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {currentResource.qte}{" "}
                  {currentResource.unitMeasure || currentResource.unit} · $
                  {currentResource.coutUnitaire.toLocaleString()}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteResource}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
