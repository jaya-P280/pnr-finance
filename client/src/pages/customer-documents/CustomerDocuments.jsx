import React, { useState, useEffect, useMemo } from "react";
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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  Search as SearchIcon,
  Description as DocIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
  VerifiedUser as VerifiedIcon,
  HourglassEmpty as PendingIcon,
  FolderSpecial as DossierIcon,
  FolderOff as MissingIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import customerDocumentService from "../../services/customerDocument.service";
import customerDocumentsService from "../../services/customerDocuments.service";
import documentSlotsService from "../../services/documentSlots.service";
import branchService from "../../services/branch.service";
import useAuth from "../../hooks/useAuth";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const resolveFileUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://localhost:5000/") || url.startsWith("http://127.0.0.1:5000/")) {
    return url.replace(/^http:\/\/(localhost|127\.0\.0\.1):5000/, "");
  }
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return url.startsWith("/") ? url : `/${url}`;
};

export default function CustomerDocuments() {
  const { user } = useAuth();
  const roleName = (user?.role_name || user?.role || "").toUpperCase();
  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(roleName);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <SectionPage
      title="Customer Documents & Verification Hub"
      subtitle="Review customer uploads, verify eKYC parameters, and configure required document slots."
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Customer Uploaded Documents" sx={{ fontWeight: 700 }} />
          <Tab label="eKYC Verification Queue" sx={{ fontWeight: 700 }} />
          {isAdmin && (
            <Tab
              label="Document Slots & Headings (Admin)"
              sx={{ fontWeight: 700 }}
            />
          )}
        </Tabs>
      </Box>

      {activeTab === 0 && <UploadedDocumentsSection />}
      {activeTab === 1 && <KycVerificationSection />}
      {activeTab === 2 && isAdmin && <DocumentSlotsConfigSection />}
    </SectionPage>
  );
}

/* ==========================================================================
   1. UPLOADED CUSTOMER DOCUMENTS (FOR APPROVER ROLES: ADMIN, BM, FIELD OFFICER)
   ========================================================================== */
