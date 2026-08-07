import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
import loanProductService from "../../services/loanProduct.service";

const emptyForm = {
  name: "",
  productType: "INDIVIDUAL",
  interestType: "FLAT",
  recoveryType: "",
  minAmount: "",
  maxAmount: "",
  minTenure: "",
  maxTenure: "",
  interestRate: "",
  processingFeeType: "PERCENTAGE",
  processingFee: "0",
  insuranceFeeType: "FIXED",
  insuranceFee: "0",
  penaltyType: "FIXED",
  penalty: "0",
  holidayExcluded: true,
  includeGst: false,
  description: "",
};

const numericFields = [
  "minAmount",
  "maxAmount",
  "minTenure",
  "maxTenure",
  "interestRate",
  "processingFee",
  "insuranceFee",
  "penalty",
];

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const toPayload = (form) => {
  const payload = { ...form };
  numericFields.forEach((key) => {
    payload[key] = Number(payload[key]);
  });
  if (!payload.description) delete payload.description;
  return payload;
};

export default function LoanProducts() {
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["loanProducts", search],
    queryFn: () => loanProductService.getAll({ search }),
  });

  const invalidateProducts = () =>
    queryClient.invalidateQueries({ queryKey: ["loanProducts"] });

  const saveProduct = useMutation({
    mutationFn: () => {
      const payload = toPayload(form);
      return dialog.mode === "create"
        ? loanProductService.create(payload)
        : loanProductService.update(dialog.product.loan_product_id, payload);
    },
    onSuccess: () => {
      toast.success(
        dialog.mode === "create"
          ? "Loan product created."
          : "Loan product updated.",
      );
      setDialog(null);
      invalidateProducts();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to save the loan product.")),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }) =>
      loanProductService.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success("Loan product status updated.");
      invalidateProducts();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to update status.")),
  });

  const removeProduct = useMutation({
    mutationFn: (id) => loanProductService.delete(id),
    onSuccess: () => {
      toast.success("Loan product deleted.");
      setDialog(null);
      invalidateProducts();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to delete the loan product.")),
  });

  const products = productsQuery.data?.loanProducts || [];

  const openCreate = () => {
    setForm(emptyForm);
    setDialog({ mode: "create" });
  };

  const openEdit = async (product) => {
    try {
      const details = await loanProductService.getById(product.loan_product_id);
      setForm({
        name: details.product_name || "",
        productType: details.product_type || "INDIVIDUAL",
        interestType: details.interest_type || "FLAT",
        recoveryType: details.recovery_frequency || "",
        minAmount: String(details.minimum_amount ?? ""),
        maxAmount: String(details.maximum_amount ?? ""),
        minTenure: String(details.minimum_tenure ?? ""),
        maxTenure: String(details.maximum_tenure ?? ""),
        interestRate: String(details.interest_rate ?? ""),
        processingFeeType: details.processing_fee_type || "PERCENTAGE",
        processingFee: String(details.processing_fee ?? "0"),
        insuranceFeeType: details.insurance_fee_type || "FIXED",
        insuranceFee: String(details.insurance_fee ?? "0"),
        penaltyType: details.penalty_type || "FIXED",
        penalty: String(details.penalty ?? "0"),
        holidayExcluded: Boolean(details.holiday_excluded),
        includeGst: Boolean(details.include_gst),
        description: details.description || "",
      });
      setDialog({ mode: "edit", product });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load the loan product."));
    }
  };

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  const setChecked = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.checked }));

  const requiredFilled =
    form.name &&
    form.recoveryType &&
    form.minAmount &&
    form.maxAmount &&
    form.minTenure &&
    form.maxTenure &&
    form.interestRate;

  return (
    <SectionPage
      title="Loan Schemes & Products"
      subtitle="Configure microfinance loan products, interest rates, fee structures, and eligibility ranges."
      actions={
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search by name or code..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) =>
              event.key === "Enter" && productsQuery.refetch()
            }
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => productsQuery.refetch()}
            sx={{ bgcolor: "#0F766E" }}
          >
            Search
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D655D" } }}
          >
            Add New Loan Scheme
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
        {productsQuery.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : productsQuery.isError ? (
          <Box sx={{ p: 6 }}>
            <Alert severity="error">
              Unable to load loan products. Please try again.
            </Alert>
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No loan schemes found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell fontWeight="bold">Code</TableCell>
                  <TableCell fontWeight="bold">Scheme Name</TableCell>
                  <TableCell fontWeight="bold">Type</TableCell>
                  <TableCell fontWeight="bold">Recovery</TableCell>
                  <TableCell fontWeight="bold">Amount Range</TableCell>
                  <TableCell fontWeight="bold">Interest Rate</TableCell>
                  <TableCell fontWeight="bold">Status</TableCell>
                  <TableCell align="right" fontWeight="bold">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.loan_product_id} hover>
                    <TableCell>{product.product_code || "-"}</TableCell>
                    <TableCell fontWeight="600">{product.product_name || "-"}</TableCell>
                    <TableCell>{product.product_type || "-"}</TableCell>
                    <TableCell>{product.recovery_frequency || "-"}</TableCell>
                    <TableCell>
                      ₹{product.minimum_amount ? Number(product.minimum_amount).toLocaleString() : 0} - ₹{product.maximum_amount ? Number(product.maximum_amount).toLocaleString() : 0}
                    </TableCell>
                    <TableCell>{product.interest_rate ?? "-"}% p.a.</TableCell>
                    <TableCell>
                      <Chip
                        label={product.status || "-"}
                        size="small"
                        color={
                          product.status === "ACTIVE" ? "success" : "error"
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Button size="small" onClick={() => openEdit(product)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color={product.status === "ACTIVE" ? "warning" : "success"}
                          onClick={() =>
                            changeStatus.mutate({
                              id: product.loan_product_id,
                              status:
                                product.status === "ACTIVE"
                                  ? "INACTIVE"
                                  : "ACTIVE",
                            })
                          }
                        >
                          {product.status === "ACTIVE"
                            ? "Disable"
                            : "Enable"}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => setDialog({ mode: "delete", product })}
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

      <Dialog
        open={Boolean(dialog)}
        onClose={() =>
          !saveProduct.isPending && !removeProduct.isPending && setDialog(null)
        }
        fullWidth
        maxWidth="md"
      >
        {dialog?.mode === "delete" ? (
          <>
            <DialogTitle>Delete Loan Scheme?</DialogTitle>
            <DialogContent>
              <Typography color="text.secondary">
                Are you sure you want to remove <strong>{dialog.product.product_name}</strong> from the active loan scheme catalog?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialog(null)}>Cancel</Button>
              <Button
                color="error"
                variant="contained"
                disabled={removeProduct.isPending}
                onClick={() =>
                  removeProduct.mutate(dialog.product.loan_product_id)
                }
              >
                Delete Scheme
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle>
              {dialog?.mode === "create"
                ? "Add New Loan Scheme"
                : "Edit Loan Scheme Details"}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField
                  required
                  fullWidth
                  label="Scheme Name"
                  value={form.name}
                  onChange={setField("name")}
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    select
                    fullWidth
                    label="Product Type"
                    value={form.productType}
                    onChange={setField("productType")}
                  >
                    <MenuItem value="INDIVIDUAL">Individual Loan</MenuItem>
                    <MenuItem value="GROUP">Group / SHG Loan</MenuItem>
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label="Interest Calculation Type"
                    value={form.interestType}
                    onChange={setField("interestType")}
                  >
                    <MenuItem value="FLAT">Flat Rate</MenuItem>
                    <MenuItem value="REDUCING">Reducing Balance</MenuItem>
                  </TextField>
                  <TextField
                    required
                    select
                    fullWidth
                    label="Recovery Frequency"
                    value={form.recoveryType}
                    onChange={setField("recoveryType")}
                  >
                    <MenuItem value="">Select Frequency</MenuItem>
                    <MenuItem value="DAILY">Daily</MenuItem>
                    <MenuItem value="WEEKLY">Weekly</MenuItem>
                    <MenuItem value="BI_WEEKLY">Bi-Weekly</MenuItem>
                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                  </TextField>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Minimum Amount (₹)"
                    value={form.minAmount}
                    onChange={setField("minAmount")}
                  />
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Maximum Amount (₹)"
                    value={form.maxAmount}
                    onChange={setField("maxAmount")}
                  />
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Interest Rate (% p.a.)"
                    value={form.interestRate}
                    onChange={setField("interestRate")}
                  />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Minimum Tenure (Months)"
                    value={form.minTenure}
                    onChange={setField("minTenure")}
                  />
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Maximum Tenure (Months)"
                    value={form.maxTenure}
                    onChange={setField("maxTenure")}
                  />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    select
                    fullWidth
                    label="Processing Fee Type"
                    value={form.processingFeeType}
                    onChange={setField("processingFeeType")}
                  >
                    <MenuItem value="FIXED">Flat (₹)</MenuItem>
                    <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
                  </TextField>
                  <TextField
                    fullWidth
                    type="number"
                    label="Processing Fee Amount/Rate"
                    value={form.processingFee}
                    onChange={setField("processingFee")}
                  />
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Description & Scheme Features"
                  value={form.description}
                  onChange={setField("description")}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialog(null)}>Cancel</Button>
              <Button
                variant="contained"
                disabled={saveProduct.isPending || !requiredFilled}
                onClick={() => saveProduct.mutate()}
                sx={{ bgcolor: "#0F766E" }}
              >
                {saveProduct.isPending ? "Saving Scheme…" : "Save Scheme"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </SectionPage>
  );
}
