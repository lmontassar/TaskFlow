import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const useResetPassword = ()=>{
    const [step, setStep] = useState(1)
    const [errorMessage, setErrorMessage] = useState("")
    const [otp,setOtp] = useState("");
    const navigator = useNavigate();
    const [timer, setTimer] = useState(60);
    const [disabled, setDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { t, i18n } = useTranslation();
  
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
      setIsLoading(true);
      if(formData.email == ""){
          setErrorMessage(t("reset.email_invalid"))
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
                  if(status == 404) setErrorMessage( t("OTP.errors.verify.status_404") );
                  else setErrorMessage( t("errors.server") );
              }   
          }catch(error){
              setErrorMessage( t("errors.server") );
          }
      }
      setIsLoading(false);
    }
  
    const handleOTP = async () => {
      if(otp.length == 6)  
        {
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
                  setErrorMessage("");
              } else {
                switch (response.status){
                    case 404: {setErrorMessage( t("OTP.errors.verify.status_404") );break}
                    case 403: {setErrorMessage( t("OTP.errors.verify.status_403") );break}
                    case 429 : {setErrorMessage( t("OTP.errors.verify.status_429") );break}
                    case 401: {setErrorMessage( t("OTP.errors.verify.status_401") );break}
              }
              setOtp("");
              }
          } catch (error) {
              setErrorMessage(t("errors.server"));
              
          }
  
      }
    }
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if(step !== 3 ) return ;
  
      if (!formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
        setErrorMessage(t("inputs.validation.password"));
        return;
      }
  
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage( t("inputs.validation.confirm_password") );
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
            switch (response.status) {
              case 400:
                  setErrorMessage( t("errors.server") );
                  break;
              case 401: {
                  setErrorMessage( t("expired_token") );
                  localStorage.removeItem("RPT");
                  setStep(1);
                  break;
              }
              case 404: {
                  setErrorMessage( t("errors.user_not_found") );
                  localStorage.removeItem("RPT");
                  setStep(1);
                  break;
              }
          }  
          }
      } catch (error) {
          setErrorMessage( t("errors.server") );
      }
    }
  
    useEffect(
      () =>{
          if(otp.length>0) setErrorMessage("");
          handleOTP();
      }
       , [otp]
  )
  
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
              const token = localStorage.getItem("token") || "";
              const data = new FormData();
              data.append("email",formData.email);
              const res = await fetch("/api/user/resendcode", {
                  method: "POST",
                  body: data
              });
              if(res.ok){
                  
              } else {
                  switch (res.status) {
                    case 403: {setErrorMessage( t("OTP.errors.send_code.status_403")  );break}
                    case 500: {setErrorMessage( t("OTP.errors.send_code.status_500")  );break}
                    case 429: {setErrorMessage( t("OTP.errors.send_code.status_429")  );break} 
                  }
              }
          } catch(error:any){
              setErrorMessage( t("errors.server") );
          }
      } 
    return {
        step,
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
        setOtp,
        t
    };
}
export default useResetPassword;