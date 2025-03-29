"use client";

import * as React from "react";
import {
  HomeIcon as House,
  Inbox,
  MessageCircle,
  BookText,
  Gauge,
  LifeBuoy,
  Send,
  Folder,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t, i18n } = useTranslation();
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: t("sidebar.home"),
        url: "/home",
        icon: House,
        isActive: true,
      },
      {
        title: t("sidebar.inbox"),
        url: "/inbox",
        icon: Inbox,
      },
      {
        title: t("sidebar.chat"),
        url: "/chat",
        icon: MessageCircle,
      },
      {
        title: t("sidebar.documentations"),
        url: "/documentations",
        icon: BookText,
      },
      {
        title: t("sidebar.dashboard"),
        url: "/dashboard",
        icon: Gauge,
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Folder,
      },
    ],
  };

  // Track the current language
  const [currentLang, setCurrentLang] = React.useState(i18n.language || "en");

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <NavUser user={data.user} />
        <Select value={currentLang} onValueChange={changeLanguage}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Languages</SelectLabel>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <hr />
        <NavProjects projects={data.projects} />
      </SidebarContent>
    </Sidebar>
  );
}
