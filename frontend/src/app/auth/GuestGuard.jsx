import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

export default function GuestGuard({ children }) {
  const token = localStorage.getItem("token");
  const { pathname } = useLocation();

  if (!token) return <>{children}</>;

  return <Navigate replace to="/dashboard" state={{ from: pathname }} />;
}

GuestGuard.propTypes = {
  children: PropTypes.node.isRequired,
};
