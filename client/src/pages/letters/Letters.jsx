import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  Stack,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Print as PrintIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  Add as AddIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import SectionPage from "../../components/layout/SectionPage";
import branchService from "../../services/branch.service";
import userService from "../../services/user.service";
import letterService from "../../services/letter.service";

export default function Letters() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);

  // Queries for Branches and Employees
  const { data: branches = [] } = useQuery({
    queryKey: ["branches-list"],
    queryFn: async () => {
      const res = await branchService.getAll({ limit: 100 });
      return res.branches || [];
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const res = await userService.getAll({ limit: 100 });
      return res.users || [];
    },
  });

  const { data: savedLetters = [], refetch: refetchLetters } = useQuery({
    queryKey: ["saved-letters"],
    queryFn: () => letterService.getLetters(),
  });

  // 1. OFFER LETTER FORM STATE
  const [offerState, setOfferState] = useState({
    branchId: "",
    employeeId: "",
    managerName: "Reporting Manager",
    annualCtc: "600000",
  });

  // 2. EXPERIENCE LETTER FORM STATE
  const [expState, setExpState] = useState({
    branchId: "",
    employeeId: "",
    startDate: "2025-06-19",
    endDate: "2026-08-19",
  });

  // 3. RELIEVING LETTER FORM STATE
  const [relState, setRelState] = useState({
    branchId: "",
    employeeId: "",
    resignationDate: "2026-08-07",
    lastDay: "2026-08-07",
  });

  // 4. CONFIRMATION LETTER FORM STATE
  const [confState, setConfState] = useState({
    branchId: "",
    employeeId: "",
    probationStart: "2026-08-07",
    probationEnd: "2026-08-07",
  });

  // CUSTOM EDITOR FORM STATE
  const [customState, setCustomState] = useState({
    letterType: "OFFICIAL",
    recipientName: "",
    recipientDesignation: "",
    organization: "PNRG Finance Ltd.",
    subject: "",
    body: "",
    issuedDate: new Date().toISOString().split("T")[0],
    signatoryName: "Authorized Signatory",
    signatoryTitle: "HR Manager",
  });

  // PREVIEW MODAL STATE
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentLetterData, setCurrentLetterData] = useState(null);

  // Save Letter Mutation
  const saveMutation = useMutation({
    mutationFn: (payload) => letterService.createLetter(payload),
    onSuccess: () => {
      toast.success("Letter generated and saved to records!");
      queryClient.invalidateQueries(["saved-letters"]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save letter.");
    },
  });

  // Helper to find employee object
  const getEmp = (empId) => employees.find((e) => e.user_id === Number(empId));
  const getBranch = (bId) => branches.find((b) => b.branch_id === Number(bId));

  // Generate Letter Preview Handlers
  const handleGenerateOffer = () => {
    if (!offerState.branchId || !offerState.employeeId) {
      toast.error("Please select Branch and Employee ID");
      return;
    }
    const emp = getEmp(offerState.employeeId);
    const branch = getBranch(offerState.branchId);

    const letterData = {
      type: "OFFER LETTER",
      letterNumber: `PNRG/HR/OFFER/${new Date().getFullYear()}/${emp?.user_id || 101}`,
      employeeName: `${emp?.first_name || ""} ${emp?.last_name || ""}`.trim() || "Employee Name",
      employeeCode: emp?.employee_code || "EMP-101",
      branchName: branch?.branch_name || "Head Office",
      date: new Date().toISOString().split("T")[0],
      managerName: offerState.managerName,
      ctc: offerState.annualCtc,
      subject: "Letter of Employment Offer - PNRG Finance",
      body: `We are pleased to offer you employment at PNRG Finance Microfinance ERP under the position of ${
        emp?.role_name || "Staff Officer"
      }. You will be reporting to ${offerState.managerName}. Your total Annual CTC will be ₹${Number(
        offerState.annualCtc
      ).toLocaleString("en-IN")} per annum. We welcome you to our organization and look forward to a successful relationship.`,
      signatoryName: "PASLEM JAYA PRAKASH GOUD",
      signatoryTitle: "Managing Director / HR Head",
    };

    setCurrentLetterData(letterData);
    setPreviewOpen(true);
    saveMutation.mutate({
      letterType: "OFFER",
      recipientName: letterData.employeeName,
      recipientDesignation: emp?.role_name || "Staff",
      organization: letterData.branchName,
      subject: letterData.subject,
      body: letterData.body,
      issuedDate: letterData.date,
      signatoryName: letterData.signatoryName,
      signatoryTitle: letterData.signatoryTitle,
    });
  };

  const handleGenerateExperience = () => {
    if (!expState.branchId || !expState.employeeId) {
      toast.error("Please select Branch and Employee ID");
      return;
    }
    const emp = getEmp(expState.employeeId);
    const branch = getBranch(expState.branchId);

    const letterData = {
      type: "EXPERIENCE LETTER",
      letterNumber: `PNRG/HR/EXP/${new Date().getFullYear()}/${emp?.user_id || 102}`,
      employeeName: `${emp?.first_name || ""} ${emp?.last_name || ""}`.trim() || "Employee Name",
      employeeCode: emp?.employee_code || "EMP-102",
      branchName: branch?.branch_name || "Head Office",
      date: new Date().toISOString().split("T")[0],
      subject: "Experience Certificate & Employment Verification",
      body: `This is to certify that ${emp?.first_name} ${emp?.last_name} (Employee Code: ${
        emp?.employee_code
      }) was employed with PNRG Finance from ${expState.startDate} to ${
        expState.endDate
      }. During their tenure as ${emp?.role_name || "Staff Officer"} at ${
        branch?.branch_name
      }, we found them to be hard-working, sincere, and dedicated. We wish them success in all future endeavors.`,
      signatoryName: "PASLEM JAYA PRAKASH GOUD",
      signatoryTitle: "Head of Human Resources",
    };

    setCurrentLetterData(letterData);
    setPreviewOpen(true);
    saveMutation.mutate({
      letterType: "EXPERIENCE",
      recipientName: letterData.employeeName,
      recipientDesignation: emp?.role_name || "Staff",
      organization: letterData.branchName,
      subject: letterData.subject,
      body: letterData.body,
      issuedDate: letterData.date,
      signatoryName: letterData.signatoryName,
      signatoryTitle: letterData.signatoryTitle,
    });
  };

  const handleGenerateRelieving = () => {
    if (!relState.branchId || !relState.employeeId) {
      toast.error("Please select Branch and Employee ID");
      return;
    }
    const emp = getEmp(relState.employeeId);
    const branch = getBranch(relState.branchId);

    const letterData = {
      type: "RELIEVING LETTER",
      letterNumber: `PNRG/HR/REL/${new Date().getFullYear()}/${emp?.user_id || 103}`,
      employeeName: `${emp?.first_name || ""} ${emp?.last_name || ""}`.trim() || "Employee Name",
      employeeCode: emp?.employee_code || "EMP-103",
      branchName: branch?.branch_name || "Head Office",
      date: new Date().toISOString().split("T")[0],
      subject: "Relieving Letter & Discharge Certificate",
      body: `With reference to your resignation dated ${relState.resignationDate}, we hereby accept your resignation and confirm that your last day of employment with PNRG Finance is ${relState.lastDay}. You have been relieved of all official responsibilities and duties. All company assets and liabilities have been settled in full.`,
      signatoryName: "PASLEM JAYA PRAKASH GOUD",
      signatoryTitle: "Head of Operations",
    };

    setCurrentLetterData(letterData);
    setPreviewOpen(true);
    saveMutation.mutate({
      letterType: "RELIEVING",
      recipientName: letterData.employeeName,
      recipientDesignation: emp?.role_name || "Staff",
      organization: letterData.branchName,
      subject: letterData.subject,
      body: letterData.body,
      issuedDate: letterData.date,
      signatoryName: letterData.signatoryName,
      signatoryTitle: letterData.signatoryTitle,
    });
  };

  const handleGenerateConfirmation = () => {
    if (!confState.branchId || !confState.employeeId) {
      toast.error("Please select Branch and Employee ID");
      return;
    }
    const emp = getEmp(confState.employeeId);
    const branch = getBranch(confState.branchId);

    const letterData = {
      type: "CONFIRMATION LETTER",
      letterNumber: `PNRG/HR/CONF/${new Date().getFullYear()}/${emp?.user_id || 104}`,
      employeeName: `${emp?.first_name || ""} ${emp?.last_name || ""}`.trim() || "Employee Name",
      employeeCode: emp?.employee_code || "EMP-104",
      branchName: branch?.branch_name || "Head Office",
      date: new Date().toISOString().split("T")[0],
      subject: "Confirmation of Employment",
      body: `We are pleased to inform you that upon successful completion of your probation period from ${
        confState.probationStart
      } to ${confState.probationEnd}, your services with PNRG Finance Microfinance ERP stand confirmed with effect from ${
        confState.probationEnd
      } under the designation of ${emp?.role_name || "Permanent Staff"}.`,
      signatoryName: "PASLEM JAYA PRAKASH GOUD",
      signatoryTitle: "Managing Director",
    };

    setCurrentLetterData(letterData);
    setPreviewOpen(true);
    saveMutation.mutate({
      letterType: "CONFIRMATION",
      recipientName: letterData.employeeName,
      recipientDesignation: emp?.role_name || "Staff",
      organization: letterData.branchName,
      subject: letterData.subject,
      body: letterData.body,
      issuedDate: letterData.date,
      signatoryName: letterData.signatoryName,
      signatoryTitle: letterData.signatoryTitle,
    });
  };

  const handleGenerateCustom = () => {
    if (!customState.recipientName || !customState.subject || !customState.body) {
      toast.error("Please fill Recipient Name, Subject, and Letter Body");
      return;
    }

    const letterData = {
      type: customState.letterType.toUpperCase() + " LETTER",
      letterNumber: `PNRG/HR/CUST/${new Date().getFullYear()}/${Math.floor(Math.random() * 900) + 100}`,
      employeeName: customState.recipientName,
      employeeCode: "N/A",
      branchName: customState.organization || "PNRG Finance",
      date: customState.issuedDate,
      subject: customState.subject,
      body: customState.body,
      signatoryName: customState.signatoryName,
      signatoryTitle: customState.signatoryTitle,
    };

    setCurrentLetterData(letterData);
    setPreviewOpen(true);
    saveMutation.mutate(customState);
  };

  const handlePrintWindow = () => {
    window.print();
  };

  return (
    <SectionPage
      title="Employee Letters & Documents"
      subtitle="Generate, preview, and print official company letters and HR certificates"
    >
      {/* Top Header Tabs - Matching Screenshot */}
      <Box sx={{ borderBottom: "2px solid #E2E8F0", mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: "1rem",
              mr: 3,
              color: "#64748B",
            },
            "& .Mui-selected": {
              color: "#0F766E",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#0F766E",
              height: 3,
            },
          }}
        >
          <Tab label="Print Employee Letters" />
          <Tab label="Custom Document Editor" />
        </Tabs>
      </Box>

      {/* TAB 0: PRINT EMPLOYEE LETTERS (Exact 4 Cards Layout as in Screenshot) */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* 1. OFFER LETTER CARD */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 5,
                p: 1.5,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                border: "1px solid #F1F5F9",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2.5, color: "#0F172A" }}>
                  OFFER LETTER
                </Typography>

                <Stack spacing={2.2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="BRANCH *"
                    value={offerState.branchId}
                    onChange={(e) => setOfferState({ ...offerState, branchId: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  >
                    {branches.map((b, idx) => (
                      <MenuItem key={b.branch_id || b.branchId || `off-br-${idx}`} value={b.branch_id || b.branchId}>
                        {b.branch_name || b.branchName}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="EMPLOYEE ID *"
                    value={offerState.employeeId}
                    onChange={(e) => setOfferState({ ...offerState, employeeId: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  >
                    {employees
                      .filter((e) => !offerState.branchId || Number(e.branch_id || e.branchId) === Number(offerState.branchId))
                      .map((emp, idx) => (
                        <MenuItem key={emp.user_id || emp.userId || `off-emp-${idx}`} value={emp.user_id || emp.userId}>
                          {emp.first_name || emp.firstName} {emp.last_name || emp.lastName} ({emp.employee_code || emp.employeeCode || "STAFF"})
                        </MenuItem>
                      ))}
                  </TextField>

                  <TextField
                    fullWidth
                    size="small"
                    label="NAME OF REPORTING MANAGER"
                    value={offerState.managerName}
                    onChange={(e) => setOfferState({ ...offerState, managerName: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="ANNUAL CTC *"
                    value={offerState.annualCtc}
                    onChange={(e) => setOfferState({ ...offerState, annualCtc: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Stack>
              </CardContent>

              <Box sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleGenerateOffer}
                  sx={{
                    bgcolor: "#0088CC",
                    "&:hover": { bgcolor: "#0077BB" },
                    borderRadius: 8,
                    py: 1.2,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "0 4px 12px rgba(0, 136, 204, 0.3)",
                  }}
                >
                  Create Offer Letter
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* 2. EXPERIENCE LETTER CARD */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 5,
                p: 1.5,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                border: "1px solid #F1F5F9",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2.5, color: "#0F172A" }}>
                  EXPERIENCE LETTER
                </Typography>

                <Stack spacing={2.2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="BRANCH *"
                    value={expState.branchId}
                    onChange={(e) => setExpState({ ...expState, branchId: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  >
                    {branches.map((b, idx) => (
                      <MenuItem key={b.branch_id || b.branchId || `exp-br-${idx}`} value={b.branch_id || b.branchId}>
                        {b.branch_name || b.branchName}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="EMPLOYEE ID *"
                    value={expState.employeeId}
                    onChange={(e) => setExpState({ ...expState, employeeId: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  >
                    {employees
                      .filter((e) => !expState.branchId || Number(e.branch_id || e.branchId) === Number(expState.branchId))
                      .map((emp, idx) => (
                        <MenuItem key={emp.user_id || emp.userId || `exp-emp-${idx}`} value={emp.user_id || emp.userId}>
                          {emp.first_name || emp.firstName} {emp.last_name || emp.lastName} ({emp.employee_code || emp.employeeCode || "STAFF"})
                        </MenuItem>
                      ))}
                  </TextField>

                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    label="PERIOD START DATE *"
                    value={expState.startDate}
                    onChange={(e) => setExpState({ ...expState, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />

                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    label="PERIOD END DATE *"
                    value={expState.endDate}
                    onChange={(e) => setExpState({ ...expState, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Stack>
              </CardContent>

              <Box sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleGenerateExperience}
                  sx={{
                    bgcolor: "#0088CC",
                    "&:hover": { bgcolor: "#0077BB" },
                    borderRadius: 8,
                    py: 1.2,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "0 4px 12px rgba(0, 136, 204, 0.3)",
                  }}
                >
                  Create Experience Letter
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* 3. RELIEVING LETTER CARD */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 5,
                p: 1.5,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                border: "1px solid #F1F5F9",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2.5, color: "#0F172A" }}>
                  RELIEVING LETTER
                </Typography>

                <Stack spacing={2.2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="BRANCH *"
                    value={relState.branchId}
                    onChange={(e) => setRelState({ ...relState, branchId: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  >
                    {branches.map((b, idx) => (
                      <MenuItem key={b.branch_id || b.branchId || `rel-br-${idx}`} value={b.branch_id || b.branchId}>
                        {b.branch_name || b.branchName}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="EMPLOYEE ID *"
                    value={relState.employeeId}
                    onChange={(e) => setRelState({ ...relState, employeeId: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  >
                    {employees
                      .filter((e) => !relState.branchId || Number(e.branch_id || e.branchId) === Number(relState.branchId))
                      .map((emp, idx) => (
                        <MenuItem key={emp.user_id || emp.userId || `rel-emp-${idx}`} value={emp.user_id || emp.userId}>
                          {emp.first_name || emp.firstName} {emp.last_name || emp.lastName} ({emp.employee_code || emp.employeeCode || "STAFF"})
                        </MenuItem>
                      ))}
                  </TextField>

                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    label="RESIGNATION DATE *"
                    value={relState.resignationDate}
                    onChange={(e) => setRelState({ ...relState, resignationDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />

                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    label="LAST DAY OF EMPLOYMENT *"
                    value={relState.lastDay}
                    onChange={(e) => setRelState({ ...relState, lastDay: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Stack>
              </CardContent>

              <Box sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleGenerateRelieving}
                  sx={{
                    bgcolor: "#0088CC",
                    "&:hover": { bgcolor: "#0077BB" },
                    borderRadius: 8,
                    py: 1.2,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "0 4px 12px rgba(0, 136, 204, 0.3)",
                  }}
                >
                  Create Relieving Letter
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* 4. CONFIRMATION LETTER CARD */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 5,
                p: 1.5,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                border: "1px solid #F1F5F9",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2.5, color: "#0F172A" }}>
                  CONFIRMATION LETTER
                </Typography>

                <Stack spacing={2.2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="BRANCH *"
                    value={confState.branchId}
                    onChange={(e) => setConfState({ ...confState, branchId: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  >
                    {branches.map((b, idx) => (
                      <MenuItem key={b.branch_id || b.branchId || `conf-br-${idx}`} value={b.branch_id || b.branchId}>
                        {b.branch_name || b.branchName}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="EMPLOYEE ID *"
                    value={confState.employeeId}
                    onChange={(e) => setConfState({ ...confState, employeeId: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  >
                    {employees
                      .filter((e) => !confState.branchId || Number(e.branch_id || e.branchId) === Number(confState.branchId))
                      .map((emp, idx) => (
                        <MenuItem key={emp.user_id || emp.userId || `conf-emp-${idx}`} value={emp.user_id || emp.userId}>
                          {emp.first_name || emp.firstName} {emp.last_name || emp.lastName} ({emp.employee_code || emp.employeeCode || "STAFF"})
                        </MenuItem>
                      ))}
                  </TextField>

                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    label="PROBATION PERIOD START DATE *"
                    value={confState.probationStart}
                    onChange={(e) => setConfState({ ...confState, probationStart: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />

                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    label="PROBATION PERIOD END DATE *"
                    value={confState.probationEnd}
                    onChange={(e) => setConfState({ ...confState, probationEnd: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Stack>
              </CardContent>

              <Box sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleGenerateConfirmation}
                  sx={{
                    bgcolor: "#0088CC",
                    "&:hover": { bgcolor: "#0077BB" },
                    borderRadius: 8,
                    py: 1.2,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "0 4px 12px rgba(0, 136, 204, 0.3)",
                  }}
                >
                  Create Confirmation Letter
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: CUSTOM DOCUMENT EDITOR & HISTORY */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 4, p: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2.5, color: "#0F172A" }}>
                  Compose Custom Document
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="DOCUMENT TYPE"
                    value={customState.letterType}
                    onChange={(e) => setCustomState({ ...customState, letterType: e.target.value })}
                  >
                    <MenuItem value="OFFICIAL">OFFICIAL LETTER</MenuItem>
                    <MenuItem value="MEMORANDUM">INTERNAL MEMORANDUM</MenuItem>
                    <MenuItem value="WARNING">FORMAL WARNING</MenuItem>
                    <MenuItem value="APPRECIATION">APPRECIATION LETTER</MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    size="small"
                    label="RECIPIENT NAME *"
                    value={customState.recipientName}
                    onChange={(e) => setCustomState({ ...customState, recipientName: e.target.value })}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="RECIPIENT DESIGNATION"
                    value={customState.recipientDesignation}
                    onChange={(e) => setCustomState({ ...customState, recipientDesignation: e.target.value })}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="SUBJECT *"
                    value={customState.subject}
                    onChange={(e) => setCustomState({ ...customState, subject: e.target.value })}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="LETTER BODY *"
                    value={customState.body}
                    onChange={(e) => setCustomState({ ...customState, body: e.target.value })}
                  />

                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="SIGNATORY NAME"
                      value={customState.signatoryName}
                      onChange={(e) => setCustomState({ ...customState, signatoryName: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="SIGNATORY TITLE"
                      value={customState.signatoryTitle}
                      onChange={(e) => setCustomState({ ...customState, signatoryTitle: e.target.value })}
                    />
                  </Stack>

                  <Button
                    variant="contained"
                    onClick={handleGenerateCustom}
                    startIcon={<DescriptionIcon />}
                    sx={{ bgcolor: "#0F766E", py: 1.2, borderRadius: 2.5, fontWeight: 700 }}
                  >
                    Generate & Preview Custom Letter
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 4, p: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={800} color="#0F172A">
                    Saved Letters History
                  </Typography>
                  <IconButton onClick={() => refetchLetters()}>
                    <HistoryIcon />
                  </IconButton>
                </Stack>

                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Letter #</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Recipient</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Issued Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!Array.isArray(savedLetters) || savedLetters.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3, color: "#64748B" }}>
                            No generated letters saved yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        savedLetters.map((row) => (
                          <TableRow key={row.letter_id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{row.letter_number}</TableCell>
                            <TableCell>
                              <Chip label={row.letter_type} size="small" sx={{ fontWeight: 700 }} />
                            </TableCell>
                            <TableCell>{row.recipient_name}</TableCell>
                            <TableCell>{row.issued_date ? row.issued_date.split("T")[0] : "-"}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                startIcon={<PrintIcon />}
                                onClick={() => {
                                  setCurrentLetterData({
                                    type: row.letter_type,
                                    letterNumber: row.letter_number,
                                    employeeName: row.recipient_name,
                                    date: row.issued_date ? row.issued_date.split("T")[0] : "",
                                    subject: row.subject,
                                    body: row.body,
                                    signatoryName: row.signatory_name || "Authorized Signatory",
                                    signatoryTitle: row.signatory_title || "HR Manager",
                                  });
                                  setPreviewOpen(true);
                                }}
                              >
                                Print
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* OFFICIAL LETTERHEAD PREVIEW & PRINT DIALOG */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        disableRestoreFocus
        PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
      >
        <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" component="span" fontWeight={700}>
            Letterhead Preview & Print View
          </Typography>
          <IconButton onClick={() => setPreviewOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {currentLetterData && (
            <Paper
              elevation={0}
              id="printable-letterhead"
              sx={{
                p: 5,
                border: "1px solid #CBD5E1",
                borderRadius: 2,
                bgcolor: "#FFFFFF",
                color: "#0F172A",
                fontFamily: "serif",
              }}
            >
              {/* LETTERHEAD HEADER */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ pb: 3, borderBottom: "3px double #0F766E", mb: 4 }}
              >
                <Box>
                  <Typography variant="h4" fontWeight={900} sx={{ color: "#0F766E", letterSpacing: 1 }}>
                    PNRG FINANCE
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#475569" }}>
                    MICROFINANCE ERP SOLUTIONS LTD.
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Head Office: Central ERP Tower, Tech Hub, Suite 402
                  </Typography>
                </Box>
                <Box align="right">
                  <Typography variant="caption" fontWeight={700} display="block" color="#0F766E">
                    REF NO: {currentLetterData.letterNumber}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    DATE: {currentLetterData.date}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    BRANCH: {currentLetterData.branchName || "Head Office"}
                  </Typography>
                </Box>
              </Stack>

              {/* RECIPIENT */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  TO WHOM IT MAY CONCERN / RECIPIENT:
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: "#0F172A", mt: 0.5 }}>
                  {currentLetterData.employeeName}
                </Typography>
                {currentLetterData.employeeCode !== "N/A" && (
                  <Typography variant="body2" color="textSecondary">
                    Employee ID: {currentLetterData.employeeCode}
                  </Typography>
                )}
              </Box>

              {/* SUBJECT */}
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 3, textDecoration: "underline" }}>
                SUBJECT: {currentLetterData.subject}
              </Typography>

              {/* BODY TEXT */}
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  fontSize: "1.05rem",
                  mb: 6,
                  textAlign: "justify",
                }}
              >
                {currentLetterData.body}
              </Typography>

              {/* SIGNATURE BLOCK */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mt: 8 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    ISSUED BY & ON BEHALF OF:
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 4, color: "#0F172A" }}>
                    {currentLetterData.signatoryName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {currentLetterData.signatoryTitle}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    PNRG Finance Ltd.
                  </Typography>
                </Box>

                <Box align="center" sx={{ border: "2px dashed #0F766E", p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" fontWeight={800} sx={{ color: "#0F766E" }}>
                    [ OFFICIAL CORPORATE SEAL ]
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button variant="outlined" onClick={() => setPreviewOpen(false)}>
            Close
          </Button>

          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrintWindow}
            sx={{ bgcolor: "#0088CC", px: 4, fontWeight: 700 }}
          >
            Print Letter
          </Button>
        </DialogActions>
      </Dialog>
    </SectionPage>
  );
}
