import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Security as AuditIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as TimeIcon,
  Storage as ModuleIcon,
} from "@mui/icons-material";
import auditService from "../../services/audit.service";
import toast from "react-hot-toast";

const METHOD_COLORS = {
  GET: "info",
  POST: "success",
  PUT: "warning",
  DELETE: "error",
  PATCH: "secondary",
};

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selectedLog, setSelectedLog] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["audit-logs", search, moduleFilter, statusFilter, startDate, endDate, page, rowsPerPage],
    queryFn: () =>
      auditService.getLogs({
        search: search.trim() || undefined,
        module: moduleFilter || undefined,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: page + 1,
        limit: rowsPerPage,
      }),
  });

  const { data: statsData } = useQuery({
    queryKey: ["audit-stats"],
    queryFn: () => auditService.getStats(),
  });

  const logs = data?.data?.logs || [];
  const total = data?.data?.pagination?.total || 0;
  const stats = statsData?.data || { totalLogs: 0, failedLogs: 0, todayLogs: 0, activeModules: 0 };

  const handleExport = async () => {
    try {
      toast.loading("Exporting Audit Logs...", { id: "export-toast" });
      await auditService.exportCsv({
        search: search.trim() || undefined,
        module: moduleFilter || undefined,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      toast.success("Audit Trail exported successfully!", { id: "export-toast" });
    } catch {
      toast.error("Failed to export audit trail.", { id: "export-toast" });
    }
  };

  const handleReset = () => {
    setSearch("");
    setModuleFilter("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setPage(0);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Page Header */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="700" color="#0F172A" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AuditIcon sx={{ color: "#0F766E" }} /> Audit Trail & Compliance Log
          </Typography>
          <Typography variant="body2" color="#64748B" mt={0.5}>
            Real-time security auditing, user actions, and API request history
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()} size="small" sx={{ borderRadius: 2 }}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport} size="small" sx={{ bgcolor: "#0F766E", borderRadius: 2 }}>
            Export CSV
          </Button>
        </Stack>
      </Stack>

      {/* Metric Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)" }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="#64748B" fontWeight="600">TOTAL AUDIT EVENTS</Typography>
                  <Typography variant="h4" fontWeight="700" color="#0F172A" mt={0.5}>
                    {stats.totalLogs.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: "#E0F2FE", borderRadius: 2.5, color: "#0284C7" }}>
                  <AuditIcon fontSize="medium" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)" }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="#64748B" fontWeight="600">ACTIONS TODAY</Typography>
                  <Typography variant="h4" fontWeight="700" color="#0F766E" mt={0.5}>
                    {stats.todayLogs.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: "#CCFBF1", borderRadius: 2.5, color: "#0F766E" }}>
                  <TimeIcon fontSize="medium" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)" }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="#64748B" fontWeight="600">FAILED REQUESTS</Typography>
                  <Typography variant="h4" fontWeight="700" color="#E11D48" mt={0.5}>
                    {stats.failedLogs.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: "#FFE4E6", borderRadius: 2.5, color: "#E11D48" }}>
                  <ErrorIcon fontSize="medium" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)" }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="#64748B" fontWeight="600">ACTIVE MODULES</Typography>
                  <Typography variant="h4" fontWeight="700" color="#6366F1" mt={0.5}>
                    {stats.activeModules}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: "#E0E7FF", borderRadius: 2.5, color: "#6366F1" }}>
                  <ModuleIcon fontSize="medium" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #E2E8F0", borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search user, endpoint, action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Module"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <MenuItem value="">All Modules</MenuItem>
              <MenuItem value="AUTH">Auth & Login</MenuItem>
              <MenuItem value="CUSTOMERS">Customers</MenuItem>
              <MenuItem value="LOANS">Loans</MenuItem>
              <MenuItem value="LOAN_APPLICATIONS">Loan Applications</MenuItem>
              <MenuItem value="COLLECTIONS">Collections</MenuItem>
              <MenuItem value="USERS">Users Management</MenuItem>
              <MenuItem value="FINANCE">Finance</MenuItem>
              <MenuItem value="BRANCHES">Branches</MenuItem>
              <MenuItem value="REPORTS">Reports</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="success">Success (2xx/3xx)</MenuItem>
              <MenuItem value="failure">Failed (4xx/5xx)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              type="date"
              fullWidth
              size="small"
              label="Start Date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              type="date"
              fullWidth
              size="small"
              label="End Date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button fullWidth variant="text" size="small" onClick={handleReset} sx={{ color: "#64748B" }}>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Table */}
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "700", color: "#475569" }}>ID & TIME</TableCell>
                <TableCell sx={{ fontWeight: "700", color: "#475569" }}>USER / ROLE</TableCell>
                <TableCell sx={{ fontWeight: "700", color: "#475569" }}>MODULE & ACTION</TableCell>
                <TableCell sx={{ fontWeight: "700", color: "#475569" }}>HTTP METHOD & ENDPOINT</TableCell>
                <TableCell sx={{ fontWeight: "700", color: "#475569" }}>STATUS & LATENCY</TableCell>
                <TableCell sx={{ fontWeight: "700", color: "#475569" }}>IP ADDRESS</TableCell>
                <TableCell align="right" sx={{ fontWeight: "700", color: "#475569" }}>DETAILS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="#64748B">Loading audit trail records...</Typography>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="#64748B">No audit logs found matching your filters.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.log_id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" color="#0F172A">
                        #{log.log_id}
                      </Typography>
                      <Typography variant="caption" color="#64748B" display="block">
                        {new Date(log.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {log.user_id ? (
                        <Box>
                          <Typography variant="body2" fontWeight="600" color="#334155">
                            {log.first_name ? `${log.first_name} ${log.last_name || ""}` : `User #${log.user_id}`}
                          </Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center" mt={0.25}>
                            <Chip
                              label={log.role_name || "STAFF"}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: "0.68rem" }}
                            />
                            {log.branch_name && (
                              <Typography variant="caption" color="#64748B">
                                ({log.branch_name})
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      ) : (
                        <Chip label="System / Public" size="small" sx={{ bgcolor: "#F1F5F9", color: "#64748B" }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.module}
                        size="small"
                        sx={{ bgcolor: "#E0F2FE", color: "#0369A1", fontWeight: "600", mr: 1, mb: 0.5 }}
                      />
                      <Typography variant="caption" fontWeight="600" color="#475569" display="block">
                        {log.action}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={log.http_method || "GET"}
                          color={METHOD_COLORS[log.http_method] || "default"}
                          size="small"
                          sx={{ height: 20, fontSize: "0.68rem", fontWeight: "700" }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "monospace",
                            color: "#334155",
                            maxWidth: 220,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {log.endpoint}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {log.is_success ? (
                          <Chip
                            icon={<SuccessIcon sx={{ fontSize: "14px !important" }} />}
                            label={`${log.response_status || 200}`}
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            icon={<ErrorIcon sx={{ fontSize: "14px !important" }} />}
                            label={`${log.response_status || 500}`}
                            color="error"
                            size="small"
                          />
                        )}
                        <Typography variant="caption" color="#64748B">
                          {log.response_time_ms || 0}ms
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#64748B" }}>
                        {log.ip_address || "127.0.0.1"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Complete Payload & Headers">
                        <IconButton size="small" onClick={() => setSelectedLog(log)}>
                          <ViewIcon fontSize="small" sx={{ color: "#0F766E" }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[15, 30, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Log Detail Dialog */}
      <Dialog open={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="700" color="#0F172A">
            Audit Event Details #{selectedLog?.log_id}
          </Typography>
          <Typography variant="caption" color="#64748B">
            Correlation ID: {selectedLog?.correlation_id || "N/A"}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Stack spacing={2.5}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="#64748B">HTTP METHOD</Typography>
                  <Typography variant="body2" fontWeight="600">{selectedLog.http_method}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="#64748B">STATUS CODE</Typography>
                  <Typography variant="body2" fontWeight="600" color={selectedLog.is_success ? "success.main" : "error.main"}>
                    {selectedLog.response_status} ({selectedLog.response_time_ms}ms)
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="#64748B">IP ADDRESS</Typography>
                  <Typography variant="body2" fontWeight="600">{selectedLog.ip_address || "127.0.0.1"}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="#64748B">TIMESTAMP</Typography>
                  <Typography variant="body2" fontWeight="600">
                    {new Date(selectedLog.created_at).toLocaleString("en-IN")}
                  </Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="subtitle2" fontWeight="700" color="#334155" mb={0.5}>
                  API Endpoint URL
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#F8FAFC", fontFamily: "monospace", fontSize: "0.85rem" }}>
                  {selectedLog.endpoint}
                </Paper>
              </Box>

              {selectedLog.request_params && selectedLog.request_params !== "{}" && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="700" color="#334155" mb={0.5}>
                    Query & Route Parameters
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#F8FAFC", fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "pre-wrap" }}>
                    {selectedLog.request_params}
                  </Paper>
                </Box>
              )}

              {selectedLog.request_body && selectedLog.request_body !== "{}" && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="700" color="#334155" mb={0.5}>
                    Sanitized Request Body
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      bgcolor: "#0F172A",
                      color: "#38BDF8",
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      maxHeight: 250,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.request_body), null, 2);
                      } catch {
                        return selectedLog.request_body;
                      }
                    })()}
                  </Paper>
                </Box>
              )}

              {selectedLog.user_agent && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="700" color="#334155" mb={0.5}>
                    Client User Agent
                  </Typography>
                  <Typography variant="caption" color="#64748B" sx={{ wordBreak: "break-all" }}>
                    {selectedLog.user_agent}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLog(null)} variant="contained" sx={{ bgcolor: "#0F766E" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
