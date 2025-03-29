

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Props {
  value: string
  onChange: (val: string) => void
}

export default function DividedDurationInput({ value, onChange }: Props) {
  const [days, setDays] = useState("")
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("")

  const daysRef = useRef<HTMLInputElement>(null)
  const hoursRef = useRef<HTMLInputElement>(null)
  const minutesRef = useRef<HTMLInputElement>(null)

  // Initialize the input fields when the value prop changes
  useEffect(() => {
    if (value) {
      const totalSeconds = Number.parseInt(value, 10)

      // Calculate days, hours, and minutes
      const d = Math.floor(totalSeconds / (24 * 60 * 60))
      const h = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
      const m = Math.floor((totalSeconds % (60 * 60)) / 60)

      // Update state without triggering the other useEffect
      setDays(d > 0 ? d.toString() : "")
      setHours(h > 0 ? h.toString() : "")
      setMinutes(m > 0 ? m.toString() : "")
    }
  }, [value])

  // Update the value prop when days, hours, or minutes change
  useEffect(() => {
    const d = days ? Number.parseInt(days) : 0
    const h = hours ? Number.parseInt(hours) : 0
    const m = minutes ? Number.parseInt(minutes) : 0

    // Calculate total seconds
    const totalSeconds = d * 24 * 60 * 60 + h * 60 * 60 + m * 60

    // Only call onChange if any of the fields have a value to prevent infinite loop
    if (d > 0 || h > 0 || m > 0) {
      onChange(totalSeconds.toString())
    }
  }, [days, hours, minutes, onChange])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    nextRef?: React.RefObject<HTMLInputElement>,
    max?: number,
  ) => {
    const value = e.target.value
    if (value === "" || (/^\d+$/.test(value) && (!max || Number.parseInt(value) < max))) {
      setter(value)
      if (value.length >= 2 && nextRef) nextRef.current?.focus()
    }
  }

  const handleDaysChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    nextRef?: React.RefObject<HTMLInputElement>,
    max?: number,
  ) => {
    const value = e.target.value
    if (value === "" || (/^\d+$/.test(value) && (!max || Number.parseInt(value) < max))) {
      setter(value)
      if (value.length >= 3 && nextRef) nextRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, prevRef?: React.RefObject<HTMLInputElement>) => {
    if (e.key === "Backspace" && e.currentTarget.value === "" && prevRef) {
      prevRef.current?.focus()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <div className="relative flex items-center rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
          <Input
            ref={daysRef}
            id="days-input"
            className={cn("w-16 border-0 focus-visible:ring-0 text-center", "rounded-l-md")}
            placeholder="days"
            value={days}
            onChange={(e) => handleDaysChange(e, setDays, hoursRef)}
            maxLength={3}
          />
          <span className="text-muted-foreground px-1">:</span>
          <Input
            ref={hoursRef}
            id="hours-input"
            className="w-16 border-0 focus-visible:ring-0 text-center"
            placeholder="hrs"
            value={hours}
            onChange={(e) => handleInputChange(e, setHours, minutesRef, 24)}
            onKeyDown={(e) => handleKeyDown(e, daysRef)}
            maxLength={2}
          />
          <span className="text-muted-foreground px-1">:</span>
          <Input
            ref={minutesRef}
            id="minutes-input"
            className={cn("w-16 border-0 focus-visible:ring-0 text-center", "rounded-r-md")}
            placeholder="min"
            value={minutes}
            onChange={(e) => handleInputChange(e, setMinutes, undefined, 60)}
            onKeyDown={(e) => handleKeyDown(e, hoursRef)}
            maxLength={2}
          />
        </div>
      </div>
    </div>
  )
}

