import { Navigate, useLocation } from "react-router-dom";

export default function AuthGuard({ children }) {
  const token = localStorage.getItem("token");
  const { pathname } = useLocation();

  if (token) return <>{children}</>;

  return <Navigate replace to="/signin" state={{ from: pathname }} />;
}
