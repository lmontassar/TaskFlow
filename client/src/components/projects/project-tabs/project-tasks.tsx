"use client";
import { TasksInterface } from "../../Tasks/tasks-interface";
import Loading from "../../ui/loading";

interface ProjectTasksProps {
  project: any;
}

export function ProjectTasks({ project }: ProjectTasksProps) {
  if( project == null  ){
    return <Loading></Loading>
  }
  return  <TasksInterface key={project.id} project={project} />;
}