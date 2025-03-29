import "./App.css";
import { Button } from "@/components/ui/button";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EmailVerification from "./pages/EmailVerification";
import Dashboard from "./pages/Project/Dashboard";
import Home from "./pages/Project/Home";
import Inbox from "./pages/Project/Inbox";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoutes from "./utils/protectedroutes";
import useGetUser from "./hooks/useGetUser";
import { createContext, useEffect, useState } from "react";

import { Dispatch, SetStateAction } from "react";
import Page from "./pages/Project/page";
import Profile from "./pages/profile";
import { TasksInterface } from "./components/Tasks/tasks-interface";
import TasksPage from "./pages/Project/Tasks";

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
};

export const Context = createContext<{
  isSignedIn: boolean;
  setIsSignedIn: Dispatch<SetStateAction<boolean>>;
  user: UserType | null;
  setUser: Dispatch<SetStateAction<UserType | null>>;
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
    return <div>Loading...</div>;
  }
  return (
    <Context.Provider value={{ isSignedIn, setIsSignedIn, user, setUser }}>
      <Router>
        <Routes>
          {/* Protected Routes */}

          {/* Public Routes */}
          <Route path="/signup" element={<Signup />} />

          <Route path="/login" element={<Login />} />
          <Route path="/emailverification" element={<EmailVerification />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Page />}>
              <Route path="home" element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="profile" element={<Profile />} />
              <Route path="tasks" element={<TasksPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </Context.Provider>
  );
}

export default App;
