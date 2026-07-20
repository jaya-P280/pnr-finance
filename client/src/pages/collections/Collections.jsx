import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon, Download as DownloadIcon, Receipt as ReceiptIcon } from "@mui/icons-material";
import SectionPage from "../../components/layout/SectionPage";

// Mock data
const mockCollections = [
  {
    id: "CO001",
    loanId: "LN001",
    customerName: "Rajesh Kumar",
    collectionDate: "2026-07-18",
    emiAmount: "₹5,208",
    collectionAmount: "₹5,208",
    status: "completed",
    receiptNo: "RCP001",
  },
  {
    id: "CO002",
    loanId: "LN002",
    customerName: "Priya Singh",
    collectionDate: "2026-07-17",
    emiAmount: "₹10,417",
    collectionAmount: "₹10,417",
    status: "completed",
    receiptNo: "RCP002",
  },
  {
    id: "CO003",
    loanId: "LN003",
    customerName: "Arjun Patel",
    collectionDate: "2026-07-16",
    emiAmount: "₹12,500",
    collectionAmount: "₹0",
    status: "pending",
    receiptNo: "-",
  },
  {
    id: "CO004",
    loanId: "LN004",
    customerName: "Meera Devi",
    collectionDate: "2026-08-01",
    emiAmount: "₹3,125",
    collectionAmount: "₹3,125",
    status: "completed",
    receiptNo: "RCP003",
  },
];

// Collection summary stats
const collectionStats = {
  todayCollection: "₹28,750",
  monthlyTarget: "₹5,00,000",
  monthlyCollected: "₹3,75,000",
  overduePending: "₹12,500",
};

export default function Collections() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  const { data = mockCollections, isLoading } = useQuery({
    queryKey: ["collections", search, statusFilter],
    queryFn: async () => {
      // const response = await collectionService.getAll({ search, status: statusFilter });
      // return response.collections;
      return mockCollections;
    },
    keepPreviousData: true,
  });

  let collections = search
    ? data.filter(
        (col) =>
          col.customerName.toLowerCase().includes(search.toLowerCase()) ||
          col.loanId.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  if (statusFilter !== "all") {
    collections = collections.filter((col) => col.status === statusFilter);
  }

  const handleViewReceipt = (collection) => {
    setSelectedCollection(collection);
    setOpenDialog(true);
  };

  return (
    <SectionPage
      title="Collection Management"
      subtitle="Track daily collections, generate receipts, and monitor overdue payments."
      actions={
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search collections..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{
              minWidth: 250,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": {
                  borderColor: "#0F766E",
                },
              },
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
            }}
          />
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              sx={{
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#0F766E",
                  },
                },
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: "#2563EB",
              "&:hover": { bgcolor: "#1D4ED8" },
              borderRadius: 2,
            }}
          >
            Record Collection
          </Button>
        </Stack>
      }
    >
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="#64748B" sx={{ mb: 1 }}>
                Today's Collection
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#0F766E">
                {collectionStats.todayCollection}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="#64748B" sx={{ mb: 1 }}>
                Monthly Target
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#2563EB">
                {collectionStats.monthlyTarget}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="#64748B" sx={{ mb: 1 }}>
                Monthly Collected
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#10B981">
                {collectionStats.monthlyCollected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="#64748B" sx={{ mb: 1 }}>
                Overdue Pending
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#EF4444">
                {collectionStats.overduePending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress sx={{ color: "#0F766E" }} />
          </Box>
        ) : collections.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No collections found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Collection ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Loan ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>EMI</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Collected</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collections.map((collection) => (
                  <TableRow
                    key={collection.id}
                    sx={{
                      "&:hover": { bgcolor: "#F0F9FF" },
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                      {collection.id}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      {collection.loanId}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      {collection.customerName}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      {collection.collectionDate}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                      {collection.emiAmount}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                      <Typography color={collection.collectionAmount !== "₹0" ? "#10B981" : "#EF4444"}>
                        {collection.collectionAmount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={collection.status}
                        size="small"
                        sx={{
                          bgcolor: collection.status === "completed" ? "#DCFCE7" : "#FEF3C7",
                          color: collection.status === "completed" ? "#15803D" : "#92400E",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {collection.status === "completed" && (
                          <Button
                            size="small"
                            startIcon={<ReceiptIcon />}
                            variant="text"
                            onClick={() => handleViewReceipt(collection)}
                            sx={{ color: "#0F766E" }}
                          >
                            Receipt
                          </Button>
                        )}
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          variant="text"
                          sx={{ color: "#2563EB" }}
                        >
                          PDF
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Receipt Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#F8FAFC", color: "#0F172A", fontWeight: 700 }}>
          Receipt - {selectedCollection?.receiptNo}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2.5}>
            <Box sx={{ p: 2, bgcolor: "#F0F9FF", borderRadius: 2, border: "1px solid #E0F2FE" }}>
              <Typography variant="body2" color="#0369A1" fontWeight={600}>
                Collection Confirmed
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#64748B" sx={{ mb: 0.5 }}>
                Collection ID
              </Typography>
              <Typography fontWeight={600}>{selectedCollection?.id}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#64748B" sx={{ mb: 0.5 }}>
                Customer
              </Typography>
              <Typography fontWeight={600}>{selectedCollection?.customerName}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#64748B" sx={{ mb: 0.5 }}>
                Loan ID
              </Typography>
              <Typography fontWeight={600}>{selectedCollection?.loanId}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#64748B" sx={{ mb: 0.5 }}>
                Collection Amount
              </Typography>
              <Typography fontWeight={600} color="#10B981">
                {selectedCollection?.collectionAmount}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#64748B" sx={{ mb: 0.5 }}>
                Date
              </Typography>
              <Typography fontWeight={600}>{selectedCollection?.collectionDate}</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#F8FAFC" }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: "#64748B" }}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{
              bgcolor: "#2563EB",
              "&:hover": { bgcolor: "#1D4ED8" },
            }}
          >
            Download Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
