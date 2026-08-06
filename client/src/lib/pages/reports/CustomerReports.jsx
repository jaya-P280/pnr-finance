import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  CircularProgress,
  Chip,
} from "@mui/material";
import { Download as DownloadIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import SectionPage from "../../components/layout/SectionPage";
import reportsService from "../../services/reports.service";

export default function CustomerReports() {
  const [status, setStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["customerReports", status, fromDate, toDate],
    queryFn: () =>
      reportsService.getCustomerReports({
        status: status !== "all" ? status : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        limit: 100,
      }),
  });

  const reports = data?.reports || [];
  const pagination = data?.pagination || {};

  const handleExportCSV = () => {
    if (!reports.length) return;
    const headers = ["Customer Code", "Customer Name", "Branch", "Phone", "KYC Status", "Registered Date"];
    const rows = reports.map((r) => [
      r.customer_code,
      `"${r.first_name || ''} ${r.last_name || ''}"`,
      `"${r.branch_name || ''}"`,
      r.phone,
      r.kyc_status,
      new Date(r.created_at).toLocaleDateString("en-IN"),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Customer_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SectionPage
      title="Customer Analytics Reports"
      subtitle="Comprehensive view of registered customers, KYC status, and branch assignments."
      actions={
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            sx={{ borderColor: "#0F766E", color: "#0F766E", fontWeight: 600 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            sx={{ backgroundColor: "#0F766E", "&:hover": { backgroundColor: "#0D9488" } }}
          >
            Export CSV
          </Button>
        </Stack>
      }
    >
      {/* KPI METRICS */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #0F766E" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Total Registered Customers
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#0F766E" sx={{ mt: 0.5 }}>
                {pagination.total || reports.length} Customers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #10B981" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Verified KYC Customers
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#10B981" sx={{ mt: 0.5 }}>
                {reports.filter((r) => r.kyc_status === "VERIFIED").length} Verified
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #F59E0B" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Pending KYC Verification
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#F59E0B" sx={{ mt: 0.5 }}>
                {reports.filter((r) => r.kyc_status !== "VERIFIED").length} Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FILTER BAR */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2}  sx={{ alignItems: "center" }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>KYC Status</InputLabel>
              <Select
                value={status}
                label="KYC Status"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="VERIFIED">VERIFIED</MenuItem>
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="REJECTED">REJECTED</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="From Date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="To Date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* LIVE DATA TABLE */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#0F766E" }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>CUSTOMER CODE</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>FULL NAME</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>PHONE</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>BRANCH</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>KYC STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>REGISTERED DATE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#64748B" }}>
                    No customer records found.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((row) => (
                  <TableRow key={row.customer_id} hover>
                    <TableCell sx={{ fontWeight: 600, color: "#0F766E" }}>
                      {row.customer_code}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {row.first_name} {row.last_name}
                    </TableCell>
                    <TableCell>{row.phone || "-"}</TableCell>
                    <TableCell>{row.branch_name || "Head Office"}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.kyc_status || "PENDING"}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: row.kyc_status === "VERIFIED" ? "#DCFCE7" : "#FEF3C7",
                          color: row.kyc_status === "VERIFIED" ? "#166534" : "#92400E",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(row.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </SectionPage>
  );
}
