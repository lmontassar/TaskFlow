import useStatistics from "../../hooks/useStatistics";
import Loading from "../ui/loading";
import { NumberTicker } from "../ui/number-ticker";
import ProfessionalAnalyticsDashboard from "./charts/professional-analytics-dashboard";

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

  if (loading) {
    return <Loading />;
  }
  const getProjectCompletionRate = () => {
    const now = new Date();
    const currentMonth = now.getMonth(); 
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(currentMonth / 3);
    const currentQuarterStart = new Date(currentYear, currentQuarter * 3, 1);
    const currentQuarterEnd = new Date(currentYear, currentQuarter * 3 + 3, 0); 
    const previousQuarterStart =
      currentQuarter === 0
        ? new Date(currentYear - 1, 9, 1)
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
      previousDate.setMonth(11);
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
     
      <ProfessionalAnalyticsDashboard />
    </div>
  );
}
