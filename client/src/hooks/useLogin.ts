import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
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
  // const [ip, setIp] = useState<string>("");
  // useEffect(() => {
  //   async function fetchIpAddress() {
  //     try {
  //       const response = await fetch("https://api.ipify.org?format=json");
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch IP address");
  //       }
  //       const data = await response.json();
  //       console.log("IP Address:", data.ip);
  //     } catch (err) {
  //       setError("Error fetching IP address");
  //       console.error(err);
  //     }
  //   }

  //   fetchIpAddress();
  //   console.log("IP Address:", ip);
  // }, []);
  const navigate = useNavigate();
  const { setUser } = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
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
       
        const decoded:any = jwtDecode(data.jwt);
         console.log(decoded);
        if( decoded?.activation == false ){
          localStorage.setItem("token",data.jwt);
          navigate("/emailverification");
        } else {
          localStorage.setItem("authToken", data.jwt);
          setUser(data.user);
          setIsLoading(false);
          navigate("/home");
        }
        

        
      }
      if (response.status === 400) {
        setError(t("login.error"));
      }
      if (response.status === 403) {
        setError(t("login.locked"));
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
    t,
  };
};

export default useLogin;
