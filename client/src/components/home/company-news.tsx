import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export function CompanyNews() {
  const news = [
    {
      id: 1,
      title: "Company All-Hands Meeting",
      description:
        "Join us for our monthly all-hands meeting to discuss company updates and progress.",
      date: "March 15, 2025",
      type: "Event",
      link: "/calendar/event/123",
    },
    {
      id: 2,
      title: "New Feature Release",
      description:
        "We're excited to announce the release of our new project analytics dashboard.",
      date: "March 10, 2025",
      type: "Announcement",
      link: "/announcements/456",
    },
    {
      id: 3,
      title: "Team Building Event",
      description:
        "Save the date for our upcoming team building event at Central Park.",
      date: "March 25, 2025",
      type: "Event",
      link: "/calendar/event/789",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company News</CardTitle>
        <CardDescription>Latest announcements and events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{item.title}</h3>
                <Badge
                  variant={item.type === "Event" ? "secondary" : "default"}
                >
                  {item.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarDays className="mr-1 h-3 w-3" />
                  {item.date}
                </div>
                <Button variant="ghost" size="sm" className="h-7 gap-1" asChild>
                  <Link href={item.link}>
                    <span className="text-xs">View</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
