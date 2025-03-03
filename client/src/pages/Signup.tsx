"use client"

import type React from "react"

import { useState } from "react"

const apiUrl = import.meta.env.VITE_API_URL;

export default function Signup() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      title: "",
      avatar: null,
      password: "",
      confirmPassword: "",
    })
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, files } = e.target
  
      if (type === "file" && files && files.length > 0) {
        setFormData({
          ...formData,
          [name]: files[0],
        })
      } else {
        setFormData({
          ...formData,
          [name]: value,
        })
      }
    }
  
    const nextStep = () => {
      setStep(step + 1)
    }
  
    const prevStep = () => {
      setStep(step - 1)
    }
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
        
      const data = new FormData();
      data.append("UserData",)
      try{
        const response = await fetch(
            "/api/user/register",
            {
                method: "POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body : data
            }
        )
        if(response.ok){
            alert("login success");
        }

      }


      console.log("Form submitted:", formData)
    }



  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-md">
        <div className="p-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
            <p className="text-sm text-gray-500">Entrez vos informations pour vous inscrire</p>
          </div>

          {/* Progress indicator */}
          <div className="mt-6 mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step >= stepNumber ? "border-[var(--clickup1)] bg-[var(--clickup1)] text-white" :  "border-[var(--clickup2)] bg-[var(--clickup2)] text-gray-500"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {stepNumber === 1 ? "Informations" : stepNumber === 2 ? "Profil" : "Sécurité"}
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
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex gap-3 w-full">
                  <div className="w-full">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom*
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[var(--clickup1)] focus:outline-none focus:ring-1 focus:ring-[var(--clickup1)]"
                      type="text"
                      placeholder="Saisissez votre nom"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom*
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[var(--clickup1)] focus:outline-none focus:ring-1 focus:ring-[var(--clickup1)]"
                      type="text"
                      placeholder="Saisissez votre prénom"
                      required
                    />
                  </div>
                </div>
                <div className="w-full">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[var(--clickup1)] focus:outline-none focus:ring-1 focus:ring-[var(--clickup1)]"
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



            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="w-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-300">
                      {formData.avatar ? (
                        <img
                          src={URL.createObjectURL(formData.avatar) || "/placeholder.svg"}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
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
                      Choisir une photo
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

                <div className="w-full">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[var(--clickup1)] focus:outline-none focus:ring-1 focus:ring-[var(--clickup1)]"
                    type="tel"
                    placeholder="Saisissez votre numéro tel"
                    required
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Titre
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[var(--clickup1)] focus:outline-none focus:ring-1 focus:ring-[var(--clickup1)]"
                    type="text"
                    placeholder="Saisissez votre titre"
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
                    type="button"
                    onClick={nextStep}
                    className="cursor-pointer w-full rounded-md bg-[var(--clickup1)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--clickup3)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    SUIVANT
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="w-full">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe*
                  </label>
                  <input
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[var(--clickup1)] focus:outline-none focus:ring-1 focus:ring-[var(--clickup1)]"
                    type="password"
                    placeholder="Saisissez votre mot de passe"
                    required
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmation du mot de passe*
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[var(--clickup1)] focus:outline-none focus:ring-1 focus:ring-[var(--clickup1)]"
                    type="password"
                    placeholder="Re-saisissez votre mot de passe"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="cursor-pointer  rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    PRECEDENT
                  </button>
                  <button
                    type="submit"
                    className="w-full rounded-md bg-[var(--clickup1)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--clickup3)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    S'INSCRIRE
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        <div className="border-t border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500">
            Vous avez déjà un compte ?{" "}
            <a href="/login" className="font-medium text-[var(--clickup1)] hover:text-blue-500">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

