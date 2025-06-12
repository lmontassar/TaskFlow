import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { useContext, useEffect } from "react";
import { Context } from "../../App";

export default function AdminPage() {
  const { user } = useContext(Context);
  useEffect(() => {
    document.title = "TaskFlow - Admin";
  }, []);
  return (
    <div className="p-4 flex flex-col gap-4">
      <AdminHeader />
      <AdminTabs />
    </div>
  );
}
