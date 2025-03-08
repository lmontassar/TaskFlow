import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useTwoFactorAuth = ()=>{
    const [otp , setOtp] = useState("");
    const [email , setEmail] = useState();
    const [error,setError] = useState("");
    const [timer, setTimer] = useState(2);
    const [disabled, setDisabled] = useState(false);
    const navigator = useNavigate();

    useEffect(() => {
        let interval:any;

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
        alert("test");
        setDisabled(true);
        if (timer != 0 && timer != 60 ) return;
        try{
            const token = localStorage.getItem("TFAToken") || ""
            const res = await fetch("/api/user/resendcode", {
                method: "POST",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                }
            });
            if(res.ok){
                
            } else {
                switch (res.status) {
                    case 403: {setError("You cannot resend the code before 1 hour");break}
                    case 500: {setError("Email sending error");break}
                    case 429: {setError("You cannot resend the code before 60 seconds");break} 
                }
            }
        } catch(error:any){
            setError(error.message);
        }
    } 

    useEffect(()=>{
        const token = localStorage.getItem("TFAToken");
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode payload
                const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
                if (decodedToken.exp && decodedToken.exp < currentTime) {
                    handleCancel();
                }
            } catch (error) {
                console.error("Invalid token", error);
                handleCancel();
            }
        } else {
            navigator("/login");
        }
    },[])



    const handleCancel = async ()=>{
        localStorage.removeItem("TFAToken");
        navigator("/login");
    }
    

    const handleSubmit = async ()=>{
        if(otp.length == 6 ){
            const token = localStorage.getItem("TFAToken") || ""
            try{
                const response = await fetch("/api/user/twofactoauth",{
                    method: "POST",
                    headers: {
                        "Authorization": token,
                        "Content-Type": "application/json"
                    },
                    body:otp
                })
                if(response.ok) {
                    const data = await response.json();
                    localStorage.setItem("authToken", data.jwt);
                    localStorage.removeItem("TFAToken")
                    await localStorage.setItem("authToken", data.jwt); // Store token or user data in local storage
                    navigator("/home");
                }
                else {
                    switch (response.status){
                        case 404: {setError("This user is not found! try again");break}
                        case 403: {setError("Veuillez essayer de renvoyer le code");break}
                        case 429 : {setError("Vous ne pouvez pas vérifier le code avant 1 heure");break}
                        case 401: {setError("Le code est erroné, réessayez");break}
                    }
                    setOtp("");
                }
            } catch(err:any){
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
    return {
        otp,
        setOtp,
        email,
        error,
        timer,
        disabled,
        resendCode,
        handleCancel,
    };
}

export default useTwoFactorAuth;