"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  MessageSquare,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Check,
  X,
  Bell,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { NotificationType } from "./notifications-dropdown";
import { Link } from "react-router-dom";
import { useNotifications } from "../../utils/NotificationContext";

export function NotificationsList() {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );
  const {
    AcceptInvitation,
    RefuserInvitation,
    notifications,
    setNotifications,
    loading,
    error,
  } = useNotifications();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error loading notifications</div>;
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
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

  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map((n) => n.id));
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification?.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markSelectedAsRead = () => {
    setNotifications(
      notifications.map((notification) =>
        selectedNotifications.includes(notification?.id)
          ? { ...notification, read: true }
          : notification
      )
    );
    setSelectedNotifications([]);
  };

  const deleteNotification = (id: string) => {
    setNotifications(
      notifications.filter((notification) => notification?.id !== id)
    );
  };

  const deleteSelected = () => {
    setNotifications(
      notifications.filter(
        (notification) => !selectedNotifications.includes(notification?.id)
      )
    );
    setSelectedNotifications([]);
  };

  const handleAcceptInvite = (notificationId: string) => {
    AcceptInvitation(notificationId);

    // Mark notification as read
    markAsRead(notificationId);
  };

  const handleDeclineInvite = (notificationId: string) => {
    // In a real app, you would call an API to decline the invite
    RefuserInvitation(notificationId);

    // Mark notification as read
    markAsRead(notificationId);
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        {selectedNotifications.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/50 p-2">
            <span className="text-sm">
              {selectedNotifications.length} notifications selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={markSelectedAsRead}>
                Mark as read
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={deleteSelected}
              >
                Delete
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-lg border">
          <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedNotifications.length === notifications.length &&
                  notifications.length > 0
                }
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedNotifications.length > 0
                  ? `${selectedNotifications.length} selected`
                  : "Select all"}
              </span>
            </div>
          </div>

          <div className="divide-y">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification?.id}
                  className={`flex items-start gap-4 p-4 ${
                    notification?.read ? "" : "bg-muted/20"
                  }`}
                >
                  <Checkbox
                    checked={selectedNotifications.includes(notification?.id)}
                    onCheckedChange={() =>
                      toggleSelectNotification(notification?.id)
                    }
                    className="mt-1"
                  />

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {getNotificationIcon(notification?.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{notification?.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {notification?.type === "INVITATION" && (
                            <span className="">
                              {notification?.sender?.nom} invited you to join{" "}
                              {notification?.project?.nom}
                            </span>
                          )}
                          {notification?.type === "JOINED" && (
                            <span className="">
                              {notification?.sender?.nom} Joined your project{" "}
                              {notification?.project?.nom}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification?.creationDate)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => markAsRead(notification?.id)}
                            >
                              Mark as read
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                deleteNotification(notification?.id)
                              }
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {notification?.type === "INVITATION" && (
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptInvite(notification?.id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeclineInvite(notification?.id)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    )}

                    {notification?.project?.id && (
                      <div className="mt-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0"
                          asChild
                        >
                          <Link to={`/projects/${notification?.project?.id}`}>
                            View project
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mb-1 text-lg font-medium">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  You're all caught up! No new notifications to display.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
