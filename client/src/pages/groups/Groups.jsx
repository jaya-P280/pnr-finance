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
  Tab,
  Tabs,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, People as PeopleIcon } from "@mui/icons-material";
import SectionPage from "../../components/layout/SectionPage";

// Mock data
const mockGroups = [
  { id: 1, name: "Mahila Group - Main Street", branch: "New Delhi", members: 15, activeLoans: 8, totalCollected: "₹2,45,000", status: "active" },
  { id: 2, name: "Agricultural Cooperative", branch: "Pune", members: 22, activeLoans: 12, totalCollected: "₹4,56,000", status: "active" },
  { id: 3, name: "SHG - Rural Development", branch: "Bangalore", members: 18, activeLoans: 10, totalCollected: "₹3,12,000", status: "active" },
];

function TabPanel(props) {
  const { children, value, index } = props;
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function Groups() {
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const { data = mockGroups, isLoading } = useQuery({
    queryKey: ["groups", search],
    queryFn: async () => {
      // const response = await groupService.getAll({ search });
      // return response.groups;
      return mockGroups;
    },
    keepPreviousData: true,
  });

  const groups = search
    ? data.filter((group) => group.name.toLowerCase().includes(search.toLowerCase()))
    : data;

  const handleOpenDetails = (group) => {
    setSelectedGroup(group);
    setOpenDialog(true);
    setTabValue(0);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGroup(null);
  };

  return (
    <SectionPage
      title="Group Management"
      subtitle="Manage microfinance groups, members, and group-level activities."
      actions={
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search groups..."
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
            sx={{
              bgcolor: "#2563EB",
              "&:hover": { bgcolor: "#1D4ED8" },
              borderRadius: 2,
            }}
          >
            Create Group
          </Button>
        </Stack>
      }
    >
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress sx={{ color: "#0F766E" }} />
          </Box>
        ) : groups.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="#64748B">No groups found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Group Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Branch</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Members</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Active Loans</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Collection</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((group) => (
                  <TableRow
                    key={group.id}
                    sx={{
                      "&:hover": { bgcolor: "#F0F9FF" },
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>
                      {group.name}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      {group.branch}
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      <Chip
                        icon={<PeopleIcon />}
                        label={group.members}
                        size="small"
                        sx={{
                          bgcolor: "#E0F2FE",
                          color: "#0369A1",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      <Chip
                        label={group.activeLoans}
                        size="small"
                        sx={{
                          bgcolor: "#FEF08A",
                          color: "#854D0E",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "#0F172A" }}>
                      <Typography variant="body2" fontWeight={600}>
                        {group.totalCollected}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={group.status}
                        size="small"
                        sx={{
                          bgcolor: group.status === "active" ? "#DCFCE7" : "#FEE2E2",
                          color: group.status === "active" ? "#15803D" : "#991B1B",
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
                          onClick={() => handleOpenDetails(group)}
                          sx={{ color: "#0F766E" }}
                        >
                          View
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

      {/* Group Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#F8FAFC", color: "#0F172A", fontWeight: 700 }}>
          {selectedGroup?.name}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: "2px solid #E2E8F0",
              mb: 2,
              "& .MuiTab-root": {
                color: "#64748B",
                "&.Mui-selected": {
                  color: "#0F766E",
                  borderBottom: "2px solid #0F766E",
                },
              },
            }}
          >
            <Tab label="Group Details" />
            <Tab label="Members" />
            <Tab label="Attendance" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="#64748B">
                  Branch
                </Typography>
                <Typography fontWeight={600}>{selectedGroup?.branch}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="#64748B">
                  Total Members
                </Typography>
                <Typography fontWeight={600}>{selectedGroup?.members}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="#64748B">
                  Active Loans
                </Typography>
                <Typography fontWeight={600}>{selectedGroup?.activeLoans}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="#64748B">
                  Total Collection
                </Typography>
                <Typography fontWeight={600}>{selectedGroup?.totalCollected}</Typography>
              </Box>
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography color="#64748B">Member list to be implemented</Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography color="#64748B">Attendance tracking to be implemented</Typography>
          </TabPanel>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#F8FAFC" }}>
          <Button onClick={handleCloseDialog} sx={{ color: "#64748B" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
