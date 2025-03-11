import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";
import { Context } from "../App";

// 1. Define a TypeScript interface for form data
type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const useLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {t,i18n} = useTranslation();
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
    setIsLoading(true);
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
        const decode = jwtDecode<{ twoFactorAuth?: boolean }>(data.jwt);
        if (decode.twoFactorAuth) {
          localStorage.setItem("TFAToken", data.jwt);
          navigate("/emailverification");
          setIsLoading(false);
          return;
        }
        console.log(data);
        await localStorage.setItem("authToken", data.jwt);
        setUser(data.user);
        setIsLoading(false);

        navigate("/home");
      }
      if (response.status === 400) {
        setError("Invalid credentials");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  };
  return {
    formData,
    handleChange,
    handleCheckboxChange,
    error,
    handleSubmit,
    isLoading,
    t
  };
};

export default useLogin;
