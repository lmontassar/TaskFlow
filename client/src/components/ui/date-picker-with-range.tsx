"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";

export function DatePickerWithRange({
  className,
  onChange,
  dateMin,
  dateMax,
}: React.HTMLAttributes<HTMLDivElement> & {
  onChange?: (date: DateRange | undefined) => void;
}) {
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  React.useEffect(() => {
    const min = dateMin ? new Date(dateMin) : null;
    const max = dateMax ? new Date(dateMax) : null;

    if ((min || max) && date) {
      let newFrom = date.from;
      let newTo = date.to;

      if (min && newFrom && newFrom < min) {
        newFrom = min;
      }

      if (max && newTo && newTo > max) {
        newTo = max;
      }

      if (newFrom !== date.from || newTo !== date.to) {
        setDate({ from: newFrom, to: newTo });
      }
    }
  }, [dateMin, dateMax, date]);

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    if (onChange) {
      onChange(selectedDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                `${format(date.from, "MMM dd, yyyy")} - ${format(
                  date.to,
                  "MMM dd, yyyy"
                )}`
              ) : (
                format(date.from, "MMM dd, yyyy")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            disabled={{
              before: dateMin ? new Date(dateMin) : undefined,
              after: dateMax ? new Date(dateMax) : undefined,
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
