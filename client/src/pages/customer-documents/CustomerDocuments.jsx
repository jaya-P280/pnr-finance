import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
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
  UploadFile as UploadFileIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import branchService from "../../services/branch.service";
import customerService from "../../services/customer.service.js";
import customerDocumentsService from "../../services/customerDocument.service";

const getKycFileUrl = (value) => {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const SERVER_URL = import.meta.env.VITE_APP_URL;
  return `${SERVER_URL}/uploads/kyc/${value}`;
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const emptyFamily = {
  memberName: "",
  relationship: "",
  age: "",
  occupation: "",
  mobile: "",
};
const emptyNominee = {
  nomineeName: "",
  relationship: "",
  dateOfBirth: "",
  mobile: "",
  address: "",
  percentage: "",
};

const TAB_STATUS = {
  pending: "PENDING",
  verified: "VERIFIED",
  rejected: "REJECTED",
};

// `field` is the FormData field name the /upload-kyc route expects.
const MANDATORY_DOCS = [
  { key: "aadhaar_front", label: "Aadhaar Front", field: "aadhaarFront" },
  { key: "aadhaar_back", label: "Aadhaar Back", field: "aadhaarBack" },
  { key: "pan_image", label: "PAN", field: "panImage" },
];

// These columns exist in customer_kyc but the upload route only accepts
// aadhaarFront/aadhaarBack/panImage — no field for these five yet, so they
// render as informational placeholders rather than working upload buttons.
const ADDITIONAL_DOCS = [
  { key: "customer_photo", label: "Customer Photo" },
  { key: "signature_image", label: "Signature" },
  { key: "bank_passbook", label: "Bank Passbook" },
  { key: "income_proof", label: "Income Proof" },
  { key: "address_proof", label: "Address Proof" },
];

export default function CustomerDocuments() {
  return (
    <SectionPage
      title="Customer eKYC Verification & Documents"
      subtitle="Manage, review, verify, and approve customer eKYC documents and identity proofs."
    >
      <KycVerificationSection />
    </SectionPage>
  );
}

// ---------------------------------------------------------------------------
// KYC Verification — queue dashboard
// ---------------------------------------------------------------------------

function KycVerificationSection() {
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("");
  const [viewCustomerId, setViewCustomerId] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [confirmReject, setConfirmReject] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const queryClient = useQueryClient();

  const status = selectedStatus === "ALL" ? undefined : selectedStatus;
  const tab = selectedStatus.toLowerCase();

  const queueQuery = useQuery({
    queryKey: ["kycQueue", status, search, branchId],
    queryFn: () =>
      customerDocumentsService.getKycQueue({
        status,
        search: search || undefined,
        branchId: branchId || undefined,
      }),
  });

  const branchesQuery = useQuery({
    queryKey: ["branches", "form"],
    queryFn: () => branchService.getAll({ limit: 100, status: "ACTIVE" }),
  });

  const invalidateQueue = () =>
    queryClient.invalidateQueries({ queryKey: ["kycQueue"] });

  const verifyKyc = useMutation({
    mutationFn: (customerId) => customerDocumentsService.verifyKyc(customerId),
    onSuccess: () => {
      toast.success("KYC verified.");
      setViewCustomerId(null);
      invalidateQueue();
    },
    onError: (e) => toast.error(getErrorMessage(e, "Unable to verify KYC.")),
  });

  const rejectKyc = useMutation({
    mutationFn: () =>
      customerDocumentsService.rejectKyc(viewCustomerId, remarks),
    onSuccess: () => {
      toast.success("KYC rejected.");
      setViewCustomerId(null);
      setConfirmReject(false);
      invalidateQueue();
    },
    onError: (e) => toast.error(getErrorMessage(e, "Unable to reject KYC.")),
  });

  const uploadKyc = useMutation({
    mutationFn: ({ customerId, formData }) =>
      customerDocumentsService.uploadKyc(customerId, formData),
    onSuccess: () => {
      toast.success("Document uploaded.");
      invalidateQueue();
    },
    onError: (e) =>
      toast.error(getErrorMessage(e, "Unable to upload document.")),
    onSettled: () => setUploadingKey(null),
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

  const handleFileSelect = (doc, file, event) => {
    if (!file || !viewItem) return;
    setUploadingKey(doc.key);
    const formData = new FormData();
    formData.append(doc.field, file);
    uploadKyc.mutate({ customerId: viewItem.customer_id, formData });
    if (event?.target) event.target.value = "";
  };

  const mandatoryUploadedCount = viewItem
    ? MANDATORY_DOCS.filter((d) => viewItem[d.key]).length
    : 0;
  const canVerify = mandatoryUploadedCount === MANDATORY_DOCS.length;

  return (
    <Box>
      {/* Filter Bar with Status Dropdown */}
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
            <MenuItem value="PENDING">PENDING APPROVAL</MenuItem>
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
            <Alert severity="error">Unable to load the KYC queue.</Alert>
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
                  <TableCell>Aadhaar</TableCell>
                  <TableCell>PAN</TableCell>
                  <TableCell>Documents</TableCell>
                  <TableCell>Branch</TableCell>
                  {tab === "rejected" && (
                    <TableCell>Rejection Reason</TableCell>
                  )}
                  {tab === "verified" && <TableCell>Verified</TableCell>}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((item) => {
                  const uploaded = MANDATORY_DOCS.filter(
                    (d) => item[d.key],
                  ).length;
                  const kycStatusLabel = item.kyc_status || (tab === "verified" ? "VERIFIED" : tab === "rejected" ? "REJECTED" : "PENDING");
                  const chipColor = kycStatusLabel === "VERIFIED" ? "success" : kycStatusLabel === "REJECTED" ? "error" : "warning";
                  return (
                    <TableRow key={item.customer_id}>
                      <TableCell>
                        <Chip
                          size="small"
                          label={kycStatusLabel}
                          color={chipColor}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        {item.customer_code} -{" "}
                        {`${item.first_name} ${item.last_name || ""}`.trim()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.aadhaar_number ? "Uploaded" : "Missing"}
                          color={item.aadhaar_number ? "success" : "error"}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.pan_number ? "Uploaded" : "Missing"}
                          color={item.pan_number ? "success" : "error"}
                        />
                      </TableCell>
                      <TableCell>
                        {uploaded} / {MANDATORY_DOCS.length}
                        {uploaded < MANDATORY_DOCS.length && (
                          <Chip
                            size="small"
                            label="KYC Pending Upload"
                            color="warning"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{item.branch_name}</TableCell>
                      {tab === "rejected" && (
                        <TableCell>{item.remarks || "-"}</TableCell>
                      )}
                      {tab === "verified" && (
                        <TableCell>
                          {item.verified_at
                            ? new Date(item.verified_at).toLocaleDateString()
                            : "-"}
                        </TableCell>
                      )}
                      <TableCell>
                        <Button size="small" onClick={() => openView(item)}>
                          {uploaded === 0 ? "Upload KYC" : "View"}
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

      <Dialog
        open={Boolean(viewItem)}
        onClose={() => setViewCustomerId(null)}
        fullWidth
        maxWidth="md"
      >
        {viewItem && (
          <>
            <DialogTitle>Customer Verification</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ pt: 1 }}>
                <Box>
                  <Typography variant="subtitle2" color="#64748B" gutterBottom>
                    Customer Information
                  </Typography>
                  <Stack direction="row" spacing={4} sx={{ flexWrap: "wrap" }}>
                    <Typography variant="body2">
                      Code: <b>{viewItem.customer_code}</b>
                    </Typography>
                    <Typography variant="body2">
                      Name:{" "}
                      <b>
                        {`${viewItem.first_name} ${viewItem.last_name || ""}`.trim()}
                      </b>
                    </Typography>
                    <Typography variant="body2">
                      Branch: <b>{viewItem.branch_name}</b>
                    </Typography>
                    <Typography variant="body2">
                      Mobile: <b>{viewItem.mobile_number}</b>
                    </Typography>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="#64748B" gutterBottom>
                    Identity Information
                  </Typography>
                  <Stack direction="row" spacing={4}>
                    <Typography variant="body2">
                      Aadhaar: <b>{viewItem.aadhaar_number || "-"}</b>
                    </Typography>
                    <Typography variant="body2">
                      PAN: <b>{viewItem.pan_number || "-"}</b>
                    </Typography>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Stack
                    direction="row"
                    sx={{ mb: 1, justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Typography variant="subtitle2" color="#64748B">
                      KYC Completion
                    </Typography>
                    <Typography variant="body2" color="#64748B">
                      {mandatoryUploadedCount} / {MANDATORY_DOCS.length}{" "}
                      mandatory documents
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (mandatoryUploadedCount / MANDATORY_DOCS.length) * 100
                    }
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  {mandatoryUploadedCount === 0 && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      No KYC documents uploaded yet. Upload the mandatory
                      documents below to proceed with verification.
                    </Alert>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="#64748B" gutterBottom>
                    Mandatory Documents
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                    {MANDATORY_DOCS.map((doc) => {
                      const isUploadingThis =
                        uploadKyc.isPending && uploadingKey === doc.key;
                      return (
                        <Paper
                          key={doc.key}
                          variant="outlined"
                          sx={{ p: 2, width: 170 }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            gutterBottom
                          >
                            {doc.label}
                          </Typography>

                          {viewItem[doc.key] ? (
                            <>
                              <Box
                                component="img"
                                src={getKycFileUrl(viewItem[doc.key])}
                                alt={doc.label}
                                sx={{
                                  width: "100%",
                                  height: 90,
                                  objectFit: "cover",
                                  borderRadius: 1,
                                  mb: 1,
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  setPreviewFile(viewItem[doc.key])
                                }
                              />
                              <Chip
                                size="small"
                                label="Uploaded"
                                color="success"
                                sx={{ mb: 1 }}
                              />
                              <Button
                                component="label"
                                size="small"
                                fullWidth
                                variant="outlined"
                                disabled={uploadKyc.isPending}
                                startIcon={
                                  isUploadingThis ? (
                                    <CircularProgress size={14} />
                                  ) : (
                                    <UploadFileIcon fontSize="small" />
                                  )
                                }
                              >
                                {isUploadingThis ? "Uploading…" : "Replace"}
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*,.pdf"
                                  onChange={(e) =>
                                    handleFileSelect(doc, e.target.files[0], e)
                                  }
                                />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 90,
                                  borderRadius: 1,
                                  mb: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: "#F8FAFC",
                                  border: "1px dashed #CBD5E1",
                                }}
                              >
                                <Typography variant="caption" color="#94A3B8">
                                  No file
                                </Typography>
                              </Box>
                              <Chip
                                size="small"
                                label="Missing"
                                color="error"
                                sx={{ mb: 1 }}
                              />
                              <Button
                                component="label"
                                size="small"
                                fullWidth
                                variant="contained"
                                disabled={uploadKyc.isPending}
                                startIcon={
                                  isUploadingThis ? (
                                    <CircularProgress
                                      size={14}
                                      color="inherit"
                                    />
                                  ) : (
                                    <UploadFileIcon fontSize="small" />
                                  )
                                }
                              >
                                {isUploadingThis ? "Uploading…" : "Upload"}
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*,.pdf"
                                  onChange={(e) =>
                                    handleFileSelect(doc, e.target.files[0], e)
                                  }
                                />
                              </Button>
                            </>
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="#64748B" gutterBottom>
                    Additional Documents
                  </Typography>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Upload isn't wired for these document types yet — shown for
                    reference only.
                  </Alert>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    {ADDITIONAL_DOCS.map((doc) => (
                      <Chip
                        key={doc.key}
                        size="small"
                        label={`${doc.label}: ${viewItem[doc.key] ? "Uploaded" : "Missing"}`}
                        color={viewItem[doc.key] ? "success" : "default"}
                      />
                    ))}
                  </Stack>
                </Box>

                {viewItem.kyc_status === "REJECTED" && viewItem.remarks && (
                  <Alert severity="error">
                    Previous rejection reason: {viewItem.remarks}
                  </Alert>
                )}

                {viewItem.kyc_status === "PENDING" && (
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Remarks (required to reject)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewCustomerId(null)}>Cancel</Button>
              {viewItem.kyc_status === "PENDING" && (
                <>
                  <Button
                    color="error"
                    disabled={rejectKyc.isPending || !remarks}
                    onClick={() => setConfirmReject(true)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    disabled={verifyKyc.isPending || !canVerify}
                    onClick={() => verifyKyc.mutate(viewItem.customer_id)}
                  >
                    Verify
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={confirmReject} onClose={() => setConfirmReject(false)}>
        <DialogTitle>Confirm rejection</DialogTitle>
        <DialogContent>
          <Typography>
            Reject this KYC submission with the remarks you entered?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmReject(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={rejectKyc.isPending}
            onClick={() => rejectKyc.mutate()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Document Preview</DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={getKycFileUrl(previewFile)}
            alt="Document preview"
            sx={{ width: "100%", borderRadius: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            component="a"
            href={getKycFileUrl(previewFile)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in New Tab
          </Button>
          <Button component="a" href={getKycFileUrl(previewFile)} download>
            Download
          </Button>
          <Button onClick={() => setPreviewFile(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Family & Nominees — customer-picker based, unchanged from before
// ---------------------------------------------------------------------------

function FamilyNomineesSection() {
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [tab, setTab] = useState("family");
  const [dialog, setDialog] = useState(null);
  const [familyForm, setFamilyForm] = useState(emptyFamily);
  const [nomineeForm, setNomineeForm] = useState(emptyNominee);
  const queryClient = useQueryClient();

  const customersQuery = useQuery({
    queryKey: ["customers", "picker", customerSearch],
    queryFn: () =>
      customerService.getAll({ search: customerSearch, limit: 20 }),
  });

  const profileQuery = useQuery({
    queryKey: ["customerProfile", customerId],
    queryFn: () => customerDocumentsService.getProfile(customerId),
    enabled: Boolean(customerId),
  });

  const invalidateProfile = () =>
    queryClient.invalidateQueries({
      queryKey: ["customerProfile", customerId],
    });

  const saveFamily = useMutation({
    mutationFn: () => {
      const payload = { ...familyForm, age: Number(familyForm.age) };
      if (!payload.occupation) delete payload.occupation;
      if (!payload.mobile) delete payload.mobile;
      return dialog.mode === "edit-family"
        ? customerDocumentsService.updateFamilyMember(
            dialog.item.family_id,
            payload,
          )
        : customerDocumentsService.addFamilyMember(customerId, payload);
    },
    onSuccess: () => {
      toast.success("Family member saved.");
      setDialog(null);
      invalidateProfile();
    },
    onError: (e) =>
      toast.error(getErrorMessage(e, "Unable to save family member.")),
  });
  const removeFamily = useMutation({
    mutationFn: (id) => customerDocumentsService.deleteFamilyMember(id),
    onSuccess: () => {
      toast.success("Family member removed.");
      setDialog(null);
      invalidateProfile();
    },
    onError: (e) =>
      toast.error(getErrorMessage(e, "Unable to delete family member.")),
  });

  const saveNominee = useMutation({
    mutationFn: () => {
      const payload = { ...nomineeForm };
      if (payload.percentage) payload.percentage = Number(payload.percentage);
      else delete payload.percentage;
      if (!payload.dateOfBirth) delete payload.dateOfBirth;
      if (!payload.mobile) delete payload.mobile;
      if (!payload.address) delete payload.address;
      return dialog.mode === "edit-nominee"
        ? customerDocumentsService.updateNominee(
            dialog.item.nominee_id,
            payload,
          )
        : customerDocumentsService.addNominee(customerId, payload);
    },
    onSuccess: () => {
      toast.success("Nominee saved.");
      setDialog(null);
      invalidateProfile();
    },
    onError: (e) => toast.error(getErrorMessage(e, "Unable to save nominee.")),
  });
  const removeNominee = useMutation({
    mutationFn: (id) => customerDocumentsService.deleteNominee(id),
    onSuccess: () => {
      toast.success("Nominee removed.");
      setDialog(null);
      invalidateProfile();
    },
    onError: (e) =>
      toast.error(getErrorMessage(e, "Unable to delete nominee.")),
  });

  const customers = customersQuery.data?.customers || [];
  const profile = profileQuery.data;
  const family = profile?.family || [];
  const nominees = profile?.nominees || [];

  const openAddFamily = () => {
    setFamilyForm(emptyFamily);
    setDialog({ mode: "add-family" });
  };
  const openEditFamily = (item) => {
    setFamilyForm({
      memberName: item.member_name || "",
      relationship: item.relationship || "",
      age: String(item.age ?? ""),
      occupation: item.occupation || "",
      mobile: item.mobile || "",
    });
    setDialog({ mode: "edit-family", item });
  };

  const openAddNominee = () => {
    setNomineeForm(emptyNominee);
    setDialog({ mode: "add-nominee" });
  };
  const openEditNominee = (item) => {
    setNomineeForm({
      nomineeName: item.nominee_name || "",
      relationship: item.relationship || "",
      dateOfBirth: item.dob ? String(item.dob).slice(0, 10) : "",
      mobile: item.mobile || "",
      address: item.address || "",
      percentage: item.percentage ?? "",
    });
    setDialog({ mode: "edit-nominee", item });
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{ border: "1px solid #E2E8F0", borderRadius: 3, p: 3, mb: 3 }}
      >
        <TextField
          select
          fullWidth
          label="Select customer"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        >
          <MenuItem value="">Select a customer</MenuItem>
          {customers.map((c) => (
            <MenuItem key={c.customer_id} value={String(c.customer_id)}>
              {`${c.first_name} ${c.last_name || ""}`.trim()} ({c.customer_code}
              )
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          sx={{ mt: 2 }}
          fullWidth
          placeholder="Search customers by name or mobile…"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
        />
      </Paper>

      {!customerId ? (
        <Box sx={{ p: 6, textAlign: "center" }}>
          <Typography color="#64748B">
            Select a customer to view their family and nominees.
          </Typography>
        </Box>
      ) : profileQuery.isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress />
        </Box>
      ) : profileQuery.isError ? (
        <Alert severity="error">Unable to load customer records.</Alert>
      ) : (
        <>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab value="family" label="Family" />
            <Tab value="nominee" label="Nominees" />
          </Tabs>

          {tab === "family" && (
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #E2E8F0",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openAddFamily}
                >
                  Add Family Member
                </Button>
              </Box>
              {family.length === 0 ? (
                <Box sx={{ p: 6, textAlign: "center" }}>
                  <Typography color="#64748B">
                    No family members added.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                        <TableCell>Name</TableCell>
                        <TableCell>Relationship</TableCell>
                        <TableCell>Age</TableCell>
                        <TableCell>Occupation</TableCell>
                        <TableCell>Mobile</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {family.map((m) => (
                        <TableRow key={m.family_id}>
                          <TableCell>{m.member_name}</TableCell>
                          <TableCell>{m.relationship}</TableCell>
                          <TableCell>{m.age}</TableCell>
                          <TableCell>{m.occupation || "-"}</TableCell>
                          <TableCell>{m.mobile || "-"}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                onClick={() => openEditFamily(m)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() =>
                                  setDialog({ mode: "delete-family", item: m })
                                }
                              >
                                Delete
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
          )}

          {tab === "nominee" && (
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #E2E8F0",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openAddNominee}
                >
                  Add Nominee
                </Button>
              </Box>
              {nominees.length === 0 ? (
                <Box sx={{ p: 6, textAlign: "center" }}>
                  <Typography color="#64748B">No nominees added.</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                        <TableCell>Name</TableCell>
                        <TableCell>Relationship</TableCell>
                        <TableCell>Mobile</TableCell>
                        <TableCell>Share %</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {nominees.map((n) => (
                        <TableRow key={n.nominee_id}>
                          <TableCell>{n.nominee_name}</TableCell>
                          <TableCell>{n.relationship}</TableCell>
                          <TableCell>{n.mobile || "-"}</TableCell>
                          <TableCell>{n.percentage ?? "-"}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                onClick={() => openEditNominee(n)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() =>
                                  setDialog({ mode: "delete-nominee", item: n })
                                }
                              >
                                Delete
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
          )}
        </>
      )}

      <Dialog
        open={dialog?.mode === "add-family" || dialog?.mode === "edit-family"}
        onClose={() => !saveFamily.isPending && setDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialog?.mode === "edit-family"
            ? "Edit Family Member"
            : "Add Family Member"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              required
              fullWidth
              label="Member name"
              value={familyForm.memberName}
              onChange={(e) =>
                setFamilyForm((c) => ({ ...c, memberName: e.target.value }))
              }
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                fullWidth
                label="Relationship"
                value={familyForm.relationship}
                onChange={(e) =>
                  setFamilyForm((c) => ({ ...c, relationship: e.target.value }))
                }
              />
              <TextField
                required
                fullWidth
                type="number"
                label="Age"
                value={familyForm.age}
                onChange={(e) =>
                  setFamilyForm((c) => ({ ...c, age: e.target.value }))
                }
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Occupation"
                value={familyForm.occupation}
                onChange={(e) =>
                  setFamilyForm((c) => ({ ...c, occupation: e.target.value }))
                }
              />
              <TextField
                fullWidth
                label="Mobile"
                value={familyForm.mobile}
                onChange={(e) =>
                  setFamilyForm((c) => ({ ...c, mobile: e.target.value }))
                }
                slotProps={{ htmlInput: { maxLength: 10 } }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={
              saveFamily.isPending ||
              !familyForm.memberName ||
              !familyForm.relationship ||
              !familyForm.age
            }
            onClick={() => saveFamily.mutate()}
          >
            {saveFamily.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialog?.mode === "delete-family"}
        onClose={() => !removeFamily.isPending && setDialog(null)}
      >
        <DialogTitle>Remove family member?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={removeFamily.isPending}
            onClick={() => removeFamily.mutate(dialog.item.family_id)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialog?.mode === "add-nominee" || dialog?.mode === "edit-nominee"}
        onClose={() => !saveNominee.isPending && setDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialog?.mode === "edit-nominee" ? "Edit Nominee" : "Add Nominee"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              required
              fullWidth
              label="Nominee name"
              value={nomineeForm.nomineeName}
              onChange={(e) =>
                setNomineeForm((c) => ({ ...c, nomineeName: e.target.value }))
              }
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                fullWidth
                label="Relationship"
                value={nomineeForm.relationship}
                onChange={(e) =>
                  setNomineeForm((c) => ({
                    ...c,
                    relationship: e.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                type="date"
                label="Date of birth"
                value={nomineeForm.dateOfBirth}
                onChange={(e) =>
                  setNomineeForm((c) => ({ ...c, dateOfBirth: e.target.value }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Mobile"
                value={nomineeForm.mobile}
                onChange={(e) =>
                  setNomineeForm((c) => ({ ...c, mobile: e.target.value }))
                }
                slotProps={{ htmlInput: { maxLength: 10 } }}
              />
              <TextField
                fullWidth
                type="number"
                label="Share (%)"
                value={nomineeForm.percentage}
                onChange={(e) =>
                  setNomineeForm((c) => ({ ...c, percentage: e.target.value }))
                }
                slotProps={{ htmlInput: { min: 0, max: 100 } }}
              />
            </Stack>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Address"
              value={nomineeForm.address}
              onChange={(e) =>
                setNomineeForm((c) => ({ ...c, address: e.target.value }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={
              saveNominee.isPending ||
              !nomineeForm.nomineeName ||
              !nomineeForm.relationship
            }
            onClick={() => saveNominee.mutate()}
          >
            {saveNominee.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialog?.mode === "delete-nominee"}
        onClose={() => !removeNominee.isPending && setDialog(null)}
      >
        <DialogTitle>Remove nominee?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={removeNominee.isPending}
            onClick={() => removeNominee.mutate(dialog.item.nominee_id)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
