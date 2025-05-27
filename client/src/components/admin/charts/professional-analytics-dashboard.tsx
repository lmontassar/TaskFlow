"use client"

import { useState } from "react"
import {
    Activity,
    BarChart3,
    CheckCircle,
    DollarSign,
    TrendingUp,
    Users,
    AlertTriangle,
    Target,
    Award,
    Briefcase,
    Settings,
    Clock,
    Maximize2,
    Share2,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Bar,
    BarChart,
    Line,
    LineChart,
    Pie,
    PieChart,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Scatter,
    ScatterChart,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts"
import { useAnalyticsAPI } from "@/hooks/use-analytics-api"
import { SimplifiedControls, type TimeRange } from "./simplified-controls"
import Loading from "../../ui/loading"

export default function ProfessionalAnalyticsDashboard() {
    const [timeRange, setTimeRange] = useState<TimeRange>("30d")
    const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({})
    const [activeTab, setActiveTab] = useState("overview")

    const {
        kpis,
        taskStatus,
        performanceTrends,
        teamPerformance,
        teamWorkload,
        resourceUtilization,
        loading,
        error,
        refetch,
    } = useAnalyticsAPI(timeRange, customDateRange)

    const handleExport = () => {
        // Export functionality - can export specific chart data
        const exportData = {
            kpis,
            taskStatus,
            performanceTrends,
            teamPerformance,
            teamWorkload,
            resourceUtilization,
            exportedAt: new Date().toISOString(),
            timeRange,
            customDateRange,
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analytics-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleRefresh = () => {
        refetch()
    }

    if (loading) {
        return (
            <Loading></Loading>
        )
    }

    if (error || !kpis) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                    <p className="text-slate-600 text-lg">{error || "No data available"}</p>
                    <Button onClick={handleRefresh} className="mt-4">
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    return (

        <>


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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                    <TabsTrigger value="team">Team Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Task Status Distribution - Always Pie Chart */}
                        <Card className="shadow-lg border-0">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-purple-500" />
                                        Task Status Distribution
                                    </CardTitle>
                                    <CardDescription>Current status breakdown with budget allocation</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm">
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={taskStatus}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={120}
                                            paddingAngle={5}
                                            dataKey="count"
                                        >
                                            {taskStatus.map((entry, index) => {
                                                const colors = {
                                                    TODO: "#f59e0b",
                                                    IN_PROGRESS: "#8b5cf6",
                                                    REVIEW: "#3b82f6",
                                                    DONE: "#22c55e",
                                                }
                                                return <Cell key={`cell-${index}`} fill={colors[entry.status]} />
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

                        {/* Performance Trends - Always Line Chart */}
                        <Card className="shadow-lg border-0">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-blue-500" />
                                        Performance Trends
                                    </CardTitle>
                                    <CardDescription>Velocity, quality, and efficiency over time</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm">
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={performanceTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                                        <YAxis />
                                        <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                                        <Legend />
                                        <Line type="monotone" dataKey="velocity" stroke="#3b82f6" strokeWidth={3} name="Velocity" />
                                        <Line type="monotone" dataKey="quality" stroke="#22c55e" strokeWidth={3} name="Quality %" />
                                        <Line type="monotone" dataKey="efficiency" stroke="#f59e0b" strokeWidth={3} name="Efficiency %" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Team Performance Matrix - Always Bar Chart */}
                        <Card className="lg:col-span-2 shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-green-500" />
                                    Team Performance Matrix
                                </CardTitle>
                                <CardDescription>Top performers with completion rates and quality scores</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={teamPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="userName" angle={-45} textAnchor="end" height={80} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="completionRate" fill="#3b82f6" radius={4} name="Completion Rate %" />
                                        <Bar dataKey="qualityScore" fill="#22c55e" radius={4} name="Quality Score" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Performance Summary */}
                        <Card className="shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-yellow-500" />
                                    Performance Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Avg. Task Duration</span>
                                        <span className="font-medium">{kpis.avgTaskDuration.toFixed(1)} days</span>
                                    </div>
                                    <Progress value={(kpis.avgTaskDuration / 10) * 100} className="h-2" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Team Efficiency</span>
                                        <span className="font-medium">
                                            {(
                                                performanceTrends.reduce((sum, trend) => sum + trend.efficiency, 0) / performanceTrends.length
                                            ).toFixed(1)}
                                            %
                                        </span>
                                    </div>
                                    <Progress
                                        value={
                                            performanceTrends.reduce((sum, trend) => sum + trend.efficiency, 0) / performanceTrends.length
                                        }
                                        className="h-2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Quality Score</span>
                                        <span className="font-medium">
                                            {(
                                                performanceTrends.reduce((sum, trend) => sum + trend.quality, 0) / performanceTrends.length
                                            ).toFixed(1)}
                                            %
                                        </span>
                                    </div>
                                    <Progress
                                        value={
                                            performanceTrends.reduce((sum, trend) => sum + trend.quality, 0) / performanceTrends.length
                                        }
                                        className="h-2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Budget Utilization</span>
                                        <span className="font-medium">{kpis.budgetUtilization.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={kpis.budgetUtilization} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="resources" className="space-y-6">
                    <Card className="shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-indigo-500" />
                                Resource Utilization Analysis
                            </CardTitle>
                            <CardDescription>Optimized resource allocation and efficiency metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {resourceUtilization.map((resource, index) => (
                                    <div key={index} className="space-y-2 p-4 bg-slate-50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-medium">{resource.name}</span>
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    {resource.category}
                                                </Badge>
                                                <Badge variant="secondary" className="ml-1 text-xs">
                                                    {resource.type}
                                                </Badge>
                                            </div>
                                            <span className="text-sm text-slate-500">{resource.utilizationRate.toFixed(1)}% utilized</span>
                                        </div>
                                        <Progress value={resource.utilizationRate} className="h-2" />
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>
                                                {resource.currentUsage.toLocaleString()} / {resource.totalCapacity.toLocaleString()} units
                                            </span>
                                            <span>${resource.totalCost.toLocaleString()} total cost</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="team" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Team Workload Distribution */}
                        <Card className="shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    Team Workload Distribution
                                </CardTitle>
                                <CardDescription>Current capacity and utilization rates</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {teamWorkload.map((member, index) => (
                                    <div key={index} className="space-y-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {member.userName
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </div>
                                                <div>
                                                    <span className="font-medium">{member.userName}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {member.role}
                                                        </Badge>
                                                        {member.isOnline && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs bg-green-50 text-green-700 border-green-200"
                                                            >
                                                                Online
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold">
                                                    {member.currentTasks}/{member.capacity}
                                                </div>
                                                <div className="text-xs text-slate-500">tasks</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Utilization Rate</span>
                                                <span className="font-medium">{member.utilizationRate.toFixed(1)}%</span>
                                            </div>
                                            <Progress value={member.utilizationRate} className="h-2" />
                                        </div>

                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>${member.avgTaskValue.toLocaleString()} avg task value</span>
                                            <span>
                                                {member.capacity - member.currentTasks > 0
                                                    ? `${member.capacity - member.currentTasks} slots available`
                                                    : "At capacity"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Team Performance Scatter */}
                        <Card className="shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-green-500" />
                                    Team Performance Scatter
                                </CardTitle>
                                <CardDescription>Tasks completed vs completion rate analysis</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={400}>
                                    <ScatterChart data={teamPerformance} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="tasksCompleted" name="Tasks Completed" />
                                        <YAxis dataKey="completionRate" name="Completion Rate %" />
                                        <Tooltip
                                            cursor={{ strokeDasharray: "3 3" }}
                                            formatter={(value: any, name: any, props: any) => [
                                                `${value}${name === "Completion Rate %" ? "%" : ""}`,
                                                name,
                                            ]}
                                            labelFormatter={(label, payload) => {
                                                if (payload && payload[0]) {
                                                    return payload[0].payload.userName
                                                }
                                                return ""
                                            }}
                                        />
                                        <Scatter name="Performance" dataKey="completionRate" fill="#8b5cf6" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Quick Stats Footer */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                    <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-slate-900">{kpis.activeProjects}</div>
                    <div className="text-xs text-slate-500">Active Projects</div>
                </Card>

                <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-slate-900">{kpis.completedTasks.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Completed Tasks</div>
                </Card>

                <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-slate-900">{kpis.activeUsers}</div>
                    <div className="text-xs text-slate-500">Active Users</div>
                </Card>

                <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                    <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-slate-900">{kpis.avgTaskDuration.toFixed(1)}</div>
                    <div className="text-xs text-slate-500">Avg Days/Task</div>
                </Card>

                <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-red-50 to-red-100">
                    <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-slate-900">{kpis.overdueTasks}</div>
                    <div className="text-xs text-slate-500">Overdue Tasks</div>
                </Card>

                <Card className="text-center p-4 shadow-md border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
                    <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-slate-900">
                        ${(kpis.totalBudget / kpis.totalTasks / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs text-slate-500">Avg Budget/Task</div>
                </Card>
            </div>
        </>
    )
}
