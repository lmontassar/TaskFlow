import { useState, useEffect } from "react";
import useGetUserForProfile from "./useGetUserForProfile";
import { PhoneNumber } from "react-phone-number-input";

const useProfile = () => {
  const { user, setUser, loading, error, refreshUser } = useGetUserForProfile();
  const [activeTab, setActiveTab] = useState("overview");
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageChanged, setIsImageChanged] = useState(false);
  // Create a userData object that combines the user data with default values
  const userData = user || {
    id: "",
    email: "",
    nom: "",
    prenom: "",
    title: "",
    avatar: "",
    bio: "",
    phoneNumber: "",
    region: "",
    creationDate: "",
    activation: false,
    twoFactorAuth: null,
    // Default values for UI elements
    stats: { projects: 0, tasks: 0, teams: 0 },
    department: "Not specified",
    location: "Not specified",
    joinDate: "Recently",
    activeProjects: [],
    teams: [],
    recentActivity: [],
  };

  // Form state for edit profile
  const [profileForm, setProfileForm] = useState({
    firstName: userData.prenom || "",
    lastName: userData.nom || "",
    title: userData.title || "",
    email: userData.email || "",
    phoneNumber: userData.phoneNumber || "",
    location: userData.region || "",
    bio: userData.bio || "",
    avatar: userData.avatar || "",
  });

  // Update form when user data changes
  useEffect(() => {
    prepareFormData();
    prepareSettingsData();
    setIsImageChanged(false);
    console.log(settingsForm);
  }, [user, editProfileOpen, settingsOpen]);

  const prepareFormData = () => {
    if (user) {
      setProfileForm({
        firstName: user.prenom || "",
        lastName: user.nom || "",
        title: user.title || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        location: user.region || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
    }
  };

  // Form state for settings
  const [settingsForm, setSettingsForm] = useState({
    language: "english",
    timeFormat: "24h",
    twoFactorAuth: userData.twoFactorAuth,
    emailNotifications: true,
    darkMode: false,
  });

  const prepareSettingsData = () => {
    if (user) {
      setSettingsForm({
        language: "english",
        timeFormat: "24h",
        twoFactorAuth: user.twoFactorAuth,
        emailNotifications: true,
        darkMode: false,
      });
    }
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    setIsImageChanged(true);
    const { name, value, type, files } = e.target;
    if (type === "file" && files && files.length > 0) {
      setProfileForm({
        ...profileForm,
        avatar: files[0],
      });
    }
  };

  // Handle profile form changes
  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement> | string
  ) => {
    if (typeof e === "string") {
      // Handle phone number input (string value)
      setProfileForm((prev) => ({
        ...prev,
        phoneNumber: e, // Assuming "phone" is the field for phone numbers
      }));
    } else if (e?.target?.name) {
      // Handle regular inputs (event object)
      const { name, value } = e.target;
      setProfileForm((prev) => ({
        ...prev,
        [name]: value, // Update the corresponding field dynamically
      }));
    } else {
      console.error("Invalid event format received in handleProfileChange");
    }
  };

  // Handle settings form changes
  const handleSettingsChange = (name, value) => {
    console.log(name, value);
    setSettingsForm({
      ...settingsForm,
      [name]: value,
    });
  };

  // Save profile changes
  const saveProfileChanges = async () => {
    setIsLoading(true);

    const updatedUserData = new FormData();
    updatedUserData.append("nom", profileForm.lastName);
    updatedUserData.append("prenom", profileForm.firstName);
    updatedUserData.append("title", profileForm.title);
    updatedUserData.append("phoneNumber", profileForm.phoneNumber);
    updatedUserData.append("avatar", profileForm.avatar);
    console.log(updatedUserData.get("avatar"));
    updatedUserData.append("bio", profileForm.bio);

    const token: any = localStorage.getItem("authToken");
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: updatedUserData,
      });

      if (res.ok) {
        await refreshUser();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setEditProfileOpen(false);
    setIsLoading(false);
  };

  // Save settings changes
  const saveSettingsChanges = async () => {
    setIsLoading(true);
    if (user?.twoFactorAuth == null) {
      setSettingsOpen(false);
      setIsLoading(false);
      return;
    } else {
      const updatedSettings: any = new FormData();
      updatedSettings.append("twoFactorAuth", settingsForm.twoFactorAuth);
      const token: any = localStorage.getItem("authToken");
      try {
        const res = await fetch("/api/user/update/settings", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: updatedSettings,
        });

        if (res.ok) {
          await refreshUser();
        }
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
    setSettingsOpen(false);
    setIsLoading(false);
  };

  return {
    userData,
    setActiveTab,
    editProfileOpen,
    setEditProfileOpen,
    profileForm,
    handleImageChange,
    handleProfileChange,
    saveProfileChanges,
    settingsOpen,
    setSettingsOpen,
    settingsForm,
    handleSettingsChange,
    saveSettingsChanges,
    loading,
    error,
    isLoading,
    isImageChanged,
  };
};

export default useProfile;
