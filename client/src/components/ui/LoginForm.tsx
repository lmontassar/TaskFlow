import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Github } from "lucide-react";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PasswordInput from "./passwordInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RiGoogleFill } from "@remixicon/react";

// 1. Define a TypeScript interface for form data
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}
import { useGoogleLogin } from "@react-oauth/google";
const GoogleLoginButton = () => {
  const login = useGoogleLogin({
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
          const jwt = await res.text();
          console.log("JWT:", jwt);
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
    <Button variant="outline" onClick={() => login()}>
      <RiGoogleFill
        className="dark:text-primary"
        size={16}
        aria-hidden="true"
      />
      Login with Google
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
    <Button variant="outline" onClick={handleGitHubLogin}>
      <Github />
      Login with Github
    </Button>
  );
};

const GitHubCallback = () => {
  const location = useLocation();

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
        console.log("login success");
      }
      if (response.status === 400) {
        setError("Invalid credentials");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

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
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Button type="submit" className="w-full bg-[var(--clickup1)]">
                Login
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
