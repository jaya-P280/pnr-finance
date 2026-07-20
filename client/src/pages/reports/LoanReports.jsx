import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import { Download as DownloadIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import SectionPage from "../../components/layout/SectionPage";

// Mock report data
const mockLoanStats = {
  totalLoans: 1245,
  activeLoans: 892,
  closedLoans: 278,
  defaultedLoans: 75,
  totalDisbursed: "₹45,65,00,000",
  totalOutstanding: "₹28,90,00,000",
  recoveryRate: "85.5",
};

const mockLoanData = [
  {
    id: 1,
    loanProduct: "Standard Microloan",
    count: 450,
    active: 350,
    closed: 100,
    avgLoanSize: "₹2,50,000",
    totalDisbursed: "₹11,25,00,000",
    status: "Active",
  },
  {
    id: 2,
    loanProduct: "Agricultural Loan",
    count: 380,
    active: 280,
    closed: 100,
    avgLoanSize: "₹4,50,000",
    totalDisbursed: "₹17,10,00,000",
    status: "Active",
  },
  {
    id: 3,
    loanProduct: "Business Expansion",
    count: 415,
    active: 262,
    closed: 153,
    avgLoanSize: "₹6,50,000",
    totalDisbursed: "₹26,98,00,000",
    status: "Active",
  },
];

export default function LoanReports() {
  const [filters, setFilters] = useState({
    loanProduct: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleGenerateReport = () => {
    console.log("Generating loan report with filters:", filters);
  };

  const handleDownloadReport = () => {
    console.log("Downloading loan report as PDF/Excel");
  };

  return (
    <SectionPage
      title="Loan Reports"
      subtitle="Analyze loan portfolio, disbursements, collections, and recovery metrics."
      actions={
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleGenerateReport}
            sx={{
              borderColor: "#0F766E",
              color: "#0F766E",
              borderRadius: 2,
              "&:hover": {
                borderColor: "#0D9488",
                bgcolor: "#F0F9FF",
              },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadReport}
            sx={{
              bgcolor: "#2563EB",
              "&:hover": { bgcolor: "#1D4ED8" },
              borderRadius: 2,
            }}
          >
            Download
          </Button>
        </Stack>
      }
    >
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="#64748B" sx={{ mb: 1 }}>
                Total Loans
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#0F766E">
                {mockLoanStats.totalLoans}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="#64748B" sx={{ mb: 1 }}>
                Active Loans
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#10B981">
                {mockLoanStats.activeLoans}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="#64748B" sx={{ mb: 1 }}>
                Total Disbursed
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#2563EB">
                {mockLoanStats.totalDisbursed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="#64748B" sx={{ mb: 1 }}>
                Recovery Rate
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(mockLoanStats.recoveryRate)}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 2,
                    bgcolor: "#E2E8F0",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#0F766E",
                    },
                  }}
                />
                <Typography variant="body2" fontWeight={700} color="#0F766E" sx={{ minWidth: 35 }}>
                  {mockLoanStats.recoveryRate}%
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, p: 3, mb: 3 }}>
        <Typography variant="body1" fontWeight={600} sx={{ mb: 2, color: "#0F172A" }}>
          Report Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Loan Product</InputLabel>
              <Select
                value={filters.loanProduct}
                onChange={(e) => handleFilterChange("loanProduct", e.target.value)}
                label="Loan Product"
                sx={{
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                  },
                }}
              >
                <MenuItem value="all">All Products</MenuItem>
                <MenuItem value="standard">Standard Microloan</MenuItem>
                <MenuItem value="agricultural">Agricultural Loan</MenuItem>
                <MenuItem value="business">Business Expansion</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                label="Status"
                sx={{
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                  },
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="date"
              label="From Date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="date"
              label="To Date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Report Table */}
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Loan Product</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Total Count</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Active/Closed</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Avg Loan Size</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Total Disbursed</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockLoanData.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "&:hover": { bgcolor: "#F0F9FF" },
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                    {row.loanProduct}
                  </TableCell>
                  <TableCell sx={{ color: "#0F172A" }}>{row.count}</TableCell>
                  <TableCell sx={{ color: "#0F172A" }}>
                    {row.active}/{row.closed}
                  </TableCell>
                  <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                    {row.avgLoanSize}
                  </TableCell>
                  <TableCell sx={{ color: "#2563EB", fontWeight: 600 }}>
                    {row.totalDisbursed}
                  </TableCell>
                  <TableCell sx={{ color: "#15803D", fontWeight: 600 }}>
                    {row.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </SectionPage>
  );
}
