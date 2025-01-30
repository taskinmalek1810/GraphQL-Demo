import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useJwt } from "react-jwt";

export const useJwtVerify = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { isExpired } = useJwt(token || "");

  useEffect(() => {
    const verifyToken = () => {
      if (!token || isExpired) {
        // Token is expired or doesn't exist
        localStorage.clear();
        navigate("/signin");
      }
    };

    verifyToken();
    // Set up interval to check token every minute
    const interval = setInterval(verifyToken, 60000);

    return () => clearInterval(interval);
  }, [navigate, isExpired, token]);
};
