import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  Badge as BadgeIcon,
  Business as BranchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as DateIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import branchService from "../../services/branch.service";
import roleService from "../../services/role.service";
import userService from "../../services/user.service";
import useAuth from "../../hooks/useAuth";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
  roleId: "",
  branchId: "",
  profileImage: null,
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const getInitials = (firstName, lastName) => {
  const f = firstName?.[0] || "";
  const l = lastName?.[0] || "";
  return (f + l).toUpperCase() || "U";
};

const getRoleColor = (role) => {
  const r = (role || "").toLowerCase();
  if (r.includes("super_admin")) return "#0F766E";
  if (r.includes("admin")) return "#1E40AF";
  if (r.includes("branch_manager")) return "#2563EB";
  if (r.includes("field_officer")) return "#7C3AED";
  if (r.includes("accountant")) return "#D97706";
  return "#64748B";
};

export default function UsersList() {
  const { user } = useAuth();
  const userRole = (user?.role_name || user?.role || "").toUpperCase();
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const isAdmin = userRole === "ADMIN";

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [dialog, setDialog] = useState(null); // { mode: 'create'|'edit'|'view'|'delete', user?: object }
  const [form, setForm] = useState(emptyForm);

  const queryClient = useQueryClient();

  // Queries
  const usersQuery = useQuery({
    queryKey: ["users", search, roleFilter, branchFilter, statusFilter, page, rowsPerPage, userRole],
    queryFn: () =>
      userService.getAll({
        search: search.trim() || undefined,
        roleId: roleFilter || undefined,
        roleName: isSuperAdmin && !roleFilter ? "ADMIN" : undefined,
        branchId: branchFilter || undefined,
        status: statusFilter || undefined,
        page: page + 1,
        limit: rowsPerPage,
      }),
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

  // Mutations
  const saveUser = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        roleId: Number(form.roleId),
        branchId: Number(form.branchId),
        phone: form.mobileNumber,
      };
      return dialog.mode === "create"
        ? userService.create(payload)
        : userService.update(dialog.user.userId, payload);
    },
    onSuccess: () => {
      toast.success(
        dialog.mode === "create"
          ? "Employee created. A password setup email was sent."
          : "Employee updated successfully.",
      );
      setDialog(null);
      invalidateUsers();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to save employee.")),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }) => userService.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success("Employee status updated.");
      invalidateUsers();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to update status.")),
  });

  const removeUser = useMutation({
    mutationFn: (id) => userService.delete(id),
    onSuccess: () => {
      toast.success("Employee deleted.");
      setDialog(null);
      invalidateUsers();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to delete employee.")),
  });

  const users = usersQuery.data?.users || [];
  const pagination = usersQuery.data?.pagination || { totalRecords: users.length };
  const branches = branchesQuery.data?.branches || [];
  const roles = Array.isArray(rolesQuery.data?.roles) ? rolesQuery.data.roles : [];

  const location = useLocation();

  const selectableRoles = isSuperAdmin
    ? roles.filter((role) => {
        const name = (role.role_name || role.roleName || "").toUpperCase();
        return name === "ADMIN" || name.includes("ADMIN");
      })
    : isAdmin
    ? roles.filter((role) =>
        ["BRANCH_MANAGER", "FIELD_OFFICER", "ACCOUNTANT"].includes(
          (role.role_name || role.roleName || "").toUpperCase(),
        ),
      )
    : roles.filter((role) =>
        ["FIELD_OFFICER", "ACCOUNTANT"].includes(
          (role.role_name || role.roleName || "").toUpperCase(),
        ),
      );

  const formLoading = rolesQuery.isLoading || branchesQuery.isLoading;

  // Handlers
  const openCreate = () => {
    const adminRole = roles.find(
      (role) => (role.role_name || role.roleName || "").toUpperCase() === "ADMIN",
    ) || selectableRoles[0];
    setForm({
      ...emptyForm,
      roleId: isSuperAdmin
        ? String(adminRole?.role_id || adminRole?.roleId || "")
        : "",
    });
    setDialog({ mode: "create" });
  };

  useEffect(() => {
    if (location.state?.openCreate || new URLSearchParams(location.search).get("action") === "create") {
      openCreate();
    }
  }, [location.state, location.search]);

  useEffect(() => {
    if (dialog?.mode === "create" && isSuperAdmin && !form.roleId && roles.length > 0) {
      const adminRole = roles.find(
        (r) => (r.role_name || r.roleName || "").toUpperCase() === "ADMIN",
      ) || roles.find((r) => (r.role_name || r.roleName || "").toUpperCase().includes("ADMIN"));
      if (adminRole) {
        setForm((prev) => ({
          ...prev,
          roleId: String(adminRole.role_id || adminRole.roleId),
        }));
      }
    }
  }, [dialog, isSuperAdmin, form.roleId, roles]);

  const openView = async (user) => {
    try {
      const details = await userService.getById(user.userId);
      setDialog({ mode: "view", user: details });
    } catch {
      setDialog({ mode: "view", user });
    }
  };

  const openEdit = async (user) => {
    try {
      const details = await userService.getById(user.userId);
      setForm({
        firstName: details.firstName || "",
        lastName: details.lastName || "",
        email: details.email || "",
        mobileNumber: details.mobileNumber || details.phone || "",
        roleId: String(details.roleId || ""),
        branchId: String(details.branchId || ""),
      });
      setDialog({ mode: "edit", user: details });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load employee details."));
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("");
    setBranchFilter("");
    setStatusFilter("");
    setPage(0);
  };

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  // Stats calculation
  const totalEmployees = pagination.totalRecords || users.length;
  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const fieldOfficersCount = users.filter((u) =>
    (u.role || "").toUpperCase().includes("FIELD"),
  ).length;
  const managementCount = users.filter((u) =>
    ["ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER"].includes((u.role || "").toUpperCase()),
  ).length;

  return (
    <SectionPage
      title={isSuperAdmin ? "Administrator Management" : "Employee & User Management"}
      subtitle={
        isSuperAdmin
          ? "Manage system administrators and admin user accounts across all branches."
          : "Manage employees, field officers, branch managers, roles, and branch assignments."
      }
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D655D" } }}
        >
          {isSuperAdmin ? "Add Admin User" : "Add Employee"}
        </Button>
      }
    >
      <Stack spacing={3}>
        {/* Metric Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "#F0FDFA", color: "#0F766E" }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="#64748B">
                      {isSuperAdmin ? "Total Admins" : "Total Employees"}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="#0F172A">
                      {totalEmployees}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "#F0FDF4", color: "#16A34A" }}>
                    <ActiveIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="#64748B">
                      {isSuperAdmin ? "Active Admins" : "Active Staff"}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="#0F172A">
                      {activeCount}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "#F3E8FF", color: "#7C3AED" }}>
                    <BadgeIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="#64748B">
                      {isSuperAdmin ? "Role Type" : "Field Officers"}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="#0F172A">
                      {isSuperAdmin ? "ADMIN" : fieldOfficersCount}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "#EFF6FF", color: "#2563EB" }}>
                    <BranchIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="#64748B">
                      {isSuperAdmin ? "Branches Covered" : "Management"}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="#0F172A">
                      {isSuperAdmin ? branches.length || "All" : managementCount}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter and Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid #E2E8F0",
            borderRadius: 2,
            bgcolor: "#F8FAFC",
          }}
        >
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by code, name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2.5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="">{isSuperAdmin ? "Admin Role" : "All Roles"}</MenuItem>
                {(isSuperAdmin
                  ? roles.filter((r) => (r.role_name || r.roleName) === "ADMIN")
                  : roles
                ).map((r) => (
                  <MenuItem key={r.role_id || r.roleId} value={String(r.role_id || r.roleId)}>
                    {r.role_name || r.roleName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4} md={2.5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Branch"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <MenuItem value="">All Branches</MenuItem>
                {branches.map((b) => (
                  <MenuItem key={b.branch_id} value={String(b.branch_id)}>
                    {b.branch_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={1} sx={{ textAlign: "right" }}>
              <Tooltip title="Reset Filters">
                <IconButton onClick={handleResetFilters} size="small" color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>

        {/* Data Table */}
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
                Unable to load employee list. Please try again.
              </Alert>
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <PersonIcon sx={{ fontSize: 48, color: "#94A3B8", mb: 1 }} />
              <Typography color="#64748B" fontWeight="medium">
                {isSuperAdmin
                  ? "No administrator users found matching the criteria."
                  : "No employees found matching the criteria."}
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      <TableCell fontWeight="bold">
                        {isSuperAdmin ? "Administrator" : "Employee"}
                      </TableCell>
                      <TableCell fontWeight="bold">Contact</TableCell>
                      <TableCell fontWeight="bold">Role</TableCell>
                      <TableCell fontWeight="bold">Branch</TableCell>
                      <TableCell fontWeight="bold">Status</TableCell>
                      <TableCell fontWeight="bold">Joined</TableCell>
                      <TableCell align="right" fontWeight="bold">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => {
                      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unnamed Staff";
                      return (
                        <TableRow key={u.userId} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar
                                sx={{
                                  bgcolor: "#0F766E",
                                  width: 36,
                                  height: 36,
                                  fontSize: "0.875rem",
                                  fontWeight: "bold",
                                }}
                              >
                                {getInitials(u.firstName, u.lastName)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight="600" color="#0F172A">
                                  {fullName}
                                </Typography>
                                {u.employeeCode && (
                                  <Chip
                                    label={u.employeeCode}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: "0.7rem", color: "#64748B", borderColor: "#CBD5E1" }}
                                  />
                                )}
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#334155">
                              {u.email || "-"}
                            </Typography>
                            {u.mobileNumber && (
                              <Typography variant="caption" color="#64748B" display="block">
                                📞 {u.mobileNumber}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={u.role || "MEMBER"}
                              size="small"
                              sx={{
                                bgcolor: getRoleColor(u.role),
                                color: "#fff",
                                fontWeight: "600",
                                fontSize: "0.75rem",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#334155">
                              {u.branch || "Head Office / All"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={u.status || "ACTIVE"}
                              size="small"
                              color={u.status === "ACTIVE" ? "success" : "error"}
                              variant={u.status === "ACTIVE" ? "filled" : "outlined"}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#64748B">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title="View Details">
                                <IconButton size="small" color="info" onClick={() => openView(u)}>
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Employee">
                                <IconButton size="small" color="primary" onClick={() => openEdit(u)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={u.status === "ACTIVE" ? "Deactivate" : "Activate"}>
                                <Button
                                  size="small"
                                  sx={{ minWidth: 70, fontSize: "0.75rem" }}
                                  color={u.status === "ACTIVE" ? "warning" : "success"}
                                  onClick={() =>
                                    changeStatus.mutate({
                                      id: u.userId,
                                      status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                                    })
                                  }
                                >
                                  {u.status === "ACTIVE" ? "Disable" : "Enable"}
                                </Button>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => setDialog({ mode: "delete", user: u })}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={pagination.totalRecords || users.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </Paper>
      </Stack>

      {/* View Details Dialog */}
      <Dialog
        open={dialog?.mode === "view"}
        onClose={() => setDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: "#0F766E" }}>
              {getInitials(dialog?.user?.firstName, dialog?.user?.lastName)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {dialog?.user?.firstName} {dialog?.user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Employee Code: {dialog?.user?.employeeCode || "N/A"}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <EmailIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Email Address</Typography>
                    <Typography variant="body2" fontWeight="500">{dialog?.user?.email || "-"}</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Mobile Number</Typography>
                    <Typography variant="body2" fontWeight="500">{dialog?.user?.mobileNumber || dialog?.user?.phone || "-"}</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <BadgeIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Role / Designation</Typography>
                    <Chip
                      label={dialog?.user?.role || "MEMBER"}
                      size="small"
                      sx={{ bgcolor: getRoleColor(dialog?.user?.role), color: "#fff", mt: 0.5 }}
                    />
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <BranchIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Assigned Branch</Typography>
                    <Typography variant="body2" fontWeight="500">{dialog?.user?.branch || "Head Office"}</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ActiveIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Account Status</Typography>
                    <Chip
                      label={dialog?.user?.status || "ACTIVE"}
                      size="small"
                      color={dialog?.user?.status === "ACTIVE" ? "success" : "error"}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <DateIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Joined Date</Typography>
                    <Typography variant="body2" fontWeight="500">
                      {dialog?.user?.createdAt ? new Date(dialog.user.createdAt).toLocaleDateString() : "-"}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              const u = dialog.user;
              setDialog(null);
              openEdit(u);
            }}
          >
            Edit Profile
          </Button>
          <Button variant="contained" onClick={() => setDialog(null)} sx={{ bgcolor: "#0F766E" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialog?.mode === "delete"} onClose={() => setDialog(null)}>
        <DialogTitle>
          {isSuperAdmin ? "Delete Admin Account?" : "Delete Employee Account?"}
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to deactivate and delete{" "}
            <strong>
              {dialog?.user?.firstName} {dialog?.user?.lastName}
            </strong>{" "}
            ({dialog?.user?.employeeCode || dialog?.user?.email})? This action will disable their access.
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
            {removeUser.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialog?.mode === "create" || dialog?.mode === "edit"}
        onClose={() => !saveUser.isPending && setDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialog?.mode === "create"
            ? isSuperAdmin
              ? "Add New Admin User"
              : "Add New Employee"
            : isSuperAdmin
            ? "Edit Admin Details"
            : "Edit Employee Details"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {dialog?.mode === "create" && (
              <Alert severity="info">
                An account setup link will be emailed to the new user automatically upon creation.
              </Alert>
            )}
            {formLoading && (
              <Alert severity="info">Loading available roles and branches…</Alert>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={form.firstName}
                onChange={setField("firstName")}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={form.lastName}
                onChange={setField("lastName")}
              />
            </Stack>

            <TextField
              required
              fullWidth
              label="Email Address"
              type="email"
              value={form.email}
              onChange={setField("email")}
            />

            <TextField
              required
              fullWidth
              label="Mobile Number"
              placeholder="e.g. 9876543210"
              slotProps={{
                htmlInput: { inputMode: "numeric", maxLength: 10 },
              }}
              value={form.mobileNumber}
              onChange={setField("mobileNumber")}
            />

            <TextField
              required
              select
              fullWidth
              label="Role / Designation"
              value={form.roleId}
              onChange={setField("roleId")}
              disabled={formLoading}
            >
              <MenuItem value="">Select a Role</MenuItem>
              {selectableRoles.map((role) => (
                <MenuItem
                  key={role.role_id || role.roleId}
                  value={String(role.role_id || role.roleId)}
                >
                  {role.role_name || role.roleName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              required
              select
              fullWidth
              label="Assigned Branch"
              value={form.branchId}
              onChange={setField("branchId")}
              disabled={formLoading}
            >
              <MenuItem value="">Select a Branch</MenuItem>
              {branches.map((branch) => (
                <MenuItem key={branch.branch_id} value={String(branch.branch_id)}>
                  {branch.branch_name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={
              saveUser.isPending ||
              formLoading ||
              !form.firstName ||
              !form.email ||
              !form.mobileNumber ||
              !form.roleId ||
              !form.branchId
            }
            onClick={() => saveUser.mutate()}
            sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D655D" } }}
          >
            {saveUser.isPending
              ? "Saving…"
              : isSuperAdmin
              ? "Save Admin User"
              : "Save Employee"}
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
