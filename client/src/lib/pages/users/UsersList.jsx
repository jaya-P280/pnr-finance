import { useState } from "react";
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

  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const queryClient = useQueryClient();

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
          ? "Employee created. Password setup email sent."
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

  const selectableRoles = isSuperAdmin
    ? roles.filter((role) => (role.role_name || role.roleName) === "ADMIN")
    : isAdmin
    ? roles.filter((role) =>
        ["BRANCH_MANAGER", "FIELD_OFFICER", "ACCOUNTANT"].includes(
          role.role_name || role.roleName,
        ),
      )
    : roles.filter((role) =>
        ["FIELD_OFFICER", "ACCOUNTANT"].includes(
          role.role_name || role.roleName,
        ),
      );

  const formLoading = rolesQuery.isLoading || branchesQuery.isLoading;

  const openCreate = () => {
    const adminRole = selectableRoles.find(
      (role) => (role.role_name || role.roleName) === "ADMIN",
    );
    setForm({
      ...emptyForm,
      roleId: isSuperAdmin
        ? String(adminRole?.role_id || adminRole?.roleId || "")
        : "",
    });
    setDialog({ mode: "create" });
  };

  const openView = async (u) => {
    try {
      const details = await userService.getById(u.userId);
      setDialog({ mode: "view", user: details });
    } catch {
      setDialog({ mode: "view", user: u });
    }
  };

  const openEdit = async (u) => {
    try {
      const details = await userService.getById(u.userId);
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

  const totalEmployees = pagination.totalRecords || users.length;
  const activeCount = users.filter((u) => u.status === "ACTIVE").length;

  return (
    <SectionPage
      title={isSuperAdmin ? "Administrator Management" : "Employee Management"}
      subtitle={
        isSuperAdmin
          ? "Manage system administrators and admin user accounts across all branches."
          : "Manage employee staff members, field officers, branch managers, and branch assignments."
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
        </Grid>

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
                              {u.branch || "Head Office"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={u.status || "ACTIVE"}
                              size="small"
                              color={u.status === "ACTIVE" ? "success" : "error"}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title="View Details">
                                <IconButton size="small" color="info" onClick={() => openView(u)}>
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton size="small" color="primary" onClick={() => openEdit(u)}>
                                  <EditIcon fontSize="small" />
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
            </>
          )}
        </Paper>
      </Stack>
    </SectionPage>
  );
}
