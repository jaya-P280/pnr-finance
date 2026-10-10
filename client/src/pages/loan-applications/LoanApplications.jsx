import { useState } from "react";
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
  Grid,
  MenuItem,
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
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  FolderOpen as FolderIcon,
  Description as DocIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import customerService from "../../services/customer.service";
import loanProductService from "../../services/loanProduct.service";
import loanApplicationService from "../../services/loanApplication.service";
import groupService from "../../services/group.service";
import customerDocumentsService from "../../services/customerDocuments.service";
import useAuth from "../../hooks/useAuth";

const emptyForm = {
  groupId: "",
  customerId: "",
  loanProductId: "",
  requestedAmount: "",
  tenure: "",
  purpose: "",
  remarks: "",
};

const STATUS_COLORS = {
  DRAFT: "default",
  PENDING: "warning",
  UNDER_REVIEW: "info",
  VERIFIED: "info",
  APPROVED: "success",
  REJECTED: "error",
  DISBURSED: "success",
};

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

const toPayload = (form) => {
  const payload = {
    customerId: Number(form.customerId),
    loanProductId: Number(form.loanProductId),
    requestedAmount: Number(form.requestedAmount),
    tenure: Number(form.tenure),
  };
  if (form.groupId) payload.groupId = Number(form.groupId);
  if (form.purpose) payload.purpose = form.purpose;
  if (form.remarks) payload.remarks = form.remarks;
  return payload;
};

import { useSearchParams } from "react-router-dom";

