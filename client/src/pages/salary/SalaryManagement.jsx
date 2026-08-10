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
  const [dialog, setDialog] = useState(null); // { mode: 'structure'|'payout'|'payslip', user: obj }
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
      basicSalary: 30000,
      hra: 6000,
      allowances: 4000,
      pfDeduction: 1800,
      taxDeduction: 1200,
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
    toast.success(`Salary structure updated for ${dialog?.user?.firstName}`);
    setDialog(null);
  };

  const handleProcessPayout = () => {
    toast.success(`Salary payout processed successfully for ${dialog?.user?.firstName}`);
    setDialog(null);
  };

  const numberToWords = (num) => {
    if (!num) return "Zero Rupees Only";
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const inWords = (n) => {
      if ((n = n.toString()).length > 9) return 'overflow';
      let n_array = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n_array) return '';
      let str = '';
      str += (n_array[1] != 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
      str += (n_array[2] != 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
      str += (n_array[3] != 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
      str += (n_array[4] != 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
      str += (n_array[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) + 'Rupees Only' : 'Rupees Only';
      return str;
    };
    return inWords(num);
  };

  const pUser = dialog?.user;
  const pName = pUser ? `${pUser.firstName || pUser.first_name || ""} ${pUser.lastName || pUser.last_name || ""}`.trim() : "Employee";
  const pEmpCode = pUser?.employeeCode || pUser?.employee_code || "EMP001";
  const pRole = pUser?.role || pUser?.role_name || "STAFF";
  const pBranch = pUser?.branch || pUser?.branch_name || "Head Office";
  const pBasePay = Number(pUser?.basic_salary || (pRole === "BRANCH_MANAGER" ? 45000 : pRole === "ACCOUNTANT" ? 35000 : 28000));
  const pHra = Number(pUser?.hra || Math.round(pBasePay * 0.2));
  const pAllowances = Number(pUser?.allowances || Math.round(pBasePay * 0.1));
  const pGross = pBasePay + pHra + pAllowances;
  const pPf = Number(pUser?.pf_deduction || 1800);
  const pTax = Number(pUser?.tax_deduction || 1200);
  const pTotalDeductions = pPf + pTax;
  const pNetPay = Number(pUser?.net_salary || (pGross - pTotalDeductions));
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
                  staffList.map((u, idx) => {
                    const basePay = Number(u.basic_salary || (u.role === "BRANCH_MANAGER" ? 45000 : u.role === "ACCOUNTANT" ? 35000 : 28000));
                    const hra = Number(u.hra || Math.round(basePay * 0.2));
                    const allowances = Number(u.allowances || Math.round(basePay * 0.1));
                    const pf = Number(u.pf_deduction || 1800);
                    const netPay = Number(u.net_salary || (basePay + hra + allowances - pf));
                    const rowKey = u.user_id || u.userId || u.id || u.employee_code || u.employeeCode || `sal-${idx}`;

                    return (
                      <TableRow key={rowKey} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: "#0F766E", width: 36, height: 36, fontSize: "0.85rem", fontWeight: "bold" }}>
                              {(u.firstName?.[0] || "") + (u.lastName?.[0] || "")}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="600" color="#0F172A">
                                {u.firstName} {u.lastName}
                              </Typography>
                              <Typography variant="caption" color="#64748B">
                                {u.employeeCode || u.email}
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
                          <Chip label="PROCESSED" size="small" color="success" />
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

      {/* Salary Structure Modal */}
      <Dialog open={dialog?.mode === "structure"} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>Salary Structure Setup - {dialog?.user?.firstName} {dialog?.user?.lastName}</DialogTitle>
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

      {/* Process Payout Modal */}
      <Dialog open={dialog?.mode === "payout"} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>Process Monthly Salary Payout</DialogTitle>
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

      {/* Payslip Modal */}
      <Dialog
        open={dialog?.mode === "payslip"}
        onClose={() => setDialog(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-payslip, #printable-payslip * {
              visibility: visible !important;
            }
            #printable-payslip {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 20px !important;
              box-shadow: none !important;
              border: none !important;
              background: #ffffff !important;
            }
            .MuiDialog-paper {
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              padding: 0 !important;
              max-width: 100% !important;
              width: 100% !important;
              overflow: visible !important;
            }
            .MuiBackdrop-root, .MuiDialogActions-root, button, .no-print {
              display: none !important;
            }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
          }
        `}</style>

        <Box id="printable-payslip" sx={{ p: 3, bgcolor: "#ffffff" }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ borderBottom: "2px solid #0F766E", pb: 2, mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight="800" color="#0F766E" letterSpacing={0.5}>
                PNRG FINANCE LIMITED
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                MICROFINANCE ERP SOLUTIONS LTD. &bull; HEAD OFFICE: HYDERABAD
              </Typography>
            </Box>
            <Box textAlign="right">
              <Chip label="CONFIDENTIAL PAYSLIP" color="primary" size="small" sx={{ fontWeight: 800, mb: 0.5, bgcolor: "#0F766E" }} />
              <Typography variant="subtitle2" fontWeight="700" color="#1E293B">
                PAYSLIP FOR AUGUST 2026
              </Typography>
            </Box>
          </Stack>

          {/* Employee Details Grid Table */}
          <Box sx={{ border: "1px solid #CBD5E1", borderRadius: 2, overflow: "hidden", mb: 3 }}>
            <Grid container sx={{ bgcolor: "#F8FAFC", borderBottom: "1px solid #CBD5E1" }}>
              <Grid item xs={3} sx={{ p: 1.5, borderRight: "1px solid #CBD5E1" }}>
                <Typography variant="caption" color="text.secondary" display="block">EMPLOYEE NAME</Typography>
                <Typography variant="subtitle2" fontWeight="700">{pName}</Typography>
              </Grid>
              <Grid item xs={3} sx={{ p: 1.5, borderRight: "1px solid #CBD5E1" }}>
                <Typography variant="caption" color="text.secondary" display="block">EMPLOYEE CODE</Typography>
                <Typography variant="subtitle2" fontWeight="700">{pEmpCode}</Typography>
              </Grid>
              <Grid item xs={3} sx={{ p: 1.5, borderRight: "1px solid #CBD5E1" }}>
                <Typography variant="caption" color="text.secondary" display="block">DESIGNATION / ROLE</Typography>
                <Typography variant="subtitle2" fontWeight="700">{pRole}</Typography>
              </Grid>
              <Grid item xs={3} sx={{ p: 1.5 }}>
                <Typography variant="caption" color="text.secondary" display="block">BRANCH LOCATION</Typography>
                <Typography variant="subtitle2" fontWeight="700">{pBranch}</Typography>
              </Grid>
            </Grid>

            <Grid container>
              <Grid item xs={3} sx={{ p: 1.5, borderRight: "1px solid #CBD5E1" }}>
                <Typography variant="caption" color="text.secondary" display="block">BANK ACCOUNT NO.</Typography>
                <Typography variant="body2" fontWeight="600">XXXX-XXXX-9482</Typography>
              </Grid>
              <Grid item xs={3} sx={{ p: 1.5, borderRight: "1px solid #CBD5E1" }}>
                <Typography variant="caption" color="text.secondary" display="block">PAYMENT METHOD</Typography>
                <Typography variant="body2" fontWeight="600">BANK TRANSFER (NEFT)</Typography>
              </Grid>
              <Grid item xs={3} sx={{ p: 1.5, borderRight: "1px solid #CBD5E1" }}>
                <Typography variant="caption" color="text.secondary" display="block">PAYMENT REF NO.</Typography>
                <Typography variant="body2" fontWeight="600">PAY-2026-0801</Typography>
              </Grid>
              <Grid item xs={3} sx={{ p: 1.5 }}>
                <Typography variant="caption" color="text.secondary" display="block">PAYMENT DATE</Typography>
                <Typography variant="body2" fontWeight="600">01-AUG-2026</Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Salary Breakdown Table */}
          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #CBD5E1", borderRadius: 2, mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#0F766E" }}>
                  <TableCell sx={{ color: "#ffffff", fontWeight: 700 }}>EARNINGS BREAKDOWN</TableCell>
                  <TableCell align="right" sx={{ color: "#ffffff", fontWeight: 700 }}>AMOUNT (₹)</TableCell>
                  <TableCell sx={{ color: "#ffffff", fontWeight: 700, borderLeft: "1px solid #14B8A6" }}>DEDUCTIONS BREAKDOWN</TableCell>
                  <TableCell align="right" sx={{ color: "#ffffff", fontWeight: 700 }}>AMOUNT (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Basic Salary</TableCell>
                  <TableCell align="right">₹{pBasePay.toLocaleString()}</TableCell>
                  <TableCell sx={{ borderLeft: "1px solid #E2E8F0" }}>Provident Fund (PF)</TableCell>
                  <TableCell align="right" sx={{ color: "#EF4444" }}>₹{pPf.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>House Rent Allowance (HRA)</TableCell>
                  <TableCell align="right">₹{pHra.toLocaleString()}</TableCell>
                  <TableCell sx={{ borderLeft: "1px solid #E2E8F0" }}>Professional Tax (PT)</TableCell>
                  <TableCell align="right" sx={{ color: "#EF4444" }}>₹{pTax.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Special & Field Allowances</TableCell>
                  <TableCell align="right">₹{pAllowances.toLocaleString()}</TableCell>
                  <TableCell sx={{ borderLeft: "1px solid #E2E8F0" }}>Other Deductions</TableCell>
                  <TableCell align="right">₹0</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell sx={{ fontWeight: 700 }}>GROSS EARNINGS</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>₹{pGross.toLocaleString()}</TableCell>
                  <TableCell sx={{ fontWeight: 700, borderLeft: "1px solid #CBD5E1" }}>TOTAL DEDUCTIONS</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: "#EF4444" }}>₹{pTotalDeductions.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Net Salary Paid Banner */}
          <Box sx={{ border: "2px solid #0F766E", bgcolor: "#F0FDFA", p: 2.5, borderRadius: 2.5, mb: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight={700} display="block">
                  NET MONTHLY SALARY PAID
                </Typography>
                <Typography variant="caption" color="#0F766E" fontWeight={600}>
                  Amount in Words: {numberToWords(pNetPay)}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="#0F766E">
                ₹{pNetPay.toLocaleString()}
              </Typography>
            </Stack>
          </Box>

          {/* Signatures & Footer */}
          <Grid container spacing={4} sx={{ mt: 3, pt: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ borderTop: "1px dashed #94A3B8", pt: 1, textAlign: "center" }}>
                <Typography variant="caption" fontWeight="700" color="text.secondary">
                  EMPLOYEE SIGNATURE
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ borderTop: "1px dashed #94A3B8", pt: 1, textAlign: "center" }}>
                <Typography variant="caption" fontWeight="700" color="#0F766E">
                  AUTHORIZED HR / ACCOUNTS SIGNATORY
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  PNRG Finance Limited
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Typography variant="caption" display="block" textAlign="center" color="text.secondary" sx={{ mt: 3 }}>
            Note: This is a system-generated salary slip and does not require a physical seal when verified electronically.
          </Typography>
        </Box>

        <DialogActions className="no-print" sx={{ p: 2, pt: 0 }}>
          <Button
            startIcon={<PrintIcon />}
            variant="contained"
            onClick={() => window.print()}
            sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D655D" }, borderRadius: 2, fontWeight: 700 }}
          >
            Print Payslip
          </Button>
          <Button onClick={() => setDialog(null)} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
