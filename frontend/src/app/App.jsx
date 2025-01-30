import { useRoutes } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
// ROOT THEME PROVIDER
import { MatxTheme } from "./components";
// ALL CONTEXTS
import SettingsProvider from "./contexts/SettingsContext";
// ROUTES
import routes from "./routes";
// FAKE SERVER
import "../__api__";
import { ApolloProvider } from "@apollo/client";
import client from "./utils/apollo";
import { useJwtVerify } from "./hooks/useJwtVerify";

export default function App() {
  const content = useRoutes(routes);
  useJwtVerify();
  return (
    <SettingsProvider>
      <MatxTheme>
        <CssBaseline />
        <ApolloProvider client={client}>{content}</ApolloProvider>
      </MatxTheme>
    </SettingsProvider>
  );
}
