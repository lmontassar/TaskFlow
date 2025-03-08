"use client"

import type React from "react"

import { useEffect, useState } from "react"

import { Input } from "@/components/ui/input"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import PasswordInput from "../components/ui/passwordInput"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../components/ui/input-otp"
import { Link, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import useResetPassword from "../hooks/useResetPassword"

// Custom password input component with visibility toggle

export default function ResetPassword() {
  const {   step,
            errorMessage,
            otp,
            formData,
            disabled,
            timer,
            isLoading,
            handleChange,
            nextStep,
            prevStep,
            handleSubmit,
            resendCode,
            setOtp } = useResetPassword(); 

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-md">
        <div className="p-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Réinitialiser le mot de passe</h1>
            <p className="text-sm text-gray-500">
              {step === 1
                ? "Entrez votre email pour recevoir un code de réinitialisation"
                : step === 2
                  ? "Entrez le code reçu par email"
                  : "Créez un nouveau mot de passe"}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mt-6 mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step >= stepNumber
                        ? "border-[var(--clickup1)] bg-[var(--clickup1)] text-white"
                        : "border-[var(--clickup2)] bg-[var(--clickup2)] text-gray-500"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {stepNumber === 1 ? "Email" : stepNumber === 2 ? "Code" : "Mot de passe"}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 h-1 w-full bg-[var(--clickup2)]">
              <div
                className="h-1 bg-[var(--clickup1)] transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            {/* Step 1: Email */}
            {step === 1 && (
              <div className="space-y-5">
                {errorMessage !== "" && (
                  <Alert variant="destructive" className="mb-4 border border-destructive-foreground">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="w-full">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full"
                    type="email"
                    placeholder="Saisissez votre email"
                    required
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full flex justify-center gap-5 rounded-md cursor-pointer bg-[var(--clickup1)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--clickup3)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    { isLoading && (
                      <Loader2 className="animate-spin" />
                    ) || (
                      "SUIVANT"
                    )}
                    
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Verification Code */}
            {step === 2 && (
              <div className="space-y-5">
                {errorMessage !== "" && (
                  <Alert variant="destructive" className="mb-4 border border-destructive-foreground">
                    <AlertTitle>{errorMessage}</AlertTitle>
                  </Alert>
                )}

                <div className="w-full">
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Code de vérification*({formData.email})
                  </label>

                <div className="flex justify-center">
                        <InputOTP  maxLength={6} value={otp} onChange={ setOtp } >
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
                            className={`text-blue-600 underline cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={resendCode}
                            >
                            {disabled ? `Renvoyer le code (${timer}s)` : "Renvoyer le code"}
                  </div>

                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    PRECEDENT
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="cursor-pointer w-full rounded-md bg-[var(--clickup1)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--clickup3)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    SUIVANT
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <div className="space-y-5">
                {errorMessage !== "" && (
                  <Alert variant="destructive" className="mb-4 border border-destructive-foreground">
                    <AlertTitle>{errorMessage}</AlertTitle>
                  </Alert>
                )}

                <div className="w-full">
                  <PasswordInput
                    id="password"
                    name="password"
                    label="Nouveau mot de passe*"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="w-full">
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirmation du mot de passe*"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    PRECEDENT
                  </button>
                  <button
                    type="submit"
                    className="w-full rounded-md bg-[var(--clickup1)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--clickup3)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    RÉINITIALISER
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="border-t border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500">
            Retour à la page de{" "}
            <Link
              to="/login"
              className="font-medium text-[var(--clickup1)] hover:text-blue-500"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

