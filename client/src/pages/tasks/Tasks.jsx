import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tabs,
  Tab,
  LinearProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assignment as TaskIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityHighIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import taskService from "../../services/task.service";
import userService from "../../services/user.service";
import branchService from "../../services/branch.service";
import customerService from "../../services/customer.service";

const CATEGORY_OPTIONS = [
  { value: "FIELD_VISIT", label: "Field Visit", color: "primary" },
  { value: "DOCUMENT_VERIFICATION", label: "Document Verification", color: "info" },
  { value: "LOAN_COLLECTION", label: "Loan Collection", color: "warning" },
  { value: "GROUP_MEETING", label: "Group Meeting", color: "secondary" },
  { value: "KYC_AUDIT", label: "KYC Audit", color: "success" },
  { value: "CUSTOMER_ONBOARDING", label: "Customer Onboarding", color: "tertiary" },
  { value: "OTHER", label: "Other", color: "default" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low", color: "default", bg: "#F1F5F9" },
  { value: "MEDIUM", label: "Medium", color: "info", bg: "#E0F2FE" },
  { value: "HIGH", label: "High", color: "warning", bg: "#FEF3C7" },
  { value: "URGENT", label: "Urgent", color: "error", bg: "#FEE2E2" },
];

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "warning", bg: "#FEF3C7", textColor: "#D97706" },
  IN_PROGRESS: { label: "In Progress", color: "info", bg: "#E0F2FE", textColor: "#0284C7" },
  COMPLETED: { label: "Completed", color: "success", bg: "#D1FAE5", textColor: "#059669" },
  CANCELLED: { label: "Cancelled", color: "error", bg: "#F3F4F6", textColor: "#6B7280" },
};

