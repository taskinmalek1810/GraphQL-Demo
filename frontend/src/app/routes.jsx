import { lazy } from "react";
import { Navigate } from "react-router-dom";

import AuthGuard from "./auth/AuthGuard";

import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import authRoutes from "./views/sessions/auth-routes";

// E-CHART PAGE
const AppEchart = Loadable(
  lazy(() => import("app/views/charts/echarts/AppEchart"))
);
// DASHBOARD PAGE
const Analytics = Loadable(lazy(() => import("app/views/dashboard/Analytics")));

const routes = [
  { path: "/", element: <Navigate to="dashboard/default" /> },
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      // dashboard route
      {
        path: "/dashboard/default",
        element: <Analytics />,
        // auth: authRoles.admin,
      },
      // e-chart route
      {
        path: "/charts/echarts",
        element: <AppEchart />,
        // auth: authRoles.editor,
      },
    ],
  },

  // auth routes
  ...authRoutes,
];

export default routes;
