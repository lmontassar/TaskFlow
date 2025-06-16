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

    const [performanceTrends] = useState<PerformanceTrend[]>([])
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

            const teamPerfResponse = await fetch(`/api/analytics/team-performance?${params}&limit=20`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const teamPerfData = await teamPerfResponse.json()
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
            await new Promise((resolve) => setTimeout(resolve, 800))

            setKpis(kpisData)
            console.log(kpisData)

            setTaskStatus(taskStatusData)
            console.log(taskStatusData)

            setProjectStatus(projectStatusData)
            console.log(projectStatusData)


            setTeamPerformance(teamPerfData)
            console.log(teamPerfData)
            setTeamWorkload(mockTeamWorkload)
            console.log(mockTeamWorkload)
            setResourceUtilization(mockResourceUtilization)
            console.log(mockResourceUtilization)

            console.log()
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
