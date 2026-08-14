import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  TrendingUp as InflowIcon,
  TrendingDown as OutflowIcon,
  AccountBalanceWallet as WalletIcon,
  Today as TodayIcon,
} from "@mui/icons-material";
import SectionPage from "../../components/layout/SectionPage";
import financeService from "../../services/finance.service";

export default function CashBook() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["cashbook", fromDate, toDate],
    queryFn: () => financeService.getCashBook({ fromDate, toDate }),
  });

  const entries = data?.entries || [];
  const summary = data?.summary || {
    totalInflow: 0,
    totalOutflow: 0,
    netBalance: 0,
    todayInflow: 0,
    todayOutflow: 0,
  };

  const filteredEntries = entries.filter((item) => {
    const matchesType = typeFilter === "ALL" || item.entry_type === typeFilter;
    const matchesSearch =
      !search ||
      item.ref_number?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const formatCurrency = (val) =>
    `₹${Number(val || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleExportCSV = () => {
    if (!filteredEntries.length) return;
    const headers = ["Type", "Category", "Ref No", "Payment Mode", "Date", "Amount", "Description"];
    const rows = filteredEntries.map((e) => [
      e.entry_type,
      `"${e.category || ''}"`,
      e.ref_number,
      e.payment_method,
      new Date(e.entry_date).toLocaleDateString("en-IN"),
      e.amount,
      `"${e.description || ''}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CashBook_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SectionPage
      title="Cash Book & Financial Ledger"
      subtitle="Live audit trail of cash inflows, loan disbursements, EMI collections, and operational expenses."
      actions={
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          sx={{
            borderColor: "#0F766E",
            color: "#0F766E",
            fontWeight: 600,
            borderRadius: 2,
            "&:hover": { borderColor: "#0D9488", backgroundColor: "rgba(15,118,110,0.04)" },
          }}
        >
          Export CSV
        </Button>
      }
    >
      {/* SUMMARY STATS */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #10B981", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TOTAL CASH INFLOW
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: "#10B981", mt: 0.5 }}>
                    {formatCurrency(summary.totalInflow)}
                  </Typography>
                </Box>
                <InflowIcon sx={{ fontSize: 36, color: "#10B981", opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #EF4444", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TOTAL CASH OUTFLOW
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: "#EF4444", mt: 0.5 }}>
                    {formatCurrency(summary.totalOutflow)}
                  </Typography>
                </Box>
                <OutflowIcon sx={{ fontSize: 36, color: "#EF4444", opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #0F766E", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    NET CASH BALANCE
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{ color: summary.netBalance >= 0 ? "#0F766E" : "#DC2626", mt: 0.5 }}
                  >
                    {formatCurrency(summary.netBalance)}
                  </Typography>
                </Box>
                <WalletIcon sx={{ fontSize: 36, color: "#0F766E", opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #6366F1", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TODAY'S NET FLOW
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: "#6366F1", mt: 0.5 }}>
                    {formatCurrency(summary.todayInflow - summary.todayOutflow)}
                  </Typography>
                </Box>
                <TodayIcon sx={{ fontSize: 36, color: "#6366F1", opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FILTERS */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2}  sx={{ alignItems: "center" }}>
          <Grid xs={12} sm={4} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search reference, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
                },
              }}
            />
          </Grid>
          <Grid xs={12} sm={3} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={typeFilter}
                label="Transaction Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Transactions</MenuItem>
                <MenuItem value="INFLOW">Inflow Only (+)</MenuItem>
                <MenuItem value="OUTFLOW">Outflow Only (-)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} sm={2.5} md={2.5}>
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
          <Grid xs={12} sm={2.5} md={2.5}>
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

      {/* CASH BOOK LEDGER TABLE */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#0F766E" }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ref Number</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Payment Method</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No ledger transactions found in real database.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((row, idx) => {
                  const isInflow = row.entry_type === "INFLOW";
                  return (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Chip
                          label={row.entry_type}
                          size="small"
                          sx={{
                            backgroundColor: isInflow ? "#ECFDF5" : "#FEF2F2",
                            color: isInflow ? "#047857" : "#B91C1C",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.category}</TableCell>
                      <TableCell>{row.ref_number || "-"}</TableCell>
                      <TableCell>
                        <Chip label={row.payment_method || "CASH"} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{new Date(row.entry_date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, color: isInflow ? "#10B981" : "#EF4444" }}
                      >
                        {isInflow ? "+" : "-"}{formatCurrency(row.amount)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </SectionPage>
  );
}
