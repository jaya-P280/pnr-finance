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

  const safeBranches = Array.isArray(branches)
    ? branches
    : Array.isArray(branches?.branches)
    ? branches.branches
    : [];

  const safeStaffUsers = Array.isArray(staffUsers)
    ? staffUsers
    : Array.isArray(staffUsers?.users)
    ? staffUsers.users
    : [];

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
    const emp = safeStaffUsers.find((u) => u.user_id === Number(simState.userId));
    const nowTimeStr = new Date().toTimeString().split(" ")[0];

    markMutation.mutate({
      userId: Number(simState.userId),
      date: selectedDate,
      clockIn: nowTimeStr,
      status: simState.status,
      remarks: `[Device API: ${simState.deviceId}] ${simState.remarks}`,
      branchId: emp?.branch_id || simState.branchId || 1,
    });
  };

  const filteredAttendance = safeAttendanceList.filter((item) => {
    const nameMatch =
      item.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employee_code?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch;
  });

  return (
    <SectionPage
      title="Attendance & Biometric Tracking"
      subtitle="Monitor daily staff clock-ins, biometric logs, leave requests, and external hardware API integration"
      primaryAction={
        isAdmin ? (
          <Button
            variant="contained"
            startIcon={<LanIcon />}
            onClick={() => setDeviceSimOpen(true)}
            sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D655D" }, borderRadius: 2.5, fontWeight: 700 }}
          >
            Push Device API
          </Button>
        ) : null
      }
    >
      {/* Summary KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #0F766E", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    TOTAL EMPLOYEES
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#0F766E" sx={{ mt: 0.5 }}>
                    {summaryData?.total_employees || summaryData?.totalEmployees || safeAttendanceList.length || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#F0FDFA", color: "#0F766E", width: 48, height: 48 }}>
                  <PeopleIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #16A34A", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    PRESENT TODAY
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#16A34A" sx={{ mt: 0.5 }}>
                    {summaryData?.present || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#DCFCE7", color: "#16A34A", width: 48, height: 48 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #EAB308", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    LATE / HALF DAY
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#EAB308" sx={{ mt: 0.5 }}>
                    {(summaryData?.late || 0) + (summaryData?.half_day || 0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#FEF9C3", color: "#EAB308", width: 48, height: 48 }}>
                  <TimeIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #EF4444", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    ABSENT / ON LEAVE
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#EF4444" sx={{ mt: 0.5 }}>
                    {(summaryData?.absent || 0) + (summaryData?.on_leave || 0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#FEE2E2", color: "#EF4444", width: 48, height: 48 }}>
                  <WarningIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Attendance Content */}
      <Card sx={{ borderRadius: 3.5, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3, pt: 2, bgcolor: "#F8FAFC" }}>
          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} textColor="primary" indicatorColor="primary">
            <Tab icon={<FingerprintIcon />} label="Daily Attendance Log" iconPosition="start" sx={{ fontWeight: 700 }} />
            <Tab icon={<LanIcon />} label="Hardware API Integration" iconPosition="start" sx={{ fontWeight: 700 }} />
          </Tabs>
        </Box>

        {/* TAB 0: Daily Attendance Table */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <TextField
                placeholder="Search staff name or code..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />,
                }}
                sx={{ width: { xs: "100%", md: 300 } }}
              />

              <Stack direction="row" spacing={2} width={{ xs: "100%", md: "auto" }}>
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
                    {safeBranches.map((b, idx) => (
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

            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2.5 }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Branch</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Clock In</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Clock Out</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Source / Device</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        Loading attendance logs...
                      </TableCell>
                    </TableRow>
                  ) : filteredAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No attendance records logged for {selectedDate}.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttendance.map((row, idx) => (
                      <TableRow key={row.attendance_id || idx} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ width: 34, height: 34, bgcolor: "#0F766E", fontSize: 14, fontWeight: 700 }}>
                              {row.employee_name ? row.employee_name[0].toUpperCase() : "E"}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700}>
                                {row.employee_name || `Employee #${row.user_id}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {row.employee_code || `ID: ${row.user_id}`} &bull; {row.role_name || "Staff"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {row.branch_name || "Head Office"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{row.date}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.clock_in ? row.clock_in.substring(0, 5) : "--:--"}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.clock_out ? row.clock_out.substring(0, 5) : "--:--"}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            size="small"
                            color={
                              row.status === "PRESENT"
                                ? "success"
                                : row.status === "LATE" || row.status === "HALF_DAY"
                                ? "warning"
                                : "error"
                            }
                            sx={{ fontWeight: 700, borderRadius: 1.5 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            {row.remarks || "Biometric Terminal #01"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* TAB 1: External Hardware Device API Specs */}
        {activeTab === 1 && (
          <Box sx={{ p: 4 }}>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Biometric Terminal & Facial Camera Direct Integration Protocol
              </Typography>
              <Typography variant="body2">
                External biometric terminals, ZK Teco devices, and IP Facial Recognition Cameras can push real-time clock-in logs directly to PNRG Finance backend via the endpoint detailed below.
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Card sx={{ border: "1px solid #CBD5E1", borderRadius: 3, p: 3, bgcolor: "#0F172A", color: "#F8FAFC" }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <CodeIcon sx={{ color: "#38BDF8" }} />
                    <Typography variant="subtitle1" fontWeight={700} color="#38BDF8">
                      POST /api/v1/attendance/mark
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ display: "block", color: "#94A3B8", mb: 2 }}>
                    Header: Content-Type: application/json | Authorization: Bearer &lt;API_KEY&gt;
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      bgcolor: "#1E293B",
                      p: 2,
                      borderRadius: 2,
                      fontFamily: "monospace",
                      fontSize: 13,
                      color: "#A7F3D0",
                      overflowX: "auto",
                    }}
                  >
{`{
  "userId": 4,
  "date": "2026-08-08",
  "clockIn": "09:15:00",
  "status": "PRESENT",
  "branchId": 1,
  "remarks": "[ZK-Teco Bio Terminal #802] Fingerprint Verified"
}`}
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card sx={{ border: "1px solid #E2E8F0", borderRadius: 3, p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Supported Hardware Protocol Specs
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="#0F766E" fontWeight={700}>
                        Biometric Fingerprint Scanners
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Compatible with ZK Teco, Matrix COSEC, Realtime, and Mantra devices. Supports TCP/IP and HTTP push mode.
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="#0F766E" fontWeight={700}>
                        AI Facial Recognition Cameras
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pushes photo snapshot + user ID upon face match in &lt; 0.5s response time.
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="#0F766E" fontWeight={700}>
                        Auto Penalty Calculation
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Clock-ins after 09:30 AM are automatically flagged as LATE and synced with Monthly Payroll Salary slips.
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Card>

      {/* External Hardware Push Simulator Modal */}
      <Dialog open={deviceSimOpen} onClose={() => setDeviceSimOpen(false)} maxWidth="xs" fullWidth paperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
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
              {safeStaffUsers.map((emp, idx) => (
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
