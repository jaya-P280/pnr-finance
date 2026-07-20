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

const emptyForm = {
  branchName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function BranchList() {
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const branchesQuery = useQuery({
    queryKey: ["branches", search],
    queryFn: () => branchService.getAll({ search }),
  });

  const invalidateBranches = () =>
    queryClient.invalidateQueries({ queryKey: ["branches"] });

  const saveBranch = useMutation({
    mutationFn: () =>
      dialog.mode === "create"
        ? branchService.create(form)
        : branchService.update(dialog.branch.branch_id, form),
    onSuccess: () => {
      toast.success(
        dialog.mode === "create" ? "Branch created." : "Branch updated.",
      );
      setDialog(null);
      invalidateBranches();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to save the branch.")),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }) => branchService.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success("Branch status updated.");
      invalidateBranches();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to update branch status.")),
  });

  const removeBranch = useMutation({
    mutationFn: (id) => branchService.delete(id),
    onSuccess: () => {
      toast.success("Branch deleted.");
      setDialog(null);
      invalidateBranches();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to delete the branch.")),
  });

  const branches = branchesQuery.data?.branches || [];

  const openCreate = () => {
    setForm(emptyForm);
    setDialog({ mode: "create" });
  };

  const openEdit = (branch) => {
    setForm({
      branchName: branch.branch_name || "",
      phone: branch.phone || "",
      email: branch.email || "",
      address: branch.address || "",
      city: branch.city || "",
      state: branch.state || "",
      pincode: branch.pincode || "",
    });
    setDialog({ mode: "edit", branch });
  };

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <SectionPage
      title="Branch Management"
      subtitle="Manage branch locations, contact information, and status from a single view."
      actions={
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search branches by name or code..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) =>
              event.key === "Enter" && branchesQuery.refetch()
            }
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => branchesQuery.refetch()}
            sx={{ bgcolor: "#0F766E" }}
          >
            Search
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
            Add Branch
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
        {branchesQuery.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : branchesQuery.isError ? (
          <Box sx={{ p: 6 }}>
            <Alert severity="error">
              Unable to load branches. Please try again.
            </Alert>
          </Box>
        ) : branches.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No branches found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.branch_id}>
                    <TableCell>{branch.branch_code || "-"}</TableCell>
                    <TableCell>{branch.branch_name || "-"}</TableCell>
                    <TableCell>{branch.city || "-"}</TableCell>
                    <TableCell>{branch.state || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={branch.status || "-"}
                        size="small"
                        color={branch.status === "ACTIVE" ? "success" : "error"}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        <Button size="small" onClick={() => openEdit(branch)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() =>
                            changeStatus.mutate({
                              id: branch.branch_id,
                              status:
                                branch.status === "ACTIVE"
                                  ? "INACTIVE"
                                  : "ACTIVE",
                            })
                          }
                        >
                          {branch.status === "ACTIVE"
                            ? "Deactivate"
                            : "Activate"}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => setDialog({ mode: "delete", branch })}
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
          !saveBranch.isPending && !removeBranch.isPending && setDialog(null)
        }
        fullWidth
        maxWidth="sm"
      >
        {dialog?.mode === "delete" ? (
          <>
            <DialogTitle>Delete branch?</DialogTitle>
            <DialogContent>
              <Typography>
                This will deactivate and remove {dialog.branch.branch_name} from
                the branch list.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialog(null)}>Cancel</Button>
              <Button
                color="error"
                variant="contained"
                disabled={removeBranch.isPending}
                onClick={() => removeBranch.mutate(dialog.branch.branch_id)}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle>
              {dialog?.mode === "create" ? "Add Branch" : "Edit Branch"}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField
                  required
                  fullWidth
                  label="Branch name"
                  value={form.branchName}
                  onChange={setField("branchName")}
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    required
                    fullWidth
                    label="Phone"
                    value={form.phone}
                    onChange={setField("phone")}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={setField("email")}
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
                  saveBranch.isPending ||
                  !form.branchName ||
                  !form.phone ||
                  !form.email ||
                  !form.address ||
                  !form.city ||
                  !form.state ||
                  !form.pincode
                }
                onClick={() => saveBranch.mutate()}
              >
                {saveBranch.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </SectionPage>
  );
}
