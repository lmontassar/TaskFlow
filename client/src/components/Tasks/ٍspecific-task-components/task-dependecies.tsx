
import {  Link } from "react-router-dom"
import _ from "lodash"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"


import { Clock, ArrowDown, Layers, ArrowsUpFromLine,  CircleMinus } from 'lucide-react'
import { TasksSearch } from "../../ui/TasksSearch"
import { useTranslation } from "react-i18next"
import useTasks from "../../../hooks/useTasks"

interface Props {
    task :any
    canEdit : any 
    handleAddSubTask :any
    handleGetAllTasks :any
    tasksToHide :any
    subTasks :any
    formatDate :any,
    setSubTaskToDelete :any,
    handleAddPrecTask:any,
    handlegetTasksCanBePrecedente:any
    getStatusIcon:any,
    setPrecTaskToDelete:any
    handleAddParallelTask:any
    setParallelTaskToDelete:any
}


export default function TaskDependecies(
    {
        task,
        canEdit ,
        handleAddSubTask,
        handleGetAllTasks,
        tasksToHide,
        subTasks,
        formatDate,
        setSubTaskToDelete,
        handleAddPrecTask,
        handlegetTasksCanBePrecedente,
        getStatusIcon,
        setPrecTaskToDelete,
        handleAddParallelTask,
        setParallelTaskToDelete,
    } :Props
) {
    const {t} = useTranslation();
    const {
        getStatusBadge,
      } = useTasks();

    return (
        <Card className="">
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">
                            {t("tasks.specific.dependencies", "Task Dependencies")}
                        </h2>
                    </div>

                    <Card className="p-0">
                        <CardHeader className="bg-purple-50 rounded-t-lg border-b border-purple-100 pt-4 pb-4 ">
                            <div className="flex items-center gap-2 ">
                                <Layers className="h-5 w-5 text-purple-600" />
                                <CardTitle className="text-lg text-purple-800">
                                    {t("tasks.specific.subtasks.title", "SubTasks")}
                                </CardTitle>
                            </div>
                            <CardDescription>
                                {t("tasks.specific.subtasks.description", "tasks that make up this task")}
                            </CardDescription>
                        </CardHeader>
                        {canEdit && (
                            <div className="pl-6 pr-6">
                                <TasksSearch
                                    key={`sub-search-${task.id}`}
                                    placeholder={t("tasks.taskSearch.searchAndAdd")}
                                    onTaskSelect={handleAddSubTask}
                                    fetchTasks={handleGetAllTasks}
                                    tasksToHide={tasksToHide}
                                    thisTask={task}
                                />
                            </div>
                        )}
                        <CardContent className="pb-6 pl-6">
                            <div className="space-y-4">
                                {subTasks && subTasks?.length == 0 && <div className="text-center">{t("tasks.specific.no_subtasks", "There are no subTasks")}</div>}
                                {subTasks.map((ta: any, index: any) => (
                                    <div key={ta.id} className="relative">
                                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-emerald-200 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-start gap-3 relative z-10 group-hover:border-emerald-300">
                                            <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="font-bold underline cursor-pointer">
                                                        <Link to={`/task/${ta.id}`}>{ta.nomTache}</Link>
                                                    </h3>
                                                    <div className="flex gap-2">
                                                        {getStatusBadge(ta.statut)}
                                                        {ta.dateFinEstime && (
                                                            <Badge
                                                                variant="outline"
                                                                className="flex gap-1 bg-red-100 border-1 border-red-200 text-red-700"
                                                            >
                                                                <Clock className="h-3 w-3" />
                                                                {formatDate(ta.dateFinEstime)}
                                                            </Badge>
                                                        )}
                                                        {canEdit && (
                                                            <Badge
                                                                onClick={() => setSubTaskToDelete(ta)}
                                                                variant="outline"
                                                                className="cursor-pointer flex gap-1 bg-red-100 border-1 border-red-200 text-red-700" >
                                                                <span>{t("tasks.specific.remove", "Remove")}</span>
                                                                <CircleMinus className="h-4 w-4 text-red-700 border-red-200" />
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                {ta.description != "" && <p className="text-sm text-gray-600 mt-2">{ta.description}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="p-0">
                        <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100 pt-4 pb-4 ">
                            <div className="flex items-center gap-2 ">
                                <ArrowDown className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-lg text-blue-800">
                                    {t("tasks.specific.precedent.title", "Precedent Tasks")}
                                </CardTitle>
                            </div>
                            <CardDescription>
                                {t("tasks.specific.precedent.description", "Tasks that must be completed before starting this task")}
                            </CardDescription>
                        </CardHeader>
                        {canEdit && (
                            <div className="pl-6 pr-6">
                                <TasksSearch
                                    key={`prec-search-${task.id}`}
                                    placeholder={t("tasks.taskSearch.searchAndAdd")}
                                    onTaskSelect={handleAddPrecTask}
                                    fetchTasks={handlegetTasksCanBePrecedente}
                                    tasksToHide={tasksToHide}
                                    thisTask={task}
                                />
                            </div>
                        )}
                        <CardContent className="pb-6 pl-4">
                            <div className="space-y-4">
                                {task?.precedentes && task?.precedentes.length == 0 && (
                                    <div className="text-center">{t("tasks.specific.no_previous_tasks", "There are no precedentes tasks")}</div>
                                )}

                                {task.precedentes.map((ta: any, index: any) => (
                                    <div key={ta.id} className="relative">
                                        {index < task.precedentes.length - 1 && (
                                            <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-blue-200 z-0" />
                                        )}
                                        <div className="flex items-start gap-3 relative z-10">
                                            <div className="mt-1 bg-blue-100 rounded-full p-1">{getStatusIcon(ta.statut)}</div>
                                            <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="font-bold underline cursor-pointer">
                                                        <Link to={`/task/${ta.id}`}>{ta.nomTache}</Link>
                                                    </h3>
                                                    <div className="flex gap-2">
                                                        {getStatusBadge(ta.statut)}
                                                        {ta.dateFinEstime && (
                                                            <Badge
                                                                variant="outline"
                                                                className="flex gap-1 bg-red-100 border-1 border-red-200 text-red-700"
                                                            >
                                                                <Clock className="h-3 w-3" />
                                                                {formatDate(ta.dateFinEstime)}
                                                            </Badge>
                                                        )}
                                                        {canEdit && (
                                                            <Badge
                                                                onClick={() => setPrecTaskToDelete(ta)}
                                                                variant="outline"
                                                                className="cursor-pointer flex gap-1 bg-red-100 border-1 border-red-200 text-red-700"
                                                            >
                                                                {t("tasks.specific.remove", "Remove")}
                                                                <CircleMinus className="h-4 w-4 bg-red-50 text-red-700 border-red-200" />
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                {ta.description != "" && <p className="text-sm text-gray-600 mt-2">{ta.description}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="p-0">
                        <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100 pt-4 pb-4 ">
                            <div className="flex items-center gap-2 ">
                                <ArrowsUpFromLine className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-lg text-blue-800">
                                    {t("tasks.specific.parallel.title", "Parallel Tasks")}
                                </CardTitle>
                            </div>
                            <CardDescription>
                                {t("tasks.specific.parallel.description", "Tasks that must be started with this task")}
                            </CardDescription>
                        </CardHeader>
                        {canEdit && (
                            <div className="pl-6 pr-6">
                                <TasksSearch
                                    key={`parallel-search-${task.id}`}
                                    placeholder={t("tasks.taskSearch.searchAndAdd")}
                                    onTaskSelect={handleAddParallelTask}
                                    fetchTasks={handleGetAllTasks}
                                    tasksToHide={tasksToHide}
                                    thisTask={task}
                                />
                            </div>
                        )}
                        <CardContent className="pb-6 pl-4">
                            <div className="space-y-4">
                                {task?.paralleles && task?.paralleles.length == 0 && (
                                    <div className="text-center">
                                        {t("tasks.specific.no_parallel_tasks", "There is no parallel tasks")}
                                    </div>
                                )}
                                {task.paralleles.map((ta: any, index: any) => (
                                    <div key={ta.id} className="relative">
                                        {index < task.paralleles.length - 1 && (
                                            <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-blue-200 z-0" />
                                        )}
                                        <div className="flex items-start gap-3 relative z-10">
                                            <div className="mt-1 bg-blue-100 rounded-full p-1"> {getStatusIcon(ta.statut)}</div>
                                            <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="font-bold underline cursor-pointer">
                                                        <Link to={`/task/${ta.id}`}>{ta.nomTache}</Link>
                                                    </h3>
                                                    <div className="flex gap-2">
                                                        {getStatusBadge(ta.statut)}
                                                        {ta.dateFinEstime && (
                                                            <Badge
                                                                variant="outline"
                                                                className="flex gap-1 bg-red-100 border-1 border-red-200 text-red-700"
                                                            >
                                                                <Clock className="h-3 w-3" />
                                                                {formatDate(ta.dateFinEstime)}
                                                            </Badge>
                                                        )}
                                                        {canEdit && (
                                                            <Badge
                                                                onClick={() => setParallelTaskToDelete(ta)}
                                                                variant="outline"
                                                                className="cursor-pointer flex gap-1 bg-red-100 border-1 border-red-200 text-red-700"
                                                            >
                                                                {t("tasks.specific.remove", "Remove")}
                                                                <CircleMinus className="h-4 w-4 bg-red-50 text-red-700 border-red-200" />
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                {ta.description != "" && <p className="text-sm text-gray-600 mt-2">{ta.description}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>

    )
}