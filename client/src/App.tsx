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
          <Route element={<ProtectedRoutes />}>
            <Route path="home" element={<Page />}>
              <Route path="" element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
          </Route>

          {/* Public Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/emailverification" element={<EmailVerification />} />
          <Route path="/reset" element={<ResetPassword />} />
          {/* Fallback for undefined routes */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center w-full h-screen bg-gray-900 text-white text-2xl">
                Page not found. Go to{" "}
                <a className="text-blue-500 underline ml-1" href="/login">
                  Login
                </a>
              </div>
            }
          />
        </Routes>
      </Router>
    </Context.Provider>
  );
}

export default App;
