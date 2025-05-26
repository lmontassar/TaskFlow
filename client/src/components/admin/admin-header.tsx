import { Badge } from "@/components/ui/badge"
import { Shield, Users, Activity } from "lucide-react"

export function AdminHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Manage users, projects, system settings, and monitor platform activity</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-muted-foreground">System Healthy</span>
        </div>
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" />
          247 Active Users
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Activity className="h-3 w-3" />
          12 Projects Active
        </Badge>
      </div>
    </div>
  )
}
