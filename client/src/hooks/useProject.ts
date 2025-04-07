import { use, useEffect, useRef, useState } from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function useProject() {
  const [project, setProject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const clientRef = useRef<any>(null);
  const token = localStorage.getItem("authToken") || "";
  const getProject = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }
      const response = await fetch(`/api/project/getProjects`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Ensure Bearer prefix is used
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProject(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getProject();
  }, []);
  useEffect(() => {
    if (!project?.id || clientRef.current) return; // prevent duplicate connections

    const socket = new SockJS("/api/ws");
    const client = Stomp.over(socket);

    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        console.log("Projects WebSocket connected :", project.id);
        client.subscribe(`/topic/projects/${project.id}`, (message) => {
          const p = JSON.parse(message.body);
          console.log("Received project update:", p);

          setProject(p);
        });
      },
      (error: any) => {
        console.error("Projects WebSocket error:", error);
      }
    );

    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect(() => {
          console.log("WebSocket disconnected");
        });
        clientRef.current = null;
      }
    };
  }, [project?.id, token]);
  const getProjectById = async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }
      const response = await fetch(`/api/project/getProject/${projectId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Ensure Bearer prefix is used
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProject(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const removeCollaborator = async (
    projectId: string,
    collaboratorId: string
  ) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }

      const res = await fetch(
        `/api/project/remove/${projectId}/${collaboratorId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        console.log("changed");
        const data = await res.json();
        setProject(data); // Update the project state with the new data
        return project;
      } else {
        console.log("noo way");
      }
    } catch (error) {
      console.log("noo way");
    }
    return null;
  };
  return {
    project,
    isLoading,
    error,
    setProject,
    getProjectById,
    getProject,
    removeCollaborator,
  };
}

export default useProject;
