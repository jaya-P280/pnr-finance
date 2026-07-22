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
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import customerService from "../../services/customer.service";
import loanProductService from "../../services/loanProduct.service";
import loanApplicationService from "../../services/loanApplication.service";

const emptyForm = {
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

const toPayload = (form) => {
  const payload = {
    customerId: Number(form.customerId),
    loanProductId: Number(form.loanProductId),
    requestedAmount: Number(form.requestedAmount),
    tenure: Number(form.tenure),
  };
  if (form.purpose) payload.purpose = form.purpose;
  if (form.remarks) payload.remarks = form.remarks;
  return payload;
};

export default function LoanApplications() {
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyForm);
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
  });

  const loanProductsQuery = useQuery({
    queryKey: ["loanProducts", "form"],
    queryFn: () => loanProductService.getAll({ limit: 100, status: "ACTIVE" }),
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
  const loanProducts = loanProductsQuery.data?.loanProducts || [];
  const formLoading = customersQuery.isLoading || loanProductsQuery.isLoading;

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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
            New Application
          </Button>
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
                        {canEditOrDelete(app.application_status) && (
                          <Button size="small" onClick={() => openEdit(app)}>
                            Edit
                          </Button>
                        )}
                        {app.application_status === "PENDING" && (
                          <Button
                            size="small"
                            onClick={() =>
                              sendForReview.mutate(app.application_id)
                            }
                          >
                            Send for Review
                          </Button>
                        )}
                        {app.application_status === "UNDER_REVIEW" && (
                          <Button
                            size="small"
                            onClick={() =>
                              verifyApplication.mutate(app.application_id)
                            }
                          >
                            Verify
                          </Button>
                        )}
                        {app.application_status === "VERIFIED" && (
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
                        {["PENDING", "UNDER_REVIEW", "VERIFIED"].includes(
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
                        {app.application_status === "APPROVED" && (
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
                        {canEditOrDelete(app.application_status) && (
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
              required
              select
              fullWidth
              label="Customer"
              value={form.customerId}
              onChange={setField("customerId")}
              disabled={formLoading}
            >
              <MenuItem value="">Select a customer</MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.customer_id} value={String(c.customer_id)}>
                  {`${c.first_name} ${c.last_name || ""}`.trim()} (
                  {c.customer_code})
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
              saveApplication.isPending || formLoading || !requiredFilled
            }
            onClick={() => saveApplication.mutate()}
          >
            {saveApplication.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