export default function LoanApplications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const roleName = user?.role_name || user?.role;
  const canCreate = ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER", "FIELD_OFFICER", "CUSTOMER"].includes(roleName);
  const canVerify = ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"].includes(roleName);
  const canApprove = ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"].includes(roleName);
  const canDisburse = ["SUPER_ADMIN", "ADMIN", "FIELD_OFFICER"].includes(roleName);
  const canReviewDocs = ["ADMIN", "BRANCH_MANAGER", "FIELD_OFFICER"].includes(roleName);
  const [search, setSearch] = useState("");

  const [docInspectionApp, setDocInspectionApp] = useState(null);
  const [customerDocs, setCustomerDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [rejectDocDialog, setRejectDocDialog] = useState(null);
  const [rejectDocReason, setRejectDocReason] = useState("");

  const openDocumentInspection = async (app) => {
    setDocInspectionApp(app);
    setLoadingDocs(true);
    try {
      const res = await customerDocumentsService.getByCustomer(app.customer_id);
      const docs = res?.data?.data || res?.data || [];
      setCustomerDocs(Array.isArray(docs) ? docs : []);
    } catch {
      toast.error("Failed to load customer documents.");
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleVerifyDoc = async (docId) => {
    try {
      await customerDocumentsService.verify(docId);
      toast.success("Document marked as verified.");
      if (docInspectionApp) {
        const res = await customerDocumentsService.getByCustomer(docInspectionApp.customer_id);
        const docs = res?.data?.data || res?.data || [];
        setCustomerDocs(Array.isArray(docs) ? docs : []);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed.");
    }
  };

  const handleRejectDoc = async () => {
    if (!rejectDocDialog?.docId) return;
    try {
      await customerDocumentsService.reject(rejectDocDialog.docId, {
        reason: rejectDocReason || "Document does not meet requirements",
      });
      toast.success("Document rejected.");
      setRejectDocDialog(null);
      setRejectDocReason("");
      if (docInspectionApp) {
        const res = await customerDocumentsService.getByCustomer(docInspectionApp.customer_id);
        const docs = res?.data?.data || res?.data || [];
        setCustomerDocs(Array.isArray(docs) ? docs : []);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Rejection failed.");
    }
  };

  const preselectedCustomerId = searchParams.get("customerId");
  const [dialog, setDialog] = useState(
    preselectedCustomerId ? { mode: "create" } : null
  );
  const [form, setForm] = useState(
    preselectedCustomerId ? { ...emptyForm, customerId: String(preselectedCustomerId) } : emptyForm
  );
  const [approveAmount, setApproveAmount] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const queryClient = useQueryClient();

  const applicationsQuery = useQuery({
    queryKey: ["loanApplications", search],
    queryFn: () => loanApplicationService.getAll({ search }),
  });

  const customersQuery = useQuery({
    queryKey: ["customers", "form"],
    queryFn: () => customerService.getAll({ limit: 100, status: "ACTIVE" }),
    enabled: dialog?.mode === "create" || dialog?.mode === "edit",
  });

  const groupsQuery = useQuery({
    queryKey: ["groups", "form"],
    queryFn: () => groupService.getAll({ limit: 100, status: "ACTIVE" }),
    enabled: dialog?.mode === "create" || dialog?.mode === "edit",
  });

  const selectedGroupQuery = useQuery({
    queryKey: ["group-detail", form.groupId],
    queryFn: () => groupService.getById(form.groupId),
    enabled: Boolean(form.groupId) && (dialog?.mode === "create" || dialog?.mode === "edit"),
  });

  const loanProductsQuery = useQuery({
    queryKey: ["loanProducts", "form"],
    queryFn: () => loanProductService.getAll({ limit: 100, status: "ACTIVE" }),
    enabled: dialog?.mode === "create" || dialog?.mode === "edit",
  });

  const invalidateApplications = () =>
    queryClient.invalidateQueries({ queryKey: ["loanApplications"] });

  const saveApplication = useMutation({
    mutationFn: () => {
      const payload = toPayload(form);
      return dialog.mode === "create"
        ? loanApplicationService.create(payload)
        : loanApplicationService.update(
            dialog.application.application_id,
            payload,
          );
    },
    onSuccess: () => {
      toast.success(
        dialog.mode === "create"
          ? "Loan application submitted."
          : "Loan application updated.",
      );
      setDialog(null);
      invalidateApplications();
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(error, "Unable to save the loan application."),
      ),
  });

  const sendForReview = useMutation({
    mutationFn: (id) =>
      loanApplicationService.updateStatus(id, { status: "UNDER_REVIEW" }),
    onSuccess: () => {
      toast.success("Sent for review.");
      invalidateApplications();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to update status.")),
  });

  const verifyApplication = useMutation({
    mutationFn: (id) => loanApplicationService.verify(id),
    onSuccess: () => {
      toast.success("Application verified.");
      invalidateApplications();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to verify the application.")),
  });

  const approveApplication = useMutation({
    mutationFn: ({ id, amount }) => loanApplicationService.approve(id, amount),
    onSuccess: () => {
      toast.success("Application approved.");
      setDialog(null);
      invalidateApplications();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to approve the application.")),
  });

  const rejectApplication = useMutation({
    mutationFn: ({ id, reason }) => loanApplicationService.reject(id, reason),
    onSuccess: () => {
      toast.success("Application rejected.");
      setDialog(null);
      invalidateApplications();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to reject the application.")),
  });

  const disburseApplication = useMutation({
    mutationFn: (id) => loanApplicationService.disburse(id),
    onSuccess: () => {
      toast.success("Loan disbursed.");
      invalidateApplications();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to disburse the loan.")),
  });

  const removeApplication = useMutation({
    mutationFn: (id) => loanApplicationService.delete(id),
    onSuccess: () => {
      toast.success("Application deleted.");
      setDialog(null);
      invalidateApplications();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to delete the application.")),
  });

  const applications = applicationsQuery.data?.loanApplications || [];
  const customers = customersQuery.data?.customers || [];
  const groups = groupsQuery.data?.groups || [];
  const loanProducts = loanProductsQuery.data?.loanProducts || [];
  const selectedGroup = selectedGroupQuery.data;
  const formLoading = customersQuery.isLoading || loanProductsQuery.isLoading || groupsQuery.isLoading;

  const groupMembers = selectedGroup?.members || [];
  const availableCustomers = form.groupId
    ? (groupMembers.length > 0
        ? groupMembers
        : customers.filter((c) => String(c.group_id) === String(form.groupId)))
    : customers;

  const isGroupInvalid = Boolean(
    form.groupId &&
      selectedGroup &&
      (selectedGroup.status !== "ACTIVE" ||
        (selectedGroup.members && selectedGroup.members.length === 0))
  );

  const openCreate = () => {
    setForm(emptyForm);
    setDialog({ mode: "create" });
  };

  const openEdit = async (application) => {
    try {
      const details = await loanApplicationService.getById(
        application.application_id,
      );
      setForm({
        groupId: String(details.group_id || ""),
        customerId: String(details.customer_id || ""),
        loanProductId: String(details.loan_product_id || ""),
        requestedAmount: String(details.requested_amount ?? ""),
        tenure: String(details.tenure ?? ""),
        purpose: details.purpose || "",
        remarks: details.remarks || "",
      });
      setDialog({ mode: "edit", application });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load the application."));
    }
  };

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const requiredFilled =
    form.customerId &&
    form.loanProductId &&
    form.requestedAmount &&
    form.tenure;
  const canEditOrDelete = (status) =>
    status === "DRAFT" || status === "PENDING";

  return (
    <SectionPage
      title="Loan Applications"
      subtitle="Review, verify, approve, and track loan applications through their full lifecycle."
      actions={
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search by application # or customer..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) =>
              event.key === "Enter" && applicationsQuery.refetch()
            }
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => applicationsQuery.refetch()}
            sx={{ bgcolor: "#0F766E" }}
          >
            Search
          </Button>
          {canCreate && <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
            New Application
          </Button>}
        </Stack>
      }
    >
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {applicationsQuery.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : applicationsQuery.isError ? (
          <Box sx={{ p: 6 }}>
            <Alert severity="error">
              Unable to load loan applications. Please try again.
            </Alert>
          </Box>
        ) : applications.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No loan applications found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell>Application #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Tenure</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.application_id}>
                    <TableCell>{app.application_number || "-"}</TableCell>
                    <TableCell>{app.customer_name || "-"}</TableCell>
                    <TableCell>{app.product_name || "-"}</TableCell>
                    <TableCell>{app.requested_amount ?? "-"}</TableCell>
                    <TableCell>{app.tenure ?? "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.application_status || "-"}
                        size="small"
                        color={
                          STATUS_COLORS[app.application_status] || "default"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        {canReviewDocs && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            startIcon={<FolderIcon />}
                            onClick={() => openDocumentInspection(app)}
                          >
                            Documents
                          </Button>
                        )}
                        {canCreate && canEditOrDelete(app.application_status) && (
                          <Button size="small" onClick={() => openEdit(app)}>
                            Edit
                          </Button>
                        )}
                        {canCreate && app.application_status === "PENDING" && (
                          <Button
                            size="small"
                            onClick={() =>
                              sendForReview.mutate(app.application_id)
                            }
                          >
                            Send for Review
                          </Button>
                        )}
                        {canVerify && app.application_status === "UNDER_REVIEW" && (
                          <Button
                            size="small"
                            onClick={() =>
                              verifyApplication.mutate(app.application_id)
                            }
                          >
                            Verify
                          </Button>
                        )}
                        {canApprove && app.application_status === "VERIFIED" && (
                          <Button
                            size="small"
                            color="success"
                            onClick={() => {
                              setApproveAmount(
                                String(app.requested_amount ?? ""),
                              );
                              setDialog({ mode: "approve", application: app });
                            }}
                          >
                            Approve
                          </Button>
                        )}
                        {canApprove && ["PENDING", "UNDER_REVIEW", "VERIFIED"].includes(
                          app.application_status,
                        ) && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => {
                              setRejectReason("");
                              setDialog({ mode: "reject", application: app });
                            }}
                          >
                            Reject
                          </Button>
                        )}
                        {canDisburse && app.application_status === "APPROVED" && (
                          <Button
                            size="small"
                            color="success"
                            onClick={() =>
                              disburseApplication.mutate(app.application_id)
                            }
                          >
                            Disburse
                          </Button>
                        )}
                        {canCreate && canEditOrDelete(app.application_status) && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() =>
                              setDialog({ mode: "delete", application: app })
                            }
                          >
                            Delete
                          </Button>
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

      <Dialog
        open={dialog?.mode === "delete"}
        onClose={() => !removeApplication.isPending && setDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Delete application?</DialogTitle>
        <DialogContent>
          <Typography>
            This will remove application{" "}
            {dialog?.application?.application_number} permanently.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={removeApplication.isPending}
            onClick={() =>
              removeApplication.mutate(dialog.application.application_id)
            }
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialog?.mode === "approve"}
        onClose={() => !approveApplication.isPending && setDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Approve application {dialog?.application?.application_number}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              required
              fullWidth
              type="number"
              label="Approved amount"
              value={approveAmount}
              onChange={(e) => setApproveAmount(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            disabled={approveApplication.isPending || !approveAmount}
            onClick={() =>
              approveApplication.mutate({
                id: dialog.application.application_id,
                amount: Number(approveAmount),
              })
            }
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialog?.mode === "reject"}
        onClose={() => !rejectApplication.isPending && setDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Reject application {dialog?.application?.application_number}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              required
              fullWidth
              multiline
              minRows={2}
              label="Rejection reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={rejectApplication.isPending || !rejectReason}
            onClick={() =>
              rejectApplication.mutate({
                id: dialog.application.application_id,
                reason: rejectReason,
              })
            }
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialog?.mode === "create" || dialog?.mode === "edit"}
        onClose={() => !saveApplication.isPending && setDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialog?.mode === "create"
            ? "New Loan Application"
            : "Edit Loan Application"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {formLoading && (
              <Alert severity="info">
                Loading customers and loan products…
              </Alert>
            )}
            <TextField
              select
              fullWidth
              label="Group (Optional / For Group Loans)"
              value={form.groupId}
              onChange={(e) => {
                const val = e.target.value;
                setForm((current) => ({
                  ...current,
                  groupId: val,
                  customerId: "",
                }));
              }}
              disabled={formLoading}
              helperText={
                roleName === "FIELD_OFFICER"
                  ? "Displaying active groups assigned to you"
                  : "Select a group to auto-load members & group summary"
              }
            >
              <MenuItem value="">-- Individual Loan (No Group) --</MenuItem>
              {groups.map((g) => (
                <MenuItem key={g.group_id} value={String(g.group_id)}>
                  {g.group_name} ({g.group_code}) - {g.branch_name || "Branch"}
                </MenuItem>
              ))}
            </TextField>

            {form.groupId && selectedGroupQuery.isLoading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
                <CircularProgress size={20} sx={{ color: "#0F766E" }} />
                <Typography variant="body2" color="#64748B">
                  Loading group details & members...
                </Typography>
              </Box>
            )}

            {form.groupId && selectedGroup && !selectedGroupQuery.isLoading && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: "#F8FAFC",
                  borderColor: isGroupInvalid ? "#FCA5A5" : "#CBD5E1",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="#0F766E"
                  sx={{ mb: 1 }}
                >
                  Group Details
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="#64748B" display="block">
                      Branch
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedGroup.branch_name || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="#64748B" display="block">
                      Center
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedGroup.center_name || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="#64748B" display="block">
                      Field Officer
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedGroup.field_officer_name || "Unassigned"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="#64748B" display="block">
                      Member Count
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedGroup.members?.length || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="#64748B" display="block">
                      Group Leader
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedGroup.leader_name || "Not Set"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="#64748B" display="block">
                      Meeting Day
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedGroup.meeting_day || "N/A"}
                    </Typography>
                  </Grid>
                </Grid>

                {(!selectedGroup.members || selectedGroup.members.length === 0) && (
                  <Alert severity="error" sx={{ mt: 1.5 }}>
                    This group has no active members. You cannot create a loan for an empty group.
                  </Alert>
                )}
                {selectedGroup.status !== "ACTIVE" && (
                  <Alert severity="warning" sx={{ mt: 1.5 }}>
                    Group is currently {selectedGroup.status}. Loans can only be created for ACTIVE groups.
                  </Alert>
                )}
              </Paper>
            )}

            <TextField
              required
              select
              fullWidth
              label="Customer / Borrower"
              value={form.customerId}
              onChange={setField("customerId")}
              disabled={formLoading || isGroupInvalid}
              helperText={
                form.groupId
                  ? `Showing members of selected group (${availableCustomers.length} available)`
                  : "Select borrower"
              }
            >
              <MenuItem value="">Select a customer</MenuItem>
              {availableCustomers.map((c) => (
                <MenuItem key={c.customer_id} value={String(c.customer_id)}>
                  {`${c.first_name} ${c.last_name || ""}`.trim()} ({c.customer_code})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              required
              select
              fullWidth
              label="Loan product"
              value={form.loanProductId}
              onChange={setField("loanProductId")}
              disabled={formLoading}
            >
              <MenuItem value="">Select a loan product</MenuItem>
              {loanProducts.map((p) => (
                <MenuItem
                  key={p.loan_product_id}
                  value={String(p.loan_product_id)}
                >
                  {p.product_name}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                fullWidth
                type="number"
                label="Requested amount"
                value={form.requestedAmount}
                onChange={setField("requestedAmount")}
              />
              <TextField
                required
                fullWidth
                type="number"
                label="Tenure"
                value={form.tenure}
                onChange={setField("tenure")}
              />
            </Stack>
            <TextField
              fullWidth
              label="Purpose"
              value={form.purpose}
              onChange={setField("purpose")}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Remarks"
              value={form.remarks}
              onChange={setField("remarks")}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={
              saveApplication.isPending || formLoading || !requiredFilled || isGroupInvalid
            }
            onClick={() => saveApplication.mutate()}
          >
            {saveApplication.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CUSTOMER DOCUMENTS INSPECTION DIALOG (FOR APPROVERS / FIELD OFFICERS) */}
      <Dialog
        open={Boolean(docInspectionApp)}
        onClose={() => setDocInspectionApp(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2.5, bgcolor: "#0F766E", color: "#FFFFFF" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Customer Documents Review
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Application #{docInspectionApp?.application_number} • Customer: {docInspectionApp?.customer_name}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setDocInspectionApp(null)} sx={{ color: "#FFFFFF" }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {loadingDocs ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : customerDocs.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography color="text.secondary">
                No uploaded documents found for this customer yet.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell>Document Type</TableCell>
                    <TableCell>File</TableCell>
                    <TableCell>Uploaded On</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerDocs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <DocIcon sx={{ color: "#0F766E", fontSize: 20 }} />
                          <Typography variant="body2" fontWeight={700}>
                            {doc.document_type_title || doc.type_name || doc.document_type_code}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ maxWidth: 160, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {doc.original_name || doc.file_name || "Document File"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(doc.created_at || Date.now()).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={doc.verification_status || "PENDING"}
                          size="small"
                          color={
                            doc.verification_status === "VERIFIED"
                              ? "success"
                              : doc.verification_status === "REJECTED"
                              ? "error"
                              : "warning"
                          }
                          sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                        />
                        {doc.rejection_reason && (
                          <Typography variant="caption" color="error" display="block">
                            {doc.rejection_reason}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            onClick={() => setPreviewDoc(doc)}
                          >
                            View
                          </Button>
                          {doc.verification_status !== "VERIFIED" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleVerifyDoc(doc.id)}
                            >
                              Verify
                            </Button>
                          )}
                          {doc.verification_status !== "REJECTED" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => {
                                setRejectDocDialog({ docId: doc.id });
                                setRejectDocReason("");
                              }}
                            >
                              Reject
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDocInspectionApp(null)}>Close</Button>
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
              {previewDoc?.document_title || previewDoc?.documentTitle || previewDoc?.document_type_title || previewDoc?.type_name || previewDoc?.slotTitle || previewDoc?.documentTypeCode || previewDoc?.document_type_code || "Document Preview"}
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
        open={Boolean(rejectDocDialog)}
        onClose={() => setRejectDocDialog(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Reject Document</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please state the reason for rejecting this document so the customer can upload a corrected copy.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Rejection Reason"
            placeholder="e.g. Signature missing, blur image, incomplete bank statement"
            value={rejectDocReason}
            onChange={(e) => setRejectDocReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDocDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={!rejectDocReason.trim()}
            onClick={handleRejectDoc}
          >
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
