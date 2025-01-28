import { Box, styled } from "@mui/material";
// import PaginationTable from "./PaginationTable";
import { Breadcrumb, SimpleCard } from "app/components";
import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import SimpleTable from "../material-kit/tables/SimpleTable";
import ProjectTable from "app/components/projects/ProjectTable";

const GET_PROJECTS_QUERY = gql`
  query GetProjects {
    projects {
      id
      name
      description
      status
      startDate
      endDate
      priority
      clientId
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

export default function Project() {
  const { loading, error, data } = useQuery(GET_PROJECTS_QUERY);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (data) {
      setProjects(data.projects);
    }
  }, [data]);
  console.log("data1234", data);
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Dashboard", path: "/" },
            { name: "Project" },
          ]}
        />
      </Box>

      <SimpleCard title="Project Table">
        <ProjectTable projects={projects} />
      </SimpleCard>

      {/* <SimpleCard title="Pagination Table">
        <PaginationTable />
      </SimpleCard> */}
    </Container>
  );
}
