"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import Gantt from "frappe-gantt"

interface GanttTask {
  id: string
  name: string
  start: string
  end: string
  progress: number
  dependencies: string
  custom_class?: string
}

interface GanttOptions {
  header_height?: number
  column_width?: number
  step?: number
  view_modes?: string[]
  bar_height?: number
  bar_corner_radius?: number
  arrow_curve?: number
  padding?: number
  view_mode?: string
  date_format?: string
  custom_popup_html?: (task: GanttTask) => string
  on_click?: (task: GanttTask) => void
  on_date_change?: (task: GanttTask, start: string, end: string) => void
  on_progress_change?: (task: GanttTask, progress: number) => void
}

export function useFrappeGantt(
  containerRef: React.RefObject<HTMLElement>,
  tasks: GanttTask[],
  options: GanttOptions = {},
) {
  const ganttInstance = useRef<any>(null)

  useEffect(() => {
    if (containerRef.current && tasks.length > 0) {
      if (ganttInstance.current) {
        ganttInstance.current.refresh(tasks)
      } else {
        ganttInstance.current = new Gantt(containerRef.current, tasks, {
          header_height: 50,
          column_width: 30,
          step: 24,
          view_modes: ["Day", "Week", "Month"],
          bar_height: 20,
          bar_corner_radius: 3,
          arrow_curve: 5,
          padding: 18,
          view_mode: "Month",
          date_format: "YYYY-MM-DD",
          ...options,
        })
      }
    }

    return () => {
      // Clean up if needed
      ganttInstance.current = null
    }
  }, [containerRef, tasks, options])

  const changeViewMode = (mode: string) => {
    if (ganttInstance.current) {
      ganttInstance.current.change_view_mode(mode)
    }
  }

  return {
    ganttInstance: ganttInstance.current,
    changeViewMode,
  }
}
