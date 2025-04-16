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
  const editResource = async (resource: any) => {
    const res = await fetch("/api/resources/edit/" + resource.id, {
      method: "PUT",
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
  const deleteResource = async (resource: any) => {
    const res = await fetch("/api/resources/delete/" + resource.id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(resource),
    });
    if (!res.ok) {
      setError("Failed to delete resource");
      return null;
    }
    return await res.text();
  };
  return {
    loading,
    error,
    selectedResource,
    setSelectedResource,
    createResource,
    editResource,
    deleteResource,
  };
}

export default useResources;
