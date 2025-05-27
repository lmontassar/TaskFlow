import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FolderKanban,
  CheckSquare,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import useStatistics from "../../hooks/useStatistics";
import Loading from "../ui/loading";
import { NumberTicker } from "../ui/number-ticker";

export function AdminAnalytics() {
  const {
    loading,
    overview: overviewData,
    setOverview: setOverviewData,
    users,
    blockUser,
    unblockUser,
    prjcts,
  } = useStatistics();
  console.log("overviewData", overviewData);

  if (loading) {
    return <Loading />;
  }
  const getProjectCompletionRate = () => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0 = Jan
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(currentMonth / 3);
    const currentQuarterStart = new Date(currentYear, currentQuarter * 3, 1);
    const currentQuarterEnd = new Date(currentYear, currentQuarter * 3 + 3, 0); // last day of current quarter

    const previousQuarterStart =
      currentQuarter === 0
        ? new Date(currentYear - 1, 9, 1) // Q4 of previous year
        : new Date(currentYear, (currentQuarter - 1) * 3, 1);

    const previousQuarterEnd =
      currentQuarter === 0
        ? new Date(currentYear - 1, 11, 31)
        : new Date(currentYear, currentQuarter * 3, 0);

    const completedProjectsCurrentQuarter = prjcts.filter((project) => {
      const date = new Date(project.dateFinEstime);
      return (
        project.status === "COMPLETED" &&
        date >= currentQuarterStart &&
        date <= currentQuarterEnd
      );
    }).length;

    const completedProjectsPreviousQuarter = prjcts.filter((project) => {
      const date = new Date(project.dateFinEstime);
      return (
        project.status === "COMPLETED" &&
        date >= previousQuarterStart &&
        date <= previousQuarterEnd
      );
    }).length;
    const completedProjectsRate =
      prjcts.filter((project) => project.status === "COMPLETED").length /
      prjcts.length;
    const rate = completedProjectsRate * 100;
    const growth =
      completedProjectsCurrentQuarter === 0
        ? 0
        : completedProjectsPreviousQuarter === 0
        ? 100
        : ((completedProjectsCurrentQuarter -
            completedProjectsPreviousQuarter) /
            completedProjectsPreviousQuarter) *
          100;

    return {
      value: Math.abs(growth.toFixed(2)),
      rate: rate,
      trend: growth > 0 ? "up" : "down",
    };
  };
  const projectCompletionRate = getProjectCompletionRate();
  const getUsersMonthlyGrowth = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const previousDate = new Date();
    previousDate.setMonth(currentMonth - 1);

    if (currentMonth === 0) {
      previousDate.setFullYear(currentYear - 1);
      previousDate.setMonth(11); // December
    }

    const previousMonthStats = users.filter(
      (user) =>
        new Date(user.creationDate).getMonth() === previousDate.getMonth() &&
        new Date(user.creationDate).getFullYear() === previousDate.getFullYear()
    ).length;

    const currentMonthStats = users.filter(
      (user) =>
        new Date(user.creationDate).getMonth() === currentMonth &&
        new Date(user.creationDate).getFullYear() === currentYear
    ).length;

    const growth =
      previousMonthStats === 0
        ? 100
        : ((currentMonthStats - previousMonthStats) / previousMonthStats) * 100;

    return {
      value: Math.abs(growth),
      trend: growth >= 0 ? "up" : "down",
    };
  };
  const userGrowth = getUsersMonthlyGrowth();

  const metrics = [
    {
      title: "User Growth",
      value: <NumberTicker value={users.length} delay={0.1} />,
      change: (
        <>
          {userGrowth.trend === "up" ? "+" : "-"}
          <NumberTicker
            value={userGrowth.value}
            delay={0.1}
            className={
              userGrowth.trend === "up" ? "text-green-500" : "text-red-500"
            }
          />
          %
        </>
      ),
      trend: userGrowth.trend,
      period: "vs last month",
    },
    {
      title: "Project Completion Rate",
      value: (
        <>
          <NumberTicker value={projectCompletionRate.rate} delay={0.1} />%
        </>
      ),
      change: (
        <>
          {projectCompletionRate.trend === "up" ? "+" : "-"}
          <NumberTicker
            value={projectCompletionRate.value}
            delay={0.1}
            className={
              projectCompletionRate.trend === "up"
                ? "text-green-500"
                : "text-red-500"
            }
          />
          %
        </>
      ),
      trend: projectCompletionRate.trend,
      period: " vs last quarter",
    },
    {
      title: "Average Task Duration",
      value:
        overviewData?.taskDurations
          .map((td: any) =>
            td.month === new Date().getMonth() &&
            td.year === new Date().getFullYear()
              ? td.averageDuration
              : 0
          )
          .reduce((a, b) => a + b, 0) + " days",
      change: "-8.1%",
      trend: "down",
      period: "vs last month",
    },
    {
      title: "Team Productivity",
      value: "94%",
      change: "+2.3%",
      trend: "up",
      period: "vs last week",
    },
  ];

  const projectsByCategory = [
    { name: "Development", count: 45, percentage: 35 },
    { name: "Design", count: 32, percentage: 25 },
    { name: "Marketing", count: 28, percentage: 22 },
    { name: "Infrastructure", count: 23, percentage: 18 },
  ];

  const userActivity = [
    { day: "Monday", active: 89 },
    { day: "Tuesday", active: 92 },
    { day: "Wednesday", active: 87 },
    { day: "Thursday", active: 95 },
    { day: "Friday", active: 88 },
    { day: "Saturday", active: 45 },
    { day: "Sunday", active: 32 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {metric.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }
                >
                  {metric.change}
                </span>
                <span>{metric.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Projects by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Projects by Category
            </CardTitle>
            <CardDescription>
              Distribution of projects across different categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectsByCategory.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{category.name}</span>
                  <span className="font-medium">{category.count} projects</span>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly User Activity
            </CardTitle>
            <CardDescription>
              Percentage of active users by day of week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userActivity.map((day) => (
              <div key={day.day} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{day.day}</span>
                  <span className="font-medium">{day.active}%</span>
                </div>
                <Progress value={day.active} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Active Users</span>
                <span className="font-medium">1,847</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Weekly Active Users</span>
                <span className="font-medium">2,234</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Monthly Active Users</span>
                <span className="font-medium">2,847</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average Session Duration</span>
                <span className="font-medium">24 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Project Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Projects</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active Projects</span>
                <span className="font-medium">89</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completed This Month</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average Project Duration</span>
                <span className="font-medium">3.2 months</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Task Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Tasks</span>
                <span className="font-medium">8,924</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completed Tasks</span>
                <span className="font-medium">7,234</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Overdue Tasks</span>
                <span className="font-medium text-red-600">156</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average Completion Time</span>
                <span className="font-medium">2.8 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Insights
          </CardTitle>
          <CardDescription>
            Key insights and recommendations based on platform data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">Positive Trends</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  User engagement increased by 12% this month
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Project completion rate improved by 5%
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Average task completion time decreased
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-orange-600">
                Areas for Improvement
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  Weekend user activity is low (38% average)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  156 tasks are currently overdue
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  Mobile app usage could be increased
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
