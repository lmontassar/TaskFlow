import { useContext, useState, useCallback } from "react";
import { Context } from "../App";

export default function useCreateProject() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const token = localStorage.getItem("authToken");

  const createProject = useCallback(
    async (projectData: any) => {
      setIsLoading(true);
      setError(null);
      console.log(token);

      try {
        if (!token) {
          throw new Error("No authentication token found");
        }
        console.log(projectData);

        const response = await fetch("/api/project/create", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Ensure Bearer prefix is used
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...projectData,
            tags: projectData.tags.map((tag: any) => tag.text),
          }),
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error(
              "Forbidden: You do not have permission to create a project."
            );
          }

          throw new Error(response.statusText || "Failed to create project");
        }

        const data = await response.json();
        setProject(data);
        return data;
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token] // Added token dependency
  );

  const resetState = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setProject(null);
  }, []);

  return {
    createProject,
    isLoading,
    error,
    project,
    resetState,
  };
}
