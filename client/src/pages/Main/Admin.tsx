import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { Link } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { useContext } from "react";
import { Context } from "../../App";

export default function AdminPage() {
  const { user } = useContext(Context);
  return (
    <div className="p-4 flex flex-col gap-4">
      <AdminHeader />
      <AdminTabs />
    </div>
  );
}
