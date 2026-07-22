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
  name: "", // was productName
  productType: "INDIVIDUAL",
  interestType: "FLAT",
  recoveryType: "", // was recoveryFrequency
  minAmount: "", // was minimumAmount
  maxAmount: "", // was maximumAmount
  minTenure: "", // was minimumTenure
  maxTenure: "", // was maximumTenure
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
      title="Loan Products"
      subtitle="Configure loan product types, interest rates, fees, and eligibility ranges."
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
          >
            Add Loan Product
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
            <Typography color="#64748B">No loan products found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Recovery</TableCell>
                  <TableCell>Amount Range</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.loan_product_id}>
                    <TableCell>{product.product_code || "-"}</TableCell>
                    <TableCell>{product.product_name || "-"}</TableCell>
                    <TableCell>{product.product_type || "-"}</TableCell>
                    <TableCell>{product.recovery_frequency || "-"}</TableCell>
                    <TableCell>
                      {product.minimum_amount ?? "-"} -{" "}
                      {product.maximum_amount ?? "-"}
                    </TableCell>
                    <TableCell>{product.interest_rate ?? "-"}%</TableCell>
                    <TableCell>
                      <Chip
                        label={product.status || "-"}
                        size="small"
                        color={
                          product.status === "ACTIVE" ? "success" : "error"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        <Button size="small" onClick={() => openEdit(product)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
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
                            ? "Deactivate"
                            : "Activate"}
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
            <DialogTitle>Delete loan product?</DialogTitle>
            <DialogContent>
              <Typography>
                This will remove {dialog.product.product_name} from the loan
                product list.
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
                Delete
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle>
              {dialog?.mode === "create"
                ? "Add Loan Product"
                : "Edit Loan Product"}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField
                  required
                  fullWidth
                  label="Product name"
                  value={form.name}
                  onChange={setField("name")}
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    select
                    fullWidth
                    label="Product type"
                    value={form.productType}
                    onChange={setField("productType")}
                  >
                    <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                    <MenuItem value="GROUP">Group</MenuItem>
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label="Interest type"
                    value={form.interestType}
                    onChange={setField("interestType")}
                  >
                    <MenuItem value="FLAT">Flat</MenuItem>
                    <MenuItem value="REDUCING">Reducing</MenuItem>
                  </TextField>
                  <TextField
                    required
                    select
                    fullWidth
                    label="Recovery frequency"
                    value={form.recoveryType}
                    onChange={setField("recoveryType")}
                  >
                    <MenuItem value="">Select frequency</MenuItem>
                    <MenuItem value="DAILY">Daily</MenuItem>
                    <MenuItem value="WEEKLY">Weekly</MenuItem>
                    <MenuItem value="BI_WEEKLY">Bi-weekly</MenuItem>
                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                    <MenuItem value="YEARLY">Yearly</MenuItem>
                    <MenuItem value="ONE_TIME">One-time</MenuItem>
                  </TextField>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Minimum amount"
                    value={form.minAmount}
                    onChange={setField("minAmount")}
                  />
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Maximum amount"
                    value={form.maxAmount}
                    onChange={setField("maxAmount")}
                  />
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Interest rate (%)"
                    value={form.interestRate}
                    onChange={setField("interestRate")}
                  />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Minimum tenure"
                    value={form.minTenure}
                    onChange={setField("minTenure")}
                  />
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Maximum tenure"
                    value={form.maxTenure}
                    onChange={setField("maxTenure")}
                  />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    select
                    fullWidth
                    label="Processing fee type"
                    value={form.processingFeeType}
                    onChange={setField("processingFeeType")}
                  >
                    <MenuItem value="FIXED">Fixed</MenuItem>
                    <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                  </TextField>
                  <TextField
                    fullWidth
                    type="number"
                    label="Processing fee"
                    value={form.processingFee}
                    onChange={setField("processingFee")}
                  />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    select
                    fullWidth
                    label="Insurance fee type"
                    value={form.insuranceFeeType}
                    onChange={setField("insuranceFeeType")}
                  >
                    <MenuItem value="FIXED">Fixed</MenuItem>
                    <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                  </TextField>
                  <TextField
                    fullWidth
                    type="number"
                    label="Insurance fee"
                    value={form.insuranceFee}
                    onChange={setField("insuranceFee")}
                  />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    select
                    fullWidth
                    label="Penalty type"
                    value={form.penaltyType}
                    onChange={setField("penaltyType")}
                  >
                    <MenuItem value="FIXED">Fixed</MenuItem>
                    <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                  </TextField>
                  <TextField
                    fullWidth
                    type="number"
                    label="Penalty"
                    value={form.penalty}
                    onChange={setField("penalty")}
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.holidayExcluded}
                        onChange={setChecked("holidayExcluded")}
                      />
                    }
                    label="Exclude holidays from recovery"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.includeGst}
                        onChange={setChecked("includeGst")}
                      />
                    }
                    label="Include GST"
                  />
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Description"
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
              >
                {saveProduct.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </SectionPage>
  );
}
