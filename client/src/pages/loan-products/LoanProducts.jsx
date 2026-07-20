import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Percent as PercentIcon } from "@mui/icons-material";
import SectionPage from "../../components/layout/SectionPage";

// Mock data
const mockProducts = [
  {
    id: 1,
    name: "Standard Microloan",
    minAmount: "₹10,000",
    maxAmount: "₹5,00,000",
    tenure: "12-60 months",
    interestRate: "12%",
    processingFee: "2%",
    status: "active",
  },
  {
    id: 2,
    name: "Agricultural Loan",
    minAmount: "₹20,000",
    maxAmount: "₹10,00,000",
    tenure: "6-36 months",
    interestRate: "10%",
    processingFee: "1.5%",
    status: "active",
  },
  {
    id: 3,
    name: "Business Expansion",
    minAmount: "₹50,000",
    maxAmount: "₹15,00,000",
    tenure: "24-60 months",
    interestRate: "14%",
    processingFee: "2.5%",
    status: "active",
  },
];

export default function LoanProducts() {
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    minAmount: "",
    maxAmount: "",
    tenure: "",
    interestRate: "",
    processingFee: "",
    status: "active",
  });

  const { data = mockProducts, isLoading } = useQuery({
    queryKey: ["loan-products", search],
    queryFn: async () => {
      // const response = await loanProductService.getAll({ search });
      // return response.products;
      return mockProducts;
    },
    keepPreviousData: true,
  });

  const products = search
    ? data.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
    : data;

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        minAmount: "",
        maxAmount: "",
        tenure: "",
        interestRate: "",
        processingFee: "",
        status: "active",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async () => {
    // TODO: API call to save product
    console.log("Saving product:", editingProduct ? `Update ${editingProduct.id}` : "Create new", formData);
    handleCloseDialog();
  };

  return (
    <SectionPage
      title="Loan Products"
      subtitle="Configure and manage loan products with interest rates, fees, and tenure settings."
      actions={
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{
              minWidth: 250,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": {
                  borderColor: "#0F766E",
                },
              },
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "#94A3B8" }} />,
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: "#2563EB",
              "&:hover": { bgcolor: "#1D4ED8" },
              borderRadius: 2,
            }}
          >
            Add Product
          </Button>
        </Stack>
      }
    >
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress sx={{ color: "#0F766E" }} />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No products found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Product Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Min Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Max Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Tenure</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Interest Rate</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Fee</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    sx={{
                      "&:hover": { bgcolor: "#F0F9FF" },
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                      {product.name}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      {product.minAmount}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      {product.maxAmount}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      {product.tenure}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<PercentIcon />}
                        label={product.interestRate}
                        size="small"
                        sx={{
                          bgcolor: "#FEE2E2",
                          color: "#991B1B",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      {product.processingFee}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.status}
                        size="small"
                        sx={{
                          bgcolor: product.status === "active" ? "#DCFCE7" : "#FEE2E2",
                          color: product.status === "active" ? "#15803D" : "#991B1B",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          variant="text"
                          onClick={() => handleOpenDialog(product)}
                          sx={{ color: "#0F766E" }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          variant="text"
                          sx={{ color: "#EF4444" }}
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

      {/* Product Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#F8FAFC", color: "#0F172A", fontWeight: 700 }}>
          {editingProduct ? "Edit Loan Product" : "Create New Loan Product"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Min Amount"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max Amount"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                    },
                  }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Tenure"
              value={formData.tenure}
              onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
              fullWidth
              placeholder="e.g., 12-60 months"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Interest Rate"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Processing Fee"
                  value={formData.processingFee}
                  onChange={(e) => setFormData({ ...formData, processingFee: e.target.value })}
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                    },
                  }}
                />
              </Grid>
            </Grid>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
                sx={{
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                  },
                }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#F8FAFC" }}>
          <Button onClick={handleCloseDialog} sx={{ color: "#64748B" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveProduct}
            variant="contained"
            sx={{
              bgcolor: "#0F766E",
              "&:hover": { bgcolor: "#0D9488" },
            }}
          >
            {editingProduct ? "Update" : "Create"} Product
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
