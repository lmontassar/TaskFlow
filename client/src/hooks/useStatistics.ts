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
  return {
    loading,
    setLoading,
    getOverviewData,
  };
}

export default useStatistics;
