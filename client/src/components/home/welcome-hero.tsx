"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";
import useTasks from "../../hooks/useTasks";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

interface WelcomeHeroProps {
  nom: string;
}

export function WelcomeHero({ nom }: WelcomeHeroProps) {
  const [greeting, setGreeting] = useState("Good day");
  const [currentTime, setCurrentTime] = useState("");
  const selectedLocale = i18n.language === "fr" ? "fr-FR" : "en-US";
  const { myTasks, isLoading } = useTasks();
  const { t } = useTranslation();
  let weeklyProgress = 0;
  let totalTasks = 0;
  let completedTasks = 0;
  let todayTasks = 0;
  if (myTasks && myTasks.length > 0) {
    todayTasks = myTasks.filter(
      (task: any) =>
        new Date(task.dateFinEstime).toDateString() ===
        new Date().toDateString()
    ).length;
    // Count tasks completed this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    completedTasks = myTasks.filter((task: any) => {
      if (task.statut !== "DONE") return false;
      const taskDate = new Date(task.dateFinEstime);
      return taskDate >= startOfWeek && taskDate < endOfWeek;
    }).length;
    totalTasks = myTasks.filter((task: any) => {
      const taskDate = new Date(task.dateFinEstime);
      return taskDate >= startOfWeek && taskDate < endOfWeek;
    }).length;
    weeklyProgress = Math.round((completedTasks / totalTasks) * 100);
  }

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting(t("home.good_morning"));
      else if (hour < 18) setGreeting(t("home.good_afternoon"));
      else setGreeting(t("home.good_evening"));
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
      setCurrentTime(now.toLocaleDateString(selectedLocale, options));
    };

    updateGreeting();
    updateTime();

    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [t]);

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-primary/5">
      {/* Decorative background shapes */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary/20 rounded-full blur-2xl opacity-40 pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-accent/30 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <CardContent className="relative z-10 p-8 sm:p-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Left: Greeting and tasks */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary drop-shadow">
                {greeting}, {nom}!
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                {currentTime}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-background/80 rounded-lg px-4 py-2 shadow">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                <span>
                  <strong className="text-primary">{todayTasks}</strong>{" "}
                  {t("home.due_today")}
                </span>
              </div>
              <Button asChild size="sm" variant="secondary" className="shadow">
                <Link to="/tasks">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  {t("home.view_tasks")}
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Weekly progress */}
          <div className="flex flex-col items-center justify-center min-w-[200px]">
            <div className="relative flex items-center justify-center">
              <svg className="w-28 h-28" viewBox="0 0 100 100">
                <circle
                  className="text-muted-foreground"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  cx="50"
                  cy="50"
                  r="40"
                  opacity="0.2"
                />
                <circle
                  className="text-primary"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  cx="50"
                  cy="50"
                  r="40"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (weeklyProgress / 100) * 251.2}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.6s" }}
                />
              </svg>
              <span className="absolute text-3xl font-bold text-primary drop-shadow">
                {isNaN(weeklyProgress) ? 0 : weeklyProgress}%
              </span>
            </div>
            <div className="mt-3 text-center">
              <p className="font-semibold text-primary">
                {t("home.weekly_progress")}
              </p>
              <p className="text-sm text-muted-foreground">
                {completedTasks} {t("home.of")} {totalTasks}{" "}
                {t("home.completed_tasks")}{" "}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
