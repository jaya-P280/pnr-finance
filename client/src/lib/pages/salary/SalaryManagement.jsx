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
  TextField,
  MenuItem,
  Stack,
  Avatar,
  Paper,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Paid as PaidIcon,
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  ReceiptLong as ReceiptIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import userService from "../../services/user.service";
import salaryService from "../../services/salary.service";

export default function SalaryManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialog, setDialog] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    basicSalary: 25000,
    hra: 5000,
    allowances: 3000,
    pfDeduction: 1800,
    taxDeduction: 1000,
  });

  const [payoutForm, setPayoutForm] = useState({
    monthYear: "August 2026",
    paymentMethod: "BANK_TRANSFER",
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNo: "PAY-2026-0801",
    remarks: "Monthly Salary Credit",
  });

  const queryClient = useQueryClient();

  const salariesQuery = useQuery({
    queryKey: ["salaries-db"],
    queryFn: () => salaryService.getSalaries(),
  });

  const saveStructureMutation = useMutation({
    mutationFn: (payload) => salaryService.updateStructure(payload),
    onSuccess: () => {
      toast.success("Salary structure saved to database!");
      queryClient.invalidateQueries(["salaries-db"]);
      setDialog(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || err?.message || "Save failed"),
  });

  const payoutMutation = useMutation({
    mutationFn: (payload) => salaryService.processPayout(payload),
    onSuccess: () => {
      toast.success("Salary payout processed and logged in database!");
      queryClient.invalidateQueries(["salaries-db"]);
      setDialog(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || err?.message || "Payout failed"),
  });

  const staffList = (salariesQuery.data?.data || []).filter(
    (u) => !["CUSTOMER", "SUPER_ADMIN"].includes((u.role || "").toUpperCase())
  );

  const calculateNet = (b, h, a, pf, tax) => {
    const totalEarnings = Number(b || 0) + Number(h || 0) + Number(a || 0);
    const totalDeductions = Number(pf || 0) + Number(tax || 0);
    return Math.max(0, totalEarnings - totalDeductions);
  };

  const netSalary = calculateNet(
    salaryForm.basicSalary,
    salaryForm.hra,
    salaryForm.allowances,
    salaryForm.pfDeduction,
    salaryForm.taxDeduction
  );

  const openStructureModal = (employee) => {
    setSalaryForm({
      basicSalary: Number(employee.basic_salary || 30000),
      hra: Number(employee.hra || 6000),
      allowances: Number(employee.allowances || 4000),
      pfDeduction: Number(employee.pf_deduction || 1800),
      taxDeduction: Number(employee.tax_deduction || 1200),
    });
    setDialog({ mode: "structure", user: employee });
  };

  const openPayoutModal = (employee) => {
    setPayoutForm({
      monthYear: "August 2026",
      paymentMethod: "BANK_TRANSFER",
      paymentDate: new Date().toISOString().split("T")[0],
      referenceNo: `PAY-${Date.now().toString().slice(-6)}`,
      remarks: "Monthly Salary Credit",
    });
    setDialog({ mode: "payout", user: employee });
  };

  const openPayslipModal = (employee) => {
    setDialog({ mode: "payslip", user: employee });
  };

  const handleSaveStructure = () => {
    saveStructureMutation.mutate({
      userId: dialog?.user?.user_id || dialog?.user?.userId,
      ...salaryForm,
    });
  };

  const handleProcessPayout = () => {
    payoutMutation.mutate({
      userId: dialog?.user?.user_id || dialog?.user?.userId,
      ...payoutForm,
    });
  };

  const totalPayrollBudget = staffList.reduce((acc, u) => acc + Number(u.net_salary || 37000), 0);

  return (
    <SectionPage
      title="Employee Salary & Payroll Management"
      subtitle="Configure staff salary structures, process monthly payroll, track payment disbursals, and generate employee payslips."
      actions={
        <Button
          variant="contained"
          startIcon={<PaidIcon />}
          onClick={() => toast.success("Batch payroll processing triggered.")}
          sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D655D" } }}
        >
          Process Batch Payroll
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
                    <WalletIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="#64748B">
                      Total Monthly Payroll
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="#0F172A">
                      ₹{totalPayrollBudget.toLocaleString()}
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
                      Paid Staff This Month
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="#0F172A">
                      {staffList.length} Staff
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
                  <Avatar sx={{ bgcolor: "#FEF3C7", color: "#D97706" }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="#64748B">
                      Average Staff Pay
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="#0F172A">
                      ₹37,000 / mo
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
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="#64748B">
                      Active Employees
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="#0F172A">
                      {staffList.length} Active
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell fontWeight="bold">Employee Staff</TableCell>
                  <TableCell fontWeight="bold">Role / Branch</TableCell>
                  <TableCell fontWeight="bold">Base Pay</TableCell>
                  <TableCell fontWeight="bold">Allowances</TableCell>
                  <TableCell fontWeight="bold">Deductions</TableCell>
                  <TableCell fontWeight="bold">Net Monthly Salary</TableCell>
                  <TableCell fontWeight="bold">Status</TableCell>
                  <TableCell align="right" fontWeight="bold">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: "#64748B" }}>
                      No staff employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  staffList.map((u) => {
                    const basePay = Number(u.basic_salary || (u.role === "BRANCH_MANAGER" ? 45000 : u.role === "ACCOUNTANT" ? 35000 : 28000));
                    const hra = Number(u.hra || Math.round(basePay * 0.2));
                    const allowances = Number(u.allowances || Math.round(basePay * 0.1));
                    const pf = Number(u.pf_deduction || 1800);
                    const netPay = Number(u.net_salary || (basePay + hra + allowances - pf));

                    return (
                      <TableRow key={u.user_id || u.userId} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: "#0F766E", width: 36, height: 36, fontSize: "0.85rem", fontWeight: "bold" }}>
                              {((u.first_name || u.firstName)?.[0] || "") + ((u.last_name || u.lastName)?.[0] || "")}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="600" color="#0F172A">
                                {u.first_name || u.firstName} {u.last_name || u.lastName}
                              </Typography>
                              <Typography variant="caption" color="#64748B">
                                {u.employee_code || u.employeeCode || u.email}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600" color="#334155">
                            {u.role || "STAFF"}
                          </Typography>
                          <Typography variant="caption" color="#64748B">
                            {u.branch || "Head Office"}
                          </Typography>
                        </TableCell>
                        <TableCell>₹{basePay.toLocaleString()}</TableCell>
                        <TableCell>₹{(hra + allowances).toLocaleString()}</TableCell>
                        <TableCell color="error.main">-₹{pf.toLocaleString()}</TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="700" color="#0F766E">
                            ₹{netPay.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={u.payment_status || "PROCESSED"} size="small" color="success" />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Configure Structure">
                              <IconButton size="small" color="primary" onClick={() => openStructureModal(u)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Process Payout">
                              <IconButton size="small" color="success" onClick={() => openPayoutModal(u)}>
                                <PaidIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Print Payslip">
                              <IconButton size="small" color="info" onClick={() => openPayslipModal(u)}>
                                <PrintIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>

      <Dialog open={dialog?.mode === "structure"} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle component="div">Salary Structure Setup - {dialog?.user?.first_name || dialog?.user?.firstName}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Basic Salary (₹)"
                  value={salaryForm.basicSalary}
                  onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="HRA (₹)"
                  value={salaryForm.hra}
                  onChange={(e) => setSalaryForm({ ...salaryForm, hra: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Special Allowances (₹)"
                  value={salaryForm.allowances}
                  onChange={(e) => setSalaryForm({ ...salaryForm, allowances: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="PF Deduction (₹)"
                  value={salaryForm.pfDeduction}
                  onChange={(e) => setSalaryForm({ ...salaryForm, pfDeduction: Number(e.target.value) })}
                />
              </Grid>
            </Grid>

            <Paper sx={{ p: 2, bgcolor: "#F0FDFA", border: "1px solid #CCFBF1", borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" color="#0F766E">Calculated Net Monthly Salary</Typography>
                <Typography variant="h5" fontWeight="800" color="#0F766E">₹{netSalary.toLocaleString()}</Typography>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveStructure} sx={{ bgcolor: "#0F766E" }}>Save Structure</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog?.mode === "payout"} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle component="div">Process Monthly Salary Payout</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Month / Year"
              value={payoutForm.monthYear}
              onChange={(e) => setPayoutForm({ ...payoutForm, monthYear: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Payment Method"
              value={payoutForm.paymentMethod}
              onChange={(e) => setPayoutForm({ ...payoutForm, paymentMethod: e.target.value })}
            >
              <MenuItem value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</MenuItem>
              <MenuItem value="UPI">UPI Transfer</MenuItem>
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="CHEQUE">Cheque</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Payment Reference No."
              value={payoutForm.referenceNo}
              onChange={(e) => setPayoutForm({ ...payoutForm, referenceNo: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleProcessPayout}>Confirm & Pay</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog?.mode === "payslip"} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle component="div" sx={{ textAlign: "center", pb: 0 }}>
          <Typography variant="h6" fontWeight="bold">PNRG FINANCE LIMITED</Typography>
          <Typography variant="caption" color="text.secondary">Salary Payslip - August 2026</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, border: "1px solid #CBD5E1", borderRadius: 2, mt: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
              Employee: {dialog?.user?.first_name || dialog?.user?.firstName} {dialog?.user?.last_name || dialog?.user?.lastName} ({dialog?.user?.employee_code || dialog?.user?.employeeCode || "EMP001"})
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Role: {dialog?.user?.role} | Branch: {dialog?.user?.branch || "Head Office"}
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Basic Salary</Typography><Typography variant="body2">₹30,000</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2">HRA</Typography><Typography variant="body2">₹6,000</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Special Allowances</Typography><Typography variant="body2">₹4,000</Typography></Stack>
              <Stack direction="row" justifyContent="space-between" color="error.main"><Typography variant="body2">PF & Taxes</Typography><Typography variant="body2">-₹3,000</Typography></Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between"><Typography variant="subtitle1" fontWeight="bold">Net Salary Paid</Typography><Typography variant="subtitle1" fontWeight="bold" color="#0F766E">₹37,000</Typography></Stack>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<PrintIcon />} variant="contained" onClick={() => window.print()} sx={{ bgcolor: "#0F766E" }}>Print Payslip</Button>
          <Button onClick={() => setDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
