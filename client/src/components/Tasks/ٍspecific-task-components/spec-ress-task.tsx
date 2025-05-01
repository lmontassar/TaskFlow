import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
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
import { Plus, Pencil, Trash2, Database, Clock, Package } from "lucide-react"
import useNessasaryRess from "../../../hooks/useNecessaryRess"
import ConfirmAlert from "../../ui/confirm_alert"
import NecessaryRessource from "./spec-ress-task/necessary-ressource"
import RessourceSpecifiTask from "./spec-ress-task/ressource"


// Resource type icons

interface Props {
  task: any
  setTask: (task: any) => void
}


export default function SpecificRessourcesTask({ task, setTask }: Props) {
  const { t } = useTranslation()
  const [resources, setResources] = useState<any>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentResource, setCurrentResource] = useState<any>(null)
  const [necessaryToDelete, setNecessaryToDelete] = useState<any>(null);
  const { AddNecessaryRessource, EdiNecessaryRessource, deleteNecessaryRessource } = useNessasaryRess()

  // Resource types and their categories
  // const RESOURCE_TYPES = {
  //   ENERGETIC: t("task.global_resource.energetic", "Energetic"),
  //   TEMPORARY: t("task.global_resource.temporal", "Temporal"),
  //   MATERIAL: t("task.global_resource.material", "Material"),
  // }
  const RESOURCE_TYPES = {
    ENERGETIC:  "Energetic",
    TEMPORARY: "Temporal",
    MATERIAL:  "Material",
  }
  const RESOURCE_TYPE_ICONS = {
    [RESOURCE_TYPES.ENERGETIC]: <Database className="h-4 w-4" />,
    [RESOURCE_TYPES.TEMPORARY]: <Clock className="h-4 w-4" />,
    [RESOURCE_TYPES.MATERIAL]: <Package className="h-4 w-4" />,
  }

  const uniqueCategories = useMemo(() => {
    const map = new Map<string, Set<string>>()
    task?.project.listeRessource.forEach((resource: any) => {
      if (resource.type && resource.categorie) {
        if (!map.has(resource.type)) {
          map.set(resource.type, new Set())
        }
        map.get(resource.type)?.add(resource.categorie)
      }
    })
    return Array.from(map.entries()).map(([type, categories]) => ({
      type,
      categories: Array.from(categories),
    }))
  }, [task?.project.listeRessource])

  const getCategoriesForType = (type: any) => {
    const typeData = uniqueCategories.find((item) => item.type === type)
    // If no categories found in project, use defaults
    return typeData && typeData.categories.length > 0 ? typeData.categories : []
  }

  // Form state
  const [resourceType, setResourceType] = useState("")
  const [resourceCategory, setResourceCategory] = useState("")
  const [qte, setQuantity] = useState("")
  const [name, setName] = useState("")

  // Reset form
  const resetForm = () => {
    setResourceType("")
    setResourceCategory("")
    setQuantity("")
    setName("")
    setCurrentResource(null)
    setIsEditing(false)
  }

  // Open dialog for adding new resource
  const handleAddResource = () => {
    resetForm()
    setIsDialogOpen(true)
  }


  // Open dialog for editing resource
  const handleEditResource = (resource: any) => {
    setCurrentResource(resource)
    setResourceType(resource.type)
    setResourceCategory(resource.categorie)
    setQuantity(resource.qte || "")
    setName(resource.name)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  // Delete resource
  const handleDeleteResource = async (resourceId: any) => {
    if (necessaryToDelete == null || necessaryToDelete == false) {
      setNecessaryToDelete(resourceId);
      return;
    }
    const res = await deleteNecessaryRessource(necessaryToDelete, task.id)
    if (res == false) return
    setResources(resources.filter((resource: any) => resource.id !== necessaryToDelete))
    setNecessaryToDelete(null);
  }

  // Save resource (add or update)
  const handleSaveResource = async () => {
    const newResource = {
      id: isEditing ? currentResource.id : Date.now().toString(),
      type: resourceType,
      categorie: resourceCategory,
      name,
      qte
    }
    if (isEditing) {
      const res = await EdiNecessaryRessource(newResource);
      if (res != true) return
      setResources(resources.map((resource: any) => (resource.id === currentResource.id ? newResource : resource)))
    } else {
      const res = await AddNecessaryRessource(task, newResource);
      if (res == null) return
      setResources([...resources, res])
    }
    // Here you would also make an API call to save the resource

    setIsDialogOpen(false)
    resetForm()
  }
  useEffect(() => {
    console.log(task.necessaryRessource)
    setResources(task.necessaryRessource)
  }, [task])

  return (
    <Card className="mb-4">
      {necessaryToDelete && (
        <ConfirmAlert key="delete-task" confirmDelete={necessaryToDelete} setConfirmDelete={setNecessaryToDelete} FunctionToDO={handleDeleteResource}
          Title={t("task.global_resource.delete_title", "Are you sure you want to delete this?")}
          Description={t("task.global_resource.delete_description", "This necessary resource will be deleted permanently.")}
          CancelText={t("common.cancel", "Cancel")}
          ConfirmText={t("common.delete", "Delete")}
        />
      )}
      <CardContent>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {t("task.global_resource.title", "Task Resources")}
            </h2>
          </div>
          <RessourceSpecifiTask
            task={task}
            setTask={setTask}
          />
          <NecessaryRessource
            handleAddResource={handleAddResource}
            resources={resources}
            RESOURCE_TYPE_ICONS={RESOURCE_TYPE_ICONS}
            RESOURCE_TYPES={RESOURCE_TYPES}
            handleEditResource={handleEditResource}
            handleDeleteResource={handleDeleteResource}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            isEditing={isEditing}
            setName={setName}
            resourceType={resourceType}
            setResourceType={setResourceType}
            setResourceCategory={setResourceCategory}
            resourceCategory={resourceCategory}
            qte={qte}
            name={name}
            getCategoriesForType={getCategoriesForType}
            setQuantity={setQuantity}
            handleSaveResource={handleSaveResource}
          />
        </div>
      </CardContent>
    </Card>
  )
}