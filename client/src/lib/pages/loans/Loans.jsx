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
import { Search as SearchIcon } from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import branchService from "../../services/branch.service";
import loanApplicationService from "../../services/loanApplication.service";
import loanService from "../../services/loan.service";
import useAuth from "../../hooks/useAuth";

const emptyForm = {
  applicationId: "",
  branchId: "",
  principalAmount: "",
  disbursedAmount: "",
  interestRate: "",
  totalInterest: "",
  totalPayable: "",
  outstandingAmount: "",
  disbursementDate: "",
  maturityDate: "",
  remarks: "",
};

const STATUS_COLORS = {
  ACTIVE: "success",
  CLOSED: "default",
  FORECLOSED: "info",
  DEFAULTED: "error",
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function Loans() {
  const { user } = useAuth();
  const canManageLoans = (user?.role_name || user?.role) === "ADMIN";
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [appDetails, setAppDetails] = useState(null);
  const queryClient = useQueryClient();

  const loansQuery = useQuery({
    queryKey: ["loans", search],
    queryFn: () => loanService.getAll({ search }),
  });

  const applicationsQuery = useQuery({
    queryKey: ["loanApplications", "approved"],
    queryFn: () => loanApplicationService.getAll({ status: "APPROVED" }),
    enabled: dialog?.mode === "create",
  });

  const branchesQuery = useQuery({
    queryKey: ["branches", "form"],
    queryFn: () => branchService.getAll({ limit: 100, status: "ACTIVE" }),
    enabled: dialog?.mode === "create",
  });

  const invalidateLoans = () =>
    queryClient.invalidateQueries({ queryKey: ["loans"] });

  const saveLoan = useMutation({
    mutationFn: () => {
      if (dialog.mode === "create") {
        const payload = {
          applicationId: Number(form.applicationId),
          branchId: Number(form.branchId),
          customerId: appDetails?.customer_id,
          groupId: appDetails?.group_id || undefined,
          loanProductId: appDetails?.loan_product_id,
          tenure: appDetails?.tenure,
          recoveryFrequency: appDetails?.recovery_frequency,
          principalAmount: Number(form.principalAmount),
          disbursedAmount: Number(form.disbursedAmount),
          interestRate: Number(form.interestRate),
          totalInterest: Number(form.totalInterest),
          totalPayable: Number(form.totalPayable),
          outstandingAmount: Number(form.outstandingAmount),
          disbursementDate: form.disbursementDate,
        };
        if (form.maturityDate) payload.maturityDate = form.maturityDate;
        if (form.remarks) payload.remarks = form.remarks;
        return loanService.create(payload);
      }
      const payload = {
        principalAmount: Number(form.principalAmount),
        disbursedAmount: Number(form.disbursedAmount),
        interestRate: Number(form.interestRate),
        totalInterest: Number(form.totalInterest),
        totalPayable: Number(form.totalPayable),
        outstandingAmount: Number(form.outstandingAmount),
        disbursementDate: form.disbursementDate,
      };
      if (form.maturityDate) payload.maturityDate = form.maturityDate;
      if (form.remarks) payload.remarks = form.remarks;
      return loanService.update(dialog.loan.loan_id, payload);
    },
    onSuccess: () => {
      toast.success(
        dialog.mode === "create" ? "Loan disbursed." : "Loan updated.",
      );
      setDialog(null);
      invalidateLoans();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to save the loan.")),
  });

  const closeLoan = useMutation({
    mutationFn: (id) => loanService.close(id),
    onSuccess: () => {
      toast.success("Loan closed.");
      invalidateLoans();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to close the loan.")),
  });

  const forecloseLoan = useMutation({
    mutationFn: (id) => loanService.foreclose(id),
    onSuccess: () => {
      toast.success("Loan foreclosed.");
      invalidateLoans();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to foreclose the loan.")),
  });

  const defaultLoan = useMutation({
    mutationFn: (id) => loanService.markDefault(id),
    onSuccess: () => {
      toast.success("Loan marked as defaulted.");
      invalidateLoans();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to update the loan.")),
  });

  const loans = loansQuery.data?.loans || [];
  const applications = applicationsQuery.data?.loanApplications || [];
  const branches = branchesQuery.data?.branches || [];
  const formLoading = applicationsQuery.isLoading || branchesQuery.isLoading;

  const openCreate = () => {
    setForm(emptyForm);
    setAppDetails(null);
    setDialog({ mode: "create" });
  };

  const openEdit = async (loan) => {
    try {
      const details = await loanService.getById(loan.loan_id);
      setForm({
        applicationId: "",
        branchId: "",
        principalAmount: String(details.principal_amount ?? ""),
        disbursedAmount: String(details.disbursed_amount ?? ""),
        interestRate: String(details.interest_rate ?? ""),
        totalInterest: String(details.total_interest ?? ""),
        totalPayable: String(details.total_payable ?? ""),
        outstandingAmount: String(details.outstanding_amount ?? ""),
        disbursementDate: details.disbursement_date
          ? String(details.disbursement_date).slice(0, 10)
          : "",
        maturityDate: details.maturity_date
          ? String(details.maturity_date).slice(0, 10)
          : "",
        remarks: details.remarks || "",
      });
      setDialog({ mode: "edit", loan });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load the loan."));
    }
  };

  const onSelectApplication = async (event) => {
    const applicationId = event.target.value;
    setForm((current) => ({ ...current, applicationId }));
    if (!applicationId) {
      setAppDetails(null);
      return;
    }
    try {
      const details = await loanApplicationService.getById(
        Number(applicationId),
      );
      setAppDetails(details);
      setForm((current) => ({
        ...current,
        principalAmount: String(
          details.approved_amount ?? details.requested_amount ?? "",
        ),
      }));
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to load application details."),
      );
    }
  };

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const requiredFilled =
    dialog?.mode === "create"
      ? form.applicationId &&
        form.branchId &&
        form.principalAmount &&
        form.disbursedAmount &&
        form.interestRate &&
        form.totalInterest &&
        form.totalPayable &&
        form.outstandingAmount &&
        form.disbursementDate
      : form.principalAmount &&
        form.disbursedAmount &&
        form.interestRate &&
        form.totalInterest &&
        form.totalPayable &&
        form.outstandingAmount &&
        form.disbursementDate;

  return (
    <SectionPage
      title="Loans"
      subtitle="Disburse approved applications and manage active loan accounts."
      actions={
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search by loan # or customer..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && loansQuery.refetch()}
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => loansQuery.refetch()}
            sx={{ bgcolor: "#0F766E" }}
          >
            Search
          </Button>
          {canManageLoans && <Button variant="contained" onClick={openCreate}>
            Disburse Loan
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
        {loansQuery.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : loansQuery.isError ? (
          <Box sx={{ p: 6 }}>
            <Alert severity="error">
              Unable to load loans. Please try again.
            </Alert>
          </Box>
        ) : loans.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No loans found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell>Loan #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Principal</TableCell>
                  <TableCell>Outstanding</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.loan_id}>
                    <TableCell>{loan.loan_number || "-"}</TableCell>
                    <TableCell>{loan.customer_name || "-"}</TableCell>
                    <TableCell>{loan.branch_name || "-"}</TableCell>
                    <TableCell>{loan.principal_amount ?? "-"}</TableCell>
                    <TableCell>{loan.outstanding_amount ?? "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={loan.status || "-"}
                        size="small"
                        color={STATUS_COLORS[loan.status] || "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        {canManageLoans && loan.status === "ACTIVE" && (
                          <Button size="small" onClick={() => openEdit(loan)}>
                            Edit
                          </Button>
                        )}
                        {canManageLoans && loan.status === "ACTIVE" && (
                          <Button
                            size="small"
                            color="success"
                            onClick={() => closeLoan.mutate(loan.loan_id)}
                          >
                            Close
                          </Button>
                        )}
                        {canManageLoans && loan.status === "ACTIVE" && (
                          <Button
                            size="small"
                            onClick={() => forecloseLoan.mutate(loan.loan_id)}
                          >
                            Foreclose
                          </Button>
                        )}
                        {canManageLoans && loan.status === "ACTIVE" && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => defaultLoan.mutate(loan.loan_id)}
                          >
                            Mark Defaulted
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
        open={Boolean(dialog)}
        onClose={() => !saveLoan.isPending && setDialog(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {dialog?.mode === "create" ? "Disburse Loan" : "Edit Loan"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {dialog?.mode === "create" && (
              <>
                {formLoading && (
                  <Alert severity="info">
                    Loading approved applications and branches…
                  </Alert>
                )}
                <TextField
                  required
                  select
                  fullWidth
                  label="Approved application"
                  value={form.applicationId}
                  onChange={onSelectApplication}
                  disabled={formLoading}
                >
                  <MenuItem value="">Select an approved application</MenuItem>
                  {applications.map((app) => (
                    <MenuItem
                      key={app.application_id}
                      value={String(app.application_id)}
                    >
                      {app.application_number} — {app.customer_name}
                    </MenuItem>
                  ))}
                </TextField>
                {appDetails && (
                  <Alert severity="info">
                    Customer: {appDetails.customer_name} · Product:{" "}
                    {appDetails.product_name} · Tenure: {appDetails.tenure} ·
                    Recovery: {appDetails.recovery_frequency}
                  </Alert>
                )}
                <TextField
                  required
                  select
                  fullWidth
                  label="Branch"
                  value={form.branchId}
                  onChange={setField("branchId")}
                  disabled={formLoading}
                >
                  <MenuItem value="">Select a branch</MenuItem>
                  {branches.map((b) => (
                    <MenuItem key={b.branch_id} value={String(b.branch_id)}>
                      {b.branch_name}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                fullWidth
                type="number"
                label="Principal amount"
                value={form.principalAmount}
                onChange={setField("principalAmount")}
              />
              <TextField
                required
                fullWidth
                type="number"
                label="Disbursed amount"
                value={form.disbursedAmount}
                onChange={setField("disbursedAmount")}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                fullWidth
                type="number"
                label="Interest rate (%)"
                value={form.interestRate}
                onChange={setField("interestRate")}
              />
              <TextField
                required
                fullWidth
                type="number"
                label="Total interest"
                value={form.totalInterest}
                onChange={setField("totalInterest")}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                fullWidth
                type="number"
                label="Total payable"
                value={form.totalPayable}
                onChange={setField("totalPayable")}
              />
              <TextField
                required
                fullWidth
                type="number"
                label="Outstanding amount"
                value={form.outstandingAmount}
                onChange={setField("outstandingAmount")}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                fullWidth
                type="date"
                label="Disbursement date"
                value={form.disbursementDate}
                onChange={setField("disbursementDate")}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                type="date"
                label="Maturity date"
                value={form.maturityDate}
                onChange={setField("maturityDate")}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
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
              saveLoan.isPending ||
              (dialog?.mode === "create" && formLoading) ||
              !requiredFilled
            }
            onClick={() => saveLoan.mutate()}
          >
            {saveLoan.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
