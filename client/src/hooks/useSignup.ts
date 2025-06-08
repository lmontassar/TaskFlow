import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

 const useSignup = ()=>{
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [FirstStepMessage,setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { t  } = useTranslation();

    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      title: "",
      avatar: null,
      password: "",
      confirmPassword: "",
    });
  
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setErrorMessage("");
      const { name, value, type, files } = e.target;
      if (type === "file" && files && files.length > 0) {
        setFormData({
          ...formData,
          [name]: files[0],
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    };
  
    const nextStep = () => {
      setErrorMessage("");
      if(step == 1) {
        if( !formData.lastName.match("^[A-Za-z]+( [A-Za-z]+)*$") || formData.firstName == "" )  {
          setErrorMessage(t("inputs.validation.last_name"));
          return;
        }
        if( !formData.firstName.match("^[A-Za-z]+( [A-Za-z]+)*$") || formData.firstName == ""  )  {
          setErrorMessage(t("inputs.validation.first_name"));
          return;
        }
        if(!formData.email.match("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$") || formData.email == "" ) {
          setErrorMessage(t("inputs.validation.email"));
          return;
        }
      } else if(step == 2) {
       if (!formData.phone.match(/^(\+\d{1,3})?\d{8,15}$/) && formData.phone !== "") { 
          setErrorMessage(t("inputs.validation.phone_number"));
          return;
        }
        if(!formData.title.match("^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$") && formData.title !== "" ){
          setErrorMessage(t("inputs.validation.title"));
          return;
        }
      } 
      
      setStep(step + 1);
    };
  
    const prevStep = () => {
      setStep(step - 1);
      setErrorMessage("")
    };
  
  
  
  
    const handleSubmit = async (e: React.FormEvent) => {
      setErrorMessage("");
      e.preventDefault();
      setIsLoading(true);
  
      if (!formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
        setErrorMessage(t("inputs.validation.password"));
        setIsLoading(false);
        return;
      }
      if ( formData.password !== formData.confirmPassword ) {
        setErrorMessage(t("inputs.validation.confirm_password"));
        setIsLoading(false);
        return;
      }
  
      const data = new FormData();
      data.append("email", formData.email);
      data.append("prenom", formData.firstName);
      data.append("nom", formData.lastName);
      data.append("phoneNumber", formData.phone || "");
      data.append("title", formData.title || "");
      data.append("password", formData.password);
  
      if (formData.avatar) {
        data.append("image", formData.avatar);
      }
  
      try {
        const response = await fetch("/api/user/register", {
          method: "POST",
          body: data,
        });
  
        if (response.ok) {
          const rep = await response.json();
          localStorage.setItem("token",rep.token);
          navigate("/emailverification");
        } else {
          setStep(1);
          let ErrorMessage : any ="";
          switch (response.status) {
            case 400:{   ErrorMessage = t("errors.server") ;break }
            case 403:{    ErrorMessage = t("OTP.errors.send_code.status_403") ;break }
            case 429:{    ErrorMessage = t("OTP.errors.send_code.status_429") ;break }
            case 500:{    ErrorMessage = t("OTP.errors.send_code.status_500") ;break }
            case 406:{    ErrorMessage = t("signup.errors.status_406") ;break }
            case 415:{    ErrorMessage = t("signup.errors.status_415") ;break }
            case 413:{    ErrorMessage = t("signup.errors.status_413");break } 
            case 409:{    ErrorMessage = t("signup.errors.status_409");break } 
          }
          setErrorMessage(`Registration failed: ${ErrorMessage}`);
        
        }
      } catch (error) {
        setStep(1);
        console.error("Error:", error);
      }
      setIsLoading(false);
    };
    return {
        step,handleSubmit,FirstStepMessage,formData,handleChange,prevStep,isLoading,nextStep,setFormData,t
    }

}
export default useSignup;