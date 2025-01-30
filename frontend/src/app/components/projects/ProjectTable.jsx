import {
  Box,
  Icon,
  Table,
  styled,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
} from "@mui/material";

// STYLED COMPONENT
const StyledTable = styled(Table)(({ theme }) => ({
  whiteSpace: "pre",
  "& thead": {
    "& tr": { "& th": { paddingLeft: 0, paddingRight: 0 } },
  },
  "& tbody": {
    "& tr": { "& td": { paddingLeft: 0, textTransform: "capitalize" } },
  },
}));

export default function ProjectTable({ projects }) {
  return (
    <Box width="100%" overflow="auto">
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableCell align="center">Name</TableCell>
            <TableCell align="center">Description</TableCell>
            <TableCell align="center">Priority</TableCell>
            <TableCell align="center">Start Date</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {projects.map((project, index) => (
            <TableRow key={index}>
              <TableCell align="center">{project.name}</TableCell>
              <TableCell align="center">{project.description}</TableCell>
              <TableCell align="center">{project.priority}</TableCell>
              <TableCell align="center">{project.startDate}</TableCell>
              <TableCell align="center">{project.status}</TableCell>
              <TableCell align="right">
                <IconButton>
                  <Icon color="error">close</Icon>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
    </Box>
  );
}
