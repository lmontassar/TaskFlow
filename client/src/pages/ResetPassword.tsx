"use client"

import type React from "react"

import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import PasswordInput from "../components/ui/passwordInput"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../components/ui/input-otp"
import { useNavigate } from "react-router-dom"

// Custom password input component with visibility toggle

export default function ResetPassword() {
  const [step, setStep] = useState(1)
  const [errorMessage, setErrorMessage] = useState("")
  const [otp,setOtp] = useState("");
  const navigator = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const nextStep = async () => {
    // Basic validation
    if (step === 1) {
        await handleEmail();
    }
    else if(step === 2) {
        await handleOTP();
    }

  }

  const prevStep = () => {
    setStep((prevStep) => prevStep - 1)
    setErrorMessage("")
  }

  const handleEmail = async ()=>{
    if(formData.email == ""){
        setErrorMessage("Veuillez saisir votre adresse email")
        return
    } else {
        try{
            const response = await fetch("/api/user/sendcode",
                {
                    method:"POST",
                    body:formData.email
                }
            )
            if(response.ok){
                setStep(2);
                setErrorMessage("")
            } else {    
                const status = await response.status;
                if(status == 404) setErrorMessage("User doesn't exist");
                else setErrorMessage("something wrong");
            }   
        }catch(error){
            setErrorMessage("something wrong");
        }
    }
  }

  const handleOTP = async () => {
    if(otp.length != 6) {
        setErrorMessage("Veuillez saisir le code de verification");
        return
    } else {
        try{
            const data = new FormData();
            data.append("otp",otp);
            data.append("email",formData.email)
            const response = await fetch("/api/user/resetpasswordtoken",
                {
                    method:"POST",
                    body: data
                }
            )
            if ( response.ok ){
                const res = await response.json();
                localStorage.setItem("RPT",res.RPToken) ;
                setStep(3);
            } else {
                if(response.status == 402) {
                    setErrorMessage("code invalid");
                } else {
                    setErrorMessage("something wrong");
                }
            }
        } catch (error) {
            setErrorMessage("something wrong");
        }

    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas")
      return
    }
    const RPT:any = localStorage.getItem("RPT");
    if(RPT == null){
        setStep(1);
    }
    try{
        const data = new FormData();
        data.append("password",formData.password);
        const response = await fetch("/api/user/resetpassword",
            {
                headers: { Authorization:RPT },
                method:"POST",
                body: data
            }
        )
        if ( response.ok ){
            localStorage.removeItem("RPT");
            navigator("/login");
        } else {
            if(response.status == 402) {
                setErrorMessage("");
            } else {
                setErrorMessage("something wrong");
            }
        }
    } catch (error) {
        setErrorMessage("something wrong");
    }

    console.log("Password reset submitted:", formData)

  }

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
                    className="w-full rounded-md cursor-pointer bg-[var(--clickup1)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--clickup3)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    SUIVANT
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Verification Code */}
            {step === 2 && (
              <div className="space-y-5">
                {errorMessage !== "" && (
                  <Alert variant="destructive" className="mb-4 border border-destructive-foreground">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
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
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
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
            {/* <Link href="/login" className="font-medium text-[var(--clickup1)] hover:text-blue-500">
              connexion
            </Link> */}
          </p>
        </div>
      </div>
    </div>
  )
}

