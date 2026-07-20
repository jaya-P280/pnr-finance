import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
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
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import branchService from "../../services/branch.service";
import roleService from "../../services/role.service";
import userService from "../../services/user.service";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  roleId: "",
  branchId: "",
  profileImage:null,
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function UsersList() {
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["users", search],
    queryFn: () => userService.getAll({ search }),
  });

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getAll(),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches", "form"],
    queryFn: () => branchService.getAll({ limit: 100, status: "ACTIVE" }),
  });

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: ["users"] });

  const saveUser = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        roleId: Number(form.roleId),
        branchId: Number(form.branchId),
      };
      return dialog.mode === "create"
        ? userService.create(payload)
        : userService.update(dialog.user.userId, payload);
    },
    onSuccess: () => {
      toast.success(
        dialog.mode === "create"
          ? "User created. A password setup email was sent."
          : "User updated.",
      );
      setDialog(null);
      invalidateUsers();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to save the user.")),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }) => userService.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success("User status updated.");
      invalidateUsers();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to update user status.")),
  });

  const removeUser = useMutation({
    mutationFn: (id) => userService.delete(id),
    onSuccess: () => {
      toast.success("User deleted.");
      setDialog(null);
      invalidateUsers();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to delete the user.")),
  });

  const users = usersQuery.data?.users || [];
  const branches = branchesQuery.data?.branches || [];
  const roles = rolesQuery.data || [];
  const formLoading = rolesQuery.isLoading || branchesQuery.isLoading;

  const openCreate = () => {
    setForm(emptyForm);
    setDialog({ mode: "create" });
  };

  const openEdit = async (user) => {
    try {
      const details = await userService.getById(user.userId);
      setForm({
        firstName: details.firstName || "",
        lastName: details.lastName || "",
        email: details.email || "",
        phone: details.phone || "",
        roleId: String(details.roleId || ""),
        branchId: String(details.branchId || ""),
      });
      setDialog({ mode: "edit", user });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load the user."));
    }
  };

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const getRoleColor = (role) =>
    ({
      super_admin: "#0F766E",
      branch_manager: "#2563EB",
      field_officer: "#7C3AED",
      accountant: "#F59E0B",
    })[role?.toLowerCase()] || "#64748B";

  return (
    <SectionPage
      title="User Management"
      subtitle="Create, update, activate, and manage system users."
      actions={
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && usersQuery.refetch()}
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => usersQuery.refetch()}
            sx={{ bgcolor: "#0F766E" }}
          >
            Search
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
            Add User
          </Button>
        </Stack>
      }
    >
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {usersQuery.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : usersQuery.isError ? (
          <Box sx={{ p: 6 }}>
            <Alert severity="error">
              Unable to load users. Please try again.
            </Alert>
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No users found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC", width: "100%" }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>
                      {`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                        "-"}
                    </TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role || "-"}
                        size="small"
                        sx={{ bgcolor: getRoleColor(user.role), color: "#fff" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status || "-"}
                        size="small"
                        color={user.status === "ACTIVE" ? "success" : "error"}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        <Button size="small" onClick={() => openEdit(user)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() =>
                            changeStatus.mutate({
                              id: user.userId,
                              status:
                                user.status === "ACTIVE"
                                  ? "INACTIVE"
                                  : "ACTIVE",
                            })
                          }
                        >
                          {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => setDialog({ mode: "delete", user })}
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

      <Dialog
        open={Boolean(dialog)}
        onClose={() =>
          !saveUser.isPending && !removeUser.isPending && setDialog(null)
        }
        fullWidth
        maxWidth="sm"
      >
        {dialog?.mode === "delete" ? (
          <>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogContent>
              <Typography>
                This will deactivate and remove {dialog.user.firstName}{" "}
                {dialog.user.lastName} from the user list.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialog(null)}>Cancel</Button>
              <Button
                color="error"
                variant="contained"
                disabled={removeUser.isPending}
                onClick={() => removeUser.mutate(dialog.user.userId)}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle>
              {dialog?.mode === "create" ? "Add User" : "Edit User"}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                {formLoading && (
                  <Alert severity="info">
                    Loading available roles and branches…
                  </Alert>
                )}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    required
                    fullWidth
                    label="First name"
                    value={form.firstName}
                    onChange={setField("firstName")}
                  />
                  <TextField
                    fullWidth
                    label="Last name"
                    value={form.lastName}
                    onChange={setField("lastName")}
                  />
                </Stack>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={setField("email")}
                />
                <TextField
                  required
                  fullWidth
                  label="Mobile number"
                  slotProps={{
                    htmlInput: { inputMode: "numeric", maxLength: 10 },
                  }}
                  value={form.phone}
                  onChange={setField("phone")}
                />
                <TextField
                  required
                  select
                  fullWidth
                  label="Role"
                  value={form.roleId}
                  onChange={setField("roleId")}
                  disabled={formLoading}
                >
                  <MenuItem value="">Select a role</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.roleId} value={String(role.roleId)}>
                      {role.roleName}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  required
                  select
                  fullWidth
                  label="Branch"
                  value={form.branchId}
                  onChange={setField("branchId")}
                  disabled={formLoading}
                >
                  <MenuItem value="">Select a branch</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem
                      key={branch.branch_id}
                      value={String(branch.branch_id)}
                    >
                      {branch.branch_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialog(null)}>Cancel</Button>
              <Button
                variant="contained"
                disabled={
                  saveUser.isPending ||
                  formLoading ||
                  !form.firstName ||
                  !form.email ||
                  !form.phone ||
                  !form.roleId ||
                  !form.branchId
                }
                onClick={() => saveUser.mutate()}
              >
                {saveUser.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </SectionPage>
  );
}
