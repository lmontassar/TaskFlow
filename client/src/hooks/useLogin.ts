import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

// 1. Define a TypeScript interface for form data
type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const useLogin = () => {
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleCheckboxChange = () => {
    setFormData((prev) => ({
      ...prev,
      ["rememberMe"]: !formData.rememberMe,
    }));
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setError(null);
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("authToken", data.jwt);
        console.log(data);
        await localStorage.setItem("authToken", data.jwt); // Store token or user data in local storage
        navigate("/home");
        console.log("login success");
      }
      if (response.status === 400) {
        setError("Invalid credentials");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return {
    formData,
    handleChange,
    handleCheckboxChange,
    error,
    handleSubmit,
  };
};

export default useLogin;
