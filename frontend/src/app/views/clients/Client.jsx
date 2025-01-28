import { Box, styled } from "@mui/material";
// import PaginationTable from "./PaginationTable";
import { Breadcrumb, SimpleCard } from "app/components";
import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import SimpleTable from "../material-kit/tables/SimpleTable";

const CLIENTS_QUERY = gql`
  query {
    clients {
      id
      name
      email
      projects {
        id
        name
      }
      clientType
      userId
    }
  }
`;
// STYLED COMPONENTS
const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

export default function ClientTable() {
  const { loading, error, data } = useQuery(CLIENTS_QUERY);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (data) {
      setClients(data.clients);
    }
  }, [data]);
  console.log("data1234", data);
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[{ name: "Dashboard", path: "/" }, { name: "Client" }]}
        />
      </Box>

      <SimpleCard title="Client Table">
        <SimpleTable clients={clients} />
      </SimpleCard>

      {/* <SimpleCard title="Pagination Table">
        <PaginationTable />
      </SimpleCard> */}
    </Container>
  );
}
