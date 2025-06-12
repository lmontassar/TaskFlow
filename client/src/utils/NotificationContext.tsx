// context/NotificationContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Context } from "../App";
import { Notification } from "../components/notifications/notifications-dropdown";

const NotificationContext = createContext<any | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(Context);
  const token = localStorage.getItem("authToken") || "";
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
  }, [user]);

  const clientRef = useRef<any>(null);

  useEffect(() => {
    if (!user?.id || clientRef.current) return; // prevent duplicate connections

    const socket = new SockJS("/ws");
    const client = Stomp.over(socket);

    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        client.subscribe(`/topic/notifications/${user.id}`, (message) => {
          const newNotification = JSON.parse(message.body);
          setNotifications((prev) => {
            // prevent adding duplicates (by ID)
            if (prev.some((n) => n.id === newNotification.id)) return prev;
            return [newNotification, ...prev];
          });
          setUnreadCount((prev) => prev + 1);
        });
      },
      (error: any) => {
        console.error("WebSocket error:", error);
      }
    );

    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect(() => {});
        clientRef.current = null;
      }
    };
  }, [user, token]);
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

  return (
    <NotificationContext.Provider
      value={{
        AcceptInvitation,
        RefuserInvitation,
        MarkAsRead,
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
        loading,
        error,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): any => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
