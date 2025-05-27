import { useState } from "react";
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

export default function ProfessionalAnalyticsDashboard() {
    const [timeRange, setTimeRange] = useState<TimeRange>("30d");
    const [customDateRange, setCustomDateRange] = useState<{
        from?: Date;
        to?: Date;
    }>({});
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
    const { users } = useStatistics();

    const handleExport = () => {
        // Export functionality - can export specific chart data
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
                return "TO-DO";
            case "IN_PROGRESS":
                return "In Progress";
            case "PROGRESS":
                return "In Progress";
            case "REVIEW":
                return "Review";
            case "DONE":
                return "Done";
            case "NOT_STARTED":
                return "Not Started";
            case "COMPLETED":
                return "Completed";
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

                    <div className="text-xs text-slate-500">Users Growth</div>
                </Card>
                <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                    <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-slate-900">
                        <NumberTicker value={kpis.activeProjects} />
                    </div>
                    <div className="text-xs text-slate-500">Active Projects</div>
                </Card>

                <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-slate-900">
                        <NumberTicker value={kpis.completedTasks} />
                    </div>
                    <div className="text-xs text-slate-500">Completed Tasks</div>
                </Card>

                <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                    <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-slate-900">
                        <NumberTicker value={kpis.avgTaskDuration.toFixed(1)} />
                    </div>
                    <div className="text-xs text-slate-500">Avg Days/Task</div>
                </Card>

                <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-red-50 to-red-100">
                    <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-slate-900">
                        <NumberTicker value={kpis.overdueTasks} />
                    </div>
                    <div className="text-xs text-slate-500">Overdue Tasks</div>
                </Card>

                <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
                    <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-slate-900">
                        $
                        <NumberTicker value={kpis.totalBudget / kpis.totalTasks / 1000} />K
                    </div>
                    <div className="text-xs text-slate-500">Avg Budget/Task</div>
                </Card>
            </div>

            {/* Simplified Controls */}
            <SimplifiedControls
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                onExport={handleExport}
                onRefresh={handleRefresh}
                customDateRange={customDateRange}
                onCustomDateRangeChange={setCustomDateRange}
            />

            {/* Analytics Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6 w-full"
            >
                <TabsList className="grid w-full grid-cols-2 lg:w-full">
                    <TabsTrigger value="overview">Status</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Task Status Distribution - Always Pie Chart */}
                        <Card className="">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-purple-500" />
                                        Task Status Distribution
                                    </CardTitle>
                                    <CardDescription>
                                        Current status breakdown with budget allocation
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
                                        Project Status Distribution
                                    </CardTitle>
                                    <CardDescription>
                                        Current status breakdown with budget allocation
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
                                    Team Performance Matrix
                                </CardTitle>
                                <CardDescription>
                                    Top performers with completion rates and quality scores
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
                                                // rotate labels but also capitalize each word
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                tickFormatter={(name: string) =>
                                                    name
                                                        .split(" ")
                                                        .map(
                                                            w =>
                                                                w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
                                                        )
                                                        .join(" ")
                                                }
                                            />
                                            {/* left % axis */}
                                            <YAxis
                                                yAxisId="percent"
                                                domain={[0, 100]}
                                                label={{
                                                    value: "Completion %",
                                                    angle: -90,
                                                    position: "insideLeft",
                                                }}
                                            />
                                            {/* right 0–5 axis */}
                                            <YAxis
                                                yAxisId="quality"
                                                orientation="right"
                                                domain={[0, 5]}
                                                label={{
                                                    value: "Quality (0–5)",
                                                    angle: 90,
                                                    position: "insideRight",
                                                }}
                                            />
                                            <Tooltip />
                                            {/* Move legend to very bottom */}
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
                                                name="Completion Rate (%)"
                                            />
                                            <Bar
                                                yAxisId="quality"
                                                dataKey="qualityScore"
                                                fill="#22c55e"
                                                radius={4}
                                                name="Quality Score (0–5)"
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