import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
import roleService from "../../services/role.service";

const emptyForm = { roleName: "", roleDescription: "", isActive: true };

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function Roles() {
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [permTreeRole, setPermTreeRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(null);
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ["roles", search],
    queryFn: () => roleService.getAll({ search }),
  });

  const treeQuery = useQuery({
    queryKey: ["roleTree", permTreeRole?.role_id],
    queryFn: () => roleService.getPermissionTree(permTreeRole.role_id),
    enabled: Boolean(permTreeRole),
  });

  const invalidateRoles = () =>
    queryClient.invalidateQueries({ queryKey: ["roles"] });

  const saveRole = useMutation({
    mutationFn: () => {
      const payload = {
        roleName: form.roleName,
        roleDescription: form.roleDescription || null,
        isActive: form.isActive,
      };
      return dialog.mode === "create"
        ? roleService.create(payload)
        : roleService.update(dialog.role.role_id, payload);
    },
    onSuccess: () => {
      toast.success(
        dialog.mode === "create" ? "Role created." : "Role updated.",
      );
      setDialog(null);
      invalidateRoles();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to save the role.")),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, isActive }) =>
      roleService.updateStatus(id, { isActive }),
    onSuccess: () => {
      toast.success("Role status updated.");
      invalidateRoles();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to update role status.")),
  });

  const removeRole = useMutation({
    mutationFn: (id) => roleService.delete(id),
    onSuccess: () => {
      toast.success("Role deleted.");
      setDialog(null);
      invalidateRoles();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to delete the role.")),
  });

  const savePermissions = useMutation({
    mutationFn: () =>
      roleService.updatePermissions(
        permTreeRole.role_id,
        Array.from(effectivePermissions),
      ),
    onSuccess: () => {
      toast.success("Role permissions updated.");
      setPermTreeRole(null);
      queryClient.invalidateQueries({ queryKey: ["roleTree"] });
      invalidateRoles();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to update permissions.")),
  });

  const roles = rolesQuery.data?.roles || [];
  const modules = treeQuery.data?.modules || [];
  const initialPermissions = new Set(
    modules.flatMap((module) =>
      module.permissions
        .filter((permission) => permission.selected)
        .map((permission) => permission.permissionId),
    ),
  );
  const effectivePermissions = selectedPermissions ?? initialPermissions;

  const openCreate = () => {
    setForm(emptyForm);
    setDialog({ mode: "create" });
  };
  const openEdit = (role) => {
    setForm({
      roleName: role.role_name,
      roleDescription: role.role_description || "",
      isActive: Boolean(role.is_active),
    });
    setDialog({ mode: "edit", role });
  };

  const openPermissionTree = (role) => {
    setPermTreeRole(role);
    setSelectedPermissions(null);
  };

  const togglePermission = (id) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev ?? initialPermissions);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <SectionPage
      title="Roles"
      subtitle="Manage system roles, activation status, and the permissions each role grants."
      actions={
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search roles..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && rolesQuery.refetch()}
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => rolesQuery.refetch()}
            sx={{ bgcolor: "#0F766E" }}
          >
            Search
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
            Add Role
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
        {rolesQuery.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : rolesQuery.isError ? (
          <Box sx={{ p: 6 }}>
            <Alert severity="error">
              Unable to load roles. Please try again.
            </Alert>
          </Box>
        ) : roles.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No roles found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.role_id}>
                    <TableCell>{role.role_name}</TableCell>
                    <TableCell>{role.role_description || "-"}</TableCell>
                    <TableCell>{role.permission_count}</TableCell>
                    <TableCell>
                      <Chip
                        label={role.is_active ? "ACTIVE" : "INACTIVE"}
                        size="small"
                        color={role.is_active ? "success" : "error"}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        <Button size="small" onClick={() => openEdit(role)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() => openPermissionTree(role)}
                        >
                          Permissions
                        </Button>
                        <Button
                          size="small"
                          onClick={() =>
                            changeStatus.mutate({
                              id: role.role_id,
                              isActive: !role.is_active,
                            })
                          }
                        >
                          {role.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => setDialog({ mode: "delete", role })}
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
        open={dialog?.mode === "delete"}
        onClose={() => !removeRole.isPending && setDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Delete role?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently delete {dialog?.role?.role_name} and its
            permission assignments. System roles cannot be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={removeRole.isPending}
            onClick={() => removeRole.mutate(dialog.role.role_id)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialog?.mode === "create" || dialog?.mode === "edit"}
        onClose={() => !saveRole.isPending && setDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialog?.mode === "create" ? "Add Role" : "Edit Role"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              required
              fullWidth
              label="Role name"
              value={form.roleName}
              onChange={setField("roleName")}
              slotProps={{ htmlInput: { minLength: 3, maxLength: 100 } }}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Description"
              value={form.roleDescription}
              onChange={setField("roleDescription")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, isActive: e.target.checked }))
                  }
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={saveRole.isPending || form.roleName.trim().length < 3}
            onClick={() => saveRole.mutate()}
          >
            {saveRole.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(permTreeRole)}
        onClose={() => !savePermissions.isPending && setPermTreeRole(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Permissions — {permTreeRole?.role_name}</DialogTitle>
        <DialogContent>
          {treeQuery.isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3} sx={{ pt: 1 }}>
              <Alert severity="info">
                At least one permission must remain selected — the backend
                rejects an empty permission list.
              </Alert>
              {modules.map((module) => (
                <Box key={module.moduleName}>
                  <Typography variant="subtitle2" color="#64748B" gutterBottom>
                    {module.moduleName}
                  </Typography>
                  <Stack direction="row" sx={{ flexWrap: "wrap" }}>
                    {module.permissions.map((perm) => {
                      return (
                        <FormControlLabel
                          key={perm.permissionId}
                          sx={{ width: { xs: "100%", sm: "50%", md: "33%" } }}
                          control={
                            <Checkbox
                              checked={effectivePermissions.has(
                                perm.permissionId,
                              )}
                              onChange={() =>
                                togglePermission(perm.permissionId)
                              }
                            />
                          }
                          label={perm.permissionName}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermTreeRole(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={
              savePermissions.isPending || effectivePermissions.size === 0
            }
            onClick={() => savePermissions.mutate()}
          >
            {savePermissions.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
