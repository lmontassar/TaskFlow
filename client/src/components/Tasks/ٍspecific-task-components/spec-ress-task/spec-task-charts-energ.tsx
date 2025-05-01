"use client"

import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'



export default function TaskResourceStatisticEnergitic({ task }: any) {
  const [chartData, setChartData] = useState<any[]>([])
  const [assignmentPercentage, setAssignmentPercentage] = useState<number>(0)
  const { t } = useTranslation();


  const chartConfig = {
    utilizationPercentage: {
      label: t("task.chart_energetic.utilization_percentage", "Utilization %"),
      color: "hsl(239, 100.00%, 58.00%)", // Green color
    },
  } satisfies ChartConfig

  // Helper function to format numbers with commas
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "0"
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Custom label component for the bars
  const CustomBarLabel = (props: any) => {
    const { x, y, width, height, value, payload } = props


    if (!payload) return null;

    // Only render if there's enough space
    if (width < 40) return null

    // Get the actual consumption value and unit from the payload
    const qteAssigned = payload.qteAssigned
    const unitMeasure = payload.unitMeasure || ""

    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fontWeight="500"
      >
        {`${formatNumber(qteAssigned)} ${unitMeasure}`}
      </text>
    )
  }
  // Process task data to create chart data
  useEffect(() => {
    if (!task?.ressources) return

    const newChartData = task.ressources
      .filter((r: any) => r.ress.type === "Energetic")
      .map((r: any) => {
        const qteMax = r.ress.consommationMax || 0
        const qteAssigned = r.consommation || 0
        const utilizationPercentage = qteMax > 0 ? Math.round((qteAssigned / qteMax) * 100) : 0
        const unitMeasure = r.ress.unitMeasure || ""

        return {
          name: r.ress.nom,
          qteMax,
          qteAssigned,
          utilizationPercentage,
          unitMeasure,
          available: (r.ress.consommationMax - r.ress.consommationTotale)
        }
      })

    setChartData(newChartData)

    // Calculate overall assignment percentage
    if (newChartData.length > 0) {
      const totalAssigned = newChartData.reduce((sum, item) => sum + item.qteAssigned, 0)
      const totalMax = newChartData.reduce((sum, item) => sum + item.qteMax, 0)
      const percentage = totalMax > 0 ? Math.round((totalAssigned / totalMax) * 100) : 0
      setAssignmentPercentage(percentage)
    }
  }, [task])

  // Calculate trend (for demonstration purposes)
  const trend = {
    value: 8.3,
    direction: "up" as const,
  }
  const chartHeight = Math.min(Math.max(200, chartData.length * 80), 500)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Energetic Resources Allocation</CardTitle>
        <CardDescription>Resource consumption utilization percentage</CardDescription>
      </CardHeader>
      <CardContent className="pl-0 pr-0">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className={`w-full h-[${chartHeight}px]`} style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{
                  top: 20,
                  right: 40,
                  left: 0, // Significantly increased left margin for resource names
                  bottom: 20,
                }}
                barGap={20} // Increased gap between bars
              >
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={true}
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={140} // Increased width for resource names
                  tick={{ fontSize: 14 }} // Larger font size for resource names
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-4 shadow-sm">
                          <div className="font-medium text-base mb-2">{data.name}</div>
                          <div className="text-sm text-muted-foreground space-y-2">
                            <div className="flex items-center justify-between gap-8">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: chartConfig.utilizationPercentage.color }}
                                ></div>
                                <span>{t("task.chart_energetic.assigned", "Assigned")}</span>
                              </div>
                              <span className="font-medium">
                                {formatNumber(data.qteAssigned)} {data.unitMeasure} ({data.utilizationPercentage}%)
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                              <div className="flex items-center gap-2">
                                <span>{t("task.chart_energetic.maximum", "Maximum")}</span>
                              </div>
                              <span className="font-medium">
                                {formatNumber(data.qteMax)} {data.unitMeasure}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                              <div className="flex items-center gap-2">
                                <span>{t("task.chart_energetic.available", "Available")}</span>
                              </div>
                              <span className="font-medium">
                                {formatNumber(data.available)} {data.unitMeasure} (
                                {Math.round((data.available / data.qteMax) * 100)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="utilizationPercentage"
                  fill={chartConfig.utilizationPercentage.color}
                  radius={[0, 4, 4, 0]}
                  name="utilizationPercentage"
                  barSize={40} // Increased bar height
                >
                  {/* Custom label inside the bar */}
                  <LabelList dataKey="utilizationPercentage" position="center" content={CustomBarLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            {t("task.chart_energetic.no_energetic_resources", "No energetic resources assigned to this task")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
