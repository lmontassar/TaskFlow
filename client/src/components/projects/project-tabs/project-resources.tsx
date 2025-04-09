"use client";

import type React from "react";

import { useState } from "react";
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
  Clock,
  Search,
  FileText,
  Filter,
} from "lucide-react";

interface Resource {
  id: string;
  name: string;
  type: "human" | "equipment" | "material" | "software" | "service";
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  notes?: string;
  status: "available" | "allocated" | "pending" | "unavailable";
}

export function ProjectResources() {
  const [resources, setResources] = useState<Resource[]>([
    {
      id: "res-1",
      name: "Senior Developer",
      type: "human",
      quantity: 2,
      unit: "people",
      costPerUnit: 800,
      totalCost: 1600,
      notes: "Frontend specialists with React experience",
      status: "allocated",
    },
    {
      id: "res-2",
      name: "UI/UX Designer",
      type: "human",
      quantity: 1,
      unit: "people",
      costPerUnit: 750,
      totalCost: 750,
      status: "allocated",
    },
    {
      id: "res-3",
      name: "MacBook Pro",
      type: "equipment",
      quantity: 3,
      unit: "units",
      costPerUnit: 2500,
      totalCost: 7500,
      notes: "16-inch, M2 Pro, 32GB RAM",
      status: "available",
    },
    {
      id: "res-4",
      name: "Adobe Creative Cloud",
      type: "software",
      quantity: 2,
      unit: "licenses",
      costPerUnit: 80,
      totalCost: 160,
      notes: "Monthly subscription",
      status: "available",
    },
    {
      id: "res-5",
      name: "Meeting Room",
      type: "service",
      quantity: 1,
      unit: "room",
      costPerUnit: 0,
      totalCost: 0,
      notes: "Main conference room, booked every Monday 10-11 AM",
      status: "allocated",
    },
    {
      id: "res-6",
      name: "Design Assets",
      type: "material",
      quantity: 1,
      unit: "package",
      costPerUnit: 350,
      totalCost: 350,
      notes: "Premium UI kit and icon set",
      status: "pending",
    },
    {
      id: "res-7",
      name: "Cloud Hosting",
      type: "service",
      quantity: 1,
      unit: "subscription",
      costPerUnit: 200,
      totalCost: 200,
      notes: "AWS hosting for development environment",
      status: "available",
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState<Omit<Resource, "id" | "totalCost">>({
    name: "",
    type: "human",
    quantity: 1,
    unit: "",
    costPerUnit: 0,
    status: "available",
    notes: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "quantity" || name === "costPerUnit"
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

  const resetForm = () => {
    setFormData({
      name: "",
      type: "human",
      quantity: 1,
      unit: "",
      costPerUnit: 0,
      status: "available",
      notes: "",
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (resource: Resource) => {
    setCurrentResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      quantity: resource.quantity,
      unit: resource.unit,
      costPerUnit: resource.costPerUnit,
      status: resource.status,
      notes: resource.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (resource: Resource) => {
    setCurrentResource(resource);
    setIsDeleteDialogOpen(true);
  };

  const handleAddResource = () => {
    const newResource: Resource = {
      id: `res-${Date.now()}`,
      ...formData,
      totalCost: formData.quantity * formData.costPerUnit,
    };

    setResources([...resources, newResource]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditResource = () => {
    if (!currentResource) return;

    const updatedResource: Resource = {
      ...currentResource,
      ...formData,
      totalCost: formData.quantity * formData.costPerUnit,
    };

    setResources(
      resources.map((res) =>
        res.id === currentResource.id ? updatedResource : res
      )
    );
    setIsEditDialogOpen(false);
    setCurrentResource(null);
    resetForm();
  };

  const handleDeleteResource = () => {
    if (!currentResource) return;

    setResources(resources.filter((res) => res.id !== currentResource.id));
    setIsDeleteDialogOpen(false);
    setCurrentResource(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
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
    switch (status) {
      case "available":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Available
          </Badge>
        );
      case "allocated":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Allocated
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "unavailable":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Unavailable
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate total cost
  const totalCost = resources.reduce(
    (sum, resource) => sum + resource.totalCost,
    0
  );

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.notes || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || resource.type === filterType;
    return matchesSearch && matchesType;
  });

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
                  className="w-full pl-8 sm:w-[300px]"
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
                    Human Resources {filterType === "human" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("equipment")}>
                    Equipment {filterType === "equipment" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("material")}>
                    Materials {filterType === "material" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("software")}>
                    Software {filterType === "software" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("service")}>
                    Services {filterType === "service" && "✓"}
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
                  <TableHead>Cost Per Unit</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{resource.name}</div>
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
                        {resource.quantity} {resource.unit}
                      </TableCell>
                      <TableCell>
                        ${resource.costPerUnit.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${resource.totalCost.toLocaleString()}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
            <DialogDescription>
              Add a new resource to the project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name" className="mb-2">
                  Resource Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter resource name"
                />
              </div>
              <div>
                <Label htmlFor="type" className="mb-2">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="human">Human</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status" className="mb-2">
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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="allocated">Allocated</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity" className="mb-2">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="unit" className="mb-2">
                  Unit
                </Label>
                <Input
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="e.g., hours, licenses, units"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="costPerUnit" className="mb-2">
                  Cost Per Unit ($)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="costPerUnit"
                    name="costPerUnit"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-8"
                    value={formData.costPerUnit}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes" className="mb-2">
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>Update resource details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit-name">Resource Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter resource name"
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="human">Human</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="allocated">Allocated</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="edit-unit">Unit</Label>
                <Input
                  id="edit-unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="e.g., hours, licenses, units"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-costPerUnit">Cost Per Unit ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-costPerUnit"
                    name="costPerUnit"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-8"
                    value={formData.costPerUnit}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-notes">Notes (Optional)</Label>
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
        <DialogContent className="sm:max-w-[425px]">
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
                <div className="font-medium">{currentResource.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {currentResource.quantity} {currentResource.unit} · $
                  {currentResource.totalCost.toLocaleString()}
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
