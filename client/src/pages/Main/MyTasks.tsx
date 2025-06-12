import { useTranslation } from "react-i18next";
import { TasksInterface } from "../../components/Tasks/tasks-interface";
import { useEffect } from "react";

export default function MyTasksPage() {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = "TaskFlow - " + t("sidebar.myTasks");
  }, [t]);
  return <TasksInterface />;
}
