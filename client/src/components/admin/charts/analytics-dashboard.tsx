"use client"

import { useMemo } from "react"
import {
  Activity,
  BarChart3,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  Target,
  Zap,
  Award,
  Calendar,
  Briefcase,
  Settings,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid } from "recharts"
import { useApiData } from "@/hooks/use-api-data"

export default function AnalyticsDashboard() {
  const { users, tasks, projects, resources, loading, error } = useApiData()

  const analytics = useMemo(() => {
    if (!users.length || !tasks.length || !projects.length || !resources.length) {
      return null
    }

    // Task Status Distribution
    const taskStatusData = [
      { name: "TODO", value: tasks.filter((t) => t.statut === "TODO").length, color: "#f59e0b" },
      { name: "DONE", value: tasks.filter((t) => t.statut === "DONE").length, color: "#22c55e" },
      { name: "REVIEW", value: tasks.filter((t) => t.statut === "REVIEW").length, color: "#3b82f6" },
      { name: "IN_PROGRESS", value: tasks.filter((t) => t.statut === "IN_PROGRESS").length, color: "#8b5cf6" },
    ]

    // Task Difficulty Distribution
    const difficultyData = [
      {
        difficulty: "Easy",
        count: tasks.filter((t) => t.difficulte === "easy").length,
        budget: tasks.filter((t) => t.difficulte === "easy").reduce((sum, t) => sum + t.budgetEstime, 0),
      },
      {
        difficulty: "Normal",
        count: tasks.filter((t) => t.difficulte === "normal").length,
        budget: tasks.filter((t) => t.difficulte === "normal").reduce((sum, t) => sum + t.budgetEstime, 0),
      },
      {
        difficulty: "Hard",
        count: tasks.filter((t) => t.difficulte === "hard").length,
        budget: tasks.filter((t) => t.difficulte === "hard").reduce((sum, t) => sum + t.budgetEstime, 0),
      },
    ]

    // Budget Analysis
    const totalBudget = tasks.reduce((sum, task) => sum + task.budgetEstime, 0)
    const completedTasksBudget = tasks.filter((t) => t.statut === "DONE").reduce((sum, t) => sum + t.budgetEstime, 0)
    const budgetUtilization = (completedTasksBudget / totalBudget) * 100

    // User Activity
    const activeUsers = users.filter((u) => u.activation && !u.blocked).length
    const adminUsers = users.filter((u) => u.role === "ADMIN").length
    const onlineUsers = users.filter((u) => u.online).length

    // Resource Analysis
    const resourcesByType = [
      {
        type: "Material",
        count: resources.filter((r) => r.type === "Material").length,
        value: resources
          .filter((r) => r.type === "Material")
          .reduce((sum, r) => sum + r.coutUnitaire * (r.qte || 1), 0),
      },
      {
        type: "Energetic",
        count: resources.filter((r) => r.type === "Energetic").length,
        value: resources
          .filter((r) => r.type === "Energetic")
          .reduce((sum, r) => sum + r.coutUnitaire * (r.consommationTotale || 0), 0),
      },
      {
        type: "Temporary",
        count: resources.filter((r) => r.type === "Temporary").length,
        value: resources
          .filter((r) => r.type === "Temporary")
          .reduce((sum, r) => sum + r.coutUnitaire * (r.qte || 1), 0),
      },
    ]

    // Monthly Task Creation Trend
    const monthlyTasks = tasks.reduce(
      (acc, task) => {
        const month = new Date(task.dateCreation.$date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
        acc[month] = (acc[month] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const taskTrendData = Object.entries(monthlyTasks).map(([month, count]) => ({
      month,
      tasks: count,
      budget: tasks
        .filter((t) => {
          const taskMonth = new Date(t.dateCreation.$date).toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          })
          return taskMonth === month
        })
        .reduce((sum, t) => sum + t.budgetEstime, 0),
    }))

    // Team Workload
    const teamWorkload = users.map((user) => {
      const userTasks = tasks.filter(
        (task) =>
          task.assignee.some((assignee) => assignee.$id.$oid === user._id.$oid) ||
          task.rapporteur.$id.$oid === user._id.$oid,
      )
      return {
        name: `${user.prenom} ${user.nom}`,
        tasks: userTasks.length,
        budget: userTasks.reduce((sum, t) => sum + t.budgetEstime, 0),
        role: user.role,
        active: user.activation && !user.blocked,
      }
    })

    return {
      taskStatusData,
      difficultyData,
      totalBudget,
      completedTasksBudget,
      budgetUtilization,
      activeUsers,
      adminUsers,
      onlineUsers,
      resourcesByType,
      taskTrendData,
      teamWorkload,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.statut === "DONE").length,
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === "IN_PROGRESS").length,
      totalResources: resources.length,
      availableResources: resources.filter((r) => r.status === "AVAILABLE").length,
    }
  }, [users, tasks, projects, resources])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600">{error || "No data available"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">TaskFlow Analytics Dashboard</h1>
            <p className="text-slate-600 mt-1">Real-time insights from your project management data</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Tasks</CardTitle>
              <BarChart3 className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTasks}</div>
              <p className="text-xs opacity-90">{analytics.completedTasks} completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((analytics.completedTasks / analytics.totalTasks) * 100).toFixed(1)}%
              </div>
              <p className="text-xs opacity-90">
                {analytics.completedTasks}/{analytics.totalTasks} tasks
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Active Users</CardTitle>
              <Users className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeUsers}</div>
              <p className="text-xs opacity-90">{analytics.onlineUsers} online now</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Budget Utilization</CardTitle>
              <DollarSign className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.budgetUtilization.toFixed(1)}%</div>
              <p className="text-xs opacity-90">
                ${analytics.completedTasksBudget.toLocaleString()} of ${analytics.totalBudget.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Task Status Distribution
              </CardTitle>
              <CardDescription>Current status of all tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  TODO: { label: "To Do", color: "#f59e0b" },
                  DONE: { label: "Done", color: "#22c55e" },
                  REVIEW: { label: "Review", color: "#3b82f6" },
                  IN_PROGRESS: { label: "In Progress", color: "#8b5cf6" },
                }}
                className="h-[300px]"
              >
                <PieChart>
                  <Pie
                    data={analytics.taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Task Difficulty Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Task Difficulty Analysis
              </CardTitle>
              <CardDescription>Tasks and budget by difficulty level</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: { label: "Task Count", color: "#3b82f6" },
                  budget: { label: "Budget ($)", color: "#22c55e" },
                }}
                className="h-[300px]"
              >
                <BarChart data={analytics.difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="difficulty" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                  <Bar dataKey="budget" fill="var(--color-budget)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Task Trends & Team Workload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Creation Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Task Creation Trends
              </CardTitle>
              <CardDescription>Monthly task creation and budget allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  tasks: { label: "Tasks Created", color: "#3b82f6" },
                  budget: { label: "Budget Allocated", color: "#22c55e" },
                }}
                className="h-[300px]"
              >
                <LineChart data={analytics.taskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="tasks" stroke="var(--color-tasks)" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="budget" stroke="var(--color-budget)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Team Workload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Team Workload Distribution
              </CardTitle>
              <CardDescription>Tasks assigned per team member</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.teamWorkload.map((member, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{member.name}</span>
                      <Badge variant={member.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                        {member.role}
                      </Badge>
                      {!member.active && (
                        <Badge variant="destructive" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-slate-500">{member.tasks} tasks</span>
                  </div>
                  <Progress
                    value={(member.tasks / Math.max(...analytics.teamWorkload.map((m) => m.tasks))) * 100}
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>${member.budget.toLocaleString()} budget</span>
                    <span>
                      {member.tasks > 0
                        ? `$${Math.round(member.budget / member.tasks).toLocaleString()}/task`
                        : "No tasks"}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Resource Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-500" />
              Resource Analysis
            </CardTitle>
            <CardDescription>Resource distribution and utilization by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Resource Count", color: "#8b5cf6" },
                value: { label: "Total Value ($)", color: "#f59e0b" },
              }}
              className="h-[300px]"
            >
              <BarChart data={analytics.resourcesByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center p-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{analytics.activeProjects}</div>
            <div className="text-sm text-slate-500">Active Projects</div>
          </Card>

          <Card className="text-center p-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{analytics.adminUsers}</div>
            <div className="text-sm text-slate-500">Admin Users</div>
          </Card>

          <Card className="text-center p-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{analytics.availableResources}</div>
            <div className="text-sm text-slate-500">Available Resources</div>
          </Card>

          <Card className="text-center p-4">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              ${Math.round(analytics.totalBudget / analytics.totalTasks).toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">Avg. Task Budget</div>
          </Card>
        </div>
      </div>
    </div>
  )
}
