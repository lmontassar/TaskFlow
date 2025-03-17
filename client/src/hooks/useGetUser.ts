import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function useGetUser() {  // Sends the token to the endpoint, which determines whether the token has expired, and returns the user.

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
  
        const response = await fetch("/api/user/get", {
          method: "GET",
          headers: {
            Authorization: token,
          },
          signal,
        });
  
        if (response.status === 403) {
          console.log("Token has expired");
          localStorage.removeItem("authToken"); // Clear the token
          setUser(null); // Log the user out
          return;
        }
  
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
