import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// GraphQL endpoint
const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql", // Update this with your server's GraphQL endpoint
});

// Set authentication headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token"); // Replace with your token management logic
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Apollo Client instance
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
