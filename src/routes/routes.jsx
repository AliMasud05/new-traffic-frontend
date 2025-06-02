import App from "@/App";
import Exam from "@/pages/Exam";
import Result from "@/pages/Result";
import Home from "@/pages/Home";
import { createBrowserRouter, useNavigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import PrivateRoute from "./PrivetRoute";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import Demo from "@/pages/Admin/Demo";

const ErrorRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the external URL when an error occurs
    window.location.href = "https://avtoskola-varketilshi.ge/not-found";
  }, [navigate]);

  return null; // Render nothing while redirecting
};


const routes = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    errorElement:<ErrorRedirect/>,
  },
  {
    path: "/exam",
    element: <Exam/>,
  },
  {
    path: "/result",
    element: <Result/>,
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/login",
    element: <Login/>,
  },
  {
    path: "/demo",
    element: <Demo/>,
  },
]);

export { routes };