import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
  Tooltip,
  Divider,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  EventAvailable as EventAvailableIcon,
  Business as BusinessIcon,
  MonetizationOn as MonetizationOnIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterListIcon,
  Star as StarIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import groupService from "../../services/group.service";
import branchService from "../../services/branch.service";
import customerService from "../../services/customer.service";
import useAuth from "../../hooks/useAuth";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const emptyForm = {
  groupName: "",
  branchId: "",
  meetingDay: "Monday",
  status: "ACTIVE",
  description: "",
};

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function Groups() {
  const queryClient = useQueryClient();
  const { user, hasPermission } = useAuth();
  const userRole = (user?.role_name || user?.role || "").toUpperCase().replace(/\s+/g, "_");

  const canCreate =
    userRole === "SUPER_ADMIN" ||
    userRole === "ADMIN" ||
    userRole === "BRANCH_MANAGER" ||
    hasPermission("GROUP_CREATE");

  const canEdit =
    userRole === "SUPER_ADMIN" ||
    userRole === "ADMIN" ||
    userRole === "BRANCH_MANAGER" ||
    userRole === "FIELD_OFFICER" ||
    hasPermission("GROUP_UPDATE");

  const canDelete =
    userRole === "SUPER_ADMIN" ||
    userRole === "ADMIN" ||
    userRole === "BRANCH_MANAGER" ||
    hasPermission("GROUP_DELETE");

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(null);

  // Member addition & search state inside detail dialog
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedMemberRole, setSelectedMemberRole] = useState("MEMBER");
  const [memberSearch, setMemberSearch] = useState("");

  // Attendance recording state inside detail dialog
  const [meetingDate, setMeetingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceState, setAttendanceState] = useState({});

  // ---------------- Queries ----------------
  const { data: groupsData, isLoading } = useQuery({
    queryKey: ["groups", search, branchFilter, statusFilter, page, limit],
    queryFn: () =>
      groupService.getAll({
        page: page + 1,
        limit,
        search,
        branchId: branchFilter || undefined,
        status: statusFilter || undefined,
      }),
  });

  const { data: branchesData } = useQuery({
    queryKey: ["branches-list"],
    queryFn: () => branchService.getAll({ limit: 100, status: "ACTIVE" }),
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers-list"],
    queryFn: () => customerService.getAll({ limit: 100 }),
  });

  const { data: groupDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["group-details", selectedGroupId],
    queryFn: () => groupService.getById(selectedGroupId),
    enabled: Boolean(selectedGroupId),
  });

  const { data: attendanceHistory } = useQuery({
    queryKey: ["group-attendance", selectedGroupId],
    queryFn: () => groupService.getAttendance(selectedGroupId),
    enabled: Boolean(selectedGroupId && tabValue === 2),
  });

  const groups = groupsData?.groups || [];
  const pagination = groupsData?.pagination || { totalRecords: 0 };
  const branches = branchesData?.branches || [];
  const customers = customersData?.customers || [];

  // Initialize attendance state when groupDetail loaded
  const members = groupDetail?.members || [];

  const filteredMembers = members.filter((m) => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase().trim();
    return (
      (m.customer_name && m.customer_name.toLowerCase().includes(q)) ||
      (m.customer_code && m.customer_code.toLowerCase().includes(q)) ||
      (m.mobile_number && m.mobile_number.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q))
    );
  });

  // ---------------- Mutations ----------------
  const saveGroupMutation = useMutation({
    mutationFn: (payload) =>
      editingGroup
        ? groupService.update(editingGroup.group_id, payload)
        : groupService.create(payload),
    onSuccess: () => {
      toast.success(
        editingGroup
          ? "Group updated successfully!"
          : "Group created successfully!"
      );
      queryClient.invalidateQueries(["groups"]);
      handleCloseFormDialog();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Operation failed."
      );
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id) => groupService.delete(id),
    onSuccess: () => {
      toast.success("Group deleted successfully!");
      queryClient.invalidateQueries(["groups"]);
      handleCloseDeleteDialog();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Delete failed."
      );
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ groupId, customerId, role }) =>
      groupService.addMember(groupId, customerId, role),
    onSuccess: () => {
      toast.success("Member added to group successfully!");
      queryClient.invalidateQueries(["group-details", selectedGroupId]);
      queryClient.invalidateQueries(["groups"]);
      setSelectedCustomerId("");
      setSelectedMemberRole("MEMBER");
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to add member."
      );
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ groupId, customerId }) =>
      groupService.removeMember(groupId, customerId),
    onSuccess: () => {
      toast.success("Member removed from group!");
      queryClient.invalidateQueries(["group-details", selectedGroupId]);
      queryClient.invalidateQueries(["groups"]);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to remove member."
      );
    },
  });

  const recordAttendanceMutation = useMutation({
    mutationFn: (payload) =>
      groupService.recordAttendance(selectedGroupId, payload),
    onSuccess: () => {
      toast.success("Attendance recorded successfully!");
      queryClient.invalidateQueries(["group-attendance", selectedGroupId]);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to record attendance."
      );
    },
  });

  // ---------------- Handlers ----------------
  const handleOpenFormDialog = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setForm({
        groupName: group.group_name || "",
        branchId: group.branch_id || "",
        meetingDay: group.meeting_day || "Monday",
        status: group.status || "ACTIVE",
        description: group.description || "",
      });
    } else {
      setEditingGroup(null);
      setForm(emptyForm);
    }
    setOpenFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setEditingGroup(null);
    setForm(emptyForm);
  };

  const handleSaveGroup = (e) => {
    e.preventDefault();
    if (!form.groupName.trim()) {
      toast.error("Group name is required.");
      return;
    }
    if (!form.branchId) {
      toast.error("Branch is required.");
      return;
    }
    saveGroupMutation.mutate(form);
  };

  const handleOpenDetailDialog = (group) => {
    setSelectedGroupId(group.group_id);
    setOpenDetailDialog(true);
    setTabValue(0);
    setMemberSearch("");
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedGroupId(null);
    setAttendanceState({});
    setMemberSearch("");
  };

  const handleOpenDeleteDialog = (group) => {
    setDeletingGroup(group);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingGroup(null);
  };

  const handleAddMember = () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer to add.");
      return;
    }
    addMemberMutation.mutate({
      groupId: selectedGroupId,
      customerId: selectedCustomerId,
      role: selectedMemberRole,
    });
  };

  const handleAttendanceStatusChange = (customerId, status) => {
    setAttendanceState((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        status,
      },
    }));
  };

  const handleAttendanceRemarksChange = (customerId, remarks) => {
    setAttendanceState((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        remarks,
      },
    }));
  };

  const handleSaveAttendance = () => {
    if (!meetingDate) {
      toast.error("Please select a meeting date.");
      return;
    }
    if (members.length === 0) {
      toast.error("Group has no members to record attendance.");
      return;
    }

    const attendanceRecords = members.map((m) => {
      const state = attendanceState[m.customer_id] || {};
      return {
        customerId: m.customer_id,
        status: state.status || "PRESENT",
        remarks: state.remarks || "",
      };
    });

    recordAttendanceMutation.mutate({
      groupId: selectedGroupId,
      meetingDate,
      attendance: attendanceRecords,
    });
  };

  return (
    <SectionPage
      title="Group Management"
      subtitle="Organize self-help groups (SHG/JLG), manage group members, and track meeting attendance."
      actions={
        canCreate ? (
          <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenFormDialog()}
              sx={{
                bgcolor: "#0F766E",
                "&:hover": { bgcolor: "#115E59" },
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
              }}
            >
              Create New Group
            </Button>
          </Stack>
        ) : null
      }
    >
      {/* KPI STATS BAR */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #0F766E", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL GROUPS
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#0F766E", mt: 0.5 }}>
                {pagination.totalRecords || groups.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #10B981", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                ACTIVE SHGs
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#10B981", mt: 0.5 }}>
                {groups.filter((g) => g.status === "ACTIVE").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #0284C7", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL MEMBERS
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#0284C7", mt: 0.5 }}>
                {groups.reduce((sum, g) => sum + (parseInt(g.member_count, 10) || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #6366F1", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                GROUP COLLECTIONS
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#6366F1", mt: 0.5 }}>
                {formatCurrency(groups.reduce((sum, g) => sum + (parseFloat(g.total_collected) || 0), 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Search & Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          border: "1px solid #E2E8F0",
          borderRadius: 3,
          bgcolor: "#FFFFFF",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by group name or code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Branch"
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setPage(0);
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            >
              <MenuItem value="">All Branches</MenuItem>
              {branches.map((b) => (
                <MenuItem key={b.branch_id} value={b.branch_id}>
                  {b.branch_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
              <MenuItem value="DISSOLVED">Dissolved</MenuItem>
            </TextField>
          </Grid>

          {(search || branchFilter || statusFilter) && (
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                size="small"
                onClick={() => {
                  setSearch("");
                  setBranchFilter("");
                  setStatusFilter("");
                  setPage(0);
                }}
                sx={{ color: "#0F766E", fontWeight: 600 }}
              >
                Clear Filters
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Main Groups Table */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid #E2E8F0", borderRadius: 3, overflow: "hidden" }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress sx={{ color: "#0F766E" }} />
          </Box>
        ) : groups.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <PeopleIcon sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }} />
            <Typography variant="h6" color="#475569" fontWeight={600}>
              No groups found
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mb: 2 }}>
              Try adjusting your search filters or create a new group.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => handleOpenFormDialog()}
              sx={{ color: "#0F766E", borderColor: "#0F766E", borderRadius: 2 }}
            >
              Create Group
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{ bgcolor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>
                      Group Code & Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>
                      Branch
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>
                      Meeting Day
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>
                      Members
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>
                      Active Loans
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>
                      Total Collection
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>
                      Status
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, color: "#0F172A" }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow
                      key={group.group_id}
                      sx={{
                        "&:hover": { bgcolor: "#F0F9FF" },
                        borderBottom: "1px solid #E2E8F0",
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ color: "#0F766E" }}
                        >
                          {group.group_code}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ color: "#0F172A" }}
                        >
                          {group.group_name}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ color: "#334155", fontWeight: 500 }}>
                        {group.branch_name || "-"}
                      </TableCell>

                      <TableCell sx={{ color: "#475569" }}>
                        <Chip
                          label={group.meeting_day || "N/A"}
                          size="small"
                          sx={{
                            bgcolor: "#F1F5F9",
                            color: "#334155",
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={<PeopleIcon sx={{ fontSize: "16px !important" }} />}
                          label={`${group.member_count || 0} members`}
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
                          label={`${group.active_loans || 0} active`}
                          size="small"
                          sx={{
                            bgcolor:
                              group.active_loans > 0 ? "#FEF08A" : "#F1F5F9",
                            color:
                              group.active_loans > 0 ? "#854D0E" : "#64748B",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ color: "#0F172A", fontWeight: 700 }}>
                        {formatCurrency(group.total_collected)}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={group.status}
                          size="small"
                          sx={{
                            bgcolor:
                              group.status === "ACTIVE"
                                ? "#DCFCE7"
                                : group.status === "INACTIVE"
                                ? "#FEF3C7"
                                : "#FEE2E2",
                            color:
                              group.status === "ACTIVE"
                                ? "#15803D"
                                : group.status === "INACTIVE"
                                ? "#B45309"
                                : "#991B1B",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Tooltip title="View & Manage Group">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetailDialog(group)}
                              sx={{ color: "#0F766E", bgcolor: "#CCFBF1" }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {canEdit && (
                            <Tooltip title="Edit Group">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenFormDialog(group)}
                                sx={{ color: "#0284C7", bgcolor: "#E0F2FE" }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canDelete && (
                            <Tooltip title="Delete Group">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDeleteDialog(group)}
                                sx={{ color: "#DC2626", bgcolor: "#FEE2E2" }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={pagination.totalRecords || 0}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>

      {/* Create / Edit Group Dialog */}
      <Dialog
        open={openFormDialog}
        onClose={handleCloseFormDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
            fontWeight: 700,
            color: "#0F172A",
          }}
        >
          {editingGroup ? "Edit Group Details" : "Create New Microfinance Group"}
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveGroup}>
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Group Name"
                value={form.groupName}
                onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                placeholder="e.g. Mahila Shakti SHG"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                  },
                }}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    required
                    fullWidth
                    label="Assign Branch"
                    value={form.branchId}
                    onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                      },
                    }}
                  >
                    {branches.map((b) => (
                      <MenuItem key={b.branch_id} value={b.branch_id}>
                        {b.branch_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Meeting Day"
                    value={form.meetingDay}
                    onChange={(e) =>
                      setForm({ ...form, meetingDay: e.target.value })
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                      },
                    }}
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <TextField
                select
                fullWidth
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                  },
                }}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="DISSOLVED">Dissolved</MenuItem>
              </TextField>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Group Description / Notes"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Details about meeting location, leader contact, center info..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                  },
                }}
              />
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              p: 2.5,
              bgcolor: "#F8FAFC",
              borderTop: "1px solid #E2E8F0",
            }}
          >
            <Button
              onClick={handleCloseFormDialog}
              sx={{ color: "#64748B", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saveGroupMutation.isPending}
              sx={{
                bgcolor: "#0F766E",
                "&:hover": { bgcolor: "#115E59" },
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
              }}
            >
              {saveGroupMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : editingGroup ? (
                "Update Group"
              ) : (
                "Save Group"
              )}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Group Details & Management Drawer/Modal */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, minHeight: "600px" } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              {groupDetail?.group_name || "Group Details"}
            </Typography>
            <Typography variant="caption" color="#64748B">
              Code: {groupDetail?.group_code} | Branch: {groupDetail?.branch_name}
            </Typography>
          </Box>
          <Chip
            label={groupDetail?.status || "ACTIVE"}
            size="small"
            sx={{
              bgcolor:
                groupDetail?.status === "ACTIVE" ? "#DCFCE7" : "#FEF3C7",
              color: groupDetail?.status === "ACTIVE" ? "#15803D" : "#B45309",
              fontWeight: 700,
            }}
          />
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {isLoadingDetail ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress sx={{ color: "#0F766E" }} />
            </Box>
          ) : (
            <>
              <Tabs
                value={tabValue}
                onChange={(e, val) => setTabValue(val)}
                sx={{
                  borderBottom: "2px solid #E2E8F0",
                  "& .MuiTab-root": {
                    fontWeight: 600,
                    color: "#64748B",
                    "&.Mui-selected": { color: "#0F766E" },
                  },
                  "& .MuiTabs-indicator": { bgcolor: "#0F766E", height: 3 },
                }}
              >
                <Tab label="Overview" icon={<BusinessIcon />} iconPosition="start" />
                <Tab
                  label={`Members (${members.length})`}
                  icon={<PeopleIcon />}
                  iconPosition="start"
                />
                <Tab
                  label="Attendance"
                  icon={<EventAvailableIcon />}
                  iconPosition="start"
                />
              </Tabs>

              {/* TAB 0: OVERVIEW */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card
                      elevation={0}
                      sx={{ border: "1px solid #E2E8F0", borderRadius: 2, bgcolor: "#F8FAFC" }}
                    >
                      <CardContent>
                        <Typography variant="caption" color="#64748B" fontWeight={600}>
                          TOTAL MEMBERS
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color="#0F766E">
                          {groupDetail?.member_count || members.length || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card
                      elevation={0}
                      sx={{ border: "1px solid #E2E8F0", borderRadius: 2, bgcolor: "#F8FAFC" }}
                    >
                      <CardContent>
                        <Typography variant="caption" color="#64748B" fontWeight={600}>
                          ACTIVE LOANS
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color="#0284C7">
                          {groupDetail?.active_loans || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card
                      elevation={0}
                      sx={{ border: "1px solid #E2E8F0", borderRadius: 2, bgcolor: "#F8FAFC" }}
                    >
                      <CardContent>
                        <Typography variant="caption" color="#64748B" fontWeight={600}>
                          TOTAL COLLECTIONS
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color="#15803D">
                          {formatCurrency(groupDetail?.total_collected)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #E2E8F0", borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="#64748B">
                        Branch Name
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="#0F172A">
                        {groupDetail?.branch_name}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="#64748B">
                        Weekly Meeting Day
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="#0F172A">
                        {groupDetail?.meeting_day || "Not specified"}
                      </Typography>
                    </Grid>

                    <Grid size={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="#64748B">
                        Group Description
                      </Typography>
                      <Typography variant="body2" color="#334155" sx={{ mt: 0.5 }}>
                        {groupDetail?.description || "No description provided."}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </TabPanel>

              {/* TAB 1: MEMBERS */}
              <TabPanel value={tabValue} index={1}>
                {/* Add Member Card */}
                <Paper
                  elevation={0}
                  sx={{ p: 2.5, mb: 3, border: "1px solid #CCFBF1", borderRadius: 2, bgcolor: "#F0FDFA" }}
                >
                  <Typography variant="subtitle2" fontWeight={700} color="#0F766E" sx={{ mb: 1.5 }}>
                    Add Customer to Group
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Select Customer"
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        sx={{ bgcolor: "#FFFFFF", borderRadius: 1 }}
                      >
                        <MenuItem value="">-- Select Customer --</MenuItem>
                        {customers.map((c) => (
                          <MenuItem key={c.customer_id} value={c.customer_id}>
                            {c.first_name} {c.last_name} ({c.customer_code} - {c.mobile_number})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Group Role"
                        value={selectedMemberRole}
                        onChange={(e) => setSelectedMemberRole(e.target.value)}
                        sx={{ bgcolor: "#FFFFFF", borderRadius: 1 }}
                      >
                        <MenuItem value="MEMBER">Member</MenuItem>
                        <MenuItem value="LEADER">Leader</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PersonAddIcon />}
                        onClick={handleAddMember}
                        disabled={addMemberMutation.isPending}
                        sx={{
                          bgcolor: "#0F766E",
                          "&:hover": { bgcolor: "#115E59" },
                          borderRadius: 2,
                          py: 1,
                          fontWeight: 600,
                        }}
                      >
                        {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Member Search & List Header */}
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", sm: "center" },
                    gap: 1.5,
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="Search member by name, code, contact or role..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    sx={{ width: { xs: "100%", sm: 340 } }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: "#64748B", fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: memberSearch ? (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setMemberSearch("")}
                              edge="end"
                            >
                              <ClearIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </InputAdornment>
                        ) : null,
                      },
                    }}
                  />

                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Chip
                      label={`Total Members: ${members.length}`}
                      size="small"
                      sx={{ bgcolor: "#F1F5F9", color: "#334155", fontWeight: 700 }}
                    />
                    {members.filter((m) => m.role === "LEADER").length > 0 && (
                      <Chip
                        icon={<StarIcon sx={{ fontSize: "14px !important" }} />}
                        label={`Leaders: ${
                          members.filter((m) => m.role === "LEADER").length
                        }`}
                        size="small"
                        sx={{ bgcolor: "#F3E8FF", color: "#7E22CE", fontWeight: 700 }}
                      />
                    )}
                  </Stack>
                </Box>

                {/* Members List Table */}
                {members.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="#64748B">
                      No members added to this group yet. Use the form above to add members.
                    </Typography>
                  </Box>
                ) : filteredMembers.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="#64748B">
                      No members matching &quot;{memberSearch}&quot; found.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Customer Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredMembers.map((m) => (
                          <TableRow key={m.id || m.customer_id} hover>
                            <TableCell sx={{ fontWeight: 600, color: "#0F172A" }}>
                              {m.customer_name}
                            </TableCell>
                            <TableCell>{m.customer_code}</TableCell>
                            <TableCell>{m.mobile_number || m.email || "-"}</TableCell>
                            <TableCell>
                              <Chip
                                icon={m.role === "LEADER" ? <StarIcon sx={{ fontSize: "14px !important" }} /> : undefined}
                                label={m.role || "MEMBER"}
                                size="small"
                                sx={{
                                  bgcolor: m.role === "LEADER" ? "#F3E8FF" : "#E0F2FE",
                                  color: m.role === "LEADER" ? "#7E22CE" : "#0369A1",
                                  fontWeight: 700,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                color="error"
                                onClick={() =>
                                  removeMemberMutation.mutate({
                                    groupId: selectedGroupId,
                                    customerId: m.customer_id,
                                  })
                                }
                                disabled={removeMemberMutation.isPending}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>

              {/* TAB 2: ATTENDANCE */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#0F172A" sx={{ mb: 1 }}>
                    Record Group Meeting Attendance
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        type="date"
                        fullWidth
                        size="small"
                        label="Meeting Date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2 },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 8 }} textAlign={{ sm: "right" }}>
                      <Button
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        onClick={handleSaveAttendance}
                        disabled={
                          recordAttendanceMutation.isPending ||
                          members.length === 0
                        }
                        sx={{
                          bgcolor: "#0F766E",
                          "&:hover": { bgcolor: "#115E59" },
                          borderRadius: 2,
                          px: 3,
                          fontWeight: 600,
                        }}
                      >
                        {recordAttendanceMutation.isPending
                          ? "Saving..."
                          : "Save Attendance"}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {members.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Search member in attendance list..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      sx={{ width: { xs: "100%", sm: 340 } }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: "#64748B", fontSize: 20 }} />
                            </InputAdornment>
                          ),
                          endAdornment: memberSearch ? (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={() => setMemberSearch("")}
                                edge="end"
                              >
                                <ClearIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </InputAdornment>
                          ) : null,
                        },
                      }}
                    />
                  </Box>
                )}

                {members.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="#64748B">
                      Please add members to this group before recording attendance.
                    </Typography>
                  </Box>
                ) : filteredMembers.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="#64748B">
                      No members matching &quot;{memberSearch}&quot; found.
                    </Typography>
                  </Box>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{ border: "1px solid #E2E8F0", borderRadius: 2, overflow: "hidden", mb: 3 }}
                  >
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Member</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Attendance Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredMembers.map((m) => {
                          const status =
                            attendanceState[m.customer_id]?.status || "PRESENT";
                          const remarks =
                            attendanceState[m.customer_id]?.remarks || "";
                          return (
                            <TableRow key={m.customer_id} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {m.customer_name}
                                </Typography>
                                <Typography variant="caption" color="#64748B">
                                  {m.customer_code}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <RadioGroup
                                  row
                                  value={status}
                                  onChange={(e) =>
                                    handleAttendanceStatusChange(
                                      m.customer_id,
                                      e.target.value
                                    )
                                  }
                                >
                                  <FormControlLabel
                                    value="PRESENT"
                                    control={<Radio size="small" color="success" />}
                                    label="Present"
                                  />
                                  <FormControlLabel
                                    value="ABSENT"
                                    control={<Radio size="small" color="error" />}
                                    label="Absent"
                                  />
                                  <FormControlLabel
                                    value="LATE"
                                    control={<Radio size="small" color="warning" />}
                                    label="Late"
                                  />
                                </RadioGroup>
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  fullWidth
                                  placeholder="Optional remarks..."
                                  value={remarks}
                                  onChange={(e) =>
                                    handleAttendanceRemarksChange(
                                      m.customer_id,
                                      e.target.value
                                    )
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Paper>
                )}

                {/* History Section */}
                {attendanceHistory && attendanceHistory.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="#0F172A"
                      sx={{ mb: 1.5 }}
                    >
                      Recent Attendance Log
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{ border: "1px solid #E2E8F0", borderRadius: 2, overflow: "hidden" }}
                    >
                      <Table size="small">
                        <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Meeting Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Member</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {attendanceHistory.slice(0, 10).map((a) => (
                            <TableRow key={a.id} hover>
                              <TableCell>
                                {new Date(a.meeting_date).toLocaleDateString("en-IN")}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                {a.customer_name}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={a.status}
                                  size="small"
                                  sx={{
                                    bgcolor:
                                      a.status === "PRESENT"
                                        ? "#DCFCE7"
                                        : a.status === "LATE"
                                        ? "#FEF3C7"
                                        : "#FEE2E2",
                                    color:
                                      a.status === "PRESENT"
                                        ? "#15803D"
                                        : a.status === "LATE"
                                        ? "#B45309"
                                        : "#991B1B",
                                    fontWeight: 700,
                                  }}
                                />
                              </TableCell>
                              <TableCell color="#64748B">{a.remarks || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  </Box>
                )}
              </TabPanel>
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{ p: 2.5, bgcolor: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}
        >
          <Button
            onClick={handleCloseDetailDialog}
            sx={{ color: "#64748B", fontWeight: 600 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#991B1B" }}>
          Confirm Delete Group
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#334155">
            Are you sure you want to delete group{" "}
            <strong>{deletingGroup?.group_name}</strong> ({deletingGroup?.group_code})?
            This action will soft-delete the group.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#F8FAFC" }}>
          <Button onClick={handleCloseDeleteDialog} sx={{ color: "#64748B" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteGroupMutation.isPending}
            onClick={() =>
              deletingGroup && deleteGroupMutation.mutate(deletingGroup.group_id)
            }
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            {deleteGroupMutation.isPending ? "Deleting..." : "Delete Group"}
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
