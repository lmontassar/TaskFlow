import { useEffect, useState } from "react";

function useStatistics() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const token = localStorage.getItem("authToken") || "";
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    if (users.length === 0) {
      fetchData();
    }
  }, [token, users]);
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
  const blockUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/block/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to block user");
      }
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, blocked: true } : user
        )
      );
    } catch (error) {
      console.error("Error blocking user:", error);
      throw error;
    }
  };
  const unblockUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/unblock/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to block user");
      }
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, blocked: false } : user
        )
      );
    } catch (error) {
      console.error("Error blocking user:", error);
      throw error;
    }
  };

  return {
    loading,
    setLoading,
    getOverviewData,
    getUsers,
    users,
    blockUser,
    unblockUser,
  };
}

export default useStatistics;
