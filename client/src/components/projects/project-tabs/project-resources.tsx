"use client";

import type React from "react";
import { useEffect, useState, useMemo, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Plus,
  Users,
  Laptop,
  Briefcase,
  FileText,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import useResources from "../../../hooks/useResources";
import { useTranslation } from "react-i18next";
import AddResource from "../../ui/AddResource";
import ResourceDetail from "../../ui/ResourceDetail";
import EditResource from "../../ui/EditResource";
import ResourcesTable from "../../ui/ResourcesTable";
import { Context } from "../../../App";
import hasPermission from "../../../utils/authz";

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
  const { user } = useContext(Context);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [formData, setFormData] =
    useState<typeof initialFormData>(initialFormData);

  useEffect(() => {
    setResources(project.listeRessource || []);
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
  let isAllowedToModifieResource = false;
  let role = "memeber";
  if (project?.createur?.id === user?.id) {
    role = "creator";
  }
  if (hasPermission(role, "edit", "resource")) {
    isAllowedToModifieResource = true;
  }

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
    if (formData.type === "Temporary" || formData.type === "Energetic") {
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
          {isAllowedToModifieResource && (
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              {t("resource.add_resource")}
            </Button>
          )}
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
                    {t("resource.temporary")}{" "}
                    {filterType === "temporary" && "✓"}
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
          {/* Resources Table */}
          <ResourcesTable
            permession={isAllowedToModifieResource}
            filteredResources={filteredResources}
            t={t}
            openDialog={openDialog}
            openEditDialog={openEditDialog}
            openDeleteDialog={openDeleteDialog}
            getTypeIcon={getTypeIcon}
            getStatusBadge={getStatusBadge}
          />
        </CardContent>
      </Card>
      {/* Open Resource Dialog */}
      {isOpenDialog && (
        <ResourceDetail
          currentResource={currentResource}
          isOpenDialog={isOpenDialog}
          setIsOpenDialog={setIsOpenDialog}
          t={t}
          getTypeIcon={getTypeIcon}
          getStatusBadge={getStatusBadge}
        />
      )}
      {/* Add Resource Dialog */}
      <AddResource
        formData={formData}
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        handleAddResource={handleAddResource}
        handleSelectChange={handleSelectChange}
        uniqueCategories={uniqueCategories}
        handleInputChange={handleInputChange}
        t={t}
      />
      {/* Edit Resource Dialog */}
      <EditResource
        formData={formData}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        handleEditResource={handleEditResource}
        handleSelectChange={handleSelectChange}
        uniqueCategories={uniqueCategories}
        handleInputChange={handleInputChange}
        t={t}
      />

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
