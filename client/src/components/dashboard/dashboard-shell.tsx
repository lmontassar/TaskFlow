"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HomeIcon as House,
  Inbox,
  MessageCircle,
  BookText,
  Gauge,
  LifeBuoy,
  Send,
  Folder,
  FolderKanban,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { NavMain } from "../nav-main";
import { NavProjects } from "../nav-projects";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import useGetProject from "../../hooks/useGetProjects";

interface DashboardShellProps {
  children: React.ReactNode;
}
export function DashboardShell({ children }: DashboardShellProps) {
  const { t, i18n } = useTranslation();
  const { projects, isLoading, error, setProjects } = useGetProject();

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
  };

  // Track the current language
  const [currentLang, setCurrentLang] = React.useState(i18n.language || "en");

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
  };
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <FolderKanban className="h-6 w-6" />
            <span className="font-semibold">TaskFlow</span>
          </div>
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
          <NavProjects userProject={projects} projectLoading={isLoading} />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/profile">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a
                  onClick={() => localStorage.removeItem("token")}
                  href="/login"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
              <Avatar>
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt="User"
                />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 space-y-4 p-6">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
