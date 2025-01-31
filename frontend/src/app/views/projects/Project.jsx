import {
  Box,
  styled,
  Modal,
  TextField,
  Button,
  MenuItem,
  Select,
} from "@mui/material";
import { Breadcrumb, SimpleCard } from "app/components";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import ProjectTable from "app/components/projects/ProjectTable";
import { useFormik } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

const ADD_PROJECT_MUTATION = gql`
  mutation AddProject(
    $name: String!
    $description: String
    $status: String
    $startDate: String
    $endDate: String
    $priority: String
    $clientId: String!
  ) {
    addProject(
      name: $name
      description: $description
      status: $status
      startDate: $startDate
      endDate: $endDate
      priority: $priority
      clientId: $clientId
    ) {
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

const GET_CLIENTS_QUERY = gql`
  query GetClients {
    clients {
      id
      name
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
  const { loading, error, data, refetch } = useQuery(GET_PROJECTS_QUERY);
  const { data: clientsData } = useQuery(GET_CLIENTS_QUERY);
  const [projects, setProjects] = useState([]);
  const [openAddProject, setOpenAddProject] = useState(false);
  const [addProject] = useMutation(ADD_PROJECT_MUTATION, {
    onCompleted: () => {
      refetch();
      handleClose();
    },
  });

  const handleClickAddProject = () => setOpenAddProject(!openAddProject);
  const handleClickAddProjectClose = () => {
    setOpenAddProject(false);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      status: "",
      startDate: "",
      endDate: "",
      priority: "",
      clientId: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      description: Yup.string(),
      status: Yup.string()
        .oneOf(
          ["pending", "in-progress", "completed", "pushed", "closed"],
          "Invalid status"
        )
        .required("Status is required"),
      startDate: Yup.date().required("Start Date is required"),
      endDate: Yup.date()
        .min(Yup.ref("startDate"), "End Date should be greater than Start Date")
        .required("End Date is required"),
      priority: Yup.string()
        .oneOf(["high", "med", "low"], "Invalid priority")
        .required("Priority is required"),
      clientId: Yup.string().required("Client ID is required"),
    }),
    onSubmit: (values) => {
      addProject({ variables: values });
    },
  });

  useEffect(() => {
    if (data) {
      setProjects(data.projects);
    }
  }, [data]);

  return (
    // <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Container>
      <Box
        className="breadcrumb"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Breadcrumb routeSegments={[{ name: "Project" }]} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleClickAddProject}
        >
          Add Project
        </Button>
      </Box>

      <SimpleCard title="Project Table">
        <ProjectTable projects={projects} refetch={refetch} />
      </SimpleCard>
      <Modal open={openAddProject} onClose={handleClickAddProjectClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              name="name"
              label="Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              margin="normal"
              name="description"
              label="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              helperText={
                formik.touched.description && formik.errors.description
              }
            />
            <Select
              fullWidth
              margin="normal"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.status && Boolean(formik.errors.status)}
              displayEmpty
              sx={{ marginTop: "16px" }}
            >
              <MenuItem value="" disabled>
                Select Status
              </MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pushed">Pushed</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <div style={{ color: "red", fontSize: "0.75rem" }}>
                {formik.errors.status}
              </div>
            )}
            <DatePicker
              selected={formik.values.startDate}
              onChange={(date) => formik.setFieldValue("startDate", date)}
              dateFormat="yyyy/MM/dd"
              customInput={
                <TextField
                  fullWidth
                  margin="normal"
                  label="Start Date"
                  error={
                    formik.touched.startDate && Boolean(formik.errors.startDate)
                  }
                  helperText={
                    formik.touched.startDate && formik.errors.startDate
                  }
                />
              }
            />

            <DatePicker
              selected={formik.values.endDate}
              onChange={(date) => formik.setFieldValue("endDate", date)}
              dateFormat="yyyy/MM/dd"
              customInput={
                <TextField
                  fullWidth
                  margin="normal"
                  label="End Date"
                  error={
                    formik.touched.endDate && Boolean(formik.errors.endDate)
                  }
                  helperText={formik.touched.endDate && formik.errors.endDate}
                />
              }
            />

            <Select
              fullWidth
              margin="normal"
              name="priority"
              value={formik.values.priority}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.priority && Boolean(formik.errors.priority)}
              displayEmpty
              sx={{ marginTop: "16px" }}
            >
              <MenuItem value="" disabled>
                Select Priority
              </MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="med">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
            {formik.touched.priority && formik.errors.priority && (
              <div style={{ color: "red", fontSize: "0.75rem" }}>
                {formik.errors.priority}
              </div>
            )}
            <TextField
              fullWidth
              margin="normal"
              name="clientId"
              label="Client ID"
              select
              value={formik.values.clientId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.clientId && Boolean(formik.errors.clientId)}
              helperText={formik.touched.clientId && formik.errors.clientId}
            >
              <MenuItem value="" disabled>
                Select Client
              </MenuItem>
              {clientsData?.clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </TextField>
            <Button type="submit">Add Project</Button>
          </form>
        </Box>
      </Modal>
    </Container>
    // </LocalizationProvider>
  );
}
