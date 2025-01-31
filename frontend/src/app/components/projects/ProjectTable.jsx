import { Box, Button, Stack } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { gql } from "graphql-tag";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Define the delete project mutation
const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      success
      message
    }
  }
`;

export default function ProjectTable({ projects }) {
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteProject] = useMutation(DELETE_PROJECT_MUTATION);

  const handleClickOpen = (project) => {
    setSelectedProject(project);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProject(null);
  };

  const handleDelete = async () => {
    if (selectedProject) {
      try {
        const { data } = await deleteProject({
          variables: { id: selectedProject.id },
        });
        if (data.deleteProject.success) {
          // Handle successful deletion, e.g., refetch projects or update state
          console.log("Project deleted successfully");
        } else {
          console.error(data.deleteProject.message);
        }
      } catch (error) {
        console.error("Error deleting project:", error);
      }
      handleClose();
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      valueGetter: (params) => params,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1.5,
      valueGetter: (params) => params,
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 1,
      valueGetter: (params) => params,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      valueGetter: (params) => params,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      valueGetter: (params) => params,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      headerAlign: "center",
      sortable: false,
      filterable: false,
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
  return (
    <Box width="100%" overflow="auto">
      <DataGrid
        rows={projects}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5, page: 0 },
          },
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        disableRowSelectionOnClick
        autoHeight
        density="comfortable"
        getRowId={(row) => row.id}
        getRowHeight={() => "auto"}
        sx={{
          "& .MuiDataGrid-cell": {
            whiteSpace: "normal",
            padding: 1,
          },
        }}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this project?
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
    </Box>
  );
}
