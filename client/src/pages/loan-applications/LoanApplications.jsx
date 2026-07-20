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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, CheckCircle as ApproveIcon, Cancel as RejectIcon } from "@mui/icons-material";
import SectionPage from "../../components/layout/SectionPage";

// Mock data
const mockApplications = [
  {
    id: "LA001",
    customerName: "Rajesh Kumar",
    loanProduct: "Standard Microloan",
    amount: "₹2,50,000",
    purpose: "Business Expansion",
    status: "pending",
    appliedDate: "2026-07-15",
    submittedDocuments: 4,
  },
  {
    id: "LA002",
    customerName: "Priya Singh",
    loanProduct: "Agricultural Loan",
    amount: "₹5,00,000",
    purpose: "Farm Equipment",
    status: "verified",
    appliedDate: "2026-07-10",
    submittedDocuments: 5,
  },
  {
    id: "LA003",
    customerName: "Arjun Patel",
    loanProduct: "Business Expansion",
    amount: "₹7,50,000",
    purpose: "Store Setup",
    status: "approved",
    appliedDate: "2026-07-05",
    submittedDocuments: 6,
  },
  {
    id: "LA004",
    customerName: "Meera Devi",
    loanProduct: "Standard Microloan",
    amount: "₹1,50,000",
    purpose: "Personal Expansion",
    status: "rejected",
    appliedDate: "2026-06-28",
    submittedDocuments: 3,
  },
];

export default function LoanApplications() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: null });

  const { data = mockApplications, isLoading } = useQuery({
    queryKey: ["loan-applications", search, statusFilter],
    queryFn: async () => {
      // const response = await loanApplicationService.getAll({ search, status: statusFilter });
      // return response.applications;
      return mockApplications;
    },
    keepPreviousData: true,
  });

  let applications = search
    ? data.filter(
        (app) =>
          app.customerName.toLowerCase().includes(search.toLowerCase()) ||
          app.id.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  if (statusFilter !== "all") {
    applications = applications.filter((app) => app.status === statusFilter);
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: "#FEF3C7", color: "#92400E" },
      verified: { bg: "#E0F2FE", color: "#0369A1" },
      approved: { bg: "#DCFCE7", color: "#15803D" },
      rejected: { bg: "#FEE2E2", color: "#991B1B" },
      disbursed: { bg: "#DDD6FE", color: "#4F46E5" },
    };
    return colors[status] || { bg: "#F3F4F6", color: "#374151" };
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setOpenDialog(true);
  };

  const handleApprove = (application) => {
    setSelectedApplication(application);
    setActionDialog({ open: true, type: "approve" });
  };

  const handleReject = (application) => {
    setSelectedApplication(application);
    setActionDialog({ open: true, type: "reject" });
  };

  const handleConfirmAction = async () => {
    // TODO: API call to approve/reject application
    console.log(`${actionDialog.type === "approve" ? "Approving" : "Rejecting"} application:`, selectedApplication.id);
    setActionDialog({ open: false, type: null });
  };

  return (
    <SectionPage
      title="Loan Applications"
      subtitle="Review, verify, and manage loan applications from customers."
      actions={
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search applications..."
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
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status Filter"
              sx={{
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#0F766E",
                  },
                },
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="disbursed">Disbursed</MenuItem>
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
            New Application
          </Button>
        </Stack>
      }
    >
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress sx={{ color: "#0F766E" }} />
          </Box>
        ) : applications.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No applications found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Application ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Applied Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((application) => {
                  const statusColor = getStatusColor(application.status);
                  return (
                    <TableRow
                      key={application.id}
                      sx={{
                        "&:hover": { bgcolor: "#F0F9FF" },
                        borderBottom: "1px solid #E2E8F0",
                      }}
                    >
                      <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                        {application.id}
                      </TableCell>
                      <TableCell sx={{ color: "#0F172A" }}>
                        {application.customerName}
                      </TableCell>
                      <TableCell sx={{ color: "#0F172A" }}>
                        {application.loanProduct}
                      </TableCell>
                      <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                        {application.amount}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={application.status}
                          size="small"
                          sx={{
                            bgcolor: statusColor.bg,
                            color: statusColor.color,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#0F172A" }}>
                        {application.appliedDate}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => handleViewDetails(application)}
                            sx={{ color: "#0F766E" }}
                          >
                            View
                          </Button>
                          {application.status === "verified" && (
                            <>
                              <Button
                                size="small"
                                startIcon={<ApproveIcon />}
                                variant="text"
                                onClick={() => handleApprove(application)}
                                sx={{ color: "#15803D" }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                startIcon={<RejectIcon />}
                                variant="text"
                                onClick={() => handleReject(application)}
                                sx={{ color: "#EF4444" }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#F8FAFC", color: "#0F172A", fontWeight: 700 }}>
          Application Details - {selectedApplication?.id}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="#64748B">
                Customer Name
              </Typography>
              <Typography fontWeight={600}>{selectedApplication?.customerName}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#64748B">
                Loan Product
              </Typography>
              <Typography fontWeight={600}>{selectedApplication?.loanProduct}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#64748B">
                Loan Amount
              </Typography>
              <Typography fontWeight={600}>{selectedApplication?.amount}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#64748B">
                Purpose
              </Typography>
              <Typography fontWeight={600}>{selectedApplication?.purpose}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#64748B">
                Documents Submitted
              </Typography>
              <Chip label={`${selectedApplication?.submittedDocuments} documents`} size="small" sx={{ bgcolor: "#E0F2FE", color: "#0369A1" }} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#F8FAFC" }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: "#64748B" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: null })}>
        <DialogTitle>
          {actionDialog.type === "approve" ? "Approve Application" : "Reject Application"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            Are you sure you want to {actionDialog.type === "approve" ? "approve" : "reject"} this application?
          </Typography>
          {actionDialog.type === "reject" && (
            <TextField
              label="Rejection Reason"
              fullWidth
              multiline
              rows={3}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setActionDialog({ open: false, type: null })} sx={{ color: "#64748B" }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            sx={{
              bgcolor: actionDialog.type === "approve" ? "#15803D" : "#EF4444",
              "&:hover": {
                bgcolor: actionDialog.type === "approve" ? "#10B981" : "#DC2626",
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
