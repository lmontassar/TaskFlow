import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Github, Loader2 } from "lucide-react";
import React, { useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PasswordInput from "./passwordInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RiGoogleFill } from "@remixicon/react";

import { useGoogleLogin } from "@react-oauth/google";
import useLogin from "../../hooks/useLogin";
import { useTranslation } from "react-i18next";

import { Context } from "../../App";

const GoogleLoginButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useContext(Context);
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
          await localStorage.setItem("authToken", data.jwt);
          setUser(data.user);

          navigate("/home");
        } else if (res.status === 401) {
          console.error("Invalid ID token");
        } else {
          console.error("Login failed");
        }
      } catch (error) {
        console.error("Login error:", error);
      }
    },
    onError: () => console.error("Login Failed"),
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
  const { t } = useTranslation();
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
  const { setUser } = useContext(Context);

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
            setUser(data.user);
            navigate("/home");
          } else {
            console.error("GitHub login failed.");
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
  const {
    formData,
    handleChange,
    handleCheckboxChange,
    error,
    handleSubmit,
    isLoading,
    t,
  } = useLogin();
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <GitHubCallback />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">
            {t("login.title")}
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
                <Label htmlFor="email">{t("login.inputs.email.title")}</Label>
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
                  <Label htmlFor="password">
                    {t("login.inputs.password.title")}
                  </Label>
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
                    {t("login.remember_me")}
                  </label>
                </div>
                <Link
                  to="/reset"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  {t("login.forget")}
                </Link>
              </div>

              <Button type="submit" className="w-full bg-[var(--clickup1)]">
                {(isLoading && <Loader2 className="animate-spin" />) || (
                  <>{t("login.title")}</>
                )}
              </Button>
              <div className="flex justify-between items-center">
                <hr className="w-2/5 border-gray-300" />
                <span className="px-4 text-gray-600">or</span>
                <hr className="w-2/5 border-gray-300" />
              </div>

              <div className="flex items-center flex-wrapith">
                <GoogleLoginButton />
                <GitHubLogin />
              </div>
            </div>

            <div className="mt-4 text-center text-sm">
              <hr className="my-2 " />
              {t("login.dont_have_acc")}{" "}
              <Link
                to="/signup"
                className="underline underline-offset-4 text-primary font-bold"
              >
                {t("login.signup")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
