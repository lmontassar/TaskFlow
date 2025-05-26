import { useState } from "react";

function useStatistics() {
  const [loading, setLoading] = useState(true);
  const getOverviewData = async () => {
    const response = await fetch("/api/admin/overview", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      setLoading(false);
      throw new Error("Failed to fetch overview data");
    }
    const data = await response.json();
    setLoading(false);
    return data;
  };
  const getUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        setLoading(false);
        return [];
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      console.error("Error fetching users:", error);
    }
    return [];
  };

  return {
    loading,
    setLoading,
    getOverviewData,
    getUsers,
  };
}

export default useStatistics;
