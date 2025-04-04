import { useState, useEffect } from "react";
export enum Status {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}
// export type Project = {
//   id: string;
//   nom: string;
//   description: string;
//   budgetEstime: number;
//   dateDebut: string; // ISO 8601 format (e.g., "2025-03-26T15:55:31.549Z")
//   dateFinEstime: string; // Same format
//   listeCollaborateur: any[];
//   status: Status;
//   createur: any;
//   dateCreation: string; // Same format
//   tags: string[];
// };
const useGetProject = () => {
  const [projects, setProjects] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/project/getProject`, {
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
        setProjects(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [token]);

  return { projects, isLoading, error, setProjects };
};

export default useGetProject;
