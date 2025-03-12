import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

export function UpcomingTasks() {
  const tasks = [
    {
      id: 1,
      title: "Finalize design mockups",
      project: "Website Redesign",
      dueDate: "Today",
      completed: false,
    },
    {
      id: 2,
      title: "Review content strategy",
      project: "Marketing Campaign",
      dueDate: "Tomorrow",
      completed: false,
    },
    {
      id: 3,
      title: "API integration planning",
      project: "Mobile App Development",
      dueDate: "Mar 15",
      completed: false,
    },
    {
      id: 4,
      title: "User testing feedback review",
      project: "Website Redesign",
      dueDate: "Mar 12",
      completed: true,
    },
    {
      id: 5,
      title: "Sprint planning meeting",
      project: "Mobile App Development",
      dueDate: "Mar 14",
      completed: false,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3">
              {task.completed ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" />
              )}
              <div className="space-y-1">
                <p
                  className={cn(
                    "font-medium leading-none",
                    task.completed && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </p>
                <div className="flex text-sm text-muted-foreground">
                  <span>{task.project}</span>
                  <span className="mx-2">•</span>
                  <span>{task.dueDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
