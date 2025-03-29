import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ProjectActivityProps {
  projectId: string;
}

export function ProjectActivity({ projectId }: ProjectActivityProps) {
  // In a real app, you would fetch the activity data based on the project ID
  const activities = [
    {
      id: 1,
      user: {
        name: "Sarah Miller",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SM",
      },
      action: "uploaded",
      target: "Homepage Mockup.fig",
      timestamp: "2025-03-12T14:30:00Z",
      type: "file",
    },
    {
      id: 2,
      user: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "AJ",
      },
      action: "created",
      target: "Homepage Design Feedback",
      timestamp: "2025-03-10T09:30:00Z",
      type: "discussion",
    },
    {
      id: 3,
      user: {
        name: "David Chen",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "DC",
      },
      action: "completed",
      target: "Create brand style guide",
      timestamp: "2025-03-10T16:45:00Z",
      type: "task",
    },
    {
      id: 4,
      user: {
        name: "Sarah Miller",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SM",
      },
      action: "commented on",
      target: "Homepage Design Feedback",
      timestamp: "2025-03-10T10:15:00Z",
      type: "discussion",
    },
    {
      id: 5,
      user: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "AJ",
      },
      action: "assigned",
      target: "User testing session",
      timestamp: "2025-03-09T11:20:00Z",
      type: "task",
      details: "to Alex Johnson",
    },
    {
      id: 6,
      user: {
        name: "David Chen",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "DC",
      },
      action: "created",
      target: "Mobile Responsiveness Strategy",
      timestamp: "2025-03-08T14:20:00Z",
      type: "discussion",
    },
    {
      id: 7,
      user: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "AJ",
      },
      action: "updated",
      target: "Project Timeline",
      timestamp: "2025-03-07T15:30:00Z",
      type: "project",
    },
  ];

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={activity.user.avatar}
                  alt={activity.user.name}
                />
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p>
                  <span className="font-medium">{activity.user.name}</span>{" "}
                  <span>{activity.action}</span>{" "}
                  <span className="font-medium">{activity.target}</span>
                  {activity.details && <span> {activity.details}</span>}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
