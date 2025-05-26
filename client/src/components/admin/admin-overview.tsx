import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, FolderKanban, CheckSquare } from "lucide-react";
import useStatistics from "../../hooks/useStatistics";
import { useEffect, useState } from "react";
import Loading from "../ui/loading";

export function AdminOverview() {
  const { getOverviewData, loading, setLoading } = useStatistics();
  const [overviewData, setOverviewData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getOverviewData();
        setOverviewData(data);
        console.log("Overview Data:", data);
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (overviewData == null) {
      fetchData();
    }
  }, [getOverviewData, setLoading]);

  if (loading) {
    return <Loading />;
  }

  const systemStats = [
    {
      title: "Total Users",
      value: overviewData?.user ?? "N/A",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Projects",
      value: overviewData?.project?.inProgress ?? "N/A",
      change: "0%",
      icon: FolderKanban,
      color: "text-green-600",
    },
    {
      title: "Completed Tasks",
      value: overviewData?.task?.completed ?? "N/A",
      change: "0%",
      icon: CheckSquare,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {systemStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last
                month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
