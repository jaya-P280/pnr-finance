import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
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
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  TrendingUp as IncomeIcon,
  Receipt as FeeIcon,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import financeService from "../../services/finance.service";

const INCOME_CATEGORIES = [
  "Loan Processing Fee",
  "Documentation Fee",
  "Late Payment Penalty",
  "Pre-closure & Legal Charges",
  "Advisory Fees",
  "Inspection Fees",
  "Miscellaneous Income",
];

export default function Income() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [openDialog, setOpenDialog] = useState(false);

  // Form State
  const [category, setCategory] = useState("Loan Processing Fee");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split("T")[0]);
  const [receivedFrom, setReceivedFrom] = useState("");
  const [receiptRef, setReceiptRef] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["income", search, categoryFilter],
    queryFn: () =>
      financeService.getIncome({
        search,
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
      }),
  });

  const incomeList = data?.income || [];
  const pagination = data?.pagination || { total: 0, totalAmount: 0 };

  const createMutation = useMutation({
    mutationFn: (newInc) => financeService.createIncome(newInc),
    onSuccess: () => {
      toast.success("Income entry recorded successfully!");
      queryClient.invalidateQueries(["income"]);
      queryClient.invalidateQueries(["cashbook"]);
      handleCloseDialog();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add income entry");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => financeService.deleteIncome(id),
    onSuccess: () => {
      toast.success("Income record deleted!");
      queryClient.invalidateQueries(["income"]);
      queryClient.invalidateQueries(["cashbook"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete income");
    },
  });

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setAmount("");
    setReceivedFrom("");
    setReceiptRef("");
    setDescription("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    createMutation.mutate({
      category,
      amount: parseFloat(amount),
      paymentMethod,
      incomeDate,
      receivedFrom,
      receiptRef,
      description,
    });
  };

  const formatCurrency = (val) =>
    `₹${Number(val || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <SectionPage
      title="Direct Income Management"
      subtitle="Track loan processing fees, documentation charges, penalty collections, and advisory income."
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            backgroundColor: "#0F766E",
            fontWeight: 600,
            borderRadius: 2,
            "&:hover": { backgroundColor: "#0D9488" },
          }}
        >
          Record Income
        </Button>
      }
    >
      {/* SUMMARY STATS */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #10B981", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TOTAL DIRECT INCOME
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: "#10B981", mt: 0.5 }}>
                    {formatCurrency(pagination.totalAmount)}
                  </Typography>
                </Box>
                <IncomeIcon sx={{ fontSize: 36, color: "#10B981", opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #0F766E", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TOTAL ENTRIES
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: "#0F766E", mt: 0.5 }}>
                    {pagination.total || 0} Records
                  </Typography>
                </Box>
                <FeeIcon sx={{ fontSize: 36, color: "#0F766E", opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #3B82F6", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    AVERAGE INCOME / ENTRY
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: "#3B82F6", mt: 0.5 }}>
                    {formatCurrency(pagination.total ? pagination.totalAmount / pagination.total : 0)}
                  </Typography>
                </Box>
                <SuccessIcon sx={{ fontSize: 36, color: "#3B82F6", opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FILTER BAR */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2}  sx={{ alignItems: "center" }}>
          <Grid xs={12} sm={6} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search income number, payer name, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
                },
              }}
            />
          </Grid>
          <Grid xs={12} sm={6} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                {INCOME_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* INCOME TABLE */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#0F766E" }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Income No</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Received From</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Payment Method</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: "center" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incomeList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No income records found in real database.
                  </TableCell>
                </TableRow>
              ) : (
                incomeList.map((row) => (
                  <TableRow key={row.income_id} hover>
                    <TableCell sx={{ fontWeight: 600, color: "#0F766E" }}>{row.income_number}</TableCell>
                    <TableCell>
                      <Chip label={row.category} size="small" sx={{ backgroundColor: "#E0F2FE", color: "#0369A1" }} />
                    </TableCell>
                    <TableCell>{row.received_from || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.payment_method}
                        size="small"
                        variant="outlined"
                        color={row.payment_method === "CASH" ? "primary" : "secondary"}
                      />
                    </TableCell>
                    <TableCell>{new Date(row.income_date).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "#10B981" }}>
                      {formatCurrency(row.amount)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteMutation.mutate(row.income_id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* RECORD INCOME DIALOG */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Record Direct Income Entry</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Category</InputLabel>
                  <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                    {INCOME_CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  type="number"
                  label="Amount (₹)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    label="Payment Method"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <MenuItem value="CASH">CASH</MenuItem>
                    <MenuItem value="BANK_TRANSFER">BANK TRANSFER / NEFT</MenuItem>
                    <MenuItem value="UPI">UPI / GPAY</MenuItem>
                    <MenuItem value="CHEQUE">CHEQUE</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Income Date"
                  value={incomeDate}
                  onChange={(e) => setIncomeDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Received From"
                  placeholder="e.g. Borrower Name / Batch #1"
                  value={receivedFrom}
                  onChange={(e) => setReceivedFrom(e.target.value)}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Receipt / Ref No"
                  placeholder="e.g. REC-1002"
                  value={receiptRef}
                  onChange={(e) => setReceiptRef(e.target.value)}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Description / Notes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending}
              sx={{ backgroundColor: "#0F766E", "&:hover": { backgroundColor: "#0D9488" } }}
            >
              {createMutation.isPending ? "Saving..." : "Save Income"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </SectionPage>
  );
}
