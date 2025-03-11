import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Github, Loader2 } from "lucide-react";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PasswordInput from "./passwordInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RiGoogleFill } from "@remixicon/react";

import { useGoogleLogin } from "@react-oauth/google";
import useLogin from "../../hooks/useLogin";
import { useTranslation } from "react-i18next";
const {t} = useTranslation();
const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const loginGoogle = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          }
        );
        if (!userInfoResponse.ok) throw new Error("Failed to fetch user info.");
        const userInfo = await userInfoResponse.json();
        console.log("Google user info:", userInfo);
        const res = await fetch("/api/user/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userInfo.email,
            nom: userInfo.given_name,
            prenom: userInfo.family_name,
            image: userInfo.picture,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          await localStorage.setItem("authToken", data.jwt); // Store token or user data in local storage
          navigate("/home");
        } else if (res.status === 401) {
          console.log("Invalid ID token");
        } else {
          console.log("Login failed");
        }
      } catch (error) {
        console.error("Login error:", error);
      }
    },
    onError: () => console.log("Login Failed"),
  });

  return (
    <Button type="button" variant="outline" onClick={() => loginGoogle()}>
      <RiGoogleFill
        className="dark:text-primary"
        size={16}
        aria-hidden="true"
      />
      {t("login.google")}
    </Button>
  );
};

const GitHubLogin = () => {
  const handleGitHubLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${
      import.meta.env.VITE_GITHUB_CLIENT_ID || ""
    }&scope=user`;
  };

  return (
    <Button type="button" variant="outline" onClick={handleGitHubLogin}>
      <Github />
      {t("login.github")}
    </Button>
  );
};

const GitHubCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");
      if (code) {
        try {
          const res = await fetch("/api/user/github", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          });

          if (res.ok) {
            const data = await res.json();
            await localStorage.setItem("authToken", data.jwt); // Store token or user data in local storage
            navigate("/home");
            console.log("GitHub user info:", data);
          } else {
            console.log("GitHub login failed.");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    };
    exchangeCodeForToken();
  }, [location]);

  return null;
};

export default function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { formData, handleChange, handleCheckboxChange, error, handleSubmit ,isLoading} =
    useLogin();
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <GitHubCallback />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert
              variant="destructive"
              className="mb-4 border border-destructive-foreground"
            >
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex items-center justify-between flex-wrap">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" onClick={handleCheckboxChange} />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  to="/reset"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-[var(--clickup1)]">
                { isLoading && (
                    <Loader2 className="animate-spin" />
                ) || (
                  "Login"
                ) 
                
                } 
                
              </Button>
              
              <div className="flex items-center justify-between flex-wrap">
                <GoogleLoginButton />
                <GitHubLogin />
              </div>
            </div>

            <div className="mt-4 text-center text-sm">
              <hr className="my-2 " />
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="underline underline-offset-4 text-primary font-bold"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
