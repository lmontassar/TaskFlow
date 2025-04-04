import { useEffect, useState } from "react";
import { Notification } from "../components/notifications/notifications-dropdown";

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications/get-notifications", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(
          data.filter((notification: Notification) => !notification.read).length
        );
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);
  const AcceptInvitation = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/accept-invitation`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invitationId: id }),
      });
      if (!response.ok) {
        throw new Error("Failed to accept invitation");
      }
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );
    } catch (error: any) {
      setError(error.message);
    }
  };
  const RefuserInvitation = async (id: string) => {
    try {
      const response = await fetch(
        `/api/notifications/refuser-invitation/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to refuse invitation");
      }
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );
    } catch (error: any) {
      setError(error.message);
    }
  };
  const MarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/mark-as-read/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  return {
    AcceptInvitation,
    RefuserInvitation,
    MarkAsRead,

    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    loading,
    error,
  };
}
