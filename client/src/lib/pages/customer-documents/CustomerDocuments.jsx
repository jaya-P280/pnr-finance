import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  MenuItem,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import customerDocumentService from "../../services/customerDocument.service";
import branchService from "../../services/branch.service";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function CustomerDocuments() {
  return (
    <SectionPage
      title="Customer eKYC Verification"
      subtitle="Manage, review, verify, and approve customer eKYC identity details."
    >
      <KycVerificationSection />
    </SectionPage>
  );
}

function KycVerificationSection() {
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("");
  const [viewCustomerId, setViewCustomerId] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [confirmReject, setConfirmReject] = useState(false);

  const queryClient = useQueryClient();

  const branchesQuery = useQuery({
    queryKey: ["branches", "picker"],
    queryFn: () => branchService.getAll({ limit: 100, status: "ACTIVE" }),
  });

  const queryParams = {
    status: selectedStatus === "ALL" ? "" : selectedStatus,
    branchId,
    search,
  };

  const queueQuery = useQuery({
    queryKey: ["kycQueue", queryParams],
    queryFn: () => customerDocumentService.getKycQueue(queryParams),
  });

  const invalidateQueue = () => {
    queryClient.invalidateQueries({ queryKey: ["kycQueue"] });
  };

  const verifyKyc = useMutation({
    mutationFn: (customerId) =>
      customerDocumentService.verifyKyc(customerId),
    onSuccess: () => {
      toast.success("eKYC verified successfully.");
      setViewCustomerId(null);
      invalidateQueue();
    },
    onError: (e) =>
      toast.error(getErrorMessage(e, "Unable to verify eKYC.")),
  });

  const rejectKyc = useMutation({
    mutationFn: ({ customerId, remarks }) =>
      customerDocumentService.rejectKyc(customerId, remarks),
    onSuccess: () => {
      toast.success("eKYC rejected.");
      setViewCustomerId(null);
      setConfirmReject(false);
      invalidateQueue();
    },
    onError: (e) => toast.error(getErrorMessage(e, "Unable to reject eKYC.")),
  });

  const rows = queueQuery.data?.rows || [];
  const branches = branchesQuery.data?.branches || [];
  const viewItem =
    rows.find((row) => row.customer_id === viewCustomerId) || null;

  const openView = (item) => {
    setRemarks("");
    setConfirmReject(false);
    setViewCustomerId(item.customer_id);
  };

  return (
    <Box>
      {/* Filter Bar */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid #E2E8F0", borderRadius: 3, p: 2, mb: 3 }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search customer by name, code, or mobile…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
              },
            }}
          />
          <TextField
            select
            size="small"
            sx={{ minWidth: 200 }}
            label="Verification Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="PENDING">PENDING</MenuItem>
            <MenuItem value="VERIFIED">VERIFIED / APPROVED</MenuItem>
            <MenuItem value="REJECTED">REJECTED</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            sx={{ minWidth: 200 }}
            label="Branch"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
          >
            <MenuItem value="">All branches</MenuItem>
            {branches.map((b) => (
              <MenuItem key={b.branch_id} value={String(b.branch_id)}>
                {b.branch_name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {queueQuery.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : queueQuery.isError ? (
          <Box sx={{ p: 6 }}>
            <Alert severity="error">Unable to load the eKYC queue.</Alert>
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No records in this queue.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell fontWeight="bold">eKYC Verification Status</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Aadhaar Number</TableCell>
                  <TableCell>PAN Number</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((item) => {
                  const kycStatusLabel = item.kyc_status || "PENDING";
                  const chipColor =
                    kycStatusLabel === "VERIFIED"
                      ? "success"
                      : kycStatusLabel === "REJECTED"
                      ? "error"
                      : "warning";

                  return (
                    <TableRow key={item.customer_id}>
                      <TableCell>
                        <Chip
                          label={kycStatusLabel}
                          color={chipColor}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600} variant="body2">
                          {`${item.first_name || ""} ${item.last_name || ""}`.trim()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.customer_code} • {item.mobile_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {item.aadhaar_number ? (
                          <Chip
                            size="small"
                            label={item.aadhaar_number}
                            color={item.aadhaar_verified ? "success" : "default"}
                          />
                        ) : (
                          "Not provided"
                        )}
                      </TableCell>
                      <TableCell>
                        {item.pan_number ? (
                          <Chip
                            size="small"
                            label={item.pan_number}
                            color={item.pan_verified ? "success" : "default"}
                          />
                        ) : (
                          "Not provided"
                        )}
                      </TableCell>
                      <TableCell>{item.branch_name}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openView(item)}
                        >
                          Review & Verify
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Review Dialog */}
      <Dialog
        open={Boolean(viewItem)}
        onClose={() => setViewCustomerId(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Review Customer eKYC Verification</DialogTitle>
        <DialogContent>
          {viewItem && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Customer Information
                </Typography>
                <Typography variant="h6">
                  {viewItem.first_name} {viewItem.last_name} ({viewItem.customer_code})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mobile: {viewItem.mobile_number} • Branch: {viewItem.branch_name}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Identity Details (Stored in customer_kyc)
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    Aadhaar Number: <b>{viewItem.aadhaar_number || "Not Provided"}</b>
                  </Typography>
                  {viewItem.aadhaar_verified === 1 && (
                    <Chip size="small" label="Verified" color="success" />
                  )}
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Typography variant="body2">
                    PAN Number: <b>{viewItem.pan_number || "Not Provided"}</b>
                  </Typography>
                  {viewItem.pan_verified === 1 && (
                    <Chip size="small" label="Verified" color="success" />
                  )}
                </Stack>
              </Box>

              <Divider />

              {confirmReject ? (
                <Stack spacing={1}>
                  <Alert severity="warning">
                    Specify the reason for rejecting this customer's eKYC verification:
                  </Alert>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Rejection Remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </Stack>
              ) : (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Status: <b>{viewItem.kyc_status || "PENDING"}</b>
                  </Typography>
                  {viewItem.remarks && (
                    <Typography variant="body2" color="error">
                      Remarks: {viewItem.remarks}
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewCustomerId(null)}>Close</Button>

          {confirmReject ? (
            <>
              <Button onClick={() => setConfirmReject(false)}>Back</Button>
              <Button
                color="error"
                variant="contained"
                disabled={rejectKyc.isPending || !remarks.trim()}
                onClick={() =>
                  rejectKyc.mutate({
                    customerId: viewItem.customer_id,
                    remarks,
                  })
                }
              >
                Confirm Rejection
              </Button>
            </>
          ) : (
            <>
              {viewItem?.kyc_status !== "REJECTED" && (
                <Button
                  color="error"
                  onClick={() => setConfirmReject(true)}
                >
                  Reject
                </Button>
              )}
              {viewItem?.kyc_status !== "VERIFIED" && (
                <Button
                  color="success"
                  variant="contained"
                  disabled={verifyKyc.isPending}
                  onClick={() => verifyKyc.mutate(viewItem.customer_id)}
                >
                  Approve & Verify
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
