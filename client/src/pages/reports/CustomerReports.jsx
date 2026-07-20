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
} from "@mui/material";
import { Download as DownloadIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import SectionPage from "../../components/layout/SectionPage";

// Mock report data
const mockReportData = [
  {
    id: 1,
    customerCode: "CUST001",
    name: "Rajesh Kumar",
    branch: "New Delhi",
    totalLoans: 3,
    activeLoans: 2,
    closedLoans: 1,
    totalBorrowed: "₹10,00,000",
    totalRepaid: "₹6,00,000",
    status: "Active",
  },
  {
    id: 2,
    customerCode: "CUST002",
    name: "Priya Singh",
    branch: "Pune",
    totalLoans: 2,
    activeLoans: 1,
    closedLoans: 1,
    totalBorrowed: "₹7,50,000",
    totalRepaid: "₹5,00,000",
    status: "Active",
  },
  {
    id: 3,
    customerCode: "CUST003",
    name: "Arjun Patel",
    branch: "Bangalore",
    totalLoans: 4,
    activeLoans: 2,
    closedLoans: 2,
    totalBorrowed: "₹15,00,000",
    totalRepaid: "₹10,50,000",
    status: "Active",
  },
];

export default function CustomerReports() {
  const [filters, setFilters] = useState({
    branch: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleGenerateReport = () => {
    console.log("Generating customer report with filters:", filters);
  };

  const handleDownloadReport = () => {
    console.log("Downloading customer report as PDF/Excel");
  };

  return (
    <SectionPage
      title="Customer Reports"
      subtitle="Generate and analyze customer performance, loan history, and portfolio metrics."
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
      {/* Filters */}
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, p: 3, mb: 3 }}>
        <Typography variant="body1" fontWeight={600} sx={{ mb: 2, color: "#0F172A" }}>
          Report Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Branch</InputLabel>
              <Select
                value={filters.branch}
                onChange={(e) => handleFilterChange("branch", e.target.value)}
                label="Branch"
                sx={{
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                  },
                }}
              >
                <MenuItem value="all">All Branches</MenuItem>
                <MenuItem value="delhi">New Delhi</MenuItem>
                <MenuItem value="pune">Pune</MenuItem>
                <MenuItem value="bangalore">Bangalore</MenuItem>
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
                <MenuItem value="inactive">Inactive</MenuItem>
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
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Customer Code</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Total Loans</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Total Borrowed</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Total Repaid</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockReportData.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "&:hover": { bgcolor: "#F0F9FF" },
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                    {row.customerCode}
                  </TableCell>
                  <TableCell sx={{ color: "#0F172A" }}>{row.name}</TableCell>
                  <TableCell sx={{ color: "#0F172A" }}>{row.branch}</TableCell>
                  <TableCell sx={{ color: "#0F172A" }}>
                    {row.activeLoans}/{row.totalLoans}
                  </TableCell>
                  <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                    {row.totalBorrowed}
                  </TableCell>
                  <TableCell sx={{ color: "#10B981", fontWeight: 600 }}>
                    {row.totalRepaid}
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
