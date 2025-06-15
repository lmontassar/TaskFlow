"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Check,
  X,
  UserPlus,
  MessageSquare,
  Clock,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { useNotifications } from "../../utils/NotificationContext";

export type NotificationType =
  | "INVITATION"
  | "COMMENT"
  | "MENTION"
  | "TASK"
  | "JOINED"
  | "SYSTEM";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  creationDate: string;
  read: boolean;
  project?: any;
  sender?: any;
  receiver?: any;
};

export function NotificationsDropdown() {
  const [activeTab, setActiveTab] = useState<"all" | "INVITATION">("all");
  const {
    AcceptInvitation,
    RefuserInvitation,
    notifications,
    setNotifications,
    unreadCount,
    markRead,
    setUnreadCount,
  } = useNotifications();

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: {
          formatDistance: (token, count, options) => {
            const formats: any = {
              lessThanXSeconds: "just now",
              xSeconds: `${count} seconds`,
              halfAMinute: "half a minute",
              lessThanXMinutes: `${count} minutes`,
              xMinutes: `${count} minutes`,
              aboutXHours: `about ${count} hours`,
              xHours: `${count} hours`,
              xDays: `${count} days`,
              aboutXMonths: `about ${count} months`,
              xMonths: `${count} months`,
              aboutXYears: `about ${count} years`,
              xYears: `${count} years`,
            };
            return formats[token] || token;
          },
        },
      });
    } catch (error) {
      return dateString;
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "INVITATION":
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case "JOINED":
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case "MENTION":
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case "TASK":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "COMMENT":
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case "SYSTEM":
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleAcceptInvite = (notificationId: string) => {
    AcceptInvitation(notificationId);
    markAsRead(notificationId);
  };

  const handleDeclineInvite = (notificationId: string) => {
    // In a real app, you would call an API to decline the invite
    RefuserInvitation(notificationId);

    // Mark notification as read
    markAsRead(notificationId);
  };

  const markAsRead = (notificationId: string) => {
    markRead(notificationId);
    const updatedNotifications = notifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );

    setNotifications(updatedNotifications);

    // Update unread count
    const newUnreadCount = updatedNotifications.filter((n) => !n.read).length;
    setUnreadCount(newUnreadCount);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter(
          (notification) => notification.type === "INVITATION"
        );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="text-base">
            Notifications
          </DropdownMenuLabel>
        </div>
        <DropdownMenuSeparator />

        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={(value) => setActiveTab(value as "all" | "INVITATION")}
        >
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="INVITATION">Invites</TabsTrigger>
            </TabsList>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2">
            <DropdownMenuGroup>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start p-0 focus:bg-transparent mt-2"
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div
                      className={`w-full rounded-md p-3 ${
                        notification.read ? "" : "bg-muted"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(notification.creationDate)}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.type === "INVITATION" && (
                              <span className="">
                                {notification.sender.nom} invited you to join{" "}
                                {notification.project?.nom}
                              </span>
                            )}
                            {notification?.type === "MENTION" && (
                              <span className="cursor-pointer hover:underline">
                                {notification.sender.nom}{" "}
                                <a
                                  href={`/task/${notification.task?.id}`}
                                  className="text-blue-500"
                                >
                                  mentioned
                                </a>{" "}
                                you in {notification.project?.nom}
                              </span>
                            )}
                          </p>

                          {notification.type === "INVITATION" && (
                            <div className="mt-2 flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleAcceptInvite(notification.id)
                                }
                              >
                                <Check className="mr-2 h-4 w-4 text-primary-foreground" />
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() =>
                                  handleDeclineInvite(notification.id)
                                }
                              >
                                <X className="mr-1 h-3 w-3" />
                                Decline
                              </Button>
                            </div>
                          )}
                          {notification?.type === "JOINED" && (
                            <span className="">
                              {notification?.sender?.nom} Joined your project{" "}
                              {notification?.project?.nom}
                            </span>
                          )}
                          {notification.sender?.nom && (
                            <div className="mt-2 flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={notification.sender?.avatar}
                                  alt={`${notification.sender?.prenom} ${notification.sender?.nom}`}
                                />
                                <AvatarFallback>
                                  {notification.sender.userInitials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">
                                {notification.sender.nom}
                              </span>
                              {notification.project?.nom && (
                                <>
                                  <span className="text-xs text-muted-foreground">
                                    in
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="px-1 py-0 text-[10px]"
                                  >
                                    {notification.project.nom}
                                  </Badge>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications to display
                </div>
              )}
            </DropdownMenuGroup>
          </div>
        </Tabs>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="cursor-pointer justify-center p-2 text-center"
        >
          <Link to="/notifications" className="w-full">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
