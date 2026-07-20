import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import SectionPage from "../../components/layout/SectionPage";

const modules = [
  { id: 1, name: "User Management", permissions: ["View", "Create", "Edit", "Delete", "Export"] },
  { id: 2, name: "Customer Management", permissions: ["View", "Create", "Edit", "Delete", "KYC Verification"] },
  { id: 3, name: "Loan Management", permissions: ["View", "Create", "Approve", "Disburse", "Close"] },
  { id: 4, name: "Collection", permissions: ["View", "Record", "Generate Receipt", "Reconcile"] },
  { id: 5, name: "Branch Management", permissions: ["View", "Create", "Edit", "Delete"] },
  { id: 6, name: "Reports", permissions: ["View Customer Reports", "View Loan Reports", "View Collection Reports", "Export"] },
  { id: 7, name: "Settings", permissions: ["View", "Configure System", "Manage Interest Rates"] },
  { id: 8, name: "Dashboard", permissions: ["View Metrics", "View Analytics", "Export Data"] },
];

export default function Permissions() {
  const [selectedRole, setSelectedRole] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const roles = ["Super Admin", "Branch Manager", "Field Officer", "Accountant"];

  const handleAssignPermissions = () => {
    // TODO: API call to assign permissions
    console.log("Assigning permissions for role:", selectedRole);
  };

  return (
    <SectionPage
      title="Permissions Management"
      subtitle="Manage granular permissions for each role in the system."
      actions={
        <Stack direction="row" spacing={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Role</InputLabel>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              label="Select Role"
              sx={{
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#0F766E",
                  },
                },
              }}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!selectedRole}
            sx={{
              bgcolor: "#2563EB",
              "&:hover": { bgcolor: "#1D4ED8" },
              borderRadius: 2,
            }}
          >
            Configure
          </Button>
        </Stack>
      }
    >
      {selectedRole && (
        <>
          <Box sx={{ mb: 3, p: 2, bgcolor: "#F0F9FF", border: "1px solid #E0F2FE", borderRadius: 2 }}>
            <Typography variant="body2" color="#0369A1">
              Configuring permissions for: <strong>{selectedRole}</strong>
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, overflow: "hidden" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                    <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Module</TableCell>
                    {modules[0]?.permissions.map((perm) => (
                      <TableCell key={perm} align="center" sx={{ fontWeight: 700, color: "#0F172A" }}>
                        {perm}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow
                      key={module.id}
                      sx={{
                        "&:hover": { bgcolor: "#F0F9FF" },
                        borderBottom: "1px solid #E2E8F0",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#0F172A", width: "25%" }}>
                        {module.name}
                      </TableCell>
                      {module.permissions.map((perm) => (
                        <TableCell key={perm} align="center">
                          <Checkbox
                            defaultChecked={Math.random() > 0.5}
                            sx={{
                              color: "#94A3B8",
                              "&.Mui-checked": {
                                color: "#0F766E",
                              },
                            }}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ p: 3, bgcolor: "#F8FAFC", borderTop: "1px solid #E2E8F0", display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button sx={{ color: "#64748B" }}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleAssignPermissions}
                sx={{
                  bgcolor: "#0F766E",
                  "&:hover": { bgcolor: "#0D9488" },
                  borderRadius: 2,
                }}
              >
                Save Permissions
              </Button>
            </Box>
          </Paper>
        </>
      )}

      {!selectedRole && (
        <Paper elevation={0} sx={{ border: "2px dashed #E2E8F0", borderRadius: 3, p: 6, textAlign: "center" }}>
          <Typography color="#64748B" variant="body1">
            Select a role from above to configure its permissions
          </Typography>
        </Paper>
      )}
    </SectionPage>
  );
}
