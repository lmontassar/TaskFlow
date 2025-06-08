"use client";
import {
  BadgeCheck,
  Briefcase,
  Calendar,
  Edit,
  Loader2,
  Mail,
  Phone,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import useProfile from "../hooks/useProfile";
import Input46 from "../components/ui/phoneInput";
import { Textarea } from "../components/ui/textarea";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const {
    userData,
    editProfileOpen,
    setEditProfileOpen,
    profileForm,
    handleImageChange,
    handleProfileChange,
    saveProfileChanges,
    settingsOpen,
    setSettingsOpen,
    settingsForm,
    saveSettingsChanges,
    handleSettingsChange,
    isLoading,
    isImageChanged,
  } = useProfile();
  console.log(userData);
  const { t, i18n } = useTranslation();


  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center">
        <Avatar className="h-24 w-24 border-2 border-muted">
          <AvatarImage
            src={userData?.avatar}
            alt={`${userData?.prenom} ${userData?.nom}`}
          />
          <AvatarFallback className="text-2xl">
            {userData?.prenom?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">
              {userData?.prenom} {userData?.nom}
            </h1>
            {userData?.verified && (
              <BadgeCheck className="h-5 w-5 text-primary" />
            )}
          </div>
          {/* <p className="text-muted-foreground">{userData?.title}</p> */}
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            {/* FIX: Translated "Title not provided" */}
            <span>
              {userData?.title
                ? userData?.title
                : t("profile.title_not_provided")}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            {t("profile.settings.title")}
          </Button>
          <Button size="sm" onClick={() => setEditProfileOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            {t("profile.edit_profile.label")}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Bio and Info */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.about")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">{userData?.bio}</p>
              <div className="grid gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{userData?.email}</span>
                </div>
                {userData?.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{userData?.phoneNumber}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {/* FIX: Translated "Joined" */}
                  <span>
                    {t("profile.joined")} {userData?.joinDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  {/* FIX: Translated "Title not provided" */}
                  <span>
                    {userData?.title
                      ? userData?.title
                      : t("profile.title_not_provided")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Remove the Skills section */}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="w-full max-w-3xl h-auto max-h-[90vh] overflow-y-auto sm:h-auto md:h-auto lg:max-h-[80vh] sm:max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{t("profile.edit_profile.label")}</DialogTitle>
            <DialogDescription>
              {t("profile.edit_profile.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 border-2 border-muted">
                <AvatarImage
                  src={
                    isImageChanged
                      ? URL.createObjectURL(profileForm.avatar)
                      : profileForm.avatar
                  }
                  alt={`${profileForm.firstName} ${profileForm.lastName}`}
                />
                <AvatarFallback className="text-2xl">
                  {profileForm.firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Label
                htmlFor="avatar"
                className="cursor-pointer text-sm text-primary"
              >
                {t("profile.edit_profile.change_profile_picture")}
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </Label>
            </div>

            {/* Form fields in a responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-3">
                <Label htmlFor="firstName">
                  {t("profile.edit_profile.first_name")}
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="lastName">
                  {t("profile.edit_profile.last_name")}
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="title">
                  {t("profile.edit_profile.job_title")}
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={profileForm.title}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="grid gap-3">
                {/* <Label htmlFor="phone">Phone Number</Label> */}
                <Input46
                  id="phone"
                  name="phoneNumber"
                  value={profileForm.phoneNumber}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="grid gap-3 md:col-span-2">
                <Label htmlFor="bio">{t("profile.edit_profile.bio")}</Label>
                {/* <Input id="bio" name="bio" value={profileForm.bio} onChange={handleProfileChange} /> */}
                <Textarea
                  placeholder={t("profile.edit_profile.bio_placeholder")}
                  className="resize-none"
                  id="bio"
                  name="bio"
                  value={profileForm.bio}
                  onChange={handleProfileChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex w-full gap-2">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => setEditProfileOpen(false)}
            >
              {t("profile.edit_profile.cancel")}
            </Button>
            <Button
              className="flex-1 flex justify-center items-center"
              onClick={saveProfileChanges}
            >
              {(isLoading && <Loader2 className="animate-spin" />) || (
                <>{t("profile.edit_profile.save_changes")}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="w-full max-w-3xl h-auto max-h-[90vh] overflow-y-auto sm:h-auto md:h-auto lg:max-h-[80vh] sm:max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{t("profile.settings.title")}</DialogTitle>
            <DialogDescription>
              {t("profile.settings.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-3 w-full">
                <Label htmlFor="language">
                  {t("profile.settings.language")}
                </Label>
                <Select
                  className="w-1/2 max-w-full"
                  value={settingsForm.language}
                  onValueChange={(value: any) =>
                    changeLanguage(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    {/* FIX: Translated placeholder */}
                    <SelectValue
                     
                    >{i18n.language == "en" ? t("profile.settings.english") : t("profile.settings.french")} </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {/* FIX: Translated options */}
                    <SelectItem value="en">
                      {t("profile.settings.english")}
                    </SelectItem>
                    <SelectItem value="fr">
                      {t("profile.settings.french")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactorAuth">
                    {t("profile.settings.2fa.title")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("profile.settings.2fa.description")}
                  </p>
                </div>
                <Switch
                  disabled={userData?.twoFactorAuth == null}
                  id="twoFactorAuth"
                  checked={settingsForm.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    handleSettingsChange("twoFactorAuth", checked)
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex w-full gap-2">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => setSettingsOpen(false)}
            >
              {t("profile.settings.cancel")}
            </Button>
            <Button
              className="flex-1 flex justify-center items-center"
              onClick={saveSettingsChanges}
            >
              {(isLoading && <Loader2 className="animate-spin" />) || (
                <>{t("profile.settings.save_changes")}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}