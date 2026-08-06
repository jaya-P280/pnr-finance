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

export default function CollectionReports() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["collectionReports", fromDate, toDate],
    queryFn: () =>
      reportsService.getCollectionReports({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        limit: 100,
      }),
  });

  const reports = data?.reports || [];
  const pagination = data?.pagination || {};

  const totalCollected = reports.reduce((acc, r) => acc + parseFloat(r.total_amount || 0), 0);
  const totalPenalties = reports.reduce((acc, r) => acc + parseFloat(r.penalty_amount || 0), 0);

  const formatCurrency = (val) =>
    `₹${Number(val || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleExportCSV = () => {
    if (!reports.length) return;
    const headers = ["Receipt No", "Customer Name", "Branch", "Collection Date", "Penalty Amount", "Total Collected", "Status"];
    const rows = reports.map((r) => [
      r.receipt_number,
      `"${r.customer_name || ''}"`,
      `"${r.branch_name || ''}"`,
      new Date(r.collection_date).toLocaleDateString("en-IN"),
      r.penalty_amount,
      r.total_amount,
      r.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Collection_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SectionPage
      title="Collection & Recovery Reports"
      subtitle="Detailed audit trail and live data breakdown of daily EMI receipts and penalty recoveries."
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
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #10B981" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Total Collections Sum
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#10B981" sx={{ mt: 0.5 }}>
                {formatCurrency(totalCollected)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #0F766E" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Total Receipts Issued
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#0F766E" sx={{ mt: 0.5 }}>
                {pagination.total || reports.length} Receipts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #F59E0B" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Penalty Collections
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#F59E0B" sx={{ mt: 0.5 }}>
                {formatCurrency(totalPenalties)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FILTER BAR */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2}  sx={{ alignItems: "center" }}>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
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
                <TableCell sx={{ fontWeight: 700 }}>RECEIPT NO</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>CUSTOMER NAME</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>BRANCH</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>COLLECTION DATE</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>PENALTY</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>TOTAL COLLECTED</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "#64748B" }}>
                    No collection receipts found for this period.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((row) => (
                  <TableRow key={row.collection_id} hover>
                    <TableCell sx={{ fontWeight: 600, color: "#0F766E" }}>
                      {row.receipt_number}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{row.customer_name}</TableCell>
                    <TableCell>{row.branch_name}</TableCell>
                    <TableCell>
                      {new Date(row.collection_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#D97706" }}>
                      {formatCurrency(row.penalty_amount)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "#059669" }}>
                      {formatCurrency(row.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status || "COMPLETED"}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: "#DCFCE7",
                          color: "#166534",
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
