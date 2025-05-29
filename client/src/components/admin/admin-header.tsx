import { Badge } from "@/components/ui/badge";
import { Shield, Users, Activity } from "lucide-react";
import useStatistics from "../../hooks/useStatistics";
import { useTranslation } from "react-i18next";

export function AdminHeader() {
  const { t } = useTranslation();
  const { overview } = useStatistics();
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            {t(`admin.title`)}
          </h1>
        </div>
        <p className="text-muted-foreground">{t(`admin.description`)}</p>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" />
          {overview?.user} {t(`admin.users.`)}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Activity className="h-3 w-3" />
          {overview?.project.all} {t(`admin.projects.`)}
        </Badge>
      </div>
    </div>
  );
}
