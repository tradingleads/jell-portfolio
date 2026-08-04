"use client";

import * as React from "react";
import {
  format,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isBefore,
  startOfDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DAYS_OF_WEEK = [
  { key: "sun", label: "Sun" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
];

export interface CalendarProps {
  /** Controlled selected date. Omit to let the calendar manage its own state. */
  selected?: Date;
  /** Called whenever a selectable day is clicked. */
  onSelect?: (date: Date) => void;
  /** Dates before this day are rendered disabled. Defaults to today. */
  minDate?: Date;
  /** Grey out and disable Saturdays/Sundays — useful for booking flows. */
  disableWeekends?: boolean;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  selected,
  onSelect,
  minDate,
  disableWeekends = false,
  className,
}) => {
  const [internalSelected, setInternalSelected] = React.useState<Date>(selected ?? new Date());
  const [currentWeek, setCurrentWeek] = React.useState<Date>(selected ?? new Date());

  const selectedDate = selected ?? internalSelected;
  const floor = startOfDay(minDate ?? new Date());

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 0 }),
    end: endOfWeek(currentWeek, { weekStartsOn: 0 }),
  });

  const handleSelect = (day: Date) => {
    if (!selected) setInternalSelected(day);
    onSelect?.(day);
  };

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow", className)}>
      <div className="flex items-center justify-between p-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setCurrentWeek((w) => subWeeks(w, 1))}
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <h2 className="text-sm font-medium">
          {format(currentWeek, "MMMM yyyy")}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setCurrentWeek((w) => addWeeks(w, 1))}
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </div>

      <div className="grid grid-cols-7 text-center mb-2 px-4">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day.key}
            className="text-xs font-medium text-muted-foreground"
          >
            {day.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 p-4 pt-0">
        {weekDays.map((day) => {
          const isSelected = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          const isWeekend = disableWeekends && (day.getDay() === 0 || day.getDay() === 6);
          const isPast = isBefore(day, floor);
          const isDisabled = isWeekend || isPast;

          return (
            <Button
              key={day.toString()}
              type="button"
              variant={isSelected ? "default" : "ghost"}
              disabled={isDisabled}
              className={cn(
                "h-9 w-9 p-0 font-normal",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
              onClick={() => handleSelect(day)}
            >
              <time dateTime={format(day, "yyyy-MM-dd")}>
                {format(day, "d")}
              </time>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
