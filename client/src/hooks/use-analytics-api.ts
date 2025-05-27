"use client"

import { useState, useEffect } from "react"

// API Response Types - Optimized for millions of users
export interface TaskStatusDistribution {
    status: "TODO" | "DONE" | "REVIEW" | "IN_PROGRESS"
    count: number
    percentage: number
    totalBudget: number
}

export interface PerformanceTrend {
    date: string // ISO date string
    velocity: number // Story points completed
    quality: number // Average quality score (0-100)
    efficiency: number // Tasks completed vs planned (0-100)
    burndown: number // Remaining work
}

export interface TeamPerformanceMetric {
    userId: string
    userName: string
    role: string
    tasksAssigned: number
    tasksCompleted: number
    completionRate: number
    avgTaskDuration: number // in hours
    totalBudgetManaged: number
    qualityScore: number
}

export interface TeamWorkloadItem {
    userId: string
    userName: string
    role: string
    currentTasks: number
    capacity: number // max tasks they can handle
    utilizationRate: number // percentage
    avgTaskValue: number
    isOnline: boolean
}

export interface ResourceUtilization {
    resourceId: string
    name: string
    type: "Material" | "Energetic" | "Temporary"
    category: string
    totalCapacity: number
    currentUsage: number
    utilizationRate: number
    costPerUnit: number
    totalCost: number
}

export interface DashboardKPIs {
    totalTasks: number
    completedTasks: number
    completionRate: number
    totalBudget: number
    spentBudget: number
    budgetUtilization: number
    activeUsers: number
    onlineUsers: number
    activeProjects: number
    overdueTasks: number
    highRiskTasks: number
    avgTaskDuration: number
}

