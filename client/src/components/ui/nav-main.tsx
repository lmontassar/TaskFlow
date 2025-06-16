"use client";

import {
  BookText,
  ChevronRight,
  Gauge,
  House,
  Inbox,
  ListTodo,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { Context } from "../../App";

export function NavMain() {
  const { t } = useTranslation();
  const { user } = useContext(Context);
  const items = [
    {
      title: t("sidebar.home"),
      url: "/home",
      icon: House,
      isActive: true,
    },
    {
      title: t("sidebar.chat"),
      url: "/chat",
      icon: MessageCircle,
    },

    {
      title: t("sidebar.dashboard"),
      url: "/dashboard",
      icon: Gauge,
    },
    {
      title: t("sidebar.myTasks"),
      url: "/my-tasks",
      icon: ListTodo,
    },
    user?.role === "ADMIN"
      ? {
          title: "Admin",
          url: "/admin",
          icon: BookText,
          isActive: false,
        }
      : null,
  ];
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.filter(Boolean).map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
