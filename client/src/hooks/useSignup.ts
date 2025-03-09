import { useState } from "react";
import { useNavigate } from "react-router-dom";

const useSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [FirstStepMessage, setFirstStepMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    setFirstStepMessage("");
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
    setFirstStepMessage("");
    if (step == 1) {
      if (
        !formData.lastName.match("^[A-Za-z]+( [A-Za-z]+)*$") ||
        formData.firstName == ""
      ) {
        setFirstStepMessage(
          "Nom must contain only letters and spaces, without leading or trailing spaces."
        );
        return;
      }
      if (
        !formData.firstName.match("^[A-Za-z]+( [A-Za-z]+)*$") ||
        formData.firstName == ""
      ) {
        setFirstStepMessage(
          "Prenom  must contain only letters and spaces, without leading or trailing spaces."
        );
        return;
      }
      if (
        !formData.email.match("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$") ||
        formData.email == ""
      ) {
        setFirstStepMessage("Invalid email format.");
        return;
      }
    } else if (step == 2) {
      if (
        !formData.phone.match(/^(\+\d{1,3})?\d{8,15}$/) &&
        formData.phone !== ""
      ) {
        setFirstStepMessage("Invalid phone number format.");
        return;
      }
      if (
        !formData.title.match(
          "^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$"
        ) &&
        formData.title !== ""
      ) {
        setFirstStepMessage(
          "Invalid title format. Only letters, spaces, and apostrophes are allowed."
        );
        return;
      }
    }

    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setFirstStepMessage("");
    e.preventDefault();
    setIsLoading(true);

    if (
      !formData.password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
      setFirstStepMessage(
        "Password must have at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
      );
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFirstStepMessage("passwords don't match");
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
        localStorage.setItem("token", rep.token);
        navigate("/emailverification");
      } else {
        setStep(1);
        let ErrorMessage: any = "";
        switch (response.status) {
          case 400: {
            ErrorMessage = "Server error";
            break;
          }
          case 403: {
            ErrorMessage = "Vous ne pouvez pas renvoyer le code avant 1 heure.";
            break;
          }
          case 429: {
            ErrorMessage =
              "Vous ne pouvez pas renvoyer le code avant 60 secondes.";
            break;
          }
          case 500: {
            ErrorMessage = "Une erreur est survenue ! Vérifiez votre e-mail.";
            break;
          }
          case 406: {
            ErrorMessage = "Invalid data";
            break;
          }
          case 415: {
            ErrorMessage = "Only JPEG, PNG images are allowed.";
            break;
          }
          case 413: {
            ErrorMessage = "Image size must be under 5MB.";
            break;
          }
          case 409: {
            ErrorMessage = "The email or the phone is already used.";
            break;
          }
        }
        setFirstStepMessage(`Registration failed: ${ErrorMessage}`);
      }
    } catch (error) {
      setStep(1);
      console.error("Error:", error);
    }
    setIsLoading(false);
  };
  return {
    step,
    handleSubmit,
    FirstStepMessage,
    formData,
    handleChange,
    prevStep,
    isLoading,
    nextStep,
    setFormData,
  };
};
export default useSignup;
