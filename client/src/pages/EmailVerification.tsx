import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "../components/ui/alert";
import useEmailVerification from "../hooks/useEmailVerification";
import useTwoFactorAuth from "../hooks/useTwoFactorAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupVerification() {
  const EXPIRED_TIME = 600;

  const isTFAEnabled = localStorage.getItem("TFAToken");

  const {
    otp,
    setOtp,
    email,
    error,
    timer,
    disabled,
    resendCode,
    handleCancel,
    t,
  } = isTFAEnabled ? useTwoFactorAuth() : useEmailVerification();
  const navigate = useNavigate();
  useEffect(() => {
    const token = isTFAEnabled ?? localStorage.getItem("token");
    const tokenKey = isTFAEnabled ? "TFAToken" : "token";
    // make sure it's outside the effect
    if (!token) return;
    let intervalId: any;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const issuedAt = payload.iat;
      const expiryTime = issuedAt + EXPIRED_TIME;
      const checkExpiry = () => {
        const now = Math.floor(Date.now() / 1000);
        if (now > expiryTime) {
          localStorage.removeItem(tokenKey);
          console.log("Token expired and removed. Redirecting...");
          clearInterval(intervalId);
          window.location.href = "/login"; // Redirect to login or any other page
        }
      };

      intervalId = setInterval(checkExpiry, 1000);

      return () => clearInterval(intervalId);
    } catch (err) {
      console.error("Failed to decode token", err);
    }
  }, [isTFAEnabled]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white shadow-md">
        <div className="p-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {t("OTP.title")}
            </h1>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
          <div className="space-y-5 mt-6 flex justify-center">
            <div className="grid gap-5">
              {error !== "" && (
                <Alert variant="destructive" className="">
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}
              <div>{t("OTP.subtitle")}</div>

              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div
                className={`text-blue-600 underline cursor-pointer ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={resendCode}
              >
                {disabled ? (
                  `Renvoyer le code (${timer}s)`
                ) : (
                  <>{t("OTP.resend")} </>
                )}
              </div>
              <Button
                className="bg-white hover:bg-gray-200 text-color-black border-1 border-gray-200"
                onClick={handleCancel}
              >
                {t("OTP.cancel")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
