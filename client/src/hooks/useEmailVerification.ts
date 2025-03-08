import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useEmailVerification = ()=>{
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

    const handleCancel = async ()=>{
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
                    handleCancel();
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

export default useEmailVerification;