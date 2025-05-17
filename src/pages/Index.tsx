
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// This page will redirect to the dashboard
const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Only redirect if we're on the exact root path
    if (location.pathname === "/") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, location]);
  
  return null;
};

export default Index;