export default function Tasks() {
  const queryClient = useQueryClient();

  const [statusTab, setStatusTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [openModal, setOpenModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({
    task_title: "",
    description: "",
    category: "FIELD_VISIT",
    priority: "MEDIUM",
    due_date: "",
    assigned_to: "",
    branch_id: "",
    customer_id: "",
  });

  // Queries
  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ["tasks", statusTab, categoryFilter, priorityFilter, search],
    queryFn: () =>
      taskService.getAll({
        status: statusTab,
        category: categoryFilter,
        priority: priorityFilter,
        search,
      }),
  });

  const { data: stats = {} } = useQuery({
    queryKey: ["taskStats"],
    queryFn: () => taskService.getStats(),
  });

  const { data: usersData = [] } = useQuery({
    queryKey: ["usersForTasks"],
    queryFn: async () => {
      const res = await userService.getUsers({ limit: 100 });
      return res.users || [];
    },
  });

  const { data: branchesData = [] } = useQuery({
    queryKey: ["branchesForTasks"],
    queryFn: async () => {
      const res = await branchService.getBranches({ limit: 100 });
      return res.data?.branches || res.branches || [];
    },
  });

  const { data: customersData = [] } = useQuery({
    queryKey: ["customersForTasks"],
    queryFn: async () => {
      const res = await customerService.getAll({ limit: 100 });
      return res.customers || [];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => taskService.create(data),
    onSuccess: () => {
      toast.success("Task created successfully!");
      queryClient.invalidateQueries(["tasks"]);
      queryClient.invalidateQueries(["taskStats"]);
      handleCloseModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create task");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => taskService.update(id, data),
    onSuccess: () => {
      toast.success("Task updated successfully!");
      queryClient.invalidateQueries(["tasks"]);
      queryClient.invalidateQueries(["taskStats"]);
      handleCloseModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update task");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => taskService.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Task status updated!");
      queryClient.invalidateQueries(["tasks"]);
      queryClient.invalidateQueries(["taskStats"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => taskService.delete(id),
    onSuccess: () => {
      toast.success("Task deleted!");
      queryClient.invalidateQueries(["tasks"]);
      queryClient.invalidateQueries(["taskStats"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete task");
    },
  });

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        task_title: task.task_title || "",
        description: task.description || "",
        category: task.category || "FIELD_VISIT",
        priority: task.priority || "MEDIUM",
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
        assigned_to: task.assigned_to || "",
        branch_id: task.branch_id || "",
        customer_id: task.customer_id || "",
      });
    } else {
      setEditingTask(null);
      setFormData({
        task_title: "",
        description: "",
        category: "FIELD_VISIT",
        priority: "MEDIUM",
        due_date: new Date().toISOString().split("T")[0],
        assigned_to: "",
        branch_id: "",
        customer_id: "",
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingTask(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.task_title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    if (editingTask) {
      updateMutation.mutate({ id: editingTask.task_id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <SectionPage title="Task & Operations Management">
      <Box sx={{ mb: 4 }}>
        {/* Header summary & Create Button */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 3, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} color="#0F172A">
              Daily Operations & Field Tasks
            </Typography>
            <Typography variant="body2" color="#64748B">
              Assign, track, and manage customer visits, document verification, and collections.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              sx={{ borderColor: "#CBD5E1", color: "#475569" }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{
                bgcolor: "#0F766E",
                "&:hover": { bgcolor: "#0D9488" },
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
              }}
            >
              New Task
            </Button>
          </Stack>
        </Stack>

        {/* Stats Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="caption" color="#64748B" fontWeight={600}>
                  TOTAL TASKS
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ mt: 0.5 }}>
                  {stats.total || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ border: "1px solid #FEF3C7", bgcolor: "#FFFBEB", borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="caption" color="#D97706" fontWeight={700}>
                  PENDING
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#B45309" sx={{ mt: 0.5 }}>
                  {stats.pending || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ border: "1px solid #E0F2FE", bgcolor: "#F0F9FF", borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="caption" color="#0284C7" fontWeight={700}>
                  IN PROGRESS
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#0369A1" sx={{ mt: 0.5 }}>
                  {stats.in_progress || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ border: "1px solid #D1FAE5", bgcolor: "#ECFDF5", borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="caption" color="#059669" fontWeight={700}>
                  COMPLETED
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#047857" sx={{ mt: 0.5 }}>
                  {stats.completed || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ border: "1px solid #FEE2E2", bgcolor: "#FEF2F2", borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="caption" color="#DC2626" fontWeight={700}>
                  URGENT / HIGH
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#B91C1C" sx={{ mt: 0.5 }}>
                  {stats.urgent || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters & Search Bar */}
        <Card elevation={0} sx={{ p: 2.5, border: "1px solid #E2E8F0", borderRadius: 3, mb: 3 }}>
          <Stack spacing={2}>
            <Tabs
              value={statusTab}
              onChange={(e, val) => setStatusTab(val)}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minWidth: 100 },
              }}
            >
              <Tab value="ALL" label="All Tasks" />
              <Tab value="PENDING" label="Pending" />
              <Tab value="IN_PROGRESS" label="In Progress" />
              <Tab value="COMPLETED" label="Completed" />
              <Tab value="CANCELLED" label="Cancelled" />
            </Tabs>

            <Grid container spacing={2}  sx={{ alignItems: "center" }}>
              <Grid xs={12} md={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search task title, customer, or notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <SearchIcon sx={{ color: "#94A3B8", mr: 1 }} />,
                    },
                  }}
                />
              </Grid>

              <Grid xs={12} sm={6} md={3.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Categories</MenuItem>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={3.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priorityFilter}
                    label="Priority"
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Priorities</MenuItem>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
        </Card>

        {/* Task Cards Grid */}
        {isLoading && <LinearProgress sx={{ my: 3, borderRadius: 1 }} />}

        {!isLoading && tasks.length === 0 && (
          <Card elevation={0} sx={{ border: "1px border-dashed #CBD5E1", p: 6, textAlign: "center", borderRadius: 3 }}>
            <TaskIcon sx={{ fontSize: 48, color: "#94A3B8", mb: 1 }} />
            <Typography variant="h6" color="#475569" fontWeight={700}>
              No tasks found
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mb: 2 }}>
              There are no tasks matching your current filters. Create a new task to get started.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D9488" } }}
            >
              Create New Task
            </Button>
          </Card>
        )}

        <Grid container spacing={2.5}>
          {tasks.map((task) => {
            const statusStyle = STATUS_CONFIG[task.status] || STATUS_CONFIG.PENDING;
            const priorityStyle =
              PRIORITY_OPTIONS.find((p) => p.value === task.priority) || PRIORITY_OPTIONS[1];
            const categoryObj =
              CATEGORY_OPTIONS.find((c) => c.value === task.category) || CATEGORY_OPTIONS[0];

            return (
              <Grid key={task.task_id} xs={12} md={6} lg={4}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid #E2E8F0",
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
                      borderColor: "#CBD5E1",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Category & Priority Row */}
                    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between",  mb: 1.5 }}>
                      <Chip
                        label={categoryObj.label}
                        size="small"
                        sx={{
                          bgcolor: "#F1F5F9",
                          color: "#334155",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                        }}
                      />
                      <Chip
                        label={priorityStyle.label}
                        size="small"
                        sx={{
                          bgcolor: priorityStyle.bg,
                          color: priorityStyle.value === "URGENT" ? "#DC2626" : "#475569",
                          fontWeight: 700,
                          fontSize: "0.72rem",
                        }}
                      />
                    </Stack>

                    {/* Task Title */}
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="#0F172A"
                      sx={{ mb: 1, fontSize: "1.05rem", lineHeight: 1.3 }}
                    >
                      {task.task_title}
                    </Typography>

                    {/* Description */}
                    {task.description && (
                      <Typography
                        variant="body2"
                        color="#64748B"
                        sx={{
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {task.description}
                      </Typography>
                    )}

                    {/* Details Info */}
                    <Stack spacing={1} sx={{ mt: 2, pt: 1.5, borderTop: "1px solid #F1F5F9" }}>
                      {task.due_date && (
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <ScheduleIcon sx={{ fontSize: 16, color: "#64748B" }} />
                          <Typography variant="caption" color="#475569" fontWeight={600}>
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      )}

                      {task.assigned_to_name && (
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <PersonIcon sx={{ fontSize: 16, color: "#64748B" }} />
                          <Typography variant="caption" color="#475569">
                            Assigned to: <strong>{task.assigned_to_name}</strong>
                          </Typography>
                        </Stack>
                      )}

                      {task.customer_name && (
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <TaskIcon sx={{ fontSize: 16, color: "#0F766E" }} />
                          <Typography variant="caption" color="#0F766E" fontWeight={600}>
                            Customer: {task.customer_name} ({task.customer_code})
                          </Typography>
                        </Stack>
                      )}

                      {task.branch_name && (
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <BusinessIcon sx={{ fontSize: 16, color: "#64748B" }} />
                          <Typography variant="caption" color="#64748B">
                            Branch: {task.branch_name}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>

                  {/* Card Footer Actions */}
                  <Box
                    sx={{
                      p: 1.5,
                      px: 2.5,
                      bgcolor: "#F8FAFC",
                      borderTop: "1px solid #F1F5F9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                    }}
                  >
                    <Chip
                      label={statusStyle.label}
                      size="small"
                      sx={{
                        bgcolor: statusStyle.bg,
                        color: statusStyle.textColor,
                        fontWeight: 700,
                        fontSize: "0.72rem",
                      }}
                    />

                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      {task.status === "PENDING" && (
                        <Tooltip title="Start Task">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              statusMutation.mutate({ id: task.task_id, status: "IN_PROGRESS" })
                            }
                          >
                            <PlayArrowIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {task.status !== "COMPLETED" && (
                        <Tooltip title="Mark Completed">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() =>
                              statusMutation.mutate({ id: task.task_id, status: "COMPLETED" })
                            }
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Edit Task">
                        <IconButton size="small" onClick={() => handleOpenModal(task)}>
                          <EditIcon fontSize="small" sx={{ color: "#64748B" }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Task">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this task?")) {
                              deleteMutation.mutate(task.task_id);
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Create / Edit Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
            {editingTask ? "Edit Operation Task" : "Create New Operation Task"}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                fullWidth
                required
                label="Task Title"
                placeholder="e.g. Conduct field visit for customer loan verification"
                value={formData.task_title}
                onChange={(e) => setFormData({ ...formData, task_title: e.target.value })}
              />

              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <FormControl fullWidth required size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      label="Category"
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl fullWidth required size="small">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={formData.priority}
                      label="Priority"
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      {PRIORITY_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Due Date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Assign To Officer</InputLabel>
                    <Select
                      value={formData.assigned_to}
                      label="Assign To Officer"
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    >
                      <MenuItem value="">Unassigned</MenuItem>
                      {usersData.map((u) => (
                        <MenuItem key={u.user_id} value={u.user_id}>
                          {u.first_name} {u.last_name} ({u.employee_code || u.role_name})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Branch</InputLabel>
                    <Select
                      value={formData.branch_id}
                      label="Branch"
                      onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                    >
                      <MenuItem value="">Select Branch</MenuItem>
                      {branchesData.map((b) => (
                        <MenuItem key={b.branch_id} value={b.branch_id}>
                          {b.branch_name} ({b.branch_code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Customer (Optional)</InputLabel>
                    <Select
                      value={formData.customer_id}
                      label="Customer (Optional)"
                      onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    >
                      <MenuItem value="">None</MenuItem>
                      {customersData.map((c) => (
                        <MenuItem key={c.customer_id} value={c.customer_id}>
                          {c.first_name} {c.last_name} ({c.customer_code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Task Notes / Instructions"
                placeholder="Details regarding field location, specific collection amount, or verification guidelines..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
              sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D9488" } }}
            >
              {editingTask ? "Save Changes" : "Create Task"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </SectionPage>
  );
}
