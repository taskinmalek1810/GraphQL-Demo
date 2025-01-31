import {
  Box,
  Modal,
  Typography,
  Button,
  TextField,
  Stack,
  Paper,
  DialogContentText,
  DialogContent,
  DialogTitle,
  Dialog,
  DialogActions,
  MenuItem,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { gql, useMutation } from "@apollo/client";

const EDIT_CLIENT = gql`
  mutation EditClient(
    $id: ID!
    $name: String
    $email: String
    $clientType: String
  ) {
    editClient(id: $id, name: $name, email: $email, clientType: $clientType) {
      id
      name
      email
      clientType
      userId
    }
  }
`;

const DELETE_CLIENT = gql`
  mutation DeleteClient($id: ID!) {
    deleteClient(id: $id)
  }
`;

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

export default function SimpleTable({ clients, refetch }) {
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [editClient] = useMutation(EDIT_CLIENT);
  const [deleteClient] = useMutation(DELETE_CLIENT);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    clientType: Yup.string()
      .required("Client type is required")
      .oneOf(["INDIVIDUAL", "COMPANY"], "Invalid client type"),
  });

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 250,
      valueGetter: (params) => params,
    },
    {
      field: "name",
      headerName: "Name",
      width: 130,
      valueGetter: (params) => params,
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
      valueGetter: (params) => params,
      flex: 1,
    },
    {
      field: "clientType",
      headerName: "Company Type",
      width: 150,
      valueGetter: (params) => params,
      flex: 1,
    },
    {
      field: "projects",
      headerName: "Associated projects",
      width: 150,
      valueGetter: (params) => params?.length ?? 0,
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack
          direction="row"
          sx={{ gap: "8px", alignItems: "center", justifyContent: "center" }}
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleEditClick(params.row)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleClickOpen(params.row)}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  const handleClickOpen = (client) => {
    setSelectedClient(client);
    setOpenDeleteConfirmation(true);
  };

  const handleClose = () => {
    setOpenDeleteConfirmation(false);
    setSelectedClient(null);
  };

  const handleDelete = async () => {
    // Add your delete logic here
    console.log("Deleting client:", selectedClient);
    try {
      const { id } = selectedClient; // Assuming selectedClient is defined and has an id
      await deleteClient({
        variables: {
          id,
        },
        refetchQueries: [{ query: CLIENTS_QUERY }],
      });
      refetch();
      console.log("Deleted client:", selectedClient);
      // Handle success (e.g., update state, show notification, etc.)
    } catch (error) {
      console.error("Error deleting client:", error);
      // Handle error (e.g., show error message, etc.)
    }
    handleClose();
  };

  const handleEditClick = (client) => {
    console.log("Editing client:", client);
    setSelectedClient(client);
    setOpenEditModal(true);
  };

  const handleEditClose = () => {
    setOpenEditModal(false);
    setSelectedClient(null);
  };

  const handleEditSubmit = async (values, { setSubmitting }) => {
    // Add your edit logic here
    console.log("Editing client:", values);
    setSubmitting(false);
    handleEditClose();

    try {
      const { data } = await editClient({
        variables: {
          id: selectedClient.id,
          name: values.name,
          email: values.email,
          clientType: values.clientType,
        },
      });
      console.log("Client edited successfully:", data);
      setSubmitting(false);
      refetch();
      handleEditClose();
      // Handle success (e.g., update state, show notification, etc.)
    } catch (error) {
      console.error("Error editing client:", error);
      // Handle error (e.g., show error message, etc.)
    }
  };

  return (
    <Box width="100%" overflow="auto">
      <DataGrid
        rows={clients}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        getRowId={(row) => row.id}
      />

      <Dialog open={openDeleteConfirmation} onClose={handleClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedClient?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Modal
        open={openEditModal}
        onClose={handleEditClose}
        aria-labelledby="edit-client-modal"
        aria-describedby="modal-to-edit-client-details"
      >
        <Paper sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={2}>
            Edit Client
          </Typography>

          <Formik
            initialValues={{
              name: selectedClient?.name || "",
              email: selectedClient?.email || "",
              clientType: selectedClient?.clientType || "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleEditSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                  <TextField
                    select
                    fullWidth
                    margin="normal"
                    id="clientType"
                    name="clientType"
                    label="Client Type"
                    value={values.clientType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.clientType && Boolean(errors.clientType)}
                    helperText={touched.clientType && errors.clientType}
                  >
                    <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                    <MenuItem value="COMPANY">Company</MenuItem>
                  </TextField>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      justifyContent: "flex-end",
                      mt: 2,
                    }}
                  >
                    <Button onClick={handleEditClose}>Cancel</Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </Stack>
              </form>
            )}
          </Formik>
        </Paper>
      </Modal>
    </Box>
  );
}
