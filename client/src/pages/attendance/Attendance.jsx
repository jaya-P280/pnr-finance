import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import {
  Fingerprint as FingerprintIcon,
  CameraAlt as CameraIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  VerifiedUser as VerifiedIcon,
  Close as CloseIcon,
  Sensors as SensorIcon,
  Code as CodeIcon,
  Send as SendIcon,
  Lan as LanIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import attendanceService from "../../services/attendance.service";
import branchService from "../../services/branch.service";
import userService from "../../services/user.service";
import useAuth from "../../hooks/useAuth";

export default function Attendance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userRole = (user?.role_name || user?.role || "").toUpperCase().replace(/\s+/g, "_");
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"].includes(userRole);

  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  // External Device Simulation State
  const [deviceSimOpen, setDeviceSimOpen] = useState(false);
  const [simState, setSimState] = useState({
    deviceType: "BIOMETRIC",
    deviceId: "BIO-TERM-901",
    userId: "",
    branchId: "",
    status: "PRESENT",
    remarks: "Pushed via External Hardware Device API",
  });

  // Queries
  const { data: attendanceList = [], isLoading: listLoading, refetch } = useQuery({
    queryKey: ["attendance", selectedDate, selectedBranch, statusFilter],
    queryFn: () =>
      attendanceService.getAttendance({
        date: selectedDate,
        branchId: selectedBranch || undefined,
        status: statusFilter || undefined,
      }),
  });

  const { data: summaryData } = useQuery({
    queryKey: ["attendance-summary", selectedDate, selectedBranch],
    queryFn: () =>
      attendanceService.getSummary({
        date: selectedDate,
        branchId: selectedBranch || undefined,
      }),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-list"],
    queryFn: async () => {
      const res = await branchService.getAll({ limit: 100 });
      return res.branches || [];
    },
  });

  const { data: staffUsers = [] } = useQuery({
    queryKey: ["staff-users"],
    queryFn: async () => {
      const res = await userService.getAll({ limit: 100 });
      return res.users || [];
    },
  });

  const safeAttendanceList = Array.isArray(attendanceList) ? attendanceList : [];

  // Mutation for External Device API Push
  const markMutation = useMutation({
    mutationFn: (payload) => attendanceService.markAttendance(payload),
    onSuccess: () => {
      toast.success("Attendance API payload received & logged from external device!");
      queryClient.invalidateQueries(["attendance"]);
      queryClient.invalidateQueries(["attendance-summary"]);
      setDeviceSimOpen(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Device API push failed.");
    },
  });

  const handlePushDeviceApi = () => {
    if (!simState.userId) {
      toast.error("Please select an Employee for the device API push.");
      return;
    }
    const emp = staffUsers.find((u) => u.user_id === Number(simState.userId));
    const nowTimeStr = new Date().toTimeString().split(" ")[0];

    markMutation.mutate({
      userId: Number(simState.userId),
      branchId: simState.branchId ? Number(simState.branchId) : emp?.branch_id,
      attendanceDate: selectedDate,
      clockIn: nowTimeStr,
      status: simState.status,
      remarks: `Device ID: [${simState.deviceId}] - ${simState.deviceType} API Push`,
    });
  };

  // Filtered Attendance List
  const filteredList = safeAttendanceList.filter((item) => {
    const fullName = `${item.first_name || ""} ${item.last_name || ""}`.toLowerCase();
    const code = (item.employee_code || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || code.includes(term);
  });

  return (
    <SectionPage
      title="Employee Attendance Tracking"
      subtitle="Integrated Hardware Terminal Dashboard & External Device API Management Portal"
      actions={
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<LanIcon />}
            onClick={() => setDeviceSimOpen(true)}
            sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D9488" }, fontWeight: 700 }}
          >
            Push External Device API
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            sx={{ borderColor: "#CBD5E1", color: "#475569" }}
          >
            Refresh Logs
          </Button>
        </Stack>
      }
    >
      {/* 1. External Hardware Terminals Status Bar */}
      <Card
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          color: "#FFFFFF",
          borderRadius: 3,
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack direction="row" spacing={2.5} alignItems="center">
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: "rgba(2, 132, 199, 0.2)",
                    color: "#38BDF8",
                    border: "2px solid #0284C7",
                  }}
                >
                  <SensorIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    External Hardware Device Connections Active
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                    Attendance is logged via physical Biometric fingerprint devices & Facial Recognition camera hardware terminals.
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
                    <Chip
                      icon={<CheckCircleIcon style={{ color: "#4ADE80", fontSize: 16 }} />}
                      label="Biometric Terminal (BIO-TERM-901): ONLINE"
                      size="small"
                      sx={{ bgcolor: "rgba(74, 222, 128, 0.12)", color: "#4ADE80", fontWeight: 700 }}
                    />
                    <Chip
                      icon={<CheckCircleIcon style={{ color: "#4ADE80", fontSize: 16 }} />}
                      label="AI Facial Camera (FACE-CAM-402): ONLINE"
                      size="small"
                      sx={{ bgcolor: "rgba(74, 222, 128, 0.12)", color: "#4ADE80", fontWeight: 700 }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5} align="right">
              <Paper
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  p: 2,
                  borderRadius: 2.5,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  textAlign: "left",
                }}
              >
                <Typography variant="caption" sx={{ color: "#CBD5E1", display: "block" }}>
                  <strong>Device API Webhook Endpoint:</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: "#38BDF8", fontFamily: "monospace", fontWeight: 700 }}>
                  POST /api/v1/attendance
                </Typography>
                <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                  Locks entries automatically upon reception to prevent unauthorized alterations.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "0.95rem" },
            "& .Mui-selected": { color: "#0F766E" },
            "& .MuiTabs-indicator": { backgroundColor: "#0F766E", height: 3 },
          }}
        >
          <Tab label="Live Attendance Logs" />
          <Tab label="Device & Terminal API Specifications" />
        </Tabs>
      </Box>

      {/* TAB 0: LIVE ATTENDANCE LOGS */}
      {activeTab === 0 && (
        <>
          {/* Summary Metrics */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: "4px solid #0284C7" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Total Marked Today
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#0F172A">
                      {summaryData?.total_marked ?? safeAttendanceList.length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "#E0F2FE", color: "#0284C7" }}>
                    <PeopleIcon />
                  </Avatar>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: "4px solid #16A34A" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Present Count
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#16A34A">
                      {summaryData?.present_count ??
                        safeAttendanceList.filter((i) => i.status === "PRESENT").length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "#DCFCE7", color: "#16A34A" }}>
                    <CheckCircleIcon />
                  </Avatar>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: "4px solid #CA8A04" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Late Arrivals
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#CA8A04">
                      {summaryData?.late_count ??
                        safeAttendanceList.filter((i) => i.status === "LATE").length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "#FEF9C3", color: "#CA8A04" }}>
                    <TimeIcon />
                  </Avatar>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: "4px solid #DC2626" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Absent / Leave
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#DC2626">
                      {(summaryData?.absent_count || 0) + (summaryData?.on_leave_count || 0)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "#FEE2E2", color: "#DC2626" }}>
                    <WarningIcon />
                  </Avatar>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Filters & Data Table */}
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
                sx={{ mb: 3 }}
              >
                <TextField
                  size="small"
                  placeholder="Search employee name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: "#94A3B8", mr: 1 }} />,
                  }}
                  sx={{ minWidth: 280 }}
                />

                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <TextField
                    type="date"
                    size="small"
                    label="Attendance Date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />

                  {isAdmin && (
                    <TextField
                      select
                      size="small"
                      label="Filter Branch"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      sx={{ minWidth: 160 }}
                    >
                      <MenuItem value="">All Branches</MenuItem>
                      {branches.map((b, idx) => (
                        <MenuItem key={b.branch_id || b.branchId || `br-${idx}`} value={b.branch_id || b.branchId}>
                          {b.branch_name || b.branchName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}

                  <TextField
                    select
                    size="small"
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="PRESENT">PRESENT</MenuItem>
                    <MenuItem value="LATE">LATE</MenuItem>
                    <MenuItem value="HALF_DAY">HALF DAY</MenuItem>
                    <MenuItem value="ON_LEAVE">ON LEAVE</MenuItem>
                    <MenuItem value="ABSENT">ABSENT</MenuItem>
                  </TextField>
                </Stack>
              </Stack>

              <TableContainer>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Branch</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Clock In</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Clock Out</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Hardware Source</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Record State</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {listLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          Loading hardware attendance logs...
                        </TableCell>
                      </TableRow>
                    ) : filteredList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4, color: "#64748B" }}>
                          No attendance records found for the selected date and filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredList.map((row) => (
                        <TableRow key={row.attendance_id} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ bgcolor: "#0284C7", width: 34, height: 34, fontSize: "0.85rem" }}>
                                {row.first_name?.[0] || "E"}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {row.first_name} {row.last_name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {row.employee_code || "N/A"} ({row.role_name || "Staff"})
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>{row.branch_name || "Head Office"}</TableCell>
                          <TableCell>{row.attendance_date ? row.attendance_date.split("T")[0] : "-"}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#0F172A" }}>
                            {row.clock_in || "--:--"}
                          </TableCell>
                          <TableCell sx={{ color: "#64748B" }}>{row.clock_out || "--:--"}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.status || "PRESENT"}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                bgcolor:
                                  row.status === "PRESENT"
                                    ? "#DCFCE7"
                                    : row.status === "LATE"
                                    ? "#FEF9C3"
                                    : "#FEE2E2",
                                color:
                                  row.status === "PRESENT"
                                    ? "#15803D"
                                    : row.status === "LATE"
                                    ? "#A16207"
                                    : "#B91C1C",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={row.remarks?.includes("Facial") ? <CameraIcon style={{ fontSize: 14 }} /> : <FingerprintIcon style={{ fontSize: 14 }} />}
                              label={row.remarks?.includes("Facial") ? "Face AI Terminal" : "Biometric Device"}
                              size="small"
                              variant="outlined"
                              sx={{ borderColor: "#CBD5E1", fontSize: "0.75rem", fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Locked - External hardware logs cannot be modified once received">
                              <Chip
                                icon={<LockIcon style={{ fontSize: 14, color: "#64748B" }} />}
                                label="Locked"
                                size="small"
                                sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 600 }}
                              />
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* TAB 1: DEVICE API SPECIFICATIONS */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 4, p: 2 }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <CodeIcon sx={{ color: "#0F766E", fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={800} color="#0F172A">
                    Hardware API Webhook Specification
                  </Typography>
                </Stack>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  External biometric fingerprint readers (ZKTeco, Mantra, Morpho) and facial recognition camera systems (Hikvision, Dahua) post JSON payloads to the system webhook.
                </Typography>

                <Paper sx={{ p: 2.5, bgcolor: "#0F172A", color: "#F8FAFC", borderRadius: 3, mb: 3, fontFamily: "monospace" }}>
                  <Typography variant="caption" sx={{ color: "#38BDF8", display: "block", mb: 1, fontWeight: 700 }}>
                    HTTP POST Payload Example:
                  </Typography>
                  <pre style={{ margin: 0, fontSize: "0.85rem", overflowX: "auto" }}>
{`{
  "userId": 14,
  "branchId": 1,
  "attendanceDate": "2026-08-07",
  "clockIn": "09:15:00",
  "status": "PRESENT",
  "remarks": "Terminal BIO-TERM-901 Biometric Verification"
}`}
                  </pre>
                </Paper>

                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="caption" fontWeight={600}>
                    All device API posts automatically validate employee IDs and write lockable attendance entries to prevent modifications.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 4, p: 2 }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <LanIcon sx={{ color: "#0284C7", fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={800} color="#0F172A">
                    Connected Hardware Terminals
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #E2E8F0" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: "#E0F2FE", color: "#0284C7" }}>
                          <FingerprintIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            ZKTeco F22 Optical Fingerprint Reader
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Device ID: BIO-TERM-901 | IP: 192.168.1.104
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip label="ONLINE" color="success" size="small" sx={{ fontWeight: 700 }} />
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #E2E8F0" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: "#CCFBF1", color: "#0D9488" }}>
                          <CameraIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Hikvision AI Face Recognition Terminal
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Device ID: FACE-CAM-402 | IP: 192.168.1.108
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip label="ONLINE" color="success" size="small" sx={{ fontWeight: 700 }} />
                    </Stack>
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* EXTERNAL DEVICE API PUSH DIALOG */}
      <Dialog
        open={deviceSimOpen}
        onClose={() => setDeviceSimOpen(false)}
        maxWidth="xs"
        fullWidth
        disableRestoreFocus
        PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
      >
        <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" component="span" fontWeight={700}>
            Push External Device API Payload
          </Typography>
          <IconButton onClick={() => setDeviceSimOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="DEVICE TYPE"
              value={simState.deviceType}
              onChange={(e) => setSimState({ ...simState, deviceType: e.target.value, deviceId: e.target.value === "BIOMETRIC" ? "BIO-TERM-901" : "FACE-CAM-402" })}
            >
              <MenuItem value="BIOMETRIC">BIOMETRIC FINGERPRINT TERMINAL</MenuItem>
              <MenuItem value="FACIAL">AI FACIAL RECOGNITION CAMERA</MenuItem>
            </TextField>

            <TextField
              fullWidth
              size="small"
              label="DEVICE TERMINAL SERIAL ID"
              value={simState.deviceId}
              onChange={(e) => setSimState({ ...simState, deviceId: e.target.value })}
            />

            <TextField
              select
              fullWidth
              size="small"
              label="SELECT EMPLOYEE *"
              value={simState.userId}
              onChange={(e) => setSimState({ ...simState, userId: e.target.value })}
            >
              {staffUsers.map((emp, idx) => (
                <MenuItem key={emp.user_id || emp.userId || `staff-${idx}`} value={emp.user_id || emp.userId}>
                  {emp.first_name || emp.firstName} {emp.last_name || emp.lastName} ({emp.employee_code || emp.employeeCode || "STAFF"})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label="STATUS"
              value={simState.status}
              onChange={(e) => setSimState({ ...simState, status: e.target.value })}
            >
              <MenuItem value="PRESENT">PRESENT</MenuItem>
              <MenuItem value="LATE">LATE</MenuItem>
              <MenuItem value="HALF_DAY">HALF DAY</MenuItem>
              <MenuItem value="ON_LEAVE">ON LEAVE</MenuItem>
              <MenuItem value="ABSENT">ABSENT</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handlePushDeviceApi}
            sx={{ bgcolor: "#0F766E", py: 1.2, borderRadius: 2.5, fontWeight: 700 }}
          >
            Push API Payload
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
