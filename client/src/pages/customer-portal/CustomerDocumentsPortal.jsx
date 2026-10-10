import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Description as DocIcon,
  AccountBalance as BankIcon,
  VerifiedUser as VerifiedIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  CloudUpload as UploadIcon,
  Print as PrintIcon,
  Visibility as ViewIcon,
  DeleteOutline as DeleteIcon,
  Gavel as ContractIcon,
  WarningAmber as WarningIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { customerPortalApi } from "../../api/customer.api";
import documentSlotsService from "../../services/documentSlots.service";

export default function CustomerDocumentsPortal() {
  const [documents, setDocuments] = useState([]);
  const [documentSlots, setDocumentSlots] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Contract dialog state
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [contractData, setContractData] = useState(null);
  const [loadingContract, setLoadingContract] = useState(false);

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [docsRes, slotsRes, appsRes] = await Promise.allSettled([
        customerPortalApi.getMyDocuments(),
        documentSlotsService.getAll({ is_active: true }),
        customerPortalApi.getMyApplications(),
      ]);

      if (docsRes.status === "fulfilled") {
        const d = docsRes.value?.data?.data || docsRes.value?.data || [];
        setDocuments(Array.isArray(d) ? d : []);
      }

      if (slotsRes.status === "fulfilled") {
        const s = slotsRes.value?.data?.data || slotsRes.value?.data || [];
        setDocumentSlots(Array.isArray(s) ? s : []);
      }

      if (appsRes.status === "fulfilled") {
        const a =
          appsRes.value?.data?.data?.applications ||
          appsRes.value?.data?.data ||
          appsRes.value?.data ||
          [];
        setApplications(Array.isArray(a) ? a : []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load document records.");
    } finally {
      setLoading(false);
    }
  };

  const reloadDocuments = async () => {
    try {
      const res = await customerPortalApi.getMyDocuments();
      const d = res?.data?.data || res?.data || [];
      setDocuments(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err);
    }
  };

  // Find approved or disbursed application for contract
  const approvedApplications = applications.filter((app) => {
    const st = (app.status || app.application_status || "").toUpperCase();
    return st === "APPROVED" || st === "DISBURSED";
  });

  const activeContractApp = approvedApplications[0] || null;

  const handleOpenContract = async (applicationId) => {
    try {
      setLoadingContract(true);
      setContractModalOpen(true);
      const res = await customerPortalApi.getLoanContract(applicationId);
      setContractData(res?.data?.data || null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load contract details."
      );
      setContractModalOpen(false);
    } finally {
      setLoadingContract(false);
    }
  };

  const handlePrintContract = () => {
    window.print();
  };

  const handleFileUpload = async (slotCode, file, applicationId = null) => {
    if (!file) return;

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document", file);
    formData.append("document_type_code", slotCode);
    formData.append("documentTypeCode", slotCode);
    if (applicationId) {
      formData.append("loan_application_id", applicationId);
      formData.append("applicationId", applicationId);
    }

    setUploadingSlot(slotCode);
    try {
      await customerPortalApi.uploadDocument(formData);
      toast.success("Document uploaded successfully for review.");
      await reloadDocuments();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Document upload failed. Please try again."
      );
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to remove this document?")) return;
    try {
      await customerPortalApi.deleteDocument(docId);
      toast.success("Document removed.");
      await reloadDocuments();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete document.");
    }
  };

  const getDocForSlot = (slotCode) => {
    return documents.find(
      (d) =>
        (d.document_type_code || d.documentTypeCode || d.type_code || "").toUpperCase() ===
        slotCode.toUpperCase()
    );
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "VERIFIED") {
      return (
        <Chip
          icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
          label="Verified"
          color="success"
          size="small"
          sx={{ fontWeight: 700 }}
        />
      );
    }
    if (s === "REJECTED") {
      return (
        <Chip
          icon={<RejectedIcon sx={{ fontSize: 16 }} />}
          label="Rejected"
          color="error"
          size="small"
          sx={{ fontWeight: 700 }}
        />
      );
    }
    return (
      <Chip
        icon={<PendingIcon sx={{ fontSize: 16 }} />}
        label="Pending Review"
        color="warning"
        size="small"
        sx={{ fontWeight: 700 }}
      />
    );
  };

  const resolveFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://localhost:5000/") || url.startsWith("http://127.0.0.1:5000/")) {
      return url.replace(/^http:\/\/(localhost|127\.0\.0\.1):5000/, "");
    }
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return url.startsWith("/") ? url : `/${url}`;
  };

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

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const bankBookDoc = getDocForSlot("BANK_BOOK");
  const contractDoc = getDocForSlot("LOAN_AGREEMENT");

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 } }}>
      {/* Header Banner */}
      <Paper
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          mb: 3,
          borderRadius: 3.5,
          background: "linear-gradient(135deg, #065F46 0%, #0D9488 50%, #0284C7 100%)",
          color: "#FFFFFF",
          boxShadow: "0 10px 25px rgba(13, 148, 136, 0.2)",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
          <Box>
            <Typography variant="h4" fontWeight={800} letterSpacing="-0.5px">
              Customer Documents & Contracts
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.8, opacity: 0.9 }}>
              Upload your passbook/bank book, sign approved loan agreements, and submit required verification documents.
            </Typography>
          </Box>
          <Chip
            icon={<VerifiedIcon sx={{ color: "#FFFFFF !important" }} />}
            label="Secure Storage & Bank Grade Encryption"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "#FFFFFF",
              fontWeight: 700,
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.3)",
              alignSelf: { xs: "flex-start", md: "center" },
            }}
          />
        </Stack>
      </Paper>

      {/* 1. APPROVED LOAN CONTRACT SECTION */}
      {activeContractApp ? (
        <Card
          sx={{
            mb: 3.5,
            borderRadius: 3.5,
            border: "2px solid #10B981",
            boxShadow: "0 8px 24px rgba(16, 185, 129, 0.12)",
            background: "linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
              <Box>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
                  <ContractIcon sx={{ color: "#059669", fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={800} color="#065F46">
                    Loan Approved! Action Required: Print, Sign & Upload Contract
                  </Typography>
                </Stack>
                <Typography variant="body2" color="#374151" sx={{ maxWidth: 750 }}>
                  Application <strong>#{activeContractApp.application_number || activeContractApp.id}</strong> ({activeContractApp.product_name || "Personal Loan"}) for <strong>₹{Number(activeContractApp.approved_amount || activeContractApp.applied_amount || 0).toLocaleString()}</strong> has been approved. Please review the official contract terms, print it out, sign the agreement, and upload the signed copy below to initiate loan disbursement.
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: { xs: "100%", md: "auto" }, mt: { xs: 1, md: 0 } }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PrintIcon />}
                  onClick={() => handleOpenContract(activeContractApp.id)}
                  sx={{
                    fontWeight: 700,
                    px: { xs: 2, sm: 3 },
                    py: 1.2,
                    borderRadius: 2.5,
                    bgcolor: "#059669",
                    "&:hover": { bgcolor: "#047857" },
                    whiteSpace: "nowrap",
                    textTransform: "none",
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  View & Print Contract
                </Button>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            {/* Signed Agreement Upload Slot */}
            <Paper sx={{ p: 2.5, borderRadius: 2.5, bgcolor: "#F8FAFC", border: "1px dashed #CBD5E1" }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" } }}>
                <Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                      Signed Loan Agreement (Physical / Digital Copy)
                    </Typography>
                    {contractDoc ? getStatusBadge(contractDoc.verification_status) : (
                      <Chip label="Upload Needed" size="small" color="error" variant="outlined" sx={{ fontWeight: 700 }} />
                    )}
                  </Stack>
                  <Typography variant="caption" color="#64748B" sx={{ display: "block", mt: 0.5 }}>
                    Upload the scanned copy or high-res photo of all pages with your signature and date. PDF, PNG, JPG (Max 10MB).
                  </Typography>
                  {contractDoc?.rejection_reason && (
                    <Alert severity="error" sx={{ mt: 1, py: 0, fontSize: "0.8rem" }}>
                      Rejection Reason: {contractDoc.rejection_reason}
                    </Alert>
                  )}
                </Box>

                <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", md: "auto" }, mt: { xs: 1, md: 0 }, flexShrink: 0 }}>
                  {contractDoc ? (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => setPreviewDoc(contractDoc)}
                        sx={{ whiteSpace: "nowrap", textTransform: "none", fontWeight: 700 }}
                      >
                        View Upload
                      </Button>
                      <label htmlFor="reupload-contract-input">
                        <input
                          id="reupload-contract-input"
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/webp"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(
                              "LOAN_AGREEMENT",
                              e.target.files[0],
                              activeContractApp.id
                            )
                          }
                        />
                        <Button
                          component="span"
                          size="small"
                          variant="contained"
                          disabled={uploadingSlot === "LOAN_AGREEMENT"}
                          sx={{ whiteSpace: "nowrap", textTransform: "none", fontWeight: 700 }}
                        >
                          Re-upload
                        </Button>
                      </label>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteDocument(contractDoc.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <label htmlFor="upload-contract-input" style={{ width: "100%" }}>
                      <input
                        id="upload-contract-input"
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/webp"
                        style={{ display: "none" }}
                        onChange={(e) =>
                          handleFileUpload(
                            "LOAN_AGREEMENT",
                            e.target.files[0],
                            activeContractApp.id
                          )
                        }
                      />
                      <Button
                        component="span"
                        variant="contained"
                        color="primary"
                        startIcon={
                          uploadingSlot === "LOAN_AGREEMENT" ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            <UploadIcon />
                          )
                        }
                        disabled={uploadingSlot === "LOAN_AGREEMENT"}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          whiteSpace: "nowrap",
                          textTransform: "none",
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          px: { xs: 2, sm: 2.5 },
                          py: 1,
                          width: { xs: "100%", sm: "auto" },
                        }}
                      >
                        Upload Signed PDF
                      </Button>
                    </label>
                  )}
                </Stack>
              </Stack>
            </Paper>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info" sx={{ mb: 3.5, borderRadius: 2.5 }}>
          Once your loan application is approved by the branch manager or loan officer, your legally binding Loan Agreement contract with complete repayment schedules and terms will appear here for printing, signing, and upload.
        </Alert>
      )}

      {/* Tabs for Organization */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="All Verification Documents" sx={{ fontWeight: 700 }} />
        <Tab label="Bank Account & Passbook" sx={{ fontWeight: 700 }} />
        <Tab label="Signed Contracts" sx={{ fontWeight: 700 }} />
      </Tabs>

      {/* 2. BANK BOOK SPECIFIC HIGHLIGHT (TAB 1 OR TAB 0) */}
      {(activeTab === 0 || activeTab === 1) && (
        <Card sx={{ mb: 3.5, borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2.5}
              sx={{
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "center" },
              }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: { xs: 44, sm: 52 },
                    height: { xs: 44, sm: 52 },
                    borderRadius: 2.5,
                    bgcolor: "#E0F2FE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0284C7",
                    flexShrink: 0,
                  }}
                >
                  <BankIcon sx={{ fontSize: { xs: 26, sm: 32 } }} />
                </Box>
                <Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
                    <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                      Bank Book / Passbook / Statement
                    </Typography>
                    <Chip label="Required for Disbursement" size="small" color="primary" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />
                    {bankBookDoc && getStatusBadge(bankBookDoc.verification_status)}
                  </Stack>
                  <Typography variant="body2" color="#64748B" sx={{ mt: 0.3, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                    First page of your bank passbook showing Account Number, IFSC, and Name, or last 3 months bank statement.
                  </Typography>
                  {bankBookDoc?.rejection_reason && (
                    <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                      Rejected: {bankBookDoc.rejection_reason}
                    </Alert>
                  )}
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  width: { xs: "100%", md: "auto" },
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                  flexShrink: 0,
                  mt: { xs: 1, md: 0 },
                }}
              >
                {bankBookDoc ? (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => setPreviewDoc(bankBookDoc)}
                      sx={{ whiteSpace: "nowrap", textTransform: "none", fontWeight: 700 }}
                    >
                      View
                    </Button>
                    <label htmlFor="reupload-bankbook">
                      <input
                        id="reupload-bankbook"
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/webp"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileUpload("BANK_BOOK", e.target.files[0])}
                      />
                      <Button
                        component="span"
                        variant="contained"
                        size="small"
                        disabled={uploadingSlot === "BANK_BOOK"}
                        sx={{ whiteSpace: "nowrap", textTransform: "none", fontWeight: 700 }}
                      >
                        Re-upload
                      </Button>
                    </label>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteDocument(bankBookDoc.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <label htmlFor="upload-bankbook" style={{ width: "100%" }}>
                    <input
                      id="upload-bankbook"
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/webp"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileUpload("BANK_BOOK", e.target.files[0])}
                    />
                    <Button
                      component="span"
                      variant="contained"
                      startIcon={
                        uploadingSlot === "BANK_BOOK" ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <UploadIcon />
                        )
                      }
                      disabled={uploadingSlot === "BANK_BOOK"}
                      sx={{
                        fontWeight: 700,
                        borderRadius: 2.5,
                        whiteSpace: "nowrap",
                        textTransform: "none",
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.2 },
                        minWidth: { xs: "100%", sm: "auto" },
                        bgcolor: "#0F766E",
                        "&:hover": { bgcolor: "#0D9488" },
                      }}
                    >
                      Upload Bank Book
                    </Button>
                  </label>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* 3. DYNAMIC DOCUMENT SLOTS GRID (TAB 0) */}
      {activeTab === 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#0F172A", mb: 2 }}>
            Required & Configured Document Slots
          </Typography>

          <Grid container spacing={2.5}>
            {documentSlots
              .filter((slot) => slot.code !== "BANK_BOOK" && slot.code !== "LOAN_AGREEMENT")
              .map((slot) => {
                const doc = getDocForSlot(slot.code);
                const inputId = `upload-slot-${slot.code}`;
                const isUploading = uploadingSlot === slot.code;

                return (
                  <Grid item xs={12} sm={6} md={4} key={slot.code}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        borderRadius: 3,
                        border: doc ? "1px solid #CBD5E1" : "1px dashed #94A3B8",
                        bgcolor: doc ? "#FFFFFF" : "#F8FAFC",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": { boxShadow: "0 6px 16px rgba(0,0,0,0.06)" },
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <DocIcon sx={{ color: doc ? "#0F766E" : "#64748B" }} />
                            <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                              {slot.title}
                            </Typography>
                          </Box>
                          {slot.is_mandatory && (
                            <Chip label="Mandatory" size="small" color="error" variant="outlined" sx={{ fontWeight: 700, fontSize: "0.65rem" }} />
                          )}
                        </Stack>

                        <Typography variant="caption" color="#64748B" sx={{ display: "block", minHeight: 32, mb: 1.5 }}>
                          {slot.description || "Upload clear copy of " + slot.title}
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
                          <Chip label={slot.category || "GENERAL"} size="small" sx={{ bgcolor: "#F1F5F9", color: "#475569", fontSize: "0.65rem", fontWeight: 600 }} />
                          {doc ? (
                            getStatusBadge(doc.verification_status)
                          ) : (
                            <Chip label="Not Uploaded" size="small" sx={{ bgcolor: "#FEE2E2", color: "#991B1B", fontSize: "0.65rem", fontWeight: 700 }} />
                          )}
                        </Stack>

                        {doc?.rejection_reason && (
                          <Alert severity="error" sx={{ py: 0, px: 1, fontSize: "0.75rem", mb: 1 }}>
                            Reason: {doc.rejection_reason}
                          </Alert>
                        )}
                      </CardContent>

                      <Divider />

                      <Box sx={{ p: 1.5, display: "flex", justifyContent: "flex-end", gap: 1, bgcolor: "#FAFAFA", flexWrap: "wrap" }}>
                        {doc ? (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ViewIcon />}
                              onClick={() => setPreviewDoc(doc)}
                              sx={{ whiteSpace: "nowrap", textTransform: "none", fontSize: "0.75rem", fontWeight: 700 }}
                            >
                              View
                            </Button>
                            <label htmlFor={inputId}>
                              <input
                                id={inputId}
                                type="file"
                                accept=".pdf,image/png,image/jpeg,image/webp"
                                style={{ display: "none" }}
                                onChange={(e) => handleFileUpload(slot.code, e.target.files[0])}
                              />
                              <Button
                                component="span"
                                size="small"
                                variant="contained"
                                disabled={isUploading}
                                sx={{ whiteSpace: "nowrap", textTransform: "none", fontSize: "0.75rem", fontWeight: 700 }}
                              >
                                {isUploading ? "Uploading..." : "Replace"}
                              </Button>
                            </label>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        ) : (
                          <label htmlFor={inputId}>
                            <input
                              id={inputId}
                              type="file"
                              accept=".pdf,image/png,image/jpeg,image/webp"
                              style={{ display: "none" }}
                              onChange={(e) => handleFileUpload(slot.code, e.target.files[0])}
                            />
                            <Button
                              component="span"
                              size="small"
                              variant="contained"
                              startIcon={
                                isUploading ? (
                                  <CircularProgress size={14} color="inherit" />
                                ) : (
                                  <UploadIcon />
                                )
                              }
                              disabled={isUploading}
                              sx={{ fontWeight: 700, whiteSpace: "nowrap", textTransform: "none", fontSize: "0.75rem" }}
                            >
                              {isUploading ? "Uploading..." : "Upload"}
                            </Button>
                          </label>
                        )}
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
          </Grid>
        </Box>
      )}

      {/* 4. SIGNED CONTRACTS TAB */}
      {activeTab === 2 && (
        <Card sx={{ borderRadius: 3, p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Loan Agreement & Contracts Repository
          </Typography>
          {contractDoc ? (
            <Paper sx={{ p: 3, border: "1px solid #E2E8F0", borderRadius: 2 }}>
              <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Loan Agreement Contract
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Uploaded: {new Date(contractDoc.created_at || Date.now()).toLocaleDateString()}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  {getStatusBadge(contractDoc.verification_status)}
                  <Button
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => setPreviewDoc(contractDoc)}
                  >
                    View Document
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ) : (
            <Alert severity="info">
              No signed contracts uploaded yet. If you have an approved loan application, generate the contract above, print it, sign it, and upload the signed PDF.
            </Alert>
          )}
        </Card>
      )}

      {/* CONTRACT MODAL FOR PRINTING & SIGNING */}
      <Dialog
        open={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ m: 0, p: 2.5, bgcolor: "#0F766E", color: "#FFFFFF" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                LOAN AGREEMENT CONTRACT
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                PNR Global Finance Limited • Official Legal Disbursement Contract
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<PrintIcon />}
                onClick={handlePrintContract}
                sx={{ bgcolor: "#FFFFFF", color: "#0F766E", fontWeight: 700, "&:hover": { bgcolor: "#F0FDF4" } }}
              >
                Print
              </Button>
              <IconButton onClick={() => setContractModalOpen(false)} sx={{ color: "#FFFFFF" }}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: "#FFFFFF", color: "#111827" }}>
          {loadingContract ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : contractData ? (
            <Box id="printable-contract-area">
              {/* Header */}
              <Box sx={{ textAlign: "center", pb: 2, mb: 3, borderBottom: "2px solid #0F766E" }}>
                <Typography variant="h5" fontWeight={900} color="#0F766E" letterSpacing="0.5px">
                  {contractData.lender?.name || "PNR GLOBAL FINANCE LTD."}
                </Typography>
                <Typography variant="body2" color="#4B5563">
                  Registered NBFC / Microfinance Institution • CIN: U65929TG2020PTC144821
                </Typography>
                <Typography variant="caption" color="#6B7280">
                  Branch: {contractData.branch?.name || "Head Office"} | Branch Code: {contractData.branch?.code || "HO-01"}
                </Typography>
              </Box>

              {/* Parties */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <Typography variant="caption" fontWeight={700} color="#0F766E" sx={{ textTransform: "uppercase" }}>
                      The Lender
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {contractData.lender?.name}
                    </Typography>
                    <Typography variant="body2" color="#4B5563">
                      Address: {contractData.branch?.address || "Main Boulevard, Financial District"}
                    </Typography>
                    <Typography variant="caption" color="#6B7280" display="block">
                      Email: support@pnrfinance.com | Phone: 1800-425-8888
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <Typography variant="caption" fontWeight={700} color="#0F766E" sx={{ textTransform: "uppercase" }}>
                      The Borrower
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {contractData.borrower?.name}
                    </Typography>
                    <Typography variant="body2" color="#4B5563">
                      Phone: {contractData.borrower?.phone} | Aadhaar: {contractData.borrower?.aadhaar ? `XXXX-XXXX-${contractData.borrower.aadhaar.slice(-4)}` : "Verified"}
                    </Typography>
                    <Typography variant="body2" color="#4B5563">
                      Address: {contractData.borrower?.address || "Registered Customer Residence"}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Financial Parameters Table */}
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                Loan Financial Parameters & Repayment Schedule
              </Typography>
              <Paper sx={{ p: 2, mb: 3, bgcolor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="#4B5563">Approved Principal</Typography>
                    <Typography variant="h6" fontWeight={800} color="#065F46">
                      ₹{Number(contractData.financial?.principal || 0).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="#4B5563">Interest Rate</Typography>
                    <Typography variant="h6" fontWeight={800} color="#065F46">
                      {contractData.financial?.interest_rate}% p.a.
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="#4B5563">Tenure & Frequency</Typography>
                    <Typography variant="h6" fontWeight={800} color="#065F46">
                      {contractData.financial?.tenure_months} Months ({contractData.financial?.frequency})
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="#4B5563">Monthly Equated Installment (EMI)</Typography>
                    <Typography variant="h6" fontWeight={800} color="#047857">
                      ₹{Number(contractData.financial?.monthly_emi || 0).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="#4B5563">Total Repayment Amount</Typography>
                    <Typography variant="h6" fontWeight={800} color="#047857">
                      ₹{Number(contractData.financial?.total_repayment || 0).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="#4B5563">Application Number</Typography>
                    <Typography variant="h6" fontWeight={800} color="#0F172A">
                      {contractData.application?.application_number}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Section 1: Terms & Conditions */}
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                Section 1: General Terms and Conditions
              </Typography>
              <Box component="ol" sx={{ pl: 2.5, mb: 3, fontSize: "0.85rem", color: "#374151", lineHeight: 1.6 }}>
                {(contractData.terms_and_conditions || []).map((term, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>{term}</li>
                ))}
              </Box>

              {/* Section 2: Consequences of Default */}
              <Paper sx={{ p: 2.5, mb: 3, bgcolor: "#FEF2F2", border: "1px solid #FECACA" }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                  <WarningIcon sx={{ color: "#DC2626" }} />
                  <Typography variant="subtitle1" fontWeight={800} color="#991B1B">
                    Section 2: Legal Consequences of Non-Payment / Default
                  </Typography>
                </Stack>
                <Typography variant="caption" color="#7F1D1D" sx={{ display: "block", mb: 1.5, fontWeight: 600 }}>
                  Failure to pay scheduled EMIs on or before the due date shall invoke the following immediate statutory and financial remedies:
                </Typography>
                <Box component="ul" sx={{ pl: 2.5, fontSize: "0.85rem", color: "#7F1D1D", lineHeight: 1.6 }}>
                  {(contractData.consequences_of_default || []).map((cons, idx) => (
                    <li key={idx} style={{ marginBottom: "6px" }}>{cons}</li>
                  ))}
                </Box>
              </Paper>

              {/* Signatures */}
              <Box sx={{ mt: 5, pt: 3, borderTop: "1px dashed #94A3B8" }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 3, textAlign: "center" }}>
                  IN WITNESS WHEREOF, the parties hereto have executed this Agreement on this day {new Date().toLocaleDateString()}
                </Typography>

                <Grid container spacing={4}>
                  <Grid item xs={6} sm={4} sx={{ textAlign: "center" }}>
                    <Box sx={{ borderBottom: "1px solid #000", height: 50, mb: 1 }} />
                    <Typography variant="caption" fontWeight={700} display="block">
                      Borrower Signature
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {contractData.borrower?.name}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={4} sx={{ textAlign: "center" }}>
                    <Box sx={{ borderBottom: "1px solid #000", height: 50, mb: 1 }} />
                    <Typography variant="caption" fontWeight={700} display="block">
                      Witness / Guarantor Signature
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Name & Contact: ____________
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
                    <Box sx={{ borderBottom: "1px solid #000", height: 50, mb: 1 }} />
                    <Typography variant="caption" fontWeight={700} display="block">
                      For PNR Global Finance Ltd.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Authorized Signatory & Seal
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          ) : (
            <Alert severity="error">Unable to load contract.</Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: "#F8FAFC" }}>
          <Button onClick={() => setContractModalOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrintContract}
            sx={{ bgcolor: "#0F766E" }}
          >
            Print Contract
          </Button>
        </DialogActions>
      </Dialog>

      {/* DOCUMENT PREVIEW MODAL */}
      <Dialog
        open={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {previewDoc?.document_title || previewDoc?.documentTitle || previewDoc?.document_type_title || previewDoc?.type_name || previewDoc?.slotTitle || previewDoc?.documentTypeCode || previewDoc?.document_type_code || "Document Preview"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              File: {previewDoc?.fileName || previewDoc?.file_name || previewDoc?.original_name || "Document"}
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
                    download={previewDoc?.fileName || previewDoc?.file_name || previewDoc?.original_name || "document"}
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
    </Box>
  );
}
