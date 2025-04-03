"use client";

import { TasksInterface } from "../../Tasks/tasks-interface";
import useTasks from "../../../hooks/useTasks";
import { useEffect } from "react";

interface ProjectTasksProps {
  project: any;
}

export function ProjectTasks({ project }: ProjectTasksProps) {
  return <TasksInterface project={project} />;
}
