import Register from "./register/Register";
import Login from "./login/Login";
import ForgotPassword from "./ForgotPassword";
import NotFound from "./NotFound";
import GuestGuard from "app/auth/GuestGuard";

const authRoutes = [
  {
    path: "/signup",
    element: (
      <GuestGuard>
        <Register />
      </GuestGuard>
    ),
  },
  {
    path: "/signin",
    element: (
      <GuestGuard>
        <Login />
      </GuestGuard>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <GuestGuard>
        <ForgotPassword />
      </GuestGuard>
    ),
  },
  { path: "*", element: <NotFound /> },
];

export default authRoutes;
