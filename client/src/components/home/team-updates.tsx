import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function TeamUpdates() {
  const updates = [
    {
      id: 1,
      user: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "AJ",
      },
      status: "Completed 3 tasks today",
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
      status: "Reached 75% milestone",
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
      status: "Started new sprint",
      project: "Mobile App Development",
      time: "Yesterday",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Updates</CardTitle>
        <CardDescription>Recent achievements from your team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={update.user.avatar} alt={update.user.name} />
                <AvatarFallback>{update.user.initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="font-medium">{update.user.name}</div>
                <div className="text-sm">{update.status}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{update.project}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {update.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
