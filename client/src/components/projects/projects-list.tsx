"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
// Sample projects data
const projects = [
  {
    id: 1,
    name: "Website Redesign",
    description: "Redesign the company website with new branding",
    progress: 75,
    status: "In Progress",
    dueDate: "Mar 30, 2025",
    team: [
      {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "AJ",
      },
      {
        name: "Sarah Miller",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SM",
      },
      {
        name: "David Chen",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "DC",
      },
    ],
    category: "Design",
    tags: ["frontend", "ui", "branding"],
  },
  {
    id: 2,
    name: "Mobile App Development",
    description: "Create a new mobile app for customer engagement",
    progress: 45,
    status: "In Progress",
    dueDate: "Apr 15, 2025",
    team: [
      {
        name: "Emma Wilson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "EW",
      },
      {
        name: "James Brown",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "JB",
      },
    ],
    category: "Software",
    tags: ["mobile", "react-native", "api"],
  },
  {
    id: 3,
    name: "Marketing Campaign",
    description: "Q2 marketing campaign for product launch",
    progress: 20,
    status: "Just Started",
    dueDate: "May 10, 2025",
    team: [
      {
        name: "Olivia Davis",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "OD",
      },
      {
        name: "Noah Smith",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "NS",
      },
      {
        name: "Sophia Lee",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SL",
      },
    ],
    category: "Marketing",
    tags: ["social-media", "content", "launch"],
  },
  {
    id: 4,
    name: "Database Migration",
    description: "Migrate legacy database to new cloud infrastructure",
    progress: 60,
    status: "In Progress",
    dueDate: "Apr 5, 2025",
    team: [
      {
        name: "James Brown",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "JB",
      },
      {
        name: "Emma Wilson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "EW",
      },
    ],
    category: "Software",
    tags: ["database", "cloud", "infrastructure"],
  },
  {
    id: 5,
    name: "Product Analytics",
    description: "Implement analytics tracking for user behavior",
    progress: 90,
    status: "Almost Done",
    dueDate: "Mar 20, 2025",
    team: [
      {
        name: "David Chen",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "DC",
      },
      {
        name: "Sarah Miller",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SM",
      },
    ],
    category: "Research",
    tags: ["analytics", "user-research", "data"],
  },
  {
    id: 6,
    name: "Content Strategy",
    description: "Develop content strategy for Q2 and Q3",
    progress: 30,
    status: "In Progress",
    dueDate: "Apr 25, 2025",
    team: [
      {
        name: "Olivia Davis",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "OD",
      },
      {
        name: "Noah Smith",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "NS",
      },
    ],
    category: "Marketing",
    tags: ["content", "strategy", "planning"],
  },
];

export function ProjectsList() {
  const [filter, setFilter] = useState("all");

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((project) => {
          if (filter === "active")
            return (
              project.status === "In Progress" ||
              project.status === "Just Started"
            );
          if (filter === "completed") return project.progress === 100;
          return true;
        });

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {project.category}
                  </Badge>
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t p-4">
              <div className="flex -space-x-2">
                {project.team.map((member, i) => (
                  <Avatar
                    key={i}
                    className="border-2 border-background h-8 w-8"
                  >
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                {project.dueDate}
              </div>
            </CardFooter>
          </Card>
        ))}

        <Card
          className={cn(
            "flex flex-col items-center justify-center p-6 text-center",
            "border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
          )}
        >
          <div className="mb-4 rounded-full bg-primary/10 p-6">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-medium">Create New Project</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Set up a new project and invite your team to collaborate.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
