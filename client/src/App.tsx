import "./App.css";
import { Button } from "@/components/ui/button";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Project/Dashboard";
import DashboardHome from "./pages/Project/Dashboard-home";
import Tasks from "./pages/Project/Tasks";
import Calendar from "./pages/Project/Calendar";
import Project from "./pages/Project/Project";
import Home from "./pages/Project/Home";
import Inbox from "./pages/Project/Inbox";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Protected Routes */}
          <Route path="/home" element={<Dashboard />}>
            <Route path="" element={<Home />} />
            <Route path="inbox" element={<Inbox />} />
          </Route>
          {/* Public Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

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
    </>
  );
}

export default App;
