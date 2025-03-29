"use client";

import { TasksInterface } from "../../Tasks/tasks-interface";
import useTasks from "../../../hooks/useTasks";

interface ProjectTasksProps {
  projectId: string;
}

export function ProjectTasks({ projectId }: ProjectTasksProps) {
  return <TasksInterface projectId={projectId} />;
}
