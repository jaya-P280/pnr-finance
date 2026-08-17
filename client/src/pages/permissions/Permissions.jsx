import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  AccountBalance as BranchIcon,
  People as CustomerIcon,
  MonetizationOn as LoanIcon,
  Payments as CollectionIcon,
  ReceiptLong as AuditIcon,
  GridView as CardsIcon,
  TableChart as TableIcon,
} from "@mui/icons-material";
import SectionPage from "../../components/layout/SectionPage";
import permissionService from "../../services/permission.service";

const getModuleIcon = (moduleName = "") => {
  const name = moduleName.toUpperCase();
  if (name.includes("ADMIN")) return <AdminIcon sx={{ color: "#0F766E" }} />;
  if (name.includes("BRANCH")) return <BranchIcon sx={{ color: "#0284C7" }} />;
  if (name.includes("CUSTOMER")) return <CustomerIcon sx={{ color: "#7C3AED" }} />;
  if (name.includes("LOAN")) return <LoanIcon sx={{ color: "#D97706" }} />;
  if (name.includes("COLLECTION")) return <CollectionIcon sx={{ color: "#16A34A" }} />;
  if (name.includes("AUDIT")) return <AuditIcon sx={{ color: "#DC2626" }} />;
  return <SecurityIcon sx={{ color: "#475569" }} />;
};

const getChipColor = (permName = "") => {
  const p = permName.toUpperCase();
  if (p.includes("CREATE") || p.includes("ADD")) return { bg: "#DCFCE7", text: "#15803D", border: "#86EFAC", action: "CREATE" };
  if (p.includes("VIEW") || p.includes("READ")) return { bg: "#E0F2FE", text: "#0369A1", border: "#7DD3FC", action: "VIEW" };
  if (p.includes("DELETE") || p.includes("REMOVE")) return { bg: "#FEE2E2", text: "#B91C1C", border: "#FCA5A5", action: "DELETE" };
  if (p.includes("UPDATE") || p.includes("EDIT")) return { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A", action: "UPDATE" };
  return { bg: "#F1F5F9", text: "#334155", border: "#CBD5E1", action: "MANAGE" };
};

export default function Permissions() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table");

  const groupedQuery = useQuery({
    queryKey: ["permissionsGrouped"],
    queryFn: () => permissionService.getGrouped(),
  });

  const groups = groupedQuery.data || [];

  const filteredGroups = groups
    .map((group) => {
      const q = search.toLowerCase().trim();
      if (!q) return group;
      const matchModule = group.moduleName?.toLowerCase().includes(q);
      const filteredPerms = (group.permissions || []).filter(
        (p) =>
          p.permission_name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
      if (matchModule) return group;
      return { ...group, permissions: filteredPerms };
    })
    .filter((group) => group.permissions && group.permissions.length > 0);

  const totalPermissions = groups.reduce(
    (acc, g) => acc + (g.permissions?.length || 0),
    0
  );

  // Flattened array for Table View
  const allPermissionsList = filteredGroups.flatMap((group) =>
    (group.permissions || []).map((perm) => ({
      ...perm,
      moduleName: group.moduleName,
    }))
  );

  return (
    <SectionPage
      title="System Permissions Catalog"
      subtitle={`Browse and search ${totalPermissions} active system permissions across ${groups.length} core operational modules.`}
    >
      {/* Search & Layout Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          border: "1px solid #E2E8F0",
          borderRadius: 3,
          bgcolor: "#FFFFFF",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search permissions by name, action (CREATE, VIEW, DELETE) or module..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#0F766E" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "#F8FAFC",
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "flex-end" }, alignItems: "center", gap: 2 }}>
            <Typography variant="body2" color="#64748B" fontWeight={600}>
              Showing <b>{allPermissionsList.length}</b> permissions
            </Typography>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, next) => next && setViewMode(next)}
              size="small"
              sx={{ bgcolor: "#F8FAFC", p: 0.5, borderRadius: 2 }}
            >
              <ToggleButton value="table" sx={{ borderRadius: 1.5, px: 2, fontWeight: 700, fontSize: "0.8rem" }}>
                <TableIcon sx={{ mr: 1, fontSize: 18 }} /> Table Format
              </ToggleButton>
              <ToggleButton value="cards" sx={{ borderRadius: 1.5, px: 2, fontWeight: 700, fontSize: "0.8rem" }}>
                <CardsIcon sx={{ mr: 1, fontSize: 18 }} /> Module Cards
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {groupedQuery.isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress sx={{ color: "#0F766E" }} />
        </Box>
      ) : groupedQuery.isError ? (
        <Alert severity="error">Unable to load permission catalog.</Alert>
      ) : filteredGroups.length === 0 ? (
        <Box sx={{ p: 6, textAlign: "center" }}>
          <Typography color="#64748B">No matching permissions found.</Typography>
        </Box>
      ) : viewMode === "table" ? (
        /* TABLE VIEW FORMAT */
        <TableContainer component={Paper} sx={{ borderRadius: 3.5, border: "1px solid #E2E8F0", boxShadow: "none" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>MODULE GROUP</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>PERMISSION CODE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>ACTION TYPE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>DESCRIPTION & PURPOSE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>ACCESS CONTROL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allPermissionsList.map((perm) => {
                const style = getChipColor(perm.permission_name);
                return (
                  <TableRow key={perm.permission_id} hover>
                    <TableCell sx={{ fontWeight: 600, color: "#64748B" }}>
                      #{perm.permission_id}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ p: 0.5, borderRadius: 1.5, bgcolor: "#F1F5F9", display: "flex" }}>
                          {getModuleIcon(perm.moduleName)}
                        </Box>
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {perm.moduleName}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800} sx={{ color: "#0F766E", fontFamily: "monospace" }}>
                        {perm.permission_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={style.action}
                        size="small"
                        sx={{
                          bgcolor: style.bg,
                          color: style.text,
                          border: `1px solid ${style.border}`,
                          fontWeight: 800,
                          fontSize: "0.72rem",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "#475569", fontSize: "0.875rem" }}>
                      {perm.description || `Allows staff user to ${perm.permission_name.toLowerCase().replace(/_/g, " ")}.`}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="System Protected"
                        size="small"
                        sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 600, fontSize: "0.75rem" }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        /* CARDS VIEW FORMAT */
        <Grid container spacing={3}>
          {filteredGroups.map((group) => (
            <Grid item xs={12} md={6} lg={4} key={group.moduleName}>
              <Paper
                elevation={0}
                sx={{
                  border: "1px solid #E2E8F0",
                  borderRadius: 3.5,
                  p: 2.5,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease-in-out",
                  bgcolor: "#FFFFFF",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(15, 118, 110, 0.08)",
                    borderColor: "#CBD5E1",
                  },
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: "#F1F5F9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getModuleIcon(group.moduleName)}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                        {group.moduleName}
                      </Typography>
                      <Typography variant="caption" color="#64748B">
                        Module Authority Group
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={`${group.permissions.length} perms`}
                      sx={{ bgcolor: "#F1F5F9", fontWeight: 700, color: "#334155" }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "6px" }}>
                    {group.permissions.map((perm) => {
                      const style = getChipColor(perm.permission_name);
                      return (
                        <Chip
                          key={perm.permission_id}
                          label={perm.permission_name}
                          size="small"
                          title={perm.description || perm.permission_name}
                          sx={{
                            bgcolor: style.bg,
                            color: style.text,
                            border: `1px solid ${style.border}`,
                            fontWeight: 700,
                            fontSize: "0.75rem",
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </SectionPage>
  );
}