function UploadedDocumentsSection() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [previewDoc, setPreviewDoc] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const queryClient = useQueryClient();

  const queryParams = {
    search: search.trim() || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  };

  const docsQuery = useQuery({
    queryKey: ["customerUploadedDocuments", queryParams],
    queryFn: () => customerDocumentsService.getAll(queryParams),
  });

  const slotsQuery = useQuery({
    queryKey: ["documentSlotsActive"],
    queryFn: () => documentSlotsService.getAll({ is_active: true }),
  });

  const invalidateDocs = () => {
    queryClient.invalidateQueries({ queryKey: ["customerUploadedDocuments"] });
  };

  const documents = docsQuery.data?.data?.data || docsQuery.data?.data || [];
  const allSlots = slotsQuery.data?.data?.data || slotsQuery.data?.data || [];

  const handleVerify = async (docId) => {
    try {
      await customerDocumentsService.verify(docId);
      toast.success("Document marked as verified.");
      invalidateDocs();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to verify document."));
    }
  };

  const handleReject = async () => {
    if (!rejectDialog?.docId) return;
    try {
      await customerDocumentsService.reject(rejectDialog.docId, {
        reason: rejectReason || "Document does not meet requirements",
      });
      toast.success("Document rejected.");
      setRejectDialog(null);
      setRejectReason("");
      invalidateDocs();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reject document."));
    }
  };

  // Group all customer document uploads by customer
  const customerRequests = useMemo(() => {
    const map = new Map();
    for (const doc of documents) {
      const custId = doc.customerId || doc.customer_id;
      if (!custId) continue;
      if (!map.has(custId)) {
        map.set(custId, {
          customerId: custId,
          customerName:
            `${doc.first_name || doc.customerFirstName || ""} ${doc.last_name || doc.customerLastName || ""}`.trim() ||
            doc.customerName ||
            "Customer",
          customerCode: doc.customer_code || doc.customerCode || "CUST",
          customerMobile: doc.mobile_number || doc.customerMobile || "N/A",
          branchName: doc.branchName || doc.branch_name || "Head Office",
          applicationNumber: doc.applicationNumber || doc.application_number || null,
          latestUpload: doc.created_at || doc.uploadedAt || doc.uploaded_at,
          documents: [],
        });
      }
      const entry = map.get(custId);
      entry.documents.push(doc);
      const docDate = new Date(doc.created_at || doc.uploadedAt || doc.uploaded_at || Date.now());
      if (!entry.latestUpload || docDate > new Date(entry.latestUpload)) {
        entry.latestUpload = doc.created_at || doc.uploadedAt || doc.uploaded_at;
      }
    }

    return Array.from(map.values()).map((customer) => {
      // Find missing slots for this customer
      const uploadedSlotCodes = new Set(
        customer.documents.map((d) =>
          (d.documentTypeCode || d.document_type_code || d.type_code || "").toUpperCase()
        )
      );

      const notUploadedSlots = allSlots.filter(
        (slot) => !uploadedSlotCodes.has((slot.code || slot.document_type_code || "").toUpperCase())
      );

      const hasPending = customer.documents.some(
        (d) => (d.status || d.verification_status || "PENDING").toUpperCase() === "PENDING"
      );
      const hasRejected = customer.documents.some(
        (d) => (d.status || d.verification_status || "").toUpperCase() === "REJECTED"
      );
      const allVerified =
        customer.documents.length > 0 &&
        customer.documents.every(
          (d) => (d.status || d.verification_status || "").toUpperCase() === "VERIFIED"
        );

      let overallStatus = "PENDING";
      if (hasPending) {
        overallStatus = "PENDING";
      } else if (hasRejected) {
        overallStatus = "REJECTED";
      } else if (allVerified) {
        overallStatus = "VERIFIED";
      }

      return {
        ...customer,
        notUploadedSlots,
        overallStatus,
      };
    });
  }, [documents, allSlots]);

  // Keep selectedCustomer synchronized when documents query refetches
  useEffect(() => {
    if (selectedCustomer) {
      const updated = customerRequests.find((c) => c.customerId === selectedCustomer.customerId);
      if (updated) {
        setSelectedCustomer(updated);
      }
    }
  }, [customerRequests]);

  const filteredRequests = useMemo(() => {
    return customerRequests.filter((c) => {
      if (statusFilter !== "ALL" && c.overallStatus !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = c.customerName.toLowerCase().includes(q);
        const matchCode = c.customerCode.toLowerCase().includes(q);
        const matchPhone = c.customerMobile.toLowerCase().includes(q);
        const matchBranch = c.branchName.toLowerCase().includes(q);
        const matchDoc = c.documents.some((d) =>
          (d.fileName || d.file_name || d.documentTitle || d.slotTitle || "").toLowerCase().includes(q)
        );
        return matchName || matchCode || matchPhone || matchBranch || matchDoc;
      }
      return true;
    });
  }, [customerRequests, statusFilter, search]);

  const isPdfFile = (doc) => {
    const url = (doc?.file_url || doc?.fileUrl || "").toLowerCase();
    const mime = (doc?.mime_type || doc?.mimeType || "").toLowerCase();
    if (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png") || url.endsWith(".webp")) {
      return false;
    }
    if (mime.startsWith("image/")) {
      return false;
    }
    return url.endsWith(".pdf") || mime === "application/pdf";
  };

  return (
    <Box>
      {/* Filter Bar */}
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by customer name, phone, code, branch, or document..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="PENDING">Pending Review</MenuItem>
            <MenuItem value="VERIFIED">Verified</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </TextField>
          <Button
            variant="contained"
            onClick={() => invalidateDocs()}
            sx={{ bgcolor: "#0F766E", minWidth: 100 }}
          >
            Filter
          </Button>
        </Stack>
      </Paper>

      {/* Table: Grouped by Customer */}
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, overflow: "hidden" }}>
        {docsQuery.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : docsQuery.isError ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="error">Failed to load uploaded documents.</Alert>
          </Box>
        ) : filteredRequests.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No customer document requests found matching filters.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Uploaded Documents</TableCell>
                  <TableCell>Not Uploaded (Missing)</TableCell>
                  <TableCell>Latest Uploaded</TableCell>
                  <TableCell>Overall Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((customer) => {
                  const createdDate = new Date(
                    customer.latestUpload || Date.now()
                  ).toLocaleDateString();

                  return (
                    <TableRow key={customer.customerId} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {customer.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Code: {customer.customerCode} • Ph: {customer.customerMobile}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{customer.branchName}</Typography>
                        {customer.applicationNumber && (
                          <Typography variant="caption" color="text.secondary">
                            App: {customer.applicationNumber}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Chip
                            label={`${customer.documents.length} Uploaded`}
                            size="small"
                            color="info"
                            sx={{ fontWeight: 700, width: "fit-content" }}
                          />
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {customer.documents.slice(0, 2).map((d) => (
                              <Chip
                                key={d.id || d.documentId}
                                label={d.slotTitle || d.document_type_title || d.documentTypeCode || "Document"}
                                size="small"
                                sx={{ height: 18, fontSize: "0.65rem", bgcolor: "#F1F5F9" }}
                              />
                            ))}
                            {customer.documents.length > 2 && (
                              <Chip
                                label={`+${customer.documents.length - 2} more`}
                                size="small"
                                sx={{ height: 18, fontSize: "0.65rem", bgcolor: "#E2E8F0" }}
                              />
                            )}
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {customer.notUploadedSlots.length === 0 ? (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                            label="All Uploaded"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        ) : (
                          <Tooltip
                            title={customer.notUploadedSlots.map((s) => s.title || s.code).join(", ")}
                          >
                            <Chip
                              icon={<MissingIcon sx={{ fontSize: 14 }} />}
                              label={`${customer.notUploadedSlots.length} Missing`}
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ fontWeight: 700 }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {createdDate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            customer.overallStatus === "VERIFIED"
                              ? "All Verified"
                              : customer.overallStatus === "REJECTED"
                              ? "Has Rejections"
                              : "Pending Review"
                          }
                          size="small"
                          color={
                            customer.overallStatus === "VERIFIED"
                              ? "success"
                              : customer.overallStatus === "REJECTED"
                              ? "error"
                              : "warning"
                          }
                          icon={
                            customer.overallStatus === "VERIFIED" ? (
                              <CheckCircleIcon sx={{ fontSize: 14 }} />
                            ) : customer.overallStatus === "REJECTED" ? (
                              <CancelIcon sx={{ fontSize: 14 }} />
                            ) : (
                              <PendingIcon sx={{ fontSize: 14 }} />
                            )
                          }
                          sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<DossierIcon />}
                          onClick={() => setSelectedCustomer(customer)}
                          sx={{
                            whiteSpace: "nowrap",
                            textTransform: "none",
                            fontWeight: 700,
                            bgcolor: "#0F766E",
                            "&:hover": { bgcolor: "#0D655E" },
                          }}
                        >
                          Review Documents
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

      {/* =====================================================================
          CUSTOMER DOSSIER DIALOG (ALL UPLOADED AND NOT UPLOADED DOCUMENTS)
          ===================================================================== */}
      <Dialog
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2.5, bgcolor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <DossierIcon sx={{ color: "#0F766E", fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" fontWeight={800} color="#0F172A">
                    Customer Documents Dossier: {selectedCustomer?.customerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Code: <b>{selectedCustomer?.customerCode}</b> • Branch: <b>{selectedCustomer?.branchName}</b> • Mobile: <b>{selectedCustomer?.customerMobile}</b>
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <IconButton size="small" onClick={() => setSelectedCustomer(null)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* Quick Stats Bar */}
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }} flexWrap="wrap">
            <Chip
              label={`Total Uploaded: ${selectedCustomer?.documents?.length || 0}`}
              size="small"
              color="primary"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
              label={`Verified: ${selectedCustomer?.documents?.filter((d) => (d.status || d.verification_status) === "VERIFIED").length || 0}`}
              size="small"
              color="success"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              icon={<PendingIcon sx={{ fontSize: 14 }} />}
              label={`Pending: ${selectedCustomer?.documents?.filter((d) => (d.status || d.verification_status) === "PENDING").length || 0}`}
              size="small"
              color="warning"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              icon={<MissingIcon sx={{ fontSize: 14 }} />}
              label={`Not Uploaded: ${selectedCustomer?.notUploadedSlots?.length || 0}`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={4}>
            {/* 1. UPLOADED DOCUMENTS SECTION */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                  1. Uploaded Documents ({selectedCustomer?.documents?.length || 0})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Review and verify customer submitted documents
                </Typography>
              </Stack>

              {selectedCustomer?.documents?.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: "center", bgcolor: "#F8FAFC", borderRadius: 2 }}>
                  <Typography color="text.secondary">No documents uploaded by this customer yet.</Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {selectedCustomer?.documents?.map((doc, idx) => {
                    const docId = doc.id || doc.documentId || doc.document_id;
                    const slotTitle =
                      doc.document_type_title ||
                      doc.slotTitle ||
                      doc.type_name ||
                      doc.documentTitle ||
                      doc.document_type_code ||
                      "Document";
                    const slotCategory = doc.type_category || doc.slotCategory || "GENERAL";
                    const fileName = doc.original_name || doc.file_name || doc.fileName || "Document";
                    const fileUrl = doc.file_url || doc.fileUrl;
                    const status = (doc.verification_status || doc.status || "PENDING").toUpperCase();
                    const createdDate = new Date(
                      doc.created_at || doc.uploadedAt || doc.uploaded_at || Date.now()
                    ).toLocaleDateString();

                    return (
                      <Grid item xs={12} md={6} key={docId || idx}>
                        <Card
                          variant="outlined"
                          sx={{
                            borderRadius: 2.5,
                            border: "1px solid",
                            borderColor: status === "VERIFIED" ? "#BBF7D0" : status === "REJECTED" ? "#FECACA" : "#E2E8F0",
                            bgcolor: status === "VERIFIED" ? "#F0FDF4" : status === "REJECTED" ? "#FEF2F2" : "#FFFFFF",
                            transition: "box-shadow 0.2s",
                            "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.06)" },
                          }}
                        >
                          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                            <Stack spacing={1.5}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                  <DocIcon sx={{ color: "#0F766E", fontSize: 24 }} />
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight={800}>
                                      {slotTitle}
                                    </Typography>
                                    <Chip
                                      label={slotCategory}
                                      size="small"
                                      sx={{ height: 18, fontSize: "0.65rem", bgcolor: "#F1F5F9" }}
                                    />
                                  </Box>
                                </Stack>
                                <Chip
                                  label={status}
                                  size="small"
                                  color={
                                    status === "VERIFIED"
                                      ? "success"
                                      : status === "REJECTED"
                                      ? "error"
                                      : "warning"
                                  }
                                  sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                                />
                              </Stack>

                              <Divider />

                              <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  File: <b>{fileName}</b>
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Uploaded On: {createdDate}
                                </Typography>
                                {doc.rejection_reason && (
                                  <Alert severity="error" sx={{ py: 0.5, px: 1.5, fontSize: "0.75rem" }}>
                                    Reason: {doc.rejection_reason}
                                  </Alert>
                                )}
                              </Stack>

                              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 0.5 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<ViewIcon />}
                                  onClick={() =>
                                    setPreviewDoc({
                                      ...doc,
                                      file_url: fileUrl,
                                      fileUrl,
                                      fileName,
                                      original_name: fileName,
                                      document_type_title: slotTitle,
                                    })
                                  }
                                  sx={{ textTransform: "none", fontWeight: 700 }}
                                >
                                  View
                                </Button>
                                {status !== "VERIFIED" && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircleIcon />}
                                    onClick={() => handleVerify(docId)}
                                    sx={{ textTransform: "none", fontWeight: 700 }}
                                  >
                                    Verify
                                  </Button>
                                )}
                                {status !== "REJECTED" && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    startIcon={<CancelIcon />}
                                    onClick={() => {
                                      setRejectDialog({ docId });
                                      setRejectReason("");
                                    }}
                                    sx={{ textTransform: "none", fontWeight: 700 }}
                                  >
                                    Reject
                                  </Button>
                                )}
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>

            <Divider />

            {/* 2. NOT UPLOADED DOCUMENTS SECTION */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                  2. Not Uploaded Documents ({selectedCustomer?.notUploadedSlots?.length || 0})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Document slots required or configured that the customer has not yet provided
                </Typography>
              </Stack>

              {selectedCustomer?.notUploadedSlots?.length === 0 ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  All required and configured document slots have been uploaded for this customer!
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {selectedCustomer?.notUploadedSlots?.map((slot) => (
                    <Grid item xs={12} md={6} key={slot.id || slot.code}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 2.5,
                          border: "1px dashed #CBD5E1",
                          bgcolor: "#F8FAFC",
                        }}
                      >
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Stack spacing={1.5}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <MissingIcon sx={{ color: "#94A3B8", fontSize: 24 }} />
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={800} color="#475569">
                                    {slot.title}
                                  </Typography>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                      label={slot.code}
                                      size="small"
                                      sx={{ height: 18, fontSize: "0.65rem", bgcolor: "#E2E8F0" }}
                                    />
                                    <Chip
                                      label={slot.category || "GENERAL"}
                                      size="small"
                                      sx={{ height: 18, fontSize: "0.65rem", bgcolor: "#F1F5F9" }}
                                    />
                                  </Stack>
                                </Box>
                              </Stack>
                              <Chip
                                label={slot.is_required_for_loan ? "Required for Loan" : "Optional"}
                                size="small"
                                color={slot.is_required_for_loan ? "error" : "default"}
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                              />
                            </Stack>

                            <Divider />

                            <Typography variant="caption" color="text.secondary">
                              {slot.description || "No specific instructions provided."}
                            </Typography>

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Chip
                                label="Not Uploaded"
                                size="small"
                                variant="outlined"
                                sx={{ height: 22, fontSize: "0.7rem", color: "#64748B" }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                Awaiting customer submission
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}>
          <Button variant="outlined" onClick={() => setSelectedCustomer(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* DOCUMENT FILE PREVIEW DIALOG */}
      <Dialog
        open={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {previewDoc?.document_type_title ||
                previewDoc?.slotTitle ||
                previewDoc?.type_name ||
                previewDoc?.document_type_code ||
                "Document Preview"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              File: {previewDoc?.fileName || previewDoc?.original_name || previewDoc?.file_name || "Document"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {(previewDoc?.file_url || previewDoc?.fileUrl) && (
              <>
                <Tooltip title="Open in new tab">
                  <IconButton
                    component="a"
                    href={resolveFileUrl(previewDoc.file_url || previewDoc.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    size="small"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download file">
                  <IconButton
                    component="a"
                    href={resolveFileUrl(previewDoc.file_url || previewDoc.fileUrl)}
                    download={previewDoc?.fileName || previewDoc?.original_name || previewDoc?.file_name || "document"}
                    target="_blank"
                    rel="noreferrer"
                    size="small"
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <IconButton size="small" onClick={() => setPreviewDoc(null)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2, textAlign: "center", bgcolor: "#F1F5F9", minHeight: 400 }}>
          {previewDoc?.file_url || previewDoc?.fileUrl ? (
            isPdfFile(previewDoc) ? (
              <Box sx={{ width: "100%", height: "600px" }}>
                <iframe
                  title="Document PDF"
                  src={resolveFileUrl(previewDoc.file_url || previewDoc.fileUrl)}
                  style={{ width: "100%", height: "100%", border: "none", borderRadius: 4 }}
                />
              </Box>
            ) : (
              <img
                src={resolveFileUrl(previewDoc.file_url || previewDoc.fileUrl)}
                alt="Document Preview"
                style={{ maxWidth: "100%", maxHeight: "600px", objectFit: "contain", borderRadius: 4 }}
              />
            )
          ) : (
            <Typography color="text.secondary">No preview file available.</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* REJECT DOCUMENT REASON DIALOG */}
      <Dialog
        open={Boolean(rejectDialog)}
        onClose={() => setRejectDialog(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Reject Document</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide the rejection remarks so the customer can upload the corrected document.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Rejection Reason"
            placeholder="e.g. Blurred document, first page missing, unreadable passbook"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={!rejectReason.trim()}
            onClick={handleReject}
          >
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ==========================================================================
   2. DYNAMIC DOCUMENT SLOTS CONFIGURATION (ADMIN FEATURE)
   ========================================================================== */
function DocumentSlotsConfigSection() {
  const [slotModal, setSlotModal] = useState(null); // { mode: "create" | "edit", slot: {...} }
  const [form, setForm] = useState({
    code: "",
    title: "",
    category: "GENERAL",
    description: "",
    is_mandatory: false,
    is_active: true,
  });

  const queryClient = useQueryClient();

  const slotsQuery = useQuery({
    queryKey: ["documentSlots"],
    queryFn: () => documentSlotsService.getAll(),
  });

  const invalidateSlots = () => {
    queryClient.invalidateQueries({ queryKey: ["documentSlots"] });
  };

  const openCreate = () => {
    setForm({
      code: "",
      title: "",
      category: "GENERAL",
      description: "",
      is_mandatory: false,
      is_active: true,
    });
    setSlotModal({ mode: "create" });
  };

  const openEdit = (slot) => {
    setForm({
      code: slot.code,
      title: slot.title,
      category: slot.category || "GENERAL",
      description: slot.description || "",
      is_mandatory: Boolean(slot.is_mandatory),
      is_active: slot.is_active !== false && slot.is_active !== 0,
    });
    setSlotModal({ mode: "edit", slot });
  };

  const handleTitleChange = (val) => {
    const autoCode = val
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .replace(/\s+/g, "_");
    setForm((f) => ({
      ...f,
      title: val,
      code: slotModal?.mode === "create" ? autoCode : f.code,
    }));
  };

  const handleSaveSlot = async () => {
    if (!form.title.trim() || !form.code.trim()) {
      toast.error("Please provide both Slot Heading/Title and Code.");
      return;
    }

    try {
      if (slotModal.mode === "create") {
        await documentSlotsService.create(form);
        toast.success("New document slot created successfully!");
      } else {
        await documentSlotsService.update(slotModal.slot.id, form);
        toast.success("Document slot updated successfully!");
      }
      setSlotModal(null);
      invalidateSlots();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save document slot."));
    }
  };

  const handleDeleteSlot = async (slotId, slotCode) => {
    if (["LOAN_AGREEMENT", "BANK_BOOK"].includes(slotCode)) {
      toast.error("Core system slots (Bank Book, Loan Agreement) cannot be deleted.");
      return;
    }

    if (!window.confirm("Are you sure you want to remove this document slot? Customers will no longer see this upload requirement.")) {
      return;
    }

    try {
      await documentSlotsService.delete(slotId);
      toast.success("Document slot removed.");
      invalidateSlots();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete document slot."));
    }
  };

  const slots = slotsQuery.data?.data?.data || slotsQuery.data?.data || [];

  return (
    <Box>
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, p: 3, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#0F172A">
              Dynamic Document Slots & Heading Configuration
            </Typography>
            <Typography variant="body2" color="#64748B">
              Add new document requirements, change slot headings, set mandatory flags, and control what documents customers must upload.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{ bgcolor: "#0F766E", fontWeight: 700, borderRadius: 2 }}
          >
            Add Document Slot
          </Button>
        </Stack>
      </Paper>

      {/* Slots Table */}
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, overflow: "hidden" }}>
        {slotsQuery.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : slotsQuery.isError ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="error">Unable to load document slots.</Alert>
          </Box>
        ) : slots.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No document slots configured yet.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell>Slot Heading / Title</TableCell>
                  <TableCell>Slot Code</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description / Guidance</TableCell>
                  <TableCell>Mandatory</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {slots.map((slot) => (
                  <TableRow key={slot.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <DocIcon sx={{ color: "#0F766E" }} />
                        <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                          {slot.title}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={slot.code} size="small" sx={{ fontFamily: "monospace", fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={slot.category || "GENERAL"} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {slot.description || "No description provided."}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {slot.is_mandatory ? (
                        <Chip label="Compulsory" size="small" color="error" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />
                      ) : (
                        <Chip label="Optional" size="small" color="default" sx={{ fontWeight: 600, fontSize: "0.7rem" }} />
                      )}
                    </TableCell>
                    <TableCell>
                      {slot.is_active !== false && slot.is_active !== 0 ? (
                        <Chip label="Active" size="small" color="success" sx={{ fontWeight: 700 }} />
                      ) : (
                        <Chip label="Inactive" size="small" color="default" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                        <IconButton size="small" color="primary" onClick={() => openEdit(slot)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {!["LOAN_AGREEMENT", "BANK_BOOK"].includes(slot.code) && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteSlot(slot.id, slot.code)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* CREATE / EDIT SLOT DIALOG */}
      <Dialog
        open={Boolean(slotModal)}
        onClose={() => setSlotModal(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2.5, bgcolor: "#0F766E", color: "#FFFFFF" }}>
          <Typography variant="h6" fontWeight={800}>
            {slotModal?.mode === "create" ? "Add New Document Slot" : "Edit Document Slot"}
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              required
              fullWidth
              label="Document Slot Heading / Title"
              placeholder="e.g. Electricity Bill (Past 3 Months), Property Tax Receipt"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              helperText="The clear title shown to the customer in the upload portal."
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Slot System Code"
                  placeholder="e.g. ELECTRICITY_BILL"
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                    }))
                  }
                  disabled={slotModal?.mode === "edit"}
                  helperText="Unique uppercase identifier."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  <MenuItem value="BANKING">Banking & Finance</MenuItem>
                  <MenuItem value="LEGAL">Legal & Contracts</MenuItem>
                  <MenuItem value="IDENTITY">Identity Verification</MenuItem>
                  <MenuItem value="ADDRESS">Address Proof</MenuItem>
                  <MenuItem value="INCOME">Income & Earnings</MenuItem>
                  <MenuItem value="COLLATERAL">Collateral & Property</MenuItem>
                  <MenuItem value="GENERAL">General / Other</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Description & Instructions for Customer"
              placeholder="e.g. Please upload latest bill showing meter number and applicant name clearly."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />

            <Stack direction="row" spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_mandatory}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_mandatory: e.target.checked }))
                    }
                    color="error"
                  />
                }
                label="Mandatory (Customer must upload)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_active: e.target.checked }))
                    }
                    color="success"
                  />
                }
                label="Active in Portal"
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSlotModal(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveSlot}
            sx={{ bgcolor: "#0F766E", fontWeight: 700 }}
          >
            {slotModal?.mode === "create" ? "Create Slot" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ==========================================================================
   3. eKYC VERIFICATION QUEUE (EXISTING SECTION PRESERVED)
   ========================================================================== */
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
            <MenuItem value="">All Branches</MenuItem>
            {branches.map((b) => (
              <MenuItem key={b.branch_id} value={String(b.branch_id)}>
                {b.branch_name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Verification Queue Table */}
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
            <Alert severity="error">
              Unable to load KYC verification queue.
            </Alert>
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">
              No customers found matching the search/filter criteria.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Customer Code</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Mobile Number</TableCell>
                  <TableCell>Aadhaar Status</TableCell>
                  <TableCell>PAN Status</TableCell>
                  <TableCell>KYC Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.customer_id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {row.first_name} {row.last_name}
                    </TableCell>
                    <TableCell>{row.customer_code}</TableCell>
                    <TableCell>{row.branch_name}</TableCell>
                    <TableCell>{row.mobile_number}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          row.aadhaar_verified === 1
                            ? "Verified"
                            : row.aadhaar_number
                            ? "Provided"
                            : "Missing"
                        }
                        color={
                          row.aadhaar_verified === 1
                            ? "success"
                            : row.aadhaar_number
                            ? "info"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          row.pan_verified === 1
                            ? "Verified"
                            : row.pan_number
                            ? "Provided"
                            : "Missing"
                        }
                        color={
                          row.pan_verified === 1
                            ? "success"
                            : row.pan_number
                            ? "info"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.kyc_status}
                        color={
                          row.kyc_status === "VERIFIED"
                            ? "success"
                            : row.kyc_status === "REJECTED"
                            ? "error"
                            : "warning"
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openView(row)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Review Modal */}
      <Dialog
        open={Boolean(viewItem)}
        onClose={() => setViewCustomerId(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          KYC Review: {viewItem?.first_name} {viewItem?.last_name}
        </DialogTitle>
        <DialogContent dividers>
          {viewItem && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Customer Code
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewItem.customer_code}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Contact Information
                </Typography>
                <Typography variant="body2">
                  Phone: {viewItem.mobile_number} | Email:{" "}
                  {viewItem.email || "N/A"}
                </Typography>
                <Typography variant="body2">
                  Address: {viewItem.address || "N/A"}, {viewItem.city || ""},{" "}
                  {viewItem.state || ""} - {viewItem.pincode || ""}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Identity Documents
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    Aadhaar: <b>{viewItem.aadhaar_number || "Not Provided"}</b>
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
