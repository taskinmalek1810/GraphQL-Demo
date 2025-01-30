import AuthGuard from "./auth/AuthGuard";
import { authRoles } from "./auth/authRoles";

import MatxLayout from "./components/MatxLayout/MatxLayout";
import authRoutes from "./views/sessions/auth-routes";

import Project from "./views/projects/Project";
import ClientTable from "./views/clients/Client";
import Analytics from "./views/dashboard/Analytics";
import { Navigate } from "react-router-dom";

const routes = [
  {
    path: "/",
    element: (
      <AuthGuard>
        <Navigate to="/dashboard" />
      </AuthGuard>
    ),
  },
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      // dashboard route
      {
        path: "/dashboard",
        element: <Analytics />,
        auth: authRoles.admin,
      },
      {
        path: "/clients",
        element: <ClientTable />,
        auth: authRoles.admin,
      },
      {
        path: "/projects",
        element: <Project />,
        auth: authRoles.admin,
      },
    ],
  },

  // auth routes
  ...authRoutes,
];

export default routes;
