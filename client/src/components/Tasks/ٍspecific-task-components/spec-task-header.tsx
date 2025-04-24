import {Link } from "react-router-dom"
import _ from "lodash"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Edit, Trash2, ArrowLeft, MoreHorizontal } from 'lucide-react'
import { DropdownMenuSeparator } from "../../ui/dropdown-menu"
import ConfirmAlert from "../../ui/confirm_alert"
import { useTranslation } from "react-i18next"
import useTasks from "../../../hooks/useTasks"

export default function SpecificTaskHeader(
    {
        confirmDelete,
        assigneeToDelete,
        setAssigneeToDelete,
        setConfirmDelete,
        deleteTask,
        handleRemoveAssignee,
        subTaskToDelete,
        setSubTaskToDelete,
        handleDeleteSubTask,
        task,
        precTaskToDelete,
        setPrecTaskToDelete,
        handleDeletePrecTask,
        setParallelTaskToDelete,
        parallelTaskToDelete,
        handleDeleteParallelTask,
        canEdit,
        setIsEditing,
        isEditing,
        navigate
    }: any
) {
    const {
        checkIfCreatorOfProject
      } = useTasks();
    const {t} = useTranslation();
    return (
        <>
            <ConfirmAlert key="delete-task" confirmDelete={confirmDelete} setConfirmDelete={setConfirmDelete} FunctionToDO={deleteTask}
                Title={t("tasks.specific.delete_confirm.title", "Are you sure you want to delete this task?")}
                Description={t("tasks.specific.delete_confirm.description",
                    "This action cannot be undone. This will permanently delete the task and all associated data.",)}
                CancelText={t("common.cancel")} ConfirmText={t("common.delete")}
            />

            {(assigneeToDelete) && (
                <ConfirmAlert key="delete-assigne" confirmDelete={assigneeToDelete} setConfirmDelete={setAssigneeToDelete} FunctionToDO={handleRemoveAssignee}
                    Title={t("tasks.specific.remove_assignee.title", "Are you sure you want to remove this assignee?")}
                    Description={`${assigneeToDelete.prenom} ${assigneeToDelete.nom} 
                    ${t("tasks.specific.remove_assignee.description",
                        "won't be able to change the status of this task anymore, but you can add them again.",)}`}
                    CancelText={t("common.cancel")} ConfirmText={t("common.delete")}
                />
            )}

            {(subTaskToDelete) && (
                <ConfirmAlert key="delete-subTask" confirmDelete={subTaskToDelete} setConfirmDelete={setSubTaskToDelete} FunctionToDO={handleDeleteSubTask}
                    Title={t("tasks.specific.remove_subtask.title", "Are you sure you want to remove '{subTaskToDelete.nomTache}'' from sub-tasks?",
                        { taskName: subTaskToDelete.nomTache })}
                    Description={`${subTaskToDelete.nomTache}' 
                              ${t("tasks.specific.remove_subtask.description", "will be just removed from the '{task.nomTache}' sub-tasks section.",
                        { taskName: task.nomTache })}`}
                    CancelText={t("common.cancel")} ConfirmText={t("common.delete")}
                />
            )}

            {(precTaskToDelete) && (
                <ConfirmAlert key="delete-precTask" confirmDelete={precTaskToDelete} setConfirmDelete={setPrecTaskToDelete} FunctionToDO={handleDeletePrecTask}
                    Title={t("tasks.specific.remove_precaution.title", "Are you sure you want to remove '{{taskName}}' from previous tasks?", { taskName: precTaskToDelete.nomTache })}
                    Description={t("tasks.specific.remove_precaution.description", "'{{precTaskName}}' will be just removed from the '{{taskName}}' previous tasks section.",
                        {
                            precTaskName: precTaskToDelete.nomTache,
                            taskName: task.nomTache,
                        })}
                    CancelText={t("common.cancel")} ConfirmText={t("common.delete")}
                />
            )}

            {(parallelTaskToDelete) && (
                <ConfirmAlert key="delete-precTask" confirmDelete={parallelTaskToDelete} setConfirmDelete={setParallelTaskToDelete} FunctionToDO={handleDeleteParallelTask}
                    Title={t("tasks.specific.remove_parallel.title", "Are you sure you want to remove '{{taskName}}' from parallel tasks?",
                        { taskName: parallelTaskToDelete.nomTache })}
                    Description={t("tasks.specific.remove_parallel.description", "'{{parallelTaskName}}' will be just removed from the '{{taskName}}' parallel tasks section.",
                        {
                            parallelTaskName: parallelTaskToDelete.nomTache,
                            taskName: task.nomTache,
                        })}
                    CancelText={t("common.cancel")} ConfirmText={t("common.delete")}
                />
            )}


            <div className="mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/tasks">
                                {t("tasks.specific.breadcrumb.tasks", "Tasks")}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink><Link to={`/projects/${task.project.id}`}> {task.project.nom}</Link></BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink>{task.nomTache}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">{t("tasks.specific.title", "Task Details")}</h1>
                </div>
                {canEdit && (
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    className=" cursor-pointer"
                                    onClick={() => setIsEditing(!isEditing)}
                                    disabled={isEditing}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t("tasks.specific.menu.edit", "Edit Task")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                    onClick={() => setConfirmDelete(true)}
                                    disabled={!checkIfCreatorOfProject(task.project)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("tasks.specific.menu.delete", "Delete Task")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
        </>
    )
}