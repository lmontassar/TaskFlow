"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { format, isValid, parseISO } from "date-fns";

import _ from "lodash";
import useTasks from "../../hooks/useTasks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { Link} from "react-router-dom";
import { useTranslation } from "react-i18next";
import Loading from "../ui/loading";
interface TasksListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  project: any;
  handleUpdateStatutTask: any;
  setTasks: any;
  isLoading:any;
}
export function TasksList({
  project,
  tasks,
  setTasks,
  onTaskClick,
  handleUpdateStatutTask,
  isLoading
}: TasksListProps) {
  const { t } = useTranslation();
  const p = "tasks.tasks-list";
  const { getStatusBadge, getDifficulteBadge } = useTasks();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "-";

      return format(date, "MMM d, yyyy");
    } catch (error) {
      return "-";
    }
  };

  const handlechangeStatut = async (taskID: any, statut: any) => {
    const res = await handleUpdateStatutTask(taskID, statut);
    if (res === true) {
      const updatedTasks = tasks.map((task) =>
        task.id === taskID ? { ...task, statut } : task
      );
      setTasks(updatedTasks);
    }
  };

  const { checkIfAssigneeTask, checkIfCreatorOfProject } = useTasks();

  

  return (
    <ScrollArea className="p-4 w-full overflow-y-auto">
      <Table className="w-full table-fixed">
        <TableHeader className="bg-background sticky:top-0 z-10">
          <TableRow>
            {/* <TableHead className="w-12"></TableHead> */}
            <TableHead className="w-[40%] whitespace-nowrap">
              {t(`${p}.header.task`)}
            </TableHead>
            <TableHead className="w-[10%] whitespace-nowrap">
              {t(`${p}.header.status`)}
            </TableHead>
            <TableHead className="w-[10%] whitespace-nowrap">
              {t(`${p}.header.difficulty`)}
            </TableHead>
            <TableHead className="w-[15%] whitespace-nowrap hidden lg:table-cell">
              {t(`${p}.header.due_date`)}
            </TableHead>
            { !project && (
              <TableHead className="w-[10%] whitespace-nowrap">
                {t(`${p}.header.project`)}
              </TableHead>
            )}
            <TableHead className="w-[10%] whitespace-nowrap hidden lg:table-cell">
              {t(`${p}.header.assignees`)}
            </TableHead>
            <TableHead className="w-[15%] whitespace-nowrap hidden lg:table-cell">
              {t(`${p}.header.rapporteur`)}
            </TableHead>
          </TableRow>
        </TableHeader>
        { isLoading && 
          (
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <Loading></Loading>
                </TableCell>
              </TableRow>
            </TableBody>
          ) ||( (tasks && tasks.length > 0  ) &&  (
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task.id}
              className={`cursor-pointer  ${
                checkIfAssigneeTask(task) ||
                checkIfCreatorOfProject(task?.project)
                  ? "bg-white hover:bg-gray-50 border-l-4 border-green-400"
                  : "bg-gray-100 hover:bg-gray-100 text-gray-500 border-l-4 border-red-400"
              }`}
            >
              <TableCell
                className="whitespace-nowrap font-medium"
                onClick={() => onTaskClick(task)}
              >
                <div className=" flex  flex-col">
                  <span className="truncate max-w-[calc(100%-1.5rem)]">
                    <Link to={`/task/${task.id}`}>{task.nomTache}</Link>
                  </span>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {  (checkIfAssigneeTask(task) || 
                   checkIfCreatorOfProject(task?.project)) && (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          {getStatusBadge(task.statut)}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-24">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handlechangeStatut(task.id, "TODO")}
                          >
                            {getStatusBadge("TODO")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() =>
                              handlechangeStatut(task.id, "PROGRESS")
                            }
                          >
                            {getStatusBadge("PROGRESS")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() =>
                              handlechangeStatut(task.id, "REVIEW")
                            }
                          >
                            {getStatusBadge("REVIEW")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handlechangeStatut(task.id, "DONE")}
                          >
                            {getStatusBadge("DONE")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) || <>{getStatusBadge(task.statut)}</>}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {getDifficulteBadge(task.difficulte)}
              </TableCell>
              <TableCell className="whitespace-nowrap hidden lg:table-cell">
                {formatDate(task.dateFinEstime)}
              </TableCell>
              {!project && (
                <TableCell className="whitespace-nowrap">
                  <Badge variant="outline">{task?.project?.nom}</Badge>
                </TableCell>
              )}
              <TableCell className="whitespace-nowrap hidden lg:table-cell">
                <div className="flex -space-x-2">
                  {task.assignee.map((assignee: any) => (
                    <Avatar
                      key={assignee.id}
                      className="h-7 w-7 border-2 border-background"
                    >
                      <AvatarImage
                        src={assignee.avatar || "/placeholder.svg"}
                        alt={assignee.nom}
                      />
                      <AvatarFallback className="text-[10px]">
                        {assignee.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap hidden lg:table-cell">
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 border-2 border-gray-200 overflow-hidden">
                    <AvatarImage
                      src={task.rapporteur.avatar || "/placeholder.svg"}
                      alt={_.startCase(task.rapporteur.nom)}
                    />
                    <AvatarFallback className="text-xs font-medium">
                      {_.startCase(task.rapporteur.nom[0])}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium text-gray-800">
                    {_.startCase(task.rapporteur.prenom)}{" "}
                    {_.startCase(task.rapporteur.nom)}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        ) || (
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                There are no tasks
              </TableCell>
            </TableRow>
          </TableBody>
        ) )}
      </Table>
    </ScrollArea>
  );
}
