import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function TeamMembers() {
  const members = [
    {
      name: "Alex Johnson",
      role: "Project Manager",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AJ",
      status: "online",
    },
    {
      name: "Sarah Miller",
      role: "UI/UX Designer",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SM",
      status: "online",
    },
    {
      name: "David Chen",
      role: "Frontend Developer",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "DC",
      status: "offline",
    },
    {
      name: "Emma Wilson",
      role: "Backend Developer",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "EW",
      status: "online",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium leading-none">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <Badge
                variant={member.status === "online" ? "default" : "outline"}
                className="capitalize"
              >
                {member.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
