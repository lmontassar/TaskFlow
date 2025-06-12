import { useState, useEffect, useRef } from "react";

import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const useTaskComment = (taskId: string) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<any>(null);
  const token = localStorage.getItem("authToken") || "";

  const handleError = (err: any, defaultMessage: string) => {
    setError(err.message || defaultMessage);
    setLoading(false);
  };

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/task-comment/${taskId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data: any[] = await response.json();
      setComments(data);
    } catch (err: any) {
      handleError(err, "Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    if (!taskId || clientRef.current) return;

    const socket = new SockJS("/ws");
    const client = Stomp.over(socket);

    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        client.subscribe(`/topic/comments/${taskId}`, (message) => {
          const updatedComments = JSON.parse(message.body);
          setComments(updatedComments);
        });
      },
      (error: any) => console.error("WebSocket error:", error)
    );

    clientRef.current = client;

    return () => {
      clientRef.current?.disconnect();
      clientRef.current = null;
    };
  };

  const addComment = async (content: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/task-comment/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, taskId }),
      });
      if (!response.ok) throw new Error("Failed to add comment");
    } catch (err: any) {
      handleError(err, "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/task-comment/${commentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete comment");
    } catch (err: any) {
      handleError(err, "Failed to delete comment");
    } finally {
      setLoading(false);
    }
  };
  const editComment = async (commentId: string, content: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/task-comment/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to edit comment");
    } catch (err: any) {
      handleError(err, "Failed to edit comment");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (taskId) fetchComments();
  }, [taskId]);

  useEffect(() => setupWebSocket(), [taskId]);

  return {
    comments,
    setComments,
    loading,
    error,
    fetchComments,
    addComment,
    editComment,
    deleteComment,
  };
};

export default useTaskComment;
