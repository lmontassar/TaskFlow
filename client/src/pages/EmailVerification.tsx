import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { stringify } from "querystring";

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { useNavigate } from "react-router-dom";


export default function SignupVerification() {
    const [otp , setOtp] = useState("");
    const [email , setEmail] = useState();
    const [error,setError] = useState("");
    const [timer, setTimer] = useState(2);
    const [disabled, setDisabled] = useState(false);
    const navigator = useNavigate();

    useEffect(() => {
        let interval;

        if (disabled) {
        interval = setInterval(() => {
            setTimer((prev) => {
            if (prev === 1) {
                clearInterval(interval);
                setDisabled(false);
                return 60; // Reset timer to 60 after it reaches 0
            }
            return prev - 1;
            });
        }, 1000);
        }

        return () => clearInterval(interval);
    }, [disabled]);
    

    const resendCode = async()=>{
        setDisabled(true);
        if (timer != 0 && timer != 60 ) return;
        try{
            const token = localStorage.getItem("token") || ""
            const res = await fetch("/api/user/resendcode", {
                method: "POST",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                }
            });
            if(res.ok){
                
            } else {
                const errorText = await res.text();
                setError(errorText);
            }
        } catch(error){
            setError(error.message);
        }
        
    } 

    useEffect(()=>{
        let token = localStorage.getItem("token");
        if(token){
            try{
                const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode payload
                if( decodedToken.activation == true){
                    navigator("/login");
                }
                setEmail(decodedToken.email); // Set email state
                setDisabled(true);
            }catch(error){
               
            }
        } else { navigator("/login"); }
    },[])

    const handleCancle = async ()=>{
        localStorage.removeItem("token");
        navigator("/login");
    }

    const handleSubmit = async ()=>{
        if(otp.length == 6 ){
            const token = localStorage.getItem("token") || ""
            try{
                
                const response = await fetch("/api/user/verifyEmail",{
                    method: "POST",
                    headers: {
                        "Authorization": token,
                        "Content-Type": "application/json"
                    },
                    body:otp
                    
                })
                if(response.ok) {
                    handleCancle();
                }
                else {
                    const errorText = await response.text();
                    setError(errorText);
                    setOtp("");
                }
            } catch(err){
                
                setError(err.message);
            }

        }
    }

    useEffect(
        () =>{
            if(otp.length>0) setError("");
            handleSubmit();
        }
         , [otp]
    )

    return (



        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white shadow-md">
          <div className="p-6">

                <div className="space-y-1 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Email Verification
                    </h1>
                    <p className="text-sm text-gray-500">
                        {email}
                    </p>
                </div>
                
                <div className="space-y-5 mt-6 flex justify-center">
                    
                    <div className="grid gap-5">
                    
                    
                        
                    {error !== "" && (
                        <Alert
                        variant="destructive"
                        className=""
                        >
                        <AlertTitle>{error} </AlertTitle>
                        </Alert>
                    )}
                        <div>
                            Veuillez entrer le code
                        </div>
                        
                        <div className="flex justify-center">
                            <InputOTP  maxLength={6} value={otp} onChange={setOtp}>
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
                        <Button className="bg-white hover:bg-gray-200 text-color-black border-1 border-gray-200" onClick={handleCancle }>
                            ANNULER
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        </div>


    );

}