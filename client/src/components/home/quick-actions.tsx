import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FolderPlus,
  MessageSquarePlus,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActions() {
  const actions = [
    {
      icon: <FolderPlus className="h-5 w-5" />,
      title: "New Project",
      description: "Create a new project",
      href: "/projects/new",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "New Task",
      description: "Add a new task",
      href: "/tasks/new",
    },
    {
      icon: <MessageSquarePlus className="h-5 w-5" />,
      title: "New Message",
      description: "Send a message",
      href: "/inbox?compose=true",
    },
    {
      icon: <UserPlus className="h-5 w-5" />,
      title: "Add Member",
      description: "Invite team member",
      href: "/team/invite",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common actions you can take</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto flex-col items-center justify-center gap-2 p-4"
              asChild
            >
              <Link to={action.href}>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {action.icon}
                </div>
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
