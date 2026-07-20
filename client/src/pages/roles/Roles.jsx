import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import SectionPage from "../../components/layout/SectionPage";

// Mock data - will be replaced with API calls
const mockRoles = [
  { id: 1, name: "Super Admin", description: "Complete system access", permissions: 24, status: "active" },
  { id: 2, name: "Branch Manager", description: "Branch operations and approvals", permissions: 18, status: "active" },
  { id: 3, name: "Field Officer", description: "Customer onboarding and collection", permissions: 12, status: "active" },
  { id: 4, name: "Accountant", description: "Financial records and reconciliation", permissions: 8, status: "active" },
];

export default function Roles() {
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // TODO: Replace with actual API call
  const { data = mockRoles, isLoading } = useQuery({
    queryKey: ["roles", search],
    queryFn: async () => {
      // const response = await roleService.getAll({ search });
      // return response.roles;
      return mockRoles;
    },
    keepPreviousData: true,
  });

  const roles = search
    ? data.filter(
        (role) =>
          role.name.toLowerCase().includes(search.toLowerCase()) ||
          role.description.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  const handleOpenDialog = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({ name: role.name, description: role.description });
    } else {
      setEditingRole(null);
      setFormData({ name: "", description: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRole(null);
    setFormData({ name: "", description: "" });
  };

  const handleSaveRole = async () => {
    // TODO: Add API call to save role
    console.log("Saving role:", editingRole ? `Update ${editingRole.id}` : "Create new", formData);
    handleCloseDialog();
  };

  const handleDeleteRole = async (roleId) => {
    // TODO: Add API call to delete role
    console.log("Deleting role:", roleId);
  };

  return (
    <SectionPage
      title="Roles Management"
      subtitle="Create and manage user roles with granular permission controls."
      actions={
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search roles..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyPress={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
            sx={{
              minWidth: 250,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": {
                  borderColor: "#0F766E",
                },
              },
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: "#2563EB",
              "&:hover": { bgcolor: "#1D4ED8" },
              borderRadius: 2,
            }}
          >
            Add Role
          </Button>
        </Stack>
      }
    >
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress sx={{ color: "#0F766E" }} />
          </Box>
        ) : roles.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No roles found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Role Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Permissions</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow
                    key={role.id}
                    sx={{
                      "&:hover": { bgcolor: "#F0F9FF" },
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                      {role.name}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      {role.description}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      <Chip
                        label={`${role.permissions} permissions`}
                        size="small"
                        sx={{
                          bgcolor: "#E0F2FE",
                          color: "#0369A1",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role.status}
                        size="small"
                        sx={{
                          bgcolor: role.status === "active" ? "#DCFCE7" : "#FEE2E2",
                          color: role.status === "active" ? "#15803D" : "#991B1B",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          variant="text"
                          onClick={() => handleOpenDialog(role)}
                          sx={{ color: "#0F766E" }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          variant="text"
                          onClick={() => handleDeleteRole(role.id)}
                          sx={{ color: "#EF4444" }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Role Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#F8FAFC", color: "#0F172A", fontWeight: 700 }}>
          {editingRole ? "Edit Role" : "Create New Role"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Role Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": {
                    borderColor: "#0F766E",
                  },
                },
              }}
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": {
                    borderColor: "#0F766E",
                  },
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#F8FAFC" }}>
          <Button onClick={handleCloseDialog} sx={{ color: "#64748B" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveRole}
            variant="contained"
            sx={{
              bgcolor: "#0F766E",
              "&:hover": { bgcolor: "#0D9488" },
            }}
          >
            {editingRole ? "Update" : "Create"} Role
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
