"use client";

import { useState } from "react";
import { CalendarIcon, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";

export type TimeRange = "7d" | "30d" | "90d" | "1y" | "all";

interface SimplifiedControlsProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onExport: () => void;
  onRefresh: () => void;
  customDateRange?: { from?: Date; to?: Date };
  onCustomDateRangeChange?: (range: { from?: Date; to?: Date }) => void;
}

export function SimplifiedControls({
  timeRange,
  onTimeRangeChange,
  onExport,
  onRefresh,
  customDateRange,
  onCustomDateRangeChange,
}: SimplifiedControlsProps) {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(
    customDateRange || {}
  );

  const timeRanges = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "1y", label: "Last year" },
    { value: "all", label: "All time" },
  ];

  const handleDateRangeChange = (
    newRange: { from?: Date; to?: Date } | undefined
  ) => {
    const range = newRange || {};
    setDateRange(range);
    onCustomDateRangeChange?.(range);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg font-semibold">
          Analytics Controls
        </CardTitle>
        <div className="flex flex-wrap items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">
              Time Range:
            </span>
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

          <Separator orientation="vertical" className="h-6" />

          {/* Custom Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Custom Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          {/* Action Buttons */}
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="h-9"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>

          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            className="h-9"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Chart
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
