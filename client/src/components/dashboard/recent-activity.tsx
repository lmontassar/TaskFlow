import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      user: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "AJ",
      },
      action: "created a new task",
      target: "Finalize design mockups",
      project: "Website Redesign",
      time: "2 hours ago",
    },
    {
      id: 2,
      user: {
        name: "Sarah Miller",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SM",
      },
      action: "completed",
      target: "User testing feedback review",
      project: "Website Redesign",
      time: "4 hours ago",
    },
    {
      id: 3,
      user: {
        name: "David Chen",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "DC",
      },
      action: "commented on",
      target: "API integration planning",
      project: "Mobile App Development",
      time: "Yesterday",
    },
    {
      id: 4,
      user: {
        name: "Emma Wilson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "EW",
      },
      action: "updated",
      target: "Sprint planning meeting",
      project: "Mobile App Development",
      time: "Yesterday",
    },
  ];

  return (
    <Card className="col-span-full overflow-y-scroll max-h-[400px]">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={activity.user.avatar}
                  alt={activity.user.name}
                />
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>{" "}
                  <span>{activity.action}</span>{" "}
                  <span className="font-medium">{activity.target}</span>{" "}
                  <span>in</span>{" "}
                  <span className="font-medium">{activity.project}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
