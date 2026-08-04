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

export default function LoanReports() {
  const [status, setStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["loanReports", status, fromDate, toDate],
    queryFn: () =>
      reportsService.getLoanReports({
        status: status !== "all" ? status : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        limit: 100,
      }),
  });

  const { data: recoveryData } = useQuery({
    queryKey: ["recoveryReports"],
    queryFn: () => reportsService.getRecoveryReports(),
  });

  const reports = data?.reports || [];
  const pagination = data?.pagination || {};

  const totalDisbursed = reports.reduce((acc, r) => acc + parseFloat(r.disbursed_amount || 0), 0);
  const totalOutstanding = reports.reduce((acc, r) => acc + parseFloat(r.outstanding_amount || 0), 0);

  const formatCurrency = (val) =>
    `₹${Number(val || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleExportCSV = () => {
    if (!reports.length) return;
    const headers = ["Loan No", "Customer", "Product", "Branch", "Disbursed Amount", "Outstanding", "Status", "Date"];
    const rows = reports.map((r) => [
      r.loan_number,
      `"${r.customer_name || ''}"`,
      `"${r.product_name || ''}"`,
      `"${r.branch_name || ''}"`,
      r.disbursed_amount,
      r.outstanding_amount,
      r.status,
      new Date(r.created_at).toLocaleDateString("en-IN"),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Loan_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SectionPage
      title="Loan Portfolio Reports"
      subtitle="Live database reporting on loan portfolio, active disbursements, and outstanding balances."
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
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #0F766E" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Total Loans Count
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#0F766E" sx={{ mt: 0.5 }}>
                {pagination.total || reports.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #10B981" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Total Disbursed
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#10B981" sx={{ mt: 0.5 }}>
                {formatCurrency(totalDisbursed)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #F59E0B" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Total Outstanding
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#F59E0B" sx={{ mt: 0.5 }}>
                {formatCurrency(totalOutstanding || recoveryData?.outstanding_amount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #EF4444" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Overdue Portfolio
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#EF4444" sx={{ mt: 0.5 }}>
                {formatCurrency(recoveryData?.overdue_amount || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FILTER BAR */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2}  sx={{ alignItems: "center" }}>
          <Grid xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Loan Status</InputLabel>
              <Select
                value={status}
                label="Loan Status"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="CLOSED">CLOSED</MenuItem>
                <MenuItem value="FORECLOSED">FORECLOSED</MenuItem>
                <MenuItem value="DEFAULTED">DEFAULTED</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} sm={4}>
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
          <Grid xs={12} sm={4}>
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
                <TableCell sx={{ fontWeight: 700 }}>LOAN NO</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>CUSTOMER</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>PRODUCT</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>BRANCH</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>DISBURSED</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>OUTSTANDING</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "#64748B" }}>
                    No loan records match your query.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((row) => (
                  <TableRow key={row.loan_id} hover>
                    <TableCell sx={{ fontWeight: 600, color: "#0F766E" }}>
                      {row.loan_number}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{row.customer_name}</TableCell>
                    <TableCell>{row.product_name}</TableCell>
                    <TableCell>{row.branch_name}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(row.disbursed_amount)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "#D97706" }}>
                      {formatCurrency(row.outstanding_amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: row.status === "ACTIVE" ? "#DCFCE7" : "#F3F4F6",
                          color: row.status === "ACTIVE" ? "#166534" : "#374151",
                        }}
                      />
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