export function useAnalyticsAPI(timeRange: string, customDateRange?: { from?: Date; to?: Date }) {
    const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
    const [taskStatus, setTaskStatus] = useState<TaskStatusDistribution[]>([])
    const [projectStatus, setProjectStatus] = useState<any[]>([])

    const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([])
    const [teamPerformance, setTeamPerformance] = useState<TeamPerformanceMetric[]>([])
    const [teamWorkload, setTeamWorkload] = useState<TeamWorkloadItem[]>([])
    const [resourceUtilization, setResourceUtilization] = useState<ResourceUtilization[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAnalyticsData = async () => {
        try {

            const token = localStorage.getItem("authToken");
            if (!token) {
                setLoading(false);
                return;
            }
            setLoading(true)
            setError(null)

            // Build query parameters
            const params = new URLSearchParams({
                timeRange,
                ...(customDateRange?.from && { startDate: customDateRange.from.toISOString() }),
                ...(customDateRange?.to && { endDate: customDateRange.to.toISOString() }),
            })



            // API 1: Dashboard KPIs - Aggregated metrics
            /*
             * Expected API: GET /api/analytics/kpis?timeRange=30d&startDate=2024-01-01&endDate=2024-12-31
             * Expected Response: {
             *   totalTasks: number,
             *   completedTasks: number,
             *   completionRate: number,
             *   totalBudget: number,
             *   spentBudget: number,
             *   budgetUtilization: number,
             *   activeUsers: number,
             *   onlineUsers: number,
             *   activeProjects: number,
             *   overdueTasks: number,
             *   highRiskTasks: number,
             *   avgTaskDuration: number
             * }
             */
            //const kpisResponse = await fetch(`/api/analytics/kpis?${params}`)
            // const kpisData = await kpisResponse.json()

            const response = await fetch(`/api/analytics/kpis?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const kpisData = await response.json();
            console.log('Analytics KPIs:', kpisData);


            // API 2: Task Status Distribution - Aggregated by status
            /*
             * Expected API: GET /api/analytics/task-status?timeRange=30d
             * Expected Response: [
             *   {
             *     status: "TODO",
             *     count: 150,
             *     percentage: 35.5,
             *     totalBudget: 45000
             *   },
             *   {
             *     status: "IN_PROGRESS",
             *     count: 89,
             *     percentage: 21.1,
             *     totalBudget: 67000
             *   }
             * ]
             */
            const taskStatusResponse = await fetch(`/api/analytics/task-status?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const taskStatusData = await taskStatusResponse.json()




            const projectStatusResponse = await fetch(`/api/analytics/project-status?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const projectStatusData = await projectStatusResponse.json()



            // API 4: Team Performance - Top performers with pagination
            /*
             * Expected API: GET /api/analytics/team-performance?timeRange=30d&limit=20&offset=0
             * Expected Response: [
             *   {
             *     userId: "user123",
             *     userName: "John Doe",
             *     role: "Senior Developer",
             *     tasksAssigned: 25,
             *     tasksCompleted: 23,
             *     completionRate: 92.0,
             *     avgTaskDuration: 18.5,
             *     totalBudgetManaged: 125000,
             *     qualityScore: 94.2
             *   }
             * ]
             */
            const teamPerfResponse = await fetch(`/api/analytics/team-performance?${params}&limit=20`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const teamPerfData = await teamPerfResponse.json()

            // API 5: Team Workload - Current active workload
            /*
             * Expected API: GET /api/analytics/team-workload?limit=20
             * Expected Response: [
             *   {
             *     userId: "user123",
             *     userName: "John Doe",
             *     role: "Senior Developer",
             *     currentTasks: 8,
             *     capacity: 10,
             *     utilizationRate: 80.0,
             *     avgTaskValue: 5000,
             *     isOnline: true
             *   }
             * ]
             */
            // const workloadResponse = await fetch(`/api/analytics/team-workload?limit=20`)
            // const workloadData = await workloadResponse.json()

            // API 6: Resource Utilization - Aggregated resource metrics
            /*
             * Expected API: GET /api/analytics/resource-utilization?timeRange=30d
             * Expected Response: [
             *   {
             *     resourceId: "res123",
             *     name: "Development Workstation",
             *     type: "Material",
             *     category: "Hardware",
             *     totalCapacity: 10,
             *     currentUsage: 8,
             *     utilizationRate: 80.0,
             *     costPerUnit: 2500,
             *     totalCost: 20000
             *   }
             * ]
             */
            // const resourceResponse = await fetch(`/api/analytics/resource-utilization?${params}`)
            // const resourceData = await resourceResponse.json()

            // Mock data for demonstration - Replace with actual API calls
            const mockKpis: DashboardKPIs = {
                totalTasks: 1247,
                completedTasks: 892,
                completionRate: 71.5,
                totalBudget: 2450000,
                spentBudget: 1876000,
                budgetUtilization: 76.6,
                activeUsers: 156,
                onlineUsers: 89,
                activeProjects: 23,
                overdueTasks: 34,
                highRiskTasks: 12,
                avgTaskDuration: 4.2,
            }

            const mockTaskStatus: TaskStatusDistribution[] = [
                { status: "TODO", count: 355, percentage: 28.5, totalBudget: 698000 },
                { status: "IN_PROGRESS", count: 267, percentage: 21.4, totalBudget: 567000 },
                { status: "REVIEW", count: 133, percentage: 10.7, totalBudget: 309000 },
                { status: "DONE", count: 492, percentage: 39.4, totalBudget: 876000 },
            ]

            const mockPerformanceTrends: PerformanceTrend[] = [
                { date: "2024-01-01", velocity: 42, quality: 85.2, efficiency: 78.5, burndown: 145 },
                { date: "2024-01-08", velocity: 48, quality: 87.8, efficiency: 82.1, burndown: 132 },
                { date: "2024-01-15", velocity: 52, quality: 89.5, efficiency: 85.7, burndown: 118 },
                { date: "2024-01-22", velocity: 45, quality: 91.2, efficiency: 83.4, burndown: 105 },
                { date: "2024-01-29", velocity: 58, quality: 93.1, efficiency: 88.9, burndown: 89 },
                { date: "2024-02-05", velocity: 61, quality: 94.7, efficiency: 91.2, burndown: 72 },
            ]

            const mockTeamPerformance: TeamPerformanceMetric[] = [
                {
                    userId: "u1",
                    userName: "Sarah Johnson",
                    role: "Senior Developer",
                    tasksAssigned: 28,
                    tasksCompleted: 26,
                    completionRate: 92.9,
                    avgTaskDuration: 16.5,
                    totalBudgetManaged: 145000,
                    qualityScore: 94.2,
                },
                {
                    userId: "u2",
                    userName: "Mike Chen",
                    role: "DevOps Engineer",
                    tasksAssigned: 22,
                    tasksCompleted: 19,
                    completionRate: 86.4,
                    avgTaskDuration: 24.2,
                    totalBudgetManaged: 98000,
                    qualityScore: 89.7,
                },
                {
                    userId: "u3",
                    userName: "Emily Davis",
                    role: "QA Engineer",
                    tasksAssigned: 35,
                    tasksCompleted: 33,
                    completionRate: 94.3,
                    avgTaskDuration: 12.8,
                    totalBudgetManaged: 87000,
                    qualityScore: 96.1,
                },
                {
                    userId: "u4",
                    userName: "Alex Rodriguez",
                    role: "UI/UX Designer",
                    tasksAssigned: 18,
                    tasksCompleted: 15,
                    completionRate: 83.3,
                    avgTaskDuration: 20.1,
                    totalBudgetManaged: 76000,
                    qualityScore: 91.5,
                },
                {
                    userId: "u5",
                    userName: "David Kim",
                    role: "Backend Developer",
                    tasksAssigned: 31,
                    tasksCompleted: 27,
                    completionRate: 87.1,
                    avgTaskDuration: 18.7,
                    totalBudgetManaged: 132000,
                    qualityScore: 88.9,
                },
            ]

            const mockTeamWorkload: TeamWorkloadItem[] = [
                {
                    userId: "u1",
                    userName: "Sarah Johnson",
                    role: "Senior Developer",
                    currentTasks: 8,
                    capacity: 10,
                    utilizationRate: 80.0,
                    avgTaskValue: 5200,
                    isOnline: true,
                },
                {
                    userId: "u2",
                    userName: "Mike Chen",
                    role: "DevOps Engineer",
                    currentTasks: 6,
                    capacity: 8,
                    utilizationRate: 75.0,
                    avgTaskValue: 4500,
                    isOnline: false,
                },
                {
                    userId: "u3",
                    userName: "Emily Davis",
                    role: "QA Engineer",
                    currentTasks: 12,
                    capacity: 15,
                    utilizationRate: 80.0,
                    avgTaskValue: 2800,
                    isOnline: true,
                },
                {
                    userId: "u4",
                    userName: "Alex Rodriguez",
                    role: "UI/UX Designer",
                    currentTasks: 5,
                    capacity: 7,
                    utilizationRate: 71.4,
                    avgTaskValue: 4200,
                    isOnline: true,
                },
                {
                    userId: "u5",
                    userName: "David Kim",
                    role: "Backend Developer",
                    currentTasks: 9,
                    capacity: 12,
                    utilizationRate: 75.0,
                    avgTaskValue: 4800,
                    isOnline: false,
                },
            ]

            const mockResourceUtilization: ResourceUtilization[] = [
                {
                    resourceId: "r1",
                    name: "Development Workstations",
                    type: "Material",
                    category: "Hardware",
                    totalCapacity: 50,
                    currentUsage: 42,
                    utilizationRate: 84.0,
                    costPerUnit: 2500,
                    totalCost: 105000,
                },
                {
                    resourceId: "r2",
                    name: "Cloud Infrastructure",
                    type: "Energetic",
                    category: "Computing",
                    totalCapacity: 1000,
                    currentUsage: 756,
                    utilizationRate: 75.6,
                    costPerUnit: 0.15,
                    totalCost: 113.4,
                },
                {
                    resourceId: "r3",
                    name: "Software Licenses",
                    type: "Temporary",
                    category: "Software",
                    totalCapacity: 200,
                    currentUsage: 167,
                    utilizationRate: 83.5,
                    costPerUnit: 299,
                    totalCost: 49933,
                },
                {
                    resourceId: "r4",
                    name: "Meeting Rooms",
                    type: "Material",
                    category: "Facilities",
                    totalCapacity: 12,
                    currentUsage: 8,
                    utilizationRate: 66.7,
                    costPerUnit: 100,
                    totalCost: 800,
                },
            ]

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 800))

            setKpis(kpisData)
            setTaskStatus(taskStatusData)
            setProjectStatus(projectStatusData)

            // setPerformanceTrends(mockPerformanceTrends)

            console.log(teamPerfData)
            setTeamPerformance(teamPerfData)
            setTeamWorkload(mockTeamWorkload)
            setResourceUtilization(mockResourceUtilization)
        } catch (err) {
            setError("Failed to fetch analytics data")
            console.error("Analytics API Error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalyticsData()
    }, [timeRange, customDateRange])

    return {
        projectStatus,
        kpis,
        taskStatus,
        performanceTrends,
        teamPerformance,
        teamWorkload,
        resourceUtilization,
        loading,
        error,
        refetch: fetchAnalyticsData,
    }
}
