import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function useGetUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Current time in seconds
        if (decoded.exp < currentTime) {
          throw new Error("Token has expired");
        }

        const response = await fetch(`/api/user/get/${decoded.sub}`, {
          signal,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch user data", err);
          setError(err.message || "Failed to fetch user data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      abortController.abort();
    };
  }, []);

  return { user, setUser, loading, error };
}
