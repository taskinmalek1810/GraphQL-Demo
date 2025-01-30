import { Box, Button, MenuItem, Modal, styled, TextField } from "@mui/material";
// import PaginationTable from "./PaginationTable";
import { Breadcrumb, SimpleCard } from "app/components";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import SimpleTable from "../material-kit/tables/SimpleTable";
import { useFormik } from "formik";
import * as Yup from "yup";

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

const ADD_CLIENT = gql`
  mutation AddClient($name: String!, $email: String!, $clientType: String!) {
    addClient(name: $name, email: $email, clientType: $clientType) {
      id
      name
      email
      clientType
    }
  }
`;

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  clientType: Yup.string()
    .required("Client type is required")
    .oneOf(["INDIVIDUAL", "COMPANY"], "Invalid client type"),
});
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
  const [open, setOpen] = useState(false);

  const [addClient] = useMutation(ADD_CLIENT, {
    update(cache, { data: { addClient } }) {
      const { clients } = cache.readQuery({ query: CLIENTS_QUERY });
      cache.writeQuery({
        query: CLIENTS_QUERY,
        data: { clients: [...clients, addClient] },
      });
    },
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      clientType: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        await addClient({
          variables: values,
          update(cache, { data: { addClient } }) {
            const { clients } = cache.readQuery({ query: CLIENTS_QUERY });
            cache.writeQuery({
              query: CLIENTS_QUERY,
              data: { clients: [...clients, addClient] },
            });
          },
        });
        handleClose();
        resetForm();
      } catch (err) {
        console.error("Error adding client:", err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (data) {
      setClients(data.clients);
    }
  }, [data]);
  console.log("data1234", data);
  return (
    <Container>
      <Box
        className="breadcrumb"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Breadcrumb routeSegments={[{ name: "Client" }]} />
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Client
        </Button>
      </Box>

      <SimpleCard title="Client Table">
        <SimpleTable clients={clients} />
      </SimpleCard>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="add-client-modal"
      >
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
          <h2>Add New Client</h2>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              id="name"
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
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              select
              fullWidth
              margin="normal"
              id="clientType"
              name="clientType"
              label="Client Type"
              value={formik.values.clientType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.clientType && Boolean(formik.errors.clientType)
              }
              helperText={formik.touched.clientType && formik.errors.clientType}
            >
              <MenuItem value="INDIVIDUAL">Individual</MenuItem>
              <MenuItem value="COMPANY">Company</MenuItem>
            </TextField>
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button onClick={handleClose} disabled={formik.isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={formik.isSubmitting || !formik.isValid}
              >
                {formik.isSubmitting ? "Adding..." : "Add Client"}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Container>
  );
}
