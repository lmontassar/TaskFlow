"use client";
import {
  BadgeCheck,
  Briefcase,
  Calendar,
  Edit,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Settings,
  User,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
export default function Profile() {
  const {
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
    saveSettingsChanges,
    handleSettingsChange,
    isLoading,
    isImageChanged,
  } = useProfile();
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
          <p className="text-muted-foreground">{userData?.title}</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{userData?.location}</span>
            <span className="mx-1">•</span>
            <Briefcase className="h-4 w-4" />
            <span>{userData?.department}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button size="sm" onClick={() => setEditProfileOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <span className="text-3xl font-bold">
              {userData?.stats.projects}
            </span>
            <span className="text-sm text-muted-foreground">Projects</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <span className="text-3xl font-bold">{userData?.stats.tasks}</span>
            <span className="text-sm text-muted-foreground">Tasks</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <span className="text-3xl font-bold">{userData?.stats.teams}</span>
            <span className="text-sm text-muted-foreground">Teams</span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="overview"
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Bio and Info */}
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6">{userData?.bio}</p>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{userData?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{userData?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{userData?.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {userData?.joinDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{userData?.department}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Remove the Skills section */}
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {userData?.activeProjects.map((project) => (
                  <div key={project.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold">{project.name}</h3>
                      <Badge variant="outline">{project.role}</Badge>
                    </div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {project.tasks.completed} of {project.tasks.total} tasks
                        completed
                      </span>
                      <span className="text-muted-foreground">
                        Due: {project.dueDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={project.progress}
                        className="h-2 flex-1"
                      />
                      <span className="text-sm font-medium">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userData?.teams.map((team) => (
                  <div key={team.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold">{team.name}</h3>
                      <Badge variant="outline">{team.role}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{team.members} members</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="w-full max-w-3xl h-auto max-h-[90vh] overflow-y-auto sm:h-auto md:h-auto lg:max-h-[80vh] sm:max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information here. Click save when you're done.
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
                Change Profile Picture
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
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="title">Job Title</Label>
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
                <Label htmlFor="bio">Bio</Label>
                {/* <Input id="bio" name="bio" value={profileForm.bio} onChange={handleProfileChange} /> */}
                <Textarea
                  placeholder="Tell us a little bit about yourself"
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
              Cancel
            </Button>
            <Button
              className="flex-1 flex justify-center items-center"
              onClick={saveProfileChanges}
            >
              {(isLoading && <Loader2 className="animate-spin" />) || (
                <>Save Changes</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="w-full max-w-3xl h-auto max-h-[90vh] overflow-y-auto sm:h-auto md:h-auto lg:max-h-[80vh] sm:max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Customize your application settings. Changes will be applied
              immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-3 w-full">
                <Label htmlFor="language">Language</Label>
                <Select
                  className="w-1/2 max-w-full"
                  value={settingsForm.language}
                  onValueChange={(value) =>
                    handleSettingsChange("language", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="timeFormat">Time Format</Label>
                <Select
                  className="w-1/2 max-w-full"
                  value={settingsForm.timeFormat}
                  onValueChange={(value) =>
                    handleSettingsChange("timeFormat", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactorAuth">
                    Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enhance your account security with 2FA
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

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your account activity
                  </p>
                </div>
                <Switch
                  disabled
                  id="emailNotifications"
                  checked={settingsForm.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingsChange("emailNotifications", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark theme
                  </p>
                </div>
                <Switch
                  disabled
                  id="darkMode"
                  checked={settingsForm.darkMode}
                  onCheckedChange={(checked) =>
                    handleSettingsChange("darkMode", checked)
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
              Cancel
            </Button>
            <Button
              className="flex-1 flex justify-center items-center"
              onClick={saveSettingsChanges}
            >
              {(isLoading && <Loader2 className="animate-spin" />) || (
                <>Save Changes</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
