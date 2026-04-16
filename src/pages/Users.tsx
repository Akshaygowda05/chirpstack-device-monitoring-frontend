import { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip, 
  IconButton, 
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import { deleteUser } from "../services/User.service";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  application?: {
    name: string;
  };
}

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 1. Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await api.get("/v1/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Delete Logic
  const handleDeleteConfirm = async () => {
    if (deleteId) {
      try {
        await deleteUser(deleteId);
        setUsers(users.filter((u) => u.id !== deleteId));
        setDeleteId(null);
      } catch (error) {
        console.error("Failed to delete user", error);
      }
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
      
      {/* --- HEADER SECTION --- */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your application users and their roles.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/users/create")}
          sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
        >
          Create User
        </Button>
      </Box>

      {/* --- TABLE SECTION --- */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid", borderColor: "divider" }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Application</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <Typography color="text.secondary">No users found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <PersonIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: "0.7rem" }} />
                  </TableCell>
                  <TableCell>{user.application?.name || "-"}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.isActive ? "Active" : "Inactive"} 
                      color={user.isActive ? "success" : "default"} 
                      size="small" 
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/users/edit/${user.id}`)}
                        sx={{ color: "primary.main", mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => setDeleteId(user.id)}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <Dialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit" sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained" 
            autoFocus
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Users;