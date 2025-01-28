import { Navigate, useLocation } from "react-router-dom";
// HOOK
import useAuth from "app/hooks/useAuth";

export default function AuthGuard({ children }) {
  const token = localStorage.getItem("token");
  console.log("token", token);
  const { pathname } = useLocation();

  if (token) return <>{children}</>;

  return <Navigate replace to="/signin" state={{ from: pathname }} />;
}
