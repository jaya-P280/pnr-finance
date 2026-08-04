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
  ReceiptLong as ExpenseIcon,
  MoneyOff as CostIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import financeService from "../../services/finance.service";

const EXPENSE_CATEGORIES = [
  "Office Rent",
  "Salaries",
  "Fuel & Conveyance",
  "Utilities",
  "Tea & Refreshments",
  "Stationery & Printing",
  "Legal & Audit",
  "Software & IT",
  "Marketing & Promotions",
  "Miscellaneous",
];

export default function Expenses() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [openDialog, setOpenDialog] = useState(false);

  // Form State
  const [category, setCategory] = useState("Office Rent");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [paidTo, setPaidTo] = useState("");
  const [receiptRef, setReceiptRef] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", search, categoryFilter],
    queryFn: () =>
      financeService.getExpenses({
        search,
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
      }),
  });

  const expenses = data?.expenses || [];
  const pagination = data?.pagination || { total: 0, totalAmount: 0 };

  const createMutation = useMutation({
    mutationFn: (newExp) => financeService.createExpense(newExp),
    onSuccess: () => {
      toast.success("Expense recorded successfully!");
      queryClient.invalidateQueries(["expenses"]);
      queryClient.invalidateQueries(["cashbook"]);
      handleCloseDialog();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add expense");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => financeService.deleteExpense(id),
    onSuccess: () => {
      toast.success("Expense deleted!");
      queryClient.invalidateQueries(["expenses"]);
      queryClient.invalidateQueries(["cashbook"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete expense");
    },
  });

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setAmount("");
    setPaidTo("");
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
      expenseDate,
      paidTo,
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
      title="Expense Management"
      subtitle="Track office rent, staff salaries, field conveyance, and operational expenditures."
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
          Record Expense
        </Button>
      }
    >
      {/* SUMMARY STATS */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #EF4444", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TOTAL EXPENDITURE
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: "#EF4444", mt: 0.5 }}>
                    {formatCurrency(pagination.totalAmount)}
                  </Typography>
                </Box>
                <CostIcon sx={{ fontSize: 36, color: "#EF4444", opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #F59E0B", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TOTAL TRANSACTIONS
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: "#F59E0B", mt: 0.5 }}>
                    {pagination.total || 0} Entries
                  </Typography>
                </Box>
                <ExpenseIcon sx={{ fontSize: 36, color: "#F59E0B", opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #6366F1", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    AVERAGE PER ENTRY
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: "#6366F1", mt: 0.5 }}>
                    {formatCurrency(pagination.total ? pagination.totalAmount / pagination.total : 0)}
                  </Typography>
                </Box>
                <CalendarIcon sx={{ fontSize: 36, color: "#6366F1", opacity: 0.8 }} />
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
              placeholder="Search expense number, vendor, description..."
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
                {EXPENSE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* EXPENSES TABLE */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#0F766E" }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>EXPENSE NO</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>CATEGORY</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>PAID TO / VENDOR</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>PAYMENT MODE</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>DATE</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>DESCRIPTION</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>AMOUNT</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: "#64748B" }}>
                    No expense entries found.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((exp) => (
                  <TableRow key={exp.expense_id} hover>
                    <TableCell sx={{ fontWeight: 600, color: "#0F766E" }}>
                      {exp.expense_number}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      <Chip label={exp.category} size="small" sx={{ backgroundColor: "#FEF2F2", color: "#991B1B", fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{exp.paid_to || "-"}</TableCell>
                    <TableCell>
                      <Chip label={exp.payment_method} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {new Date(exp.expense_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell sx={{ color: "#64748B", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {exp.description || "-"}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "#DC2626" }}>
                      {formatCurrency(exp.amount)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteMutation.mutate(exp.expense_id)}
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

      {/* RECORD EXPENSE DIALOG */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700, borderBottom: "1px solid #E2E8F0" }}>
            Record New Operational Expense
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={category}
                      label="Category"
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Amount (₹)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
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
                      <MenuItem value="BANK_TRANSFER">BANK TRANSFER</MenuItem>
                      <MenuItem value="CHEQUE">CHEQUE</MenuItem>
                      <MenuItem value="UPI">UPI</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Expense Date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Paid To / Vendor Name"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    placeholder="e.g. Commercial Plaza Rent"
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Receipt / Ref No."
                    value={receiptRef}
                    onChange={(e) => setReceiptRef(e.target.value)}
                    placeholder="e.g. BILL-9921"
                  />
                </Grid>

                <Grid xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Description / Remarks"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Notes about this expense..."
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: "1px solid #E2E8F0" }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending}
              sx={{ backgroundColor: "#0F766E", "&:hover": { backgroundColor: "#0D9488" } }}
            >
              {createMutation.isPending ? "Saving..." : "Save Expense"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </SectionPage>
  );
}
