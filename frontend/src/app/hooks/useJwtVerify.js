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
        localStorage.clear();
        navigate("/signin");
      }
    };

    if (token) {
      // Ensure token is present before starting verification
      verifyToken();
      const interval = setInterval(verifyToken, 60000);

      return () => clearInterval(interval);
    }
  }, [navigate, isExpired, token]);
};
