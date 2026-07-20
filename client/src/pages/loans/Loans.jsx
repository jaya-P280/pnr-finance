import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import { Search as SearchIcon, Edit as EditIcon, Download as DownloadIcon, PauseCircle as ForecastureIcon } from "@mui/icons-material";
import SectionPage from "../../components/layout/SectionPage";

// Mock data
const mockLoans = [
  {
    id: "LN001",
    customerName: "Rajesh Kumar",
    loanAmount: "₹2,50,000",
    disbursedDate: "2026-01-15",
    emiAmount: "₹5,208",
    nextDueDate: "2026-08-15",
    amountPaid: "₹31,250",
    amountOutstanding: "₹2,18,750",
    status: "active",
    daysOverdue: 0,
  },
  {
    id: "LN002",
    customerName: "Priya Singh",
    loanAmount: "₹5,00,000",
    disbursedDate: "2025-06-20",
    emiAmount: "₹10,417",
    nextDueDate: "2026-08-20",
    amountPaid: "₹1,25,000",
    amountOutstanding: "₹3,75,000",
    status: "active",
    daysOverdue: 0,
  },
  {
    id: "LN003",
    customerName: "Arjun Patel",
    loanAmount: "₹7,50,000",
    disbursedDate: "2025-03-10",
    emiAmount: "₹12,500",
    nextDueDate: "2026-07-10",
    amountPaid: "₹3,50,000",
    amountOutstanding: "₹4,00,000",
    status: "overdue",
    daysOverdue: 8,
  },
  {
    id: "LN004",
    customerName: "Meera Devi",
    loanAmount: "₹1,50,000",
    disbursedDate: "2025-12-01",
    emiAmount: "₹3,125",
    nextDueDate: "2026-09-01",
    amountPaid: "₹6,250",
    amountOutstanding: "₹1,43,750",
    status: "active",
    daysOverdue: 0,
  },
];

export default function Loans() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const { data = mockLoans, isLoading } = useQuery({
    queryKey: ["loans", search, statusFilter],
    queryFn: async () => {
      // const response = await loanService.getAll({ search, status: statusFilter });
      // return response.loans;
      return mockLoans;
    },
    keepPreviousData: true,
  });

  let loans = search
    ? data.filter(
        (loan) =>
          loan.customerName.toLowerCase().includes(search.toLowerCase()) ||
          loan.id.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  if (statusFilter !== "all") {
    loans = loans.filter((loan) => loan.status === statusFilter);
  }

  const handleViewDetails = (loan) => {
    setSelectedLoan(loan);
    setOpenDialog(true);
  };

  const getProgressValue = (loan) => {
    const totalAmount = parseFloat(loan.loanAmount.replace(/[₹,]/g, ""));
    const paidAmount = parseFloat(loan.amountPaid.replace(/[₹,]/g, ""));
    return (paidAmount / totalAmount) * 100;
  };

  return (
    <SectionPage
      title="Loan Management"
      subtitle="Track active loans, EMI schedules, repayments, and outstanding balances."
      actions={
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search loans..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{
              minWidth: 250,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": {
                  borderColor: "#0F766E",
                },
              },
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
            }}
          />
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status Filter"
              sx={{
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#0F766E",
                  },
                },
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      }
    >
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress sx={{ color: "#0F766E" }} />
          </Box>
        ) : loans.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No loans found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Loan ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>EMI</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Progress</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow
                    key={loan.id}
                    sx={{
                      "&:hover": { bgcolor: "#F0F9FF" },
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                      {loan.id}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      {loan.customerName}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                      {loan.loanAmount}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      {loan.emiAmount}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={getProgressValue(loan)}
                          sx={{
                            flex: 1,
                            height: 6,
                            borderRadius: 2,
                            bgcolor: "#E2E8F0",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: "#0F766E",
                              borderRadius: 2,
                            },
                          }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 30, color: "#0F172A", fontWeight: 600 }}>
                          {Math.round(getProgressValue(loan))}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={loan.status}
                        size="small"
                        sx={{
                          bgcolor: loan.status === "active" ? "#DCFCE7" : loan.status === "overdue" ? "#FEE2E2" : "#E0E7FF",
                          color: loan.status === "active" ? "#15803D" : loan.status === "overdue" ? "#991B1B" : "#4F46E5",
                          fontWeight: 600,
                        }}
                      />
                      {loan.daysOverdue > 0 && (
                        <Typography variant="caption" sx={{ display: "block", color: "#EF4444", mt: 0.5 }}>
                          {loan.daysOverdue} days overdue
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          variant="text"
                          onClick={() => handleViewDetails(loan)}
                          sx={{ color: "#0F766E" }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          variant="text"
                          sx={{ color: "#2563EB" }}
                        >
                          EMI
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

      {/* Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#F8FAFC", color: "#0F172A", fontWeight: 700 }}>
          Loan Details - {selectedLoan?.id}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="body2" color="#64748B" sx={{ mb: 0.5 }}>
                Customer Name
              </Typography>
              <Typography fontWeight={600}>{selectedLoan?.customerName}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#64748B" sx={{ mb: 0.5 }}>
                Loan Amount
              </Typography>
              <Typography fontWeight={600}>{selectedLoan?.loanAmount}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#64748B" sx={{ mb: 0.5 }}>
                Monthly EMI
              </Typography>
              <Typography fontWeight={600}>{selectedLoan?.emiAmount}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#64748B" sx={{ mb: 0.5 }}>
                Amount Paid
              </Typography>
              <Typography fontWeight={600} color="#10B981">
                {selectedLoan?.amountPaid}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#64748B" sx={{ mb: 0.5 }}>
                Outstanding Balance
              </Typography>
              <Typography fontWeight={600} color="#EF4444">
                {selectedLoan?.amountOutstanding}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#64748B" sx={{ mb: 0.5 }}>
                Next Due Date
              </Typography>
              <Typography fontWeight={600}>{selectedLoan?.nextDueDate}</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#F8FAFC" }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: "#64748B" }}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{
              bgcolor: "#2563EB",
              "&:hover": { bgcolor: "#1D4ED8" },
            }}
          >
            Download Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
