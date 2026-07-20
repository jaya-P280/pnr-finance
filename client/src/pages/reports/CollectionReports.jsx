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
} from "@mui/material";
import { Download as DownloadIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import SectionPage from "../../components/layout/SectionPage";

// Mock report data
const mockCollectionStats = {
  totalCollection: "₹3,75,00,000",
  todayCollection: "₹28,750",
  monthlyTarget: "₹5,00,000",
  monthlyCollected: "₹3,75,000",
  collectionRate: "75",
  overdueAmount: "₹12,50,000",
};

const mockCollectionData = [
  {
    id: 1,
    date: "2026-07-18",
    branch: "New Delhi",
    collectionAmount: "₹1,25,000",
    receiptCount: 24,
    avgCollection: "₹5,208",
    status: "Completed",
  },
  {
    id: 2,
    date: "2026-07-17",
    branch: "Pune",
    collectionAmount: "₹98,500",
    receiptCount: 18,
    avgCollection: "₹5,472",
    status: "Completed",
  },
  {
    id: 3,
    date: "2026-07-16",
    branch: "Bangalore",
    collectionAmount: "₹1,52,250",
    receiptCount: 28,
    avgCollection: "₹5,437",
    status: "Completed",
  },
  {
    id: 4,
    date: "2026-07-15",
    branch: "Mumbai",
    collectionAmount: "₹89,750",
    receiptCount: 15,
    avgCollection: "₹5,983",
    status: "Completed",
  },
];

export default function CollectionReports() {
  const [filters, setFilters] = useState({
    branch: "all",
    dateFrom: "",
    dateTo: "",
  });

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleGenerateReport = () => {
    console.log("Generating collection report with filters:", filters);
  };

  const handleDownloadReport = () => {
    console.log("Downloading collection report as PDF/Excel");
  };

  return (
    <SectionPage
      title="Collection Reports"
      subtitle="Track daily collections, target achievement, and overdue payment analytics."
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
                Total Collection
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#0F766E">
                {mockCollectionStats.totalCollection}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="#64748B" sx={{ mb: 1 }}>
                Today's Collection
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#10B981">
                {mockCollectionStats.todayCollection}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="#64748B" sx={{ mb: 1 }}>
                Collection Rate
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#2563EB">
                {mockCollectionStats.collectionRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="#64748B" sx={{ mb: 1 }}>
                Overdue Amount
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#EF4444">
                {mockCollectionStats.overdueAmount}
              </Typography>
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
          <Grid item xs={12} sm={6} md={4}>
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
                <MenuItem value="mumbai">Mumbai</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
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
          <Grid item xs={12} sm={6} md={4}>
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
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Collection Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Receipt Count</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Avg Collection</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockCollectionData.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "&:hover": { bgcolor: "#F0F9FF" },
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                    {row.date}
                  </TableCell>
                  <TableCell sx={{ color: "#0F172A" }}>{row.branch}</TableCell>
                  <TableCell sx={{ color: "#10B981", fontWeight: 600 }}>
                    {row.collectionAmount}
                  </TableCell>
                  <TableCell sx={{ color: "#0F172A" }}>{row.receiptCount}</TableCell>
                  <TableCell sx={{ color: "#2563EB", fontWeight: 600 }}>
                    {row.avgCollection}
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
