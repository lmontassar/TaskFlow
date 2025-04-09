"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { format, isValid, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import type { Task } from "./tasks-interface"
import _ from "lodash";
import { CheckCircle2, StarIcon, Stars, StarsIcon } from "lucide-react"
import useTasks from "../../hooks/useTasks"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

interface TasksListProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void,
  project :any 
  handleUpdateStatutTask: any
  setTasks:any
}
export function TasksList({ project, tasks,setTasks, onTaskClick ,handleUpdateStatutTask}: TasksListProps) {
  //const [tasks, setTasks] = useState(tasks);
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TODO":
        return (
          <Badge variant="outline" className="bg-slate-50">
            To Do
          </Badge>
        )
      case "PROGRESS":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            In Progress
          </Badge>
        )
      case "REVIEW":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Review
          </Badge>
        )
      case "DONE":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Done
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDifficulteBadge = (difficulte: string) => {
    switch (difficulte.toLowerCase()) {
      case "hard":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Hard
          </Badge>
        )
      case "normal":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Normal
          </Badge>
        )
      case "easy":
        return (
          <Badge variant="outline" className="bg-slate-50">
            Easy
          </Badge>
        )
      default:
        return <Badge variant="outline">{difficulte}</Badge>
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"

    try {
      const date = parseISO(dateString)
      if (!isValid(date)) return "-"

      return format(date, "MMM d, yyyy")
    } catch (error) {
      return "-"
    }
  }

  const handlechangeStatut = async (taskID:any,statut:any) =>{
    
    const res = await handleUpdateStatutTask(taskID, statut);
    if (res === true ){
      const updatedTasks = tasks.map((task) =>
        task.id === taskID ? { ...task, statut } : task
      );
      setTasks(updatedTasks);
    }

  }

  const {checkIfAssigneeTask,checkIfCreatorOfProject} = useTasks();


  return (
    <ScrollArea className="h-[calc(100vh-12rem)] w-full">
      <div className="p-4">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              {/* <TableHead className="w-12"></TableHead> */}
              <TableHead className="w-full">Task</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap"> Difficulty</TableHead>
              {/* <TableHead>Quality</TableHead> */}
              <TableHead className="whitespace-nowrap">Due Date</TableHead>
              { (project == null) && (
                <TableHead className="whitespace-nowrap" >Project</TableHead>
              )}
              
              <TableHead className="whitespace-nowrap">Assignees</TableHead>
              <TableHead className="whitespace-nowrap">Rapporteur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
              key={task.id}
              className={`cursor-pointer  ${checkIfAssigneeTask(task) || checkIfCreatorOfProject(task?.project)  ? "hover:bg-muted/50" : "bg-gray-200 hover:bg-gray-100"}`}
              
            >
            
                {/* <TableCell className="p-2">
                  <Checkbox checked={task.statut === "DONE"} onClick={(e) => e.stopPropagation()} />
                </TableCell> */}
                <TableCell className="w-full flex-1 font-medium" onClick={() => onTaskClick(task)}>
                  <div className="flex flex-col">
                    <span className="underline">
                    <Link to={`/task/${task.id}`}>{task.nomTache}</Link> 
                    </span>
                  </div>
                </TableCell>
                
                
                <TableCell className="whitespace-nowrap">
                { (checkIfAssigneeTask(task) || checkIfCreatorOfProject(task?.project)) && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        {getStatusBadge(task.statut)} 
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-24">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handlechangeStatut(task.id, "TODO")}>
                          {getStatusBadge("TODO")} 
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handlechangeStatut(task.id, "PROGRESS")}>
                        {getStatusBadge("PROGRESS")} 
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handlechangeStatut(task.id, "REVIEW")}>
                        {getStatusBadge("REVIEW")} 
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handlechangeStatut(task.id, "DONE")}>
                        {getStatusBadge("DONE")} 
                      </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> 
                  </>
                ) || (
                  <>
                    {getStatusBadge(task.statut)}  
                  </>
                )} 
                  
                  
                </TableCell>


                <TableCell className="whitespace-nowrap">{getDifficulteBadge(task.difficulte)}</TableCell>
                {/* <TableCell>
                { task.qualite != 0 && (
                <div className="flex items-center">
                  

                  {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${i < (task.qualite || 0) ? "text-blue-500 fill-blue-500" : "text-muted-foreground"}`}
                      />
                    ))} 
                    </div>
                ) || (
                  <>Not Rated</>
                )} 
                    
                </TableCell> */}
                <TableCell className="whitespace-nowrap">{formatDate(task.dateFinEstime)}</TableCell>
                { (project == null) && (
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="outline">
                      {task.project.nom}
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="whitespace-nowrap"> 
                  <div className="flex -space-x-2">
                    {task.assignee.map((assignee:any ) => (
                      <Avatar key={assignee.id} className="h-7 w-7 border-2 border-background">
                        <AvatarImage src={
                        assignee.avatar} 
                         alt={assignee.nom} />
                        <AvatarFallback className="text-[10px]">{assignee.initials}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </TableCell>

                <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 border-2 border-gray-200 overflow-hidden">
                    <AvatarImage 
                      src={
                          task.rapporteur.avatar} 
                      alt={ _.startCase(task.rapporteur.nom) } 
                    />
                    <AvatarFallback className="text-xs font-medium">
                      {_.startCase( task.rapporteur.nom[0])}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-800">
                    {_.startCase(task.rapporteur.prenom)} {_.startCase(task.rapporteur.nom)}
                  </span>
                </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  )
}

