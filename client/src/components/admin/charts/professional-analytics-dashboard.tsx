import { useEffect, useState } from "react";
import {
  BarChart3,
  AlertTriangle,
  Target,
  Maximize2,
  DollarSign,
  CheckCircle,
  Briefcase,
  Clock,
  UsersIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useAnalyticsAPI } from "@/hooks/use-analytics-api";
import { SimplifiedControls, type TimeRange } from "./simplified-controls";
import Loading from "../../ui/loading";
import useStatistics from "../../../hooks/useStatistics";
import { NumberTicker } from "../../ui/number-ticker";
import { useTranslation } from "react-i18next";

export default function ProfessionalAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const currentYear = new Date().getFullYear();

  const [customDateRange, setCustomDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({
    from: new Date(currentYear, 0, 1), // January 1st
    to: new Date(currentYear, 11, 31), // December 31st
  });
  const [activeTab, setActiveTab] = useState("overview");

  const {
    kpis,
    taskStatus,
    projectStatus,
    teamPerformance,
    loading,
    error,
    refetch,
  } = useAnalyticsAPI(timeRange, customDateRange);


  useEffect(() => {
    console.log(taskStatus)
  }, [loading])

  const { users } = useStatistics();
  const { t } = useTranslation();
  const handleExport = () => {
    const exportData = {
      kpis,
      taskStatus,
      teamPerformance,
      exportedAt: new Date().toISOString(),
      timeRange,
      customDateRange,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split("T")[0]
      }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    refetch();
  };

  const status = (s: any) => {
    switch (s) {
      case "TODO":
        return t("tasks.taskStatus.TODO");
      case "IN_PROGRESS":
        return t("admin.projects.statusList.in_progress");
      case "PROGRESS":
        return t("tasks.taskStatus.PROGRESS");
      case "REVIEW":
        return t("tasks.taskStatus.REVIEW");
      case "DONE":
        return t("tasks.taskStatus.DONE");
      case "NOT_STARTED":
        return t("admin.projects.statusList.not_started");
      case "COMPLETED":
        return t("admin.projects.statusList.completed");
    }
  };

  if (loading) {
    return <Loading></Loading>;
  }

  if (error || !kpis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <p className="text-slate-600 text-lg">
            {error || "No data available"}
          </p>
          <Button onClick={handleRefresh} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }
  return (
    <>
      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <UsersIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-slate-900 flex flex-col items-center justify-center gap-2">
            <NumberTicker value={users.length} />
          </div>

          <div className="text-xs text-slate-500">
            {t("admin.analytics.overview.user_growth")}
          </div>
        </Card>
        <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-slate-900">
            <NumberTicker value={kpis.activeProjects} />
          </div>
          <div className="text-xs text-slate-500">
            {t("admin.analytics.overview.active_projects")}
          </div>
        </Card>

        <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-slate-900">
            <NumberTicker value={kpis.completedTasks} />
          </div>
          <div className="text-xs text-slate-500">
            {t("admin.analytics.overview.completed_tasks")}
          </div>
        </Card>

        <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-orange-50 to-orange-100">
          <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-slate-900">
            <NumberTicker value={kpis.avgTaskDuration.toFixed(1)} />
          </div>
          <div className="text-xs text-slate-500">
            {t("admin.analytics.overview.avg_day_tasks")}
          </div>
        </Card>

        <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-red-50 to-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-slate-900">
            <NumberTicker value={kpis.overdueTasks} />
          </div>
          <div className="text-xs text-slate-500">
            {t("admin.analytics.overview.overdue_tasks")}
          </div>
        </Card>

        <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <span className="text-2xl text-yellow-600 mx-auto mb-2 font-bold">
            TND
          </span>
          <div className="text-xl font-bold text-slate-900">
            TND{" "}
            <NumberTicker value={kpis.totalBudget / kpis.totalTasks / 1000} />K
          </div>
          <div className="text-xs text-slate-500">
            {t("admin.analytics.overview.avg_budget_task")}
          </div>
        </Card>
      </div>

      <SimplifiedControls
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onExport={handleExport}
        onRefresh={handleRefresh}
        customDateRange={customDateRange}
        onCustomDateRangeChange={setCustomDateRange}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6 w-full"
      >
        <TabsList className="grid w-full grid-cols-2 lg:w-full">
          <TabsTrigger value="overview">
            {t("admin.analytics.controle.tabs.status")}
          </TabsTrigger>
          <TabsTrigger value="performance">
            {t("admin.analytics.controle.tabs.performance")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Distribution - Always Pie Chart */}
            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    {t("admin.analytics.controle.status.task_chart.title")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "admin.analytics.controle.status.task_chart.description"
                    )}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      nameKey="status"
                      data={taskStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                      label={(entry) => status(entry.status)}
                    >
                      {taskStatus.map((entry, index) => {
                        const colors = {
                          TODO: "#f59e0b",
                          PROGRESS: "#8b5cf6",
                          REVIEW: "#3b82f6",
                          DONE: "#22c55e",
                        };
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors[entry.status]}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, props: any) => [
                        `${value} tasks (${props.payload.percentage}%)`,
                        `$${props.payload.totalBudget.toLocaleString()} budget`,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    {t("admin.analytics.controle.status.project_chart.title")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "admin.analytics.controle.status.project_chart.description"
                    )}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      nameKey="status"
                      data={projectStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                      label={(entry) => status(entry.status)}
                    >
                      {projectStatus.map((entry, index) => {
                        const colors = {
                          IN_PROGRESS: "#8b5cf6",
                          NOT_STARTED: "#f59e0b",
                          COMPLETED: "#22c55e",
                        };
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors[entry.status]}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, props: any) => [
                        `${value} tasks (${props.payload.percentage}%)`,
                        `$${props.payload.totalBudget.toLocaleString()} budget`,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Team Performance Matrix - Always Bar Chart */}
            <Card className="lg:col-span-2 ">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  {t("admin.analytics.controle.performance.title")}
                </CardTitle>
                <CardDescription>
                  {t("admin.analytics.controle.performance.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[60vh]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={teamPerformance}
                      margin={{ top: 20, right: 30, left: 20, bottom: 100 }} // extra bottom margin
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="userName"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tickFormatter={(name: string) =>
                          name
                            .split(" ")
                            .map(
                              (w) =>
                                w.charAt(0).toUpperCase() +
                                w.slice(1).toLowerCase()
                            )
                            .join(" ")
                        }
                      />
                      <YAxis
                        yAxisId="percent"
                        domain={[0, 100]}
                        label={{
                          value:
                            t(
                              "admin.analytics.controle.performance.completion"
                            ) + " (%)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <YAxis
                        yAxisId="quality"
                        orientation="right"
                        domain={[0, 5]}
                        label={{
                          value:
                            t("admin.analytics.controle.performance.quality") +
                            " (0-5)",
                          angle: 90,
                          position: "insideRight",
                        }}
                      />
                      <Tooltip />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        layout="horizontal"
                        wrapperStyle={{ bottom: 0 }}
                      />
                      <Bar
                        yAxisId="percent"
                        dataKey="completionRate"
                        fill="#3b82f6"
                        radius={4}
                        name={t(
                          "admin.analytics.controle.performance.completion_rate"
                        )}
                      />
                      <Bar
                        yAxisId="quality"
                        dataKey="qualityScore"
                        fill="#22c55e"
                        radius={4}
                        name={t(
                          "admin.analytics.controle.performance.quality_score"
                        )}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
