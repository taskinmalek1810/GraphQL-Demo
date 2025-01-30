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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useState } from "react";

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

export default function SimpleTable({ clients }) {
  // Add state for dialog
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Handle dialog open
  const handleClickOpen = (client) => {
    setSelectedClient(client);
    setOpen(true);
  };

  // Handle dialog close
  const handleClose = () => {
    setOpen(false);
    setSelectedClient(null);
  };

  // Handle delete confirmation
  const handleDelete = () => {
    // Add your delete logic here
    console.log("Deleting client:", selectedClient);
    handleClose();
  };
  return (
    <Box width="100%" overflow="auto">
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableCell align="left">Id</TableCell>
            <TableCell align="center">Name</TableCell>
            <TableCell align="center">Email</TableCell>
            <TableCell align="center">Company Type</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {clients.map((client, index) => (
            <TableRow key={index}>
              <TableCell align="left">{client.id}</TableCell>
              <TableCell align="center">{client.name}</TableCell>
              <TableCell align="center">{client.email}</TableCell>
              <TableCell align="center">{client.clientType}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => handleClickOpen(client)}>
                  <Icon color="error">close</Icon>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>

      <Dialog open={open} onClose={handleClose}>
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
    </Box>
  );
}
