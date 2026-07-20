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
import branchService from "../../services/branch.service";
import customerService from "../../services/customer.service";

const emptyForm = {
  branchId: "",
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  mobileNumber: "",
  alternateMobile: "",
  email: "",
  aadhaarNumber: "",
  panNumber: "",
  occupation: "",
  monthlyIncome: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

// Strip optional empty fields so blank strings don't fail optional validators
const cleanPayload = (form) => {
  const payload = { ...form, branchId: Number(form.branchId) };
  [
    "lastName",
    "alternateMobile",
    "email",
    "aadhaarNumber",
    "panNumber",
    "occupation",
    "monthlyIncome",
  ].forEach((key) => {
    if (payload[key] === "") delete payload[key];
  });
  if (payload.monthlyIncome !== undefined)
    payload.monthlyIncome = Number(payload.monthlyIncome);
  return payload;
};

export default function CustomerList() {
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const customersQuery = useQuery({
    queryKey: ["customers", search],
    queryFn: () => customerService.getAll({ search }),
  });

  const branchesQuery = useQuery({
    queryKey: ["branches", "form"],
    queryFn: () => branchService.getAll({ limit: 100, status: "ACTIVE" }),
  });

  const invalidateCustomers = () =>
    queryClient.invalidateQueries({ queryKey: ["customers"] });

  const saveCustomer = useMutation({
    mutationFn: () => {
      const payload = cleanPayload(form);
      return dialog.mode === "create"
        ? customerService.create(payload)
        : customerService.update(dialog.customer.customer_id, payload);
    },
    onSuccess: () => {
      toast.success(
        dialog.mode === "create" ? "Customer created." : "Customer updated.",
      );
      setDialog(null);
      invalidateCustomers();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to save the customer.")),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }) =>
      customerService.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success("Customer status updated.");
      invalidateCustomers();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to update customer status.")),
  });

  const removeCustomer = useMutation({
    mutationFn: (id) => customerService.delete(id),
    onSuccess: () => {
      toast.success("Customer deleted.");
      setDialog(null);
      invalidateCustomers();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to delete the customer.")),
  });

  const customers = customersQuery.data?.customers || [];
  const branches = branchesQuery.data?.branches || [];
  const formLoading = branchesQuery.isLoading;

  const openCreate = () => {
    setForm(emptyForm);
    setDialog({ mode: "create" });
  };

  const openEdit = async (customer) => {
    try {
      const details = await customerService.getById(customer.customer_id);
      setForm({
        branchId: String(details.branch_id || ""),
        firstName: details.first_name || "",
        lastName: details.last_name || "",
        gender: details.gender || "",
        dateOfBirth: details.date_of_birth
          ? String(details.date_of_birth).slice(0, 10)
          : "",
        mobileNumber: details.mobile_number || "",
        alternateMobile: details.alternate_mobile || "",
        email: details.email || "",
        aadhaarNumber: details.aadhaar_number || "",
        panNumber: details.pan_number || "",
        occupation: details.occupation || "",
        monthlyIncome: details.monthly_income ?? "",
        address: details.address || "",
        city: details.city || "",
        state: details.state || "",
        pincode: details.pincode || "",
      });
      setDialog({ mode: "edit", customer });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load the customer."));
    }
  };

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const requiredFilled =
    form.branchId &&
    form.firstName &&
    form.gender &&
    form.dateOfBirth &&
    form.mobileNumber &&
    form.address &&
    form.city &&
    form.state &&
    form.pincode;

  return (
    <SectionPage
      title="Customer Management"
      subtitle="Track customer profiles, branch assignments, and KYC status from a central view."
      actions={
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search customers by name or mobile..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) =>
              event.key === "Enter" && customersQuery.refetch()
            }
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => customersQuery.refetch()}
            sx={{ bgcolor: "#0F766E" }}
          >
            Search
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
            Add Customer
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
        {customersQuery.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : customersQuery.isError ? (
          <Box sx={{ p: 6 }}>
            <Alert severity="error">
              Unable to load customers. Please try again.
            </Alert>
          </Box>
        ) : customers.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No customers found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.customer_id}>
                    <TableCell>{customer.customer_code || "-"}</TableCell>
                    <TableCell>
                      {`${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
                        "-"}
                    </TableCell>
                    <TableCell>{customer.branch_name || "-"}</TableCell>
                    <TableCell>{customer.mobile_number || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.status || "-"}
                        size="small"
                        color={
                          customer.status === "ACTIVE"
                            ? "success"
                            : customer.status === "BLACKLISTED"
                              ? "default"
                              : "error"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        <Button size="small" onClick={() => openEdit(customer)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() =>
                            changeStatus.mutate({
                              id: customer.customer_id,
                              status:
                                customer.status === "ACTIVE"
                                  ? "INACTIVE"
                                  : "ACTIVE",
                            })
                          }
                        >
                          {customer.status === "ACTIVE"
                            ? "Deactivate"
                            : "Activate"}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() =>
                            setDialog({ mode: "delete", customer })
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

      <Dialog
        open={Boolean(dialog)}
        onClose={() =>
          !saveCustomer.isPending &&
          !removeCustomer.isPending &&
          setDialog(null)
        }
        fullWidth
        maxWidth="md"
      >
        {dialog?.mode === "delete" ? (
          <>
            <DialogTitle>Delete customer?</DialogTitle>
            <DialogContent>
              <Typography>
                This will deactivate and remove {dialog.customer.first_name}{" "}
                {dialog.customer.last_name} from the customer list.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialog(null)}>Cancel</Button>
              <Button
                color="error"
                variant="contained"
                disabled={removeCustomer.isPending}
                onClick={() =>
                  removeCustomer.mutate(dialog.customer.customer_id)
                }
              >
                Delete
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle>
              {dialog?.mode === "create" ? "Add Customer" : "Edit Customer"}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                {formLoading && (
                  <Alert severity="info">Loading branches…</Alert>
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
                  {branches.map((branch) => (
                    <MenuItem
                      key={branch.branch_id}
                      value={String(branch.branch_id)}
                    >
                      {branch.branch_name}
                    </MenuItem>
                  ))}
                </TextField>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    required
                    fullWidth
                    label="First name"
                    value={form.firstName}
                    onChange={setField("firstName")}
                  />
                  <TextField
                    fullWidth
                    label="Last name"
                    value={form.lastName}
                    onChange={setField("lastName")}
                  />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    required
                    select
                    fullWidth
                    label="Gender"
                    value={form.gender}
                    onChange={setField("gender")}
                  >
                    <MenuItem value="">Select gender</MenuItem>
                    <MenuItem value="MALE">Male</MenuItem>
                    <MenuItem value="FEMALE">Female</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </TextField>
                  <TextField
                    required
                    fullWidth
                    label="Date of birth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={setField("dateOfBirth")}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    required
                    fullWidth
                    label="Mobile number"
                    value={form.mobileNumber}
                    onChange={setField("mobileNumber")}
                  />
                  <TextField
                    fullWidth
                    label="Alternate mobile"
                    value={form.alternateMobile}
                    onChange={setField("alternateMobile")}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={setField("email")}
                  />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Aadhaar number"
                    value={form.aadhaarNumber}
                    onChange={setField("aadhaarNumber")}
                    slotProps={{ htmlInput: { maxLength: 12 } }}
                  />
                  <TextField
                    fullWidth
                    label="PAN number"
                    value={form.panNumber}
                    onChange={setField("panNumber")}
                    slotProps={{ htmlInput: { maxLength: 10 } }}
                  />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Occupation"
                    value={form.occupation}
                    onChange={setField("occupation")}
                  />
                  <TextField
                    fullWidth
                    label="Monthly income"
                    type="number"
                    value={form.monthlyIncome}
                    onChange={setField("monthlyIncome")}
                  />
                </Stack>
                <TextField
                  required
                  fullWidth
                  label="Address"
                  value={form.address}
                  onChange={setField("address")}
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    required
                    fullWidth
                    label="City"
                    value={form.city}
                    onChange={setField("city")}
                  />
                  <TextField
                    required
                    fullWidth
                    label="State"
                    value={form.state}
                    onChange={setField("state")}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Pincode"
                    value={form.pincode}
                    onChange={setField("pincode")}
                  />
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialog(null)}>Cancel</Button>
              <Button
                variant="contained"
                disabled={
                  saveCustomer.isPending || formLoading || !requiredFilled
                }
                onClick={() => saveCustomer.mutate()}
              >
                {saveCustomer.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </SectionPage>
  );
}
