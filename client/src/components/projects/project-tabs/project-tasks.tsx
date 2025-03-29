"use client";

import { TasksInterface } from "../../Tasks/tasks-interface";
import useTasks from "../../../hooks/useTasks";

interface ProjectTasksProps {
  projectId: string;
}

export function ProjectTasks({ projectId }: ProjectTasksProps) {
  const { mapRawTaskToTask, tasks, setTasks } = useTasks();

  return <TasksInterface initialTasks={tasks} />;
}
