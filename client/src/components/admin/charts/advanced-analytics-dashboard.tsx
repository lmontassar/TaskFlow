import { useMemo, useState } from "react"
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
  PieChart,
  BarChart,
  Maximize2,
  Download,
  Share2,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
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
import { useApiData } from "@/hooks/use-api-data"
import { ChartControls, type ChartType, type TimeRange, type GroupBy } from "./chart-controls"

export default function AdvancedAnalyticsDashboard() {
  const { users, tasks, projects, resources, loading, error } = useApiData()

  // Chart control states
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")
  const [groupBy, setGroupBy] = useState<GroupBy>("week")
  const [showLegend, setShowLegend] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [filters, setFilters] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  const analytics = useMemo(() => {
    if (!users.length || !tasks.length || !projects.length || !resources.length) {
      return null
    }

    // Enhanced Task Status Distribution
    const taskStatusData = [
      {
        name: "TODO",
        value: tasks.filter((t) => t.statut === "TODO").length,
        color: "#f59e0b",
        budget: tasks.filter((t) => t.statut === "TODO").reduce((sum, t) => sum + t.budgetEstime, 0),
      },
      {
        name: "DONE",
        value: tasks.filter((t) => t.statut === "DONE").length,
        color: "#22c55e",
        budget: tasks.filter((t) => t.statut === "DONE").reduce((sum, t) => sum + t.budgetEstime, 0),
      },
      {
        name: "REVIEW",
        value: tasks.filter((t) => t.statut === "REVIEW").length,
        color: "#3b82f6",
        budget: tasks.filter((t) => t.statut === "REVIEW").reduce((sum, t) => sum + t.budgetEstime, 0),
      },
      {
        name: "IN_PROGRESS",
        value: tasks.filter((t) => t.statut === "IN_PROGRESS").length,
        color: "#8b5cf6",
        budget: tasks.filter((t) => t.statut === "IN_PROGRESS").reduce((sum, t) => sum + t.budgetEstime, 0),
      },
    ]

    // Performance Metrics Over Time
    const performanceData = [
      { period: "Week 1", velocity: 12, quality: 85, efficiency: 78, burndown: 45 },
      { period: "Week 2", velocity: 15, quality: 88, efficiency: 82, burndown: 38 },
      { period: "Week 3", velocity: 18, quality: 92, efficiency: 85, burndown: 28 },
      { period: "Week 4", velocity: 14, quality: 89, efficiency: 80, burndown: 22 },
      { period: "Week 5", velocity: 20, quality: 94, efficiency: 88, burndown: 15 },
      { period: "Week 6", velocity: 22, quality: 96, efficiency: 90, burndown: 8 },
    ]

    // Resource Utilization Heatmap Data
    const resourceUtilization = resources.map((resource) => ({
      name: resource.nom,
      utilization: resource.utilisationTotale || resource.consommationTotale || 0,
      capacity: resource.qte || resource.consommationMax || 100,
      efficiency:
        ((resource.utilisationTotale || resource.consommationTotale || 0) /
          (resource.qte || resource.consommationMax || 100)) *
        100,
      cost: resource.coutUnitaire,
      category: resource.categorie,
    }))

    // Team Performance Matrix
    const teamPerformance = users.map((user) => {
      const userTasks = tasks.filter(
        (task) =>
          task.assignee.some((assignee) => assignee.$id.$oid === user._id.$oid) ||
          task.rapporteur.$id.$oid === user._id.$oid,
      )
      const completedTasks = userTasks.filter((t) => t.statut === "DONE")

      return {
        name: `${user.prenom} ${user.nom}`,
        tasks: userTasks.length,
        completed: completedTasks.length,
        completionRate: userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0,
        budget: userTasks.reduce((sum, t) => sum + t.budgetEstime, 0),
        avgTaskValue:
          userTasks.length > 0 ? userTasks.reduce((sum, t) => sum + t.budgetEstime, 0) / userTasks.length : 0,
        role: user.role,
        active: user.activation && !user.blocked,
        online: user.online || false,
      }
    })

    // Budget Analysis
    const totalBudget = tasks.reduce((sum, task) => sum + task.budgetEstime, 0)
    const completedTasksBudget = tasks.filter((t) => t.statut === "DONE").reduce((sum, t) => sum + t.budgetEstime, 0)
    const budgetUtilization = (completedTasksBudget / totalBudget) * 100

    // Risk Analysis
    const overdueTasks = tasks.filter((task) => {
      const endDate = new Date(task.dateFinEstime.$date)
      const now = new Date()
      return endDate < now && task.statut !== "DONE"
    }).length

    const highRiskTasks = tasks.filter((task) => task.difficulte === "hard" && task.statut !== "DONE").length

    return {
      taskStatusData,
      performanceData,
      resourceUtilization,
      teamPerformance,
      totalBudget,
      completedTasksBudget,
      budgetUtilization,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.statut === "DONE").length,
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === "IN_PROGRESS").length,
      totalResources: resources.length,
      availableResources: resources.filter((r) => r.status === "AVAILABLE").length,
      activeUsers: users.filter((u) => u.activation && !u.blocked).length,
      onlineUsers: users.filter((u) => u.online).length,
      overdueTasks,
      highRiskTasks,
      avgTaskDuration:
        tasks.length > 0
          ? tasks.reduce((sum, t) => sum + Number.parseInt(t.duree.$numberLong), 0) / tasks.length / 86400
          : 0, // Convert to days
    }
  }, [users, tasks, projects, resources])

  const handleExport = () => {
    // Export functionality
    console.log("Exporting chart data...")
  }

  const handleRefresh = () => {
    // Refresh functionality
    console.log("Refreshing data...")
    window.location.reload()
  }

  const renderChart = (data: any[], config: any, height = 300) => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    }

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              <Line type="monotone" dataKey="velocity" stroke="#3b82f6" strokeWidth={3} />
              <Line type="monotone" dataKey="quality" stroke="#22c55e" strokeWidth={3} />
              <Line type="monotone" dataKey="efficiency" stroke="#f59e0b" strokeWidth={3} />
            </RechartsLineChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              <Area type="monotone" dataKey="velocity" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="quality" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        )

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="tasks" name="Tasks" />
              <YAxis dataKey="completionRate" name="Completion Rate" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Team Performance" dataKey="completionRate" fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              {showLegend && <Legend />}
            </RechartsPieChart>
          </ResponsiveContainer>
        )

      default: // bar
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              <Bar dataKey="tasks" fill="#3b82f6" radius={4} />
              <Bar dataKey="completed" fill="#22c55e" radius={4} />
            </RechartsBarChart>
          </ResponsiveContainer>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg">Loading advanced analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <p className="text-slate-600 text-lg">{error || "No data available"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TaskFlow Analytics Pro
            </h1>
            <p className="text-slate-600 mt-2 text-lg">Advanced project management insights with real-time analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
              <Activity className="w-4 h-4 mr-2" />
              Live Data
            </Badge>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Tasks</CardTitle>
              <BarChart3 className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.totalTasks}</div>
              <p className="text-xs opacity-90 mt-1">
                {analytics.completedTasks} completed (
                {((analytics.completedTasks / analytics.totalTasks) * 100).toFixed(1)}%)
              </p>
              <div className="mt-2">
                <Progress value={(analytics.completedTasks / analytics.totalTasks) * 100} className="h-1 bg-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Budget Efficiency</CardTitle>
              <DollarSign className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.budgetUtilization.toFixed(1)}%</div>
              <p className="text-xs opacity-90 mt-1">
                ${analytics.completedTasksBudget.toLocaleString()} of ${analytics.totalBudget.toLocaleString()}
              </p>
              <div className="mt-2">
                <Progress value={analytics.budgetUtilization} className="h-1 bg-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Team Activity</CardTitle>
              <Users className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analytics.onlineUsers}/{analytics.activeUsers}
              </div>
              <p className="text-xs opacity-90 mt-1">Online / Active users</p>
              <div className="mt-2">
                <Progress value={(analytics.onlineUsers / analytics.activeUsers) * 100} className="h-1 bg-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Risk Indicators</CardTitle>
              <AlertTriangle className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.overdueTasks + analytics.highRiskTasks}</div>
              <p className="text-xs opacity-90 mt-1">
                {analytics.overdueTasks} overdue, {analytics.highRiskTasks} high-risk
              </p>
              <div className="mt-2">
                <Progress
                  value={((analytics.overdueTasks + analytics.highRiskTasks) / analytics.totalTasks) * 100}
                  className="h-1 bg-orange-400"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Controls */}
        <ChartControls
          chartType={chartType}
          onChartTypeChange={setChartType}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          showLegend={showLegend}
          onShowLegendChange={setShowLegend}
          showGrid={showGrid}
          onShowGridChange={setShowGrid}
          onExport={handleExport}
          onRefresh={handleRefresh}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Advanced Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="team">Team Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Status Distribution */}
              <Card className="shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-purple-500" />
                      Task Status Distribution
                    </CardTitle>
                    <CardDescription>Current status breakdown with budget allocation</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>{renderChart(analytics.taskStatusData, {}, 350)}</CardContent>
              </Card>

              {/* Performance Trends */}
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
                <CardContent>{renderChart(analytics.performanceData, {}, 350)}</CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Metrics */}
              <Card className="lg:col-span-2 shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-green-500" />
                    Team Performance Matrix
                  </CardTitle>
                  <CardDescription>Individual team member performance analysis</CardDescription>
                </CardHeader>
                <CardContent>{renderChart(analytics.teamPerformance, {}, 400)}</CardContent>
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
                      <span className="font-medium">{analytics.avgTaskDuration.toFixed(1)} days</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Team Efficiency</span>
                      <span className="font-medium">87.5%</span>
                    </div>
                    <Progress value={87.5} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quality Score</span>
                      <span className="font-medium">92.3%</span>
                    </div>
                    <Progress value={92.3} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Resource Utilization</span>
                      <span className="font-medium">78.9%</span>
                    </div>
                    <Progress value={78.9} className="h-2" />
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
                <CardDescription>Detailed resource allocation and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.resourceUtilization.map((resource, index) => (
                    <div key={index} className="space-y-2 p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{resource.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {resource.category}
                          </Badge>
                        </div>
                        <span className="text-sm text-slate-500">{resource.efficiency.toFixed(1)}% utilized</span>
                      </div>
                      <Progress value={resource.efficiency} className="h-2" />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>
                          {resource.utilization} / {resource.capacity} units
                        </span>
                        <span>${resource.cost}/unit</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Team Workload Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics.teamPerformance.map((member, index) => (
                    <div key={index} className="space-y-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <span className="font-medium">{member.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={member.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                                {member.role}
                              </Badge>
                              {member.online && (
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
                          <div className="text-lg font-bold">{member.tasks}</div>
                          <div className="text-xs text-slate-500">tasks</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completion Rate</span>
                          <span className="font-medium">{member.completionRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={member.completionRate} className="h-2" />
                      </div>

                      <div className="flex justify-between text-xs text-slate-500">
                        <span>${member.budget.toLocaleString()} total budget</span>
                        <span>${member.avgTaskValue.toFixed(0)} avg/task</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Team Performance Scatter
                  </CardTitle>
                  <CardDescription>Task count vs completion rate analysis</CardDescription>
                </CardHeader>
                <CardContent>{renderChart(analytics.teamPerformance, {}, 400)}</CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
