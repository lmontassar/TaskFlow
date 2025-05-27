"use client"

import { useState } from "react"
import { CalendarIcon, Download, Filter, RefreshCw, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export type ChartType = "bar" | "line" | "pie" | "area" | "scatter"
export type TimeRange = "7d" | "30d" | "90d" | "1y" | "all"
export type GroupBy = "day" | "week" | "month" | "quarter"

interface ChartControlsProps {
  chartType: ChartType
  onChartTypeChange: (type: ChartType) => void
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  groupBy: GroupBy
  onGroupByChange: (group: GroupBy) => void
  showLegend: boolean
  onShowLegendChange: (show: boolean) => void
  showGrid: boolean
  onShowGridChange: (show: boolean) => void
  onExport: () => void
  onRefresh: () => void
  filters: string[]
  onFiltersChange: (filters: string[]) => void
}

export function ChartControls({
  chartType,
  onChartTypeChange,
  timeRange,
  onTimeRangeChange,
  groupBy,
  onGroupByChange,
  showLegend,
  onShowLegendChange,
  showGrid,
  onShowGridChange,
  onExport,
  onRefresh,
  filters,
  onFiltersChange,
}: ChartControlsProps) {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  const chartTypes = [
    { value: "bar", label: "Bar Chart" },
    { value: "line", label: "Line Chart" },
    { value: "pie", label: "Pie Chart" },
    { value: "area", label: "Area Chart" },
    { value: "scatter", label: "Scatter Plot" },
  ]

  const timeRanges = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "1y", label: "Last year" },
    { value: "all", label: "All time" },
  ]

  const groupByOptions = [
    { value: "day", label: "Daily" },
    { value: "week", label: "Weekly" },
    { value: "month", label: "Monthly" },
    { value: "quarter", label: "Quarterly" },
  ]

  const availableFilters = ["High Priority", "Overdue", "In Progress", "Completed", "Assigned to Me", "Team Tasks"]

  const toggleFilter = (filter: string) => {
    const newFilters = filters.includes(filter) ? filters.filter((f) => f !== filter) : [...filters, filter]
    onFiltersChange(newFilters)
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="h-5 w-5" />
          Chart Controls & Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart Type and Time Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="chart-type" className="text-sm font-medium">
              Chart Type:
            </Label>
            <Select value={chartType} onValueChange={onChartTypeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="time-range" className="text-sm font-medium">
              Time Range:
            </Label>
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="group-by" className="text-sm font-medium">
              Group By:
            </Label>
            <Select value={groupBy} onValueChange={onGroupByChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groupByOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Custom Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
            </PopoverContent>
          </Popover>
        </div>

        <Separator />

        {/* Display Options */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center space-x-2">
            <Switch id="show-legend" checked={showLegend} onCheckedChange={onShowLegendChange} />
            <Label htmlFor="show-legend" className="text-sm">
              Show Legend
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="show-grid" checked={showGrid} onCheckedChange={onShowGridChange} />
            <Label htmlFor="show-grid" className="text-sm">
              Show Grid
            </Label>
          </div>
        </div>

        <Separator />

        {/* Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Active Filters:</Label>
          <div className="flex flex-wrap gap-2">
            {availableFilters.map((filter) => (
              <Badge
                key={filter}
                variant={filters.includes(filter) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => toggleFilter(filter)}
              >
                {filter}
                {filters.includes(filter) && " ✓"}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>

          <Button onClick={onExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Chart
          </Button>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
