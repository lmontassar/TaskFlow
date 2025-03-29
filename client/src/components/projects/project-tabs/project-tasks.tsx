"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Clock } from "lucide-react";

interface ProjectTasksProps {
  projectId: string;
}

export function ProjectTasks({ projectId }: ProjectTasksProps) {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Design homepage mockups",
      description: "Create high-fidelity mockups for the new homepage design",
      status: "In Progress",
      priority: "High",
      dueDate: "Mar 15, 2025",
      assignee: {
        name: "Sarah Miller",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SM",
      },
      isComplete: false,
    },
    {
      id: 2,
      title: "Implement responsive navigation",
      description:
        "Develop the responsive navigation component based on the approved design",
      status: "To Do",
      priority: "Medium",
      dueDate: "Mar 18, 2025",
      assignee: {
        name: "David Chen",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "DC",
      },
      isComplete: false,
    },
    {
      id: 3,
      title: "Create brand style guide",
      description:
        "Document the brand colors, typography, and usage guidelines",
      status: "Done",
      priority: "Medium",
      dueDate: "Mar 10, 2025",
      assignee: {
        name: "Sarah Miller",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SM",
      },
      isComplete: true,
    },
    {
      id: 4,
      title: "User testing session",
      description:
        "Conduct user testing with 5 participants to gather feedback",
      status: "To Do",
      priority: "High",
      dueDate: "Mar 22, 2025",
      assignee: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "AJ",
      },
      isComplete: false,
    },
    {
      id: 5,
      title: "SEO optimization",
      description: "Implement SEO best practices across all pages",
      status: "To Do",
      priority: "Low",
      dueDate: "Mar 25, 2025",
      assignee: {
        name: "David Chen",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "DC",
      },
      isComplete: false,
    },
  ]);

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, isComplete: !task.isComplete } : task
      )
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            High
          </Badge>
        );
      case "Medium":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Medium
          </Badge>
        );
      case "Low":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks</CardTitle>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-4 rounded-lg border p-4 ${
                task.isComplete ? "bg-muted/50" : ""
              }`}
            >
              <Checkbox
                checked={task.isComplete}
                onCheckedChange={() => toggleTaskCompletion(task.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className={`font-medium ${
                        task.isComplete
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        task.isComplete ? "text-muted-foreground" : ""
                      }`}
                    >
                      {task.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Assign</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {getPriorityBadge(task.priority)}
                  <Badge variant="outline">{task.status}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Due {task.dueDate}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Assigned to:
                    </span>
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={task.assignee.avatar}
                        alt={task.assignee.name}
                      />
                      <AvatarFallback>{task.assignee.initials}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
