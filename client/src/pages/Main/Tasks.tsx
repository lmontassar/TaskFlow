"use client";

import { useEffect, useState } from "react";
import { TasksInterface } from "@/components/tasks/tasks-interface";
import useTasks from "@/hooks/useTasks";

export default function TasksPage() {
  const [loading, setLoading] = useState(true);
  const { mapRawTaskToTask, tasks, setTasks } = useTasks();

  // useEffect(() => {
  //   // In a real application, you would fetch the data from an API
  //   // For now, we'll use the sample data
  //   try {
  //     if (mapRawTaskToTask && typeof mapRawTaskToTask === "function") {
  //       const mappedTasks = rawTasksData.map((task) => mapRawTaskToTask(task))
  //       setTasks(mappedTasks)
  //     }
  //   } catch (error) {
  //     console.error("Error mapping tasks:", error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }, [mapRawTaskToTask, setTasks])

  // if (loading) {
  //   return <div className="flex h-screen items-center justify-center">Loading tasks...</div>
  // }

  return <TasksInterface initialTasks={tasks} />;
}
