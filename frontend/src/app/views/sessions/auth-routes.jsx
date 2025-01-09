import Register from "./register/Register";
import Login from "./login/Login";
import ForgotPassword from "./ForgotPassword";
import NotFound from "./NotFound";

const authRoutes = [
  { path: "/signup", element: <Register /> },
  { path: "/signin", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "*", element: <NotFound /> },
];

export default authRoutes;
