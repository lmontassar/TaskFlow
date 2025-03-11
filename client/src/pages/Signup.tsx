"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Link, useNavigate, useRoutes } from "react-router-dom";
import { Input } from "@/components/ui/input";
import Input46 from "@/components/ui/phoneInput";
import PasswordInput from "@/components/ui/passwordInput";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import SignupVerification from "../components/ui/SignupVerification";
import { Loader2 } from "lucide-react";
import useSignup from "../hooks/useSignup";
const apiUrl = import.meta.env.VITE_API_URL;

export default function Signup() {

const {step,handleSubmit,FirstStepMessage,formData,handleChange,prevStep,isLoading,nextStep,setFormData,t} = useSignup();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-md">
        <div className="p-6">

          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('signup.title')}
            </h1>
            <p className="text-sm text-gray-500">
              {t('signup.subtitle')}
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
                    {stepNumber === 1
                      && <> {t('signup.step.one')} </>
                      || stepNumber === 2
                      && <> {t('signup.step.two')} </>
                      || <> {t('signup.step.three')} </> }
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


          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="mt-6"
          >
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-5">

              {FirstStepMessage !== "" && (
                <Alert
                  variant="destructive"
                  className="mb-4 border border-destructive-foreground"
                >
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription> {FirstStepMessage} </AlertDescription>
                </Alert>
              )}


                <div className="flex gap-3 w-full">
                  <div className="w-full">
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t('signup.inputs.name.title')}
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[var(--clickup1)] focus:outline-none focus:ring-1 focus:ring-[var(--clickup1)]"
                      type="text"
                      placeholder= {t('signup.inputs.name.placeholder')}
                      required
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                       {t('signup.inputs.first_name.title')}
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[var(--clickup1)] focus:outline-none focus:ring-1 focus:ring-[var(--clickup1)]"
                      type="text"
                      placeholder= {t('signup.inputs.first_name.placeholder')}
                      required
                    />
                  </div>
                </div>
                <div className="w-full">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t('signup.inputs.email.title')}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className=""
                    type="email"
                    placeholder={t('signup.inputs.email.placeholder')}
                    required
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full rounded-md cursor-pointer bg-[var(--clickup1)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--clickup3)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {t('signup.buttons.next')}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="w-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-300">
                      {formData.avatar ? (
                        <img
                          src={
                            URL.createObjectURL(formData.avatar) ||
                            "/placeholder.svg"
                          }
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          <svg
                            className="h-12 w-12 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="avatar"
                      className="cursor-pointer rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-[var(--clickup3)] hover:bg-blue-100"
                    >
                      {t('signup.inputs.image')}
                      <input
                        id="avatar"
                        name="avatar"
                        onChange={handleChange}
                        className="hidden"
                        type="file"
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>
                
                {FirstStepMessage !== "" && (
                <Alert
                  variant="destructive"
                  className="mb-4 border border-destructive-foreground"
                >
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription> {FirstStepMessage} </AlertDescription>
                </Alert>
              )}

                <div className="w-full">
                  <Input46
                    id="phone"
                    placeholder={t("signup.inputs.phone.placeholder")}
                    value={formData.phone}
                    onChange={(value: any) => {
                      setFormData((prev) => ({ ...prev, phone: value }));
                    }}
                    required
                  />
                </div>
                <div className="w-full">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("signup.inputs.title.title")}
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[var(--clickup1)] focus:outline-none focus:ring-1 focus:ring-[var(--clickup1)]"
                    type="text"
                    placeholder={t("signup.inputs.title.placeholder")}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {t('signup.buttons.previous')}
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="cursor-pointer w-full rounded-md bg-[var(--clickup1)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--clickup3)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {t('signup.buttons.next')}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-5">
                {FirstStepMessage !== "" && (
                <Alert
                  variant="destructive"
                  className="mb-4 border border-destructive-foreground"
                >
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription> {FirstStepMessage} </AlertDescription>
                </Alert>
              )}
                <div className="w-full">
                  <PasswordInput
                    id="password"
                    name="password"
                    label={t('signup.inputs.password.label')}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="w-full">
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    label={t('signup.inputs.confirm_password.label')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="cursor-pointer  rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                   {t('signup.buttons.previous')}
                  </button>
                  <button
                    type="submit"
                    className="w-full flex justify-center gap-5 rounded-md bg-[var(--clickup1)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--clickup3)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    { isLoading && (
                      <Loader2 className="animate-spin" />
                    ) || (
                      <>
                        {t('signup.buttons.signup')}
                      </>
                    )}

                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        


        <div className="border-t border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500">
            {t('signup.have_account')} {" "}
            <Link
              to="/login"
              className="font-medium text-[var(--clickup1)] hover:text-blue-500"
            >
              {t('signup.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
