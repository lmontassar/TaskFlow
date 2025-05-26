import "./App.css";
import { Button } from "@/components/ui/button";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EmailVerification from "./pages/EmailVerification";
import Dashboard from "./pages/Main/Dashboard";
import Home from "./pages/Main/Home";
import Inbox from "./pages/Main/Inbox";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoutes from "./utils/protectedroutes";
import useGetUser from "./hooks/useGetUser";
import { createContext, useEffect, useState } from "react";

import { Dispatch, SetStateAction } from "react";
import Page from "./pages/Main/page";
import Profile from "./pages/profile";
import { TasksInterface } from "./components/Tasks/tasks-interface";
import TasksPage from "./pages/Main/Tasks";
import ProjectPage from "./pages/Main/Project";
import Notifications from "./pages/Main/Notifications";
import MyTasksPage from "./pages/Main/MyTasks";
import SpecificTaskPage from "./components/Tasks/specific-task-page";
import ProtectedLoginRoutes from "./utils/protectedloginroutes";
import { Toaster } from "./components/ui/sonner";
import { NotificationProvider } from "./utils/NotificationContext";
import Loading from "./components/ui/loading";
import AskAI from "./pages/Main/AskAI";
import AdminPage from "./pages/Main/Admin";
import AdminRoutes from "./utils/adminRoutes";

export type UserType = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  activation: boolean;
  title: string;
  phoneNumber: string;
  avatar: string;
  region: string;
  twoFactorAuth: boolean;
  role: string;
};

export const Context = createContext<{
  isSignedIn: boolean;
  setIsSignedIn: Dispatch<SetStateAction<boolean>>;
  user: UserType | null;
  setUser: Dispatch<SetStateAction<UserType | null>> | any;
}>({
  isSignedIn: false,
  setIsSignedIn: () => {},
  user: null,
  setUser: () => {},
});

function App() {
  const { user, setUser, loading, error } = useGetUser();
  const [isSignedIn, setIsSignedIn] = useState(false);
  useEffect(() => {
    if (user) {
      setIsSignedIn(true);
    }
  }, [user]);
  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <Toaster />
      <Context.Provider value={{ isSignedIn, setIsSignedIn, user, setUser }}>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Protected Routes */}
              <Route element={<ProtectedRoutes />}>
                <Route path="/" element={<Page />}>
                  <Route path="home" element={<Home />} />
                  <Route path="/" element={<Home />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="ask-ai/:projectId" element={<AskAI />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="projects/:id" element={<ProjectPage />} />
                  <Route element={<AdminRoutes role={user?.role ?? "USER"} />}>
                    <Route path="admin" element={<AdminPage />} />
                  </Route>
                  <Route path="profile" element={<Profile />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="my-tasks" element={<MyTasksPage />} />
                  <Route path="task/:taskId" element={<SpecificTaskPage />} />
                </Route>
              </Route>
              {/* Public Routes */}
              <Route element={<ProtectedLoginRoutes />}>
                <Route path="/signup" element={<Signup />} />

                <Route path="/login" element={<Login />} />
                <Route
                  path="/emailverification"
                  element={<EmailVerification />}
                />
              </Route>
              <Route path="/reset" element={<ResetPassword />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </Context.Provider>
    </>
  );
}

export default App;
