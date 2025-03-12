"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";

export function WelcomeHero() {
  const [greeting, setGreeting] = useState("Good day");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };

    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      setCurrentTime(now.toLocaleDateString("en-US", options));
    };

    updateGreeting();
    updateTime();

    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-none">
      <CardContent className="p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {greeting}, John!
              </h1>
              <p className="text-muted-foreground">{currentTime}</p>
            </div>

            <div className="space-y-2">
              <p>
                You have <strong>5 tasks</strong> due today and{" "}
                <strong>3 meetings</strong> scheduled.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="default">
                  <Link href="/tasks">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    View Tasks
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/calendar">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Calendar
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-end">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-4xl font-bold">75%</span>
            </div>
            <div className="ml-4">
              <p className="font-medium">Weekly Progress</p>
              <p className="text-sm text-muted-foreground">
                15 of 20 tasks completed
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
