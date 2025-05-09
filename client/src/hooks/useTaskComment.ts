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
      const response = await fetch(`/api/taskComments?taskId=${taskId}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data: TaskComment[] = await response.json();
      setComments(data);
    } catch (err: any) {
      handleError(err, "Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    if (!taskId || clientRef.current) return;

    const socket = new SockJS("/api/ws");
    const client = Stomp.over(socket);

    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        console.log("WebSocket connected:", taskId);
        client.subscribe(`/topic/comments/${taskId}`, (message) => {
          const updatedComments = JSON.parse(message.body);
          console.log("Received comments update:", updatedComments);
          setComments(updatedComments);
        });
      },
      (error: any) => console.error("WebSocket error:", error)
    );

    clientRef.current = client;

    return () => {
      clientRef.current?.disconnect(() =>
        console.log("WebSocket disconnected")
      );
      clientRef.current = null;
    };
  };

  const addComment = async (content: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/taskComments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, taskId }),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      const data: any = await response.json();
      setComments((prev) => [...prev, data]);
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
      const response = await fetch(`/api/taskComments/${commentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete comment");
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (err: any) {
      handleError(err, "Failed to delete comment");
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
    deleteComment,
  };
};

export default useTaskComment;
