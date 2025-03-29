"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Input42Props = {
  className?: string;
  label: string;
  type?: string;
  onChange?: (date: { from: Date; to: Date }) => void;
};

export default function Input42({
  className,
  label,
  onChange,
  type,
}: Input42Props) {
  const [date, setDate] = React.useState({
    from: new Date(),
    to: addDays(new Date(), 1),
  });

  // Update the date and call the onChange callback
  const handleDateChange = (
    newDate: React.SetStateAction<{ from: Date; to: Date }>
  ) => {
    setDate(newDate);
    // Pass the updated date to the parent component via onChange
    if (onChange) {
      if (typeof newDate === "function") {
        const result = newDate(date);
        onChange({ from: result.from, to: result.to });
      } else {
        onChange({ from: newDate.from, to: newDate.to });
      }
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            type={type}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
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
            onSelect={handleDateChange} // Use the updated handler
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
