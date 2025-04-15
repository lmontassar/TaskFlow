import { useState } from "react";

function useResources() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const token = localStorage.getItem("authToken");
  const createResource = async (resource: any) => {
    const res = await fetch("/api/resources/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(resource),
    });
    if (!res.ok) {
      setError("Failed to create resource");
      return null;
    }
    return await res.json();
  };
  return {
    loading,
    error,
    selectedResource,
    setSelectedResource,
    createResource,
  };
}

export default useResources;
