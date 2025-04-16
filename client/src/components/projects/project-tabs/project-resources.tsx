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
} from "lucide-react";
import useResources from "../../../hooks/useResources";

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
    const requiredFields = ["nom", "type", "categorie", "coutUnitaire"];
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
        setResources((prev) => [...prev, newResource]);
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
        label: "Available",
      },
      allocated: {
        className: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Allocated",
      },
      pending: {
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
        label: "Pending",
      },
      unavailable: {
        className: "bg-red-50 text-red-700 border-red-200",
        label: "Unavailable",
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
      (sum, resource) => sum + resource.coutUnitaire * resource.qte,
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
          <CardTitle>Project Resources</CardTitle>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search resources..."
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
                    All Types {!filterType && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterType("human")}>
                    Temporal {filterType === "temporal" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("equipment")}>
                    Energetic {filterType === "energetic" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("material")}>
                    Materials {filterType === "material" && "✓"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total Cost:</span>
              <span className="font-medium">${totalCost.toLocaleString()}</span>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Allocated Quantity</TableHead>
                  <TableHead>Cost Per Unit</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{resource.nom}</div>
                          {resource.notes && (
                            <div className="text-xs text-muted-foreground">
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
                        {resource.qte} {resource.unit || resource.unitMeasure}
                      </TableCell>
                      <TableCell>
                        {resource.qte - (resource?.qteDisponibilite || 0)}{" "}
                        {resource.unit || resource.unitMeasure}
                      </TableCell>
                      <TableCell>
                        ${resource.coutUnitaire.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        $
                        {(
                          resource.qte * resource.coutUnitaire
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
                      No resources found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Resource Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
            <DialogDescription>
              Add a new resource to the project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2" htmlFor="categorie">
                  Resource Category
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
                        Add new category
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.categorie === "other" && (
                <div>
                  <Label className="mb-2" htmlFor="newcategorie">
                    New Category
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
                  Resource Name
                </Label>
                <Input
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  placeholder="Enter resource name"
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="type">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                  disabled={
                    formData.categorie !== "other" && formData.categorie !== ""
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Temporal">Temporal</SelectItem>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Energetic">Energetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2" htmlFor="status">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="ALLOCATED">Allocated</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2" htmlFor="qte">
                  Quantity
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
              <div>
                {formData.type === "Temporal" ||
                formData.type === "Energetic" ? (
                  <>
                    <Label className="mb-2" htmlFor="unitMeasure">
                      Unit
                    </Label>
                    <Input
                      id="unitMeasure"
                      name="unitMeasure"
                      value={formData.unitMeasure}
                      onChange={handleInputChange}
                      placeholder="e.g., hours, licenses, kWh"
                    />
                  </>
                ) : (
                  <>
                    <Label className="mb-2" htmlFor="qteDisponibilite">
                      Available Quantity
                    </Label>
                    <Input
                      id="qteDisponibilite"
                      name="qteDisponibilite"
                      value={formData.qteDisponibilite}
                      onChange={handleInputChange}
                      placeholder="e.g., 100, 50, 25"
                      type="number"
                      min="0"
                    />
                  </>
                )}
              </div>
              {formData.type === "Material" && (
                <div>
                  <Label className="mb-2" htmlFor="consommationMax">
                    Maximum Consumption
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
              <div
                className={
                  formData.type === "Material" ? "col-span-1" : "col-span-2"
                }
              >
                <Label className="mb-2" htmlFor="coutUnitaire">
                  Cost Per Unit ($)
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
                  Notes (Optional)
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional details about this resource"
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
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>Update resource details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2" htmlFor="edit-categorie">
                  Resource Category
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
                        Add new category
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.categorie === "other" && (
                <div>
                  <Label className="mb-2" htmlFor="edit-newcategorie">
                    New Category
                  </Label>
                  <Input
                    id="edit-newcategorie"
                    name="newcategorie"
                    value={formData.newcategorie}
                    onChange={handleInputChange}
                    placeholder="Enter new category"
                  />
                </div>
              )}
              <div className="col-span-2">
                <Label className="mb-2" htmlFor="edit-nom">
                  Resource Name
                </Label>
                <Input
                  id="edit-nom"
                  name="nom"
                  className={formData.nom ? "" : "border-destructive"}
                  value={formData.nom}
                  onChange={handleInputChange}
                  placeholder="Enter resource name"
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="edit-type">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  disabled={
                    formData.categorie !== "other" && formData.categorie !== ""
                  }
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Temporal">Temporal</SelectItem>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Energetic">Energetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2" htmlFor="edit-status">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="ALLOCATED">Allocated</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2" htmlFor="edit-qte">
                  Quantity
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

              <div>
                {formData.type === "Temporal" ||
                formData.type === "Energetic" ? (
                  <>
                    <Label className="mb-2" htmlFor="edit-unitMeasure">
                      Unit
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
                      Available Quantity
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
              {formData.type === "Material" && (
                <div>
                  <Label className="mb-2" htmlFor="edit-consommationMax">
                    Maximum Consumption
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
              )}
              <div
                className={
                  formData.type === "Material" ? "col-span-1" : "col-span-2"
                }
              >
                <Label className="mb-2" htmlFor="edit-coutUnitaire">
                  Cost Per Unit ($)
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
                  Notes (Optional)
                </Label>
                <Input
                  id="edit-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional details about this resource"
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
