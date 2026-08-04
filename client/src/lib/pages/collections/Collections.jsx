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
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  CheckCircle as CheckIcon,
  AccountBalanceWallet as CollectionIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import collectionService from "../../services/collection.service";
import loanService from "../../services/loan.service";

export default function Collections() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
  const [openRecordDialog, setOpenRecordDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  // Form state for Record Collection
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [collectionAmount, setCollectionAmount] = useState("");
  const [penaltyAmount, setPenaltyAmount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  const { data: collectionsData, isLoading } = useQuery({
    queryKey: ["collections", search, statusFilter],
    queryFn: () =>
      collectionService.getAll({
        search,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  const { data: activeLoansData } = useQuery({
    queryKey: ["activeLoansForCollection"],
    queryFn: () => loanService.getAll({ status: "ACTIVE", limit: 100 }),
  });

  const { data: summary } = useQuery({
    queryKey: ["collectionSummary"],
    queryFn: () => collectionService.getSummary(),
  });

  const collections = collectionsData?.collections || [];
  const activeLoans = activeLoansData?.loans || [];

  const collectionStats = summary || {
    todayCollection: 0,
    monthlyCollection: 0,
    overdueTotal: 0,
  };

  const createCollectionMutation = useMutation({
    mutationFn: (data) => collectionService.create(data),
    onSuccess: (res) => {
      toast.success("Collection recorded successfully!");
      queryClient.invalidateQueries(["collections"]);
      queryClient.invalidateQueries(["collectionSummary"]);
      queryClient.invalidateQueries(["cashbook"]);
      handleCloseRecordDialog();
      if (res?.data) {
        setSelectedCollection(res.data);
        setOpenReceiptDialog(true);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to record collection");
    },
  });

  const selectedLoanObj = activeLoans.find(
    (l) => String(l.loan_id) === String(selectedLoanId)
  );

  const handleLoanChange = (loanId) => {
    setSelectedLoanId(loanId);
    const loan = activeLoans.find((l) => String(l.loan_id) === String(loanId));
    if (loan) {
      // Auto suggest collection amount based on monthly EMI
      const monthlyEmi = (parseFloat(loan.total_payable || 0) / (loan.tenure || 12)).toFixed(2);
      setCollectionAmount(monthlyEmi > 0 ? monthlyEmi : "1000");
    }
  };

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    if (!selectedLoanId) {
      toast.error("Please select an active loan");
      return;
    }
    if (!collectionAmount || parseFloat(collectionAmount) <= 0) {
      toast.error("Please enter a valid collection amount");
      return;
    }

    if (!selectedLoanObj) {
      toast.error("Selected loan details not found");
      return;
    }

    const totalAmt = parseFloat(collectionAmount) + parseFloat(penaltyAmount || 0);

    createCollectionMutation.mutate({
      loanId: selectedLoanObj.loan_id,
      customerId: selectedLoanObj.customer_id,
      branchId: selectedLoanObj.branch_id || 1,
      emiAmount: parseFloat(collectionAmount),
      collectionAmount: parseFloat(collectionAmount),
      penaltyAmount: parseFloat(penaltyAmount || 0),
      totalAmount: totalAmt,
      paymentMethod,
      referenceNumber,
      remarks,
      collectionDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleCloseRecordDialog = () => {
    setOpenRecordDialog(false);
    setSelectedLoanId("");
    setCollectionAmount("");
    setPenaltyAmount("0");
    setReferenceNumber("");
    setRemarks("");
  };

  const handleViewReceipt = (collection) => {
    setSelectedCollection(collection);
    setOpenReceiptDialog(true);
  };

  const formatCurrency = (val) =>
    `₹${Number(val || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <SectionPage
      title="Collection Management"
      subtitle="Track daily loan repayments, issue instant digital receipts, and monitor loan collections."
      actions={
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search collections..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{
              minWidth: 250,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": { borderColor: "#0F766E" },
              },
            }}
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
              },
            }}
          />
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              size="small"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenRecordDialog(true)}
            sx={{
              backgroundColor: "#0F766E",
              "&:hover": { backgroundColor: "#0D9488" },
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Record Collection
          </Button>
        </Stack>
      }
    >
      {/* SUMMARY CARDS */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #10B981", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TODAY'S COLLECTION
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#10B981", mt: 0.5 }}>
                {formatCurrency(collectionStats.todayCollection)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #0F766E", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                THIS MONTH'S COLLECTION
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#0F766E", mt: 0.5 }}>
                {formatCurrency(collectionStats.monthlyCollection)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "4px solid #EF4444", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                OVERDUE AMOUNT
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#EF4444", mt: 0.5 }}>
                {formatCurrency(collectionStats.overdueTotal)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* COLLECTIONS TABLE */}
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress sx={{ color: "#0F766E" }} />
          </Box>
        ) : collections.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No collection records found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>RECEIPT NO</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>LOAN NO</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>CUSTOMER</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>DATE</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>MODE</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>AMOUNT</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collections.map((col) => (
                  <TableRow key={col.collection_id} hover>
                    <TableCell sx={{ fontWeight: 600, color: "#0F766E" }}>
                      {col.receipt_number}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{col.loan_number}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{col.customer_name}</TableCell>
                    <TableCell>
                      {new Date(col.collection_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip label={col.payment_method || "CASH"} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "#059669" }}>
                      {formatCurrency(col.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={col.status || "COMPLETED"}
                        size="small"
                        sx={{
                          bgcolor: col.status === "COMPLETED" ? "#DCFCE7" : "#FEF3C7",
                          color: col.status === "COMPLETED" ? "#15803D" : "#92400E",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        startIcon={<ReceiptIcon />}
                        onClick={() => handleViewReceipt(col)}
                        sx={{ color: "#0F766E", textTransform: "none", fontWeight: 600 }}
                      >
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* RECORD COLLECTION DIALOG */}
      <Dialog open={openRecordDialog} onClose={handleCloseRecordDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleRecordSubmit}>
          <DialogTitle sx={{ fontWeight: 700, borderBottom: "1px solid #E2E8F0" }}>
            Record Loan Collection / EMI
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Select Active Loan</InputLabel>
                <Select
                  value={selectedLoanId}
                  label="Select Active Loan"
                  onChange={(e) => handleLoanChange(e.target.value)}
                >
                  {activeLoans.map((loan) => (
                    <MenuItem key={loan.loan_id} value={loan.loan_id}>
                      {loan.loan_number} - {loan.first_name} {loan.last_name} (Outstanding: ₹
                      {loan.outstanding_amount})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedLoanObj && (
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }}>
                  <Typography variant="subtitle2" color="#166534" fontWeight={700}>
                    Loan Summary: {selectedLoanObj.loan_number}
                  </Typography>
                  <Typography variant="body2" color="#15803D">
                    Customer: {selectedLoanObj.first_name} {selectedLoanObj.last_name}
                  </Typography>
                  <Typography variant="body2" color="#15803D">
                    Outstanding Balance: {formatCurrency(selectedLoanObj.outstanding_amount)}
                  </Typography>
                </Paper>
              )}

              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Collection Amount (₹)"
                    value={collectionAmount}
                    onChange={(e) => setCollectionAmount(e.target.value)}
                    required
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Penalty / Late Fee (₹)"
                    value={penaltyAmount}
                    onChange={(e) => setPenaltyAmount(e.target.value)}
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
                      <MenuItem value="UPI">UPI / GPay / PhonePe</MenuItem>
                      <MenuItem value="BANK_TRANSFER">BANK TRANSFER</MenuItem>
                      <MenuItem value="CHEQUE">CHEQUE</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Ref / UTR Number"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. UTR-992019"
                  />
                </Grid>

                <Grid xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Collection notes..."
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: "1px solid #E2E8F0" }}>
            <Button onClick={handleCloseRecordDialog} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createCollectionMutation.isPending}
              sx={{ backgroundColor: "#0F766E", "&:hover": { backgroundColor: "#0D9488" } }}
            >
              {createCollectionMutation.isPending ? "Recording..." : "Confirm Collection"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* RECEIPT VIEW DIALOG */}
      <Dialog open={openReceiptDialog} onClose={() => setOpenReceiptDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#0F766E", color: "#FFFFFF", fontWeight: 700 }}>
          Payment Receipt - {selectedCollection?.receipt_number || selectedCollection?.receiptNo}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ p: 2, backgroundColor: "#ECFDF5", borderRadius: 2, border: "1px solid #A7F3D0" }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <CheckIcon sx={{ color: "#059669" }} />
                <Typography variant="body1" fontWeight={700} color="#065F46">
                  Payment Successfully Received
                </Typography>
              </Stack>
            </Box>

            <Grid container spacing={2}>
              <Grid xs={6}>
                <Typography variant="caption" color="text.secondary">Receipt Number</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedCollection?.receipt_number || "-"}</Typography>
              </Grid>
              <Grid xs={6}>
                <Typography variant="caption" color="text.secondary">Collection Date</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedCollection?.collection_date
                    ? new Date(selectedCollection.collection_date).toLocaleDateString("en-IN")
                    : new Date().toLocaleDateString("en-IN")}
                </Typography>
              </Grid>
              <Grid xs={6}>
                <Typography variant="caption" color="text.secondary">Customer Name</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedCollection?.customer_name || selectedCollection?.customerName || "-"}</Typography>
              </Grid>
              <Grid xs={6}>
                <Typography variant="caption" color="text.secondary">Loan Number</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedCollection?.loan_number || selectedCollection?.loanId || "-"}</Typography>
              </Grid>
              <Grid xs={6}>
                <Typography variant="caption" color="text.secondary">Payment Mode</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedCollection?.payment_method || "CASH"}</Typography>
              </Grid>
              <Grid xs={6}>
                <Typography variant="caption" color="text.secondary">Amount Collected</Typography>
                <Typography variant="h6" fontWeight={700} color="#059669">
                  {formatCurrency(selectedCollection?.total_amount || selectedCollection?.totalAmount || selectedCollection?.collectionAmount)}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid #E2E8F0" }}>
          <Button onClick={() => setOpenReceiptDialog(false)} color="inherit">
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrintReceipt}
            sx={{ backgroundColor: "#0F766E", "&:hover": { backgroundColor: "#0D9488" } }}
          >
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
