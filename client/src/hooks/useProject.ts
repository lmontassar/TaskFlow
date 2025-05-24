import { use, useEffect, useRef, useState } from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { id } from "date-fns/locale";

function useProject() {
  const [project, setProject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const clientRef = useRef<any>(null);
  const token = localStorage.getItem("authToken") || "";
  const [newDescription, setNewDescription] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(true);
  const generateDescription = async (oldDescription: any, projectName: any) => {
    if (projectName === "") {
      toast.error("Please enter a project name");
      return;
    }
    const response = await fetch("/api/ai-chat/generate-description", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        description: oldDescription,
        projectName: projectName,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }
    const data = await response.json();

    setNewDescription(data.content);
    return data.content;
  };
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
  const { t } = useTranslation();
  useEffect(() => {
    getProject();
  }, []);
  useEffect(() => {
    if (!project?.id || clientRef.current) return; // prevent duplicate connections

    const socket = new SockJS("/ws");
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
        toast.success(t("member.delete.success"));
        setProject(data);
        return project;
      } else {
        console.log("noo way");
      }
    } catch (error) {
      console.log("noo way");
    }
    return null;
  };
  const addSkill = async (
    projectId: string,
    userId: string,
    skill: string,
    lvl: any,
    id: any
  ) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }

      const res = await fetch(`/api/project/edit-skill`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: projectId,
          collabId: userId,
          skill: skill,
          lvl: lvl,
          id: id,
        }),
      });

      if (res.ok) {
        console.log("changed");
        const data = await res.json();
        toast.success(t("member.editForm.success"));
        return data;
      } else {
        console.log("noo way");
      }
    } catch (error) {
      console.log("noo way");
    }
    return null;
  };
  const removeSkill = async (
    projectId: string,
    skillId: string,
    userId: string
  ) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }

      const res = await fetch(
        `/api/project/remove-skill/${projectId}/${skillId}/${userId}`,
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
        toast.success(t("member.editForm.success"));
        return data;
      } else {
        console.log("noo way");
      }
    } catch (error) {
      console.log("noo way");
    }
    return null;
  };
  const ProjectSummaryList = async (userId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }

      const res = await fetch(`/api/project/getProjectSummery/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        console.log("changed");
        const data = await res.json();
        setLoadingSummary(false);
        return data;
      } else {
        setLoadingSummary(false);
        console.log("noo way");
      }
    } catch (error) {
      setLoadingSummary(false);
      console.log("noo way");
    }
    return [];
  };
  return {
    project,
    isLoading,
    error,
    setProject,
    getProjectById,
    getProject,
    removeCollaborator,
    generateDescription,
    ProjectSummaryList,
    newDescription,
    loadingSummary,
    addSkill,
    removeSkill,
  };
}

export default useProject;
