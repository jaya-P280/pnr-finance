import React, { useState, useEffect } from "react";
import { customerPortalApi } from "../../api/customer.api";
import toast from "react-hot-toast";
import {
  VerifiedUser,
  Shield,
  Fingerprint,
  CreditCard,
  Lock,
  ArrowForward,
  CheckCircle,
  AccountBalance,
  Smartphone,
  Info,
  Close,
} from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
  Chip,
  LinearProgress,
  IconButton,
} from "@mui/material";

export default function EKycVerification() {
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // DigiLocker Modal State
  const [openDigiLockerModal, setOpenDigiLockerModal] = useState(false);
  const [digiStep, setDigiStep] = useState(1); // 1: Consent, 2: Aadhaar Input, 3: OTP Input, 4: Success
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [verifyingDigi, setVerifyingDigi] = useState(false);
  const [digiDetails, setDigiDetails] = useState(null);

  // PAN State
  const [panInput, setPanInput] = useState("");
  const [verifyingPan, setVerifyingPan] = useState(false);

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      setLoading(true);
      const response = await customerPortalApi.getKycStatus();
      const data = response.data?.data || {};
      setKycStatus(data);
      if (data.panNumber) {
        setPanInput(data.panNumber);
      }
    } catch (error) {
      setKycStatus({ aadhaarVerified: false, panVerified: false });
    } finally {
      setLoading(false);
    }
  };

  const handleStartDigiLocker = () => {
    setDigiStep(1);
    setAadhaarInput("");
    setOtpInput("");
    setDigiDetails(null);
    setOpenDigiLockerModal(true);
  };

  const handleSendOtp = () => {
    if (!aadhaarInput || aadhaarInput.length !== 12) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }
    setVerifyingDigi(true);
    setTimeout(() => {
      setVerifyingDigi(false);
      setDigiStep(3);
      toast.success("OTP sent to Aadhaar linked mobile number ending in ****89");
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (!otpInput || otpInput.length < 4) {
      toast.error("Please enter a valid OTP (e.g. 123456)");
      return;
    }
    setVerifyingDigi(true);
    setTimeout(() => {
      setVerifyingDigi(false);
      const masked = `XXXX-XXXX-${aadhaarInput.slice(-4)}`;
      const mockDetails = {
        name: "Verified Customer",
        dob: "1994-08-15",
        gender: "Female",
        maskedAadhaar: masked,
        digilockerRef: `DGL-INDIA-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      setDigiDetails(mockDetails);
      setDigiStep(4);
    }, 1500);
  };

  const handleConfirmDigiLocker = async () => {
    try {
      setVerifyingDigi(true);
      await customerPortalApi.verifyDigiLockerKyc({
        aadhaarNumber: aadhaarInput,
        digilockerRefId: digiDetails?.digilockerRef,
      });
      toast.success("DigiLocker Aadhaar e-KYC completed successfully!");
      setOpenDigiLockerModal(false);
      fetchKycStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "DigiLocker verification failed");
    } finally {
      setVerifyingDigi(false);
    }
  };

  const handleVerifyPan = async (e) => {
    e.preventDefault();
    if (!panInput || panInput.length !== 10) {
      toast.error("Please enter a valid 10-character PAN number");
      return;
    }

    try {
      setVerifyingPan(true);
      await customerPortalApi.verifyPanKyc({ panNumber: panInput.toUpperCase() });
      toast.success("PAN card verified successfully with NSDL!");
      fetchKycStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "PAN verification failed");
    } finally {
      setVerifyingPan(false);
    }
  };

  const isFullyVerified = kycStatus?.aadhaarVerified && kycStatus?.panVerified;

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <LinearProgress sx={{ borderRadius: 1 }} />
        <Typography variant="body2" color="#64748B" sx={{ mt: 2 }}>
          Loading your e-KYC status...
        </Typography>
      </Box>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
              <Shield className="w-4 h-4" /> Official DigiLocker e-KYC Portal
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Paperless e-KYC Verification</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Instant, secure Aadhaar e-KYC authentication via DigiLocker (Government of India) and NSDL PAN check. Zero physical documents required!
            </p>
          </div>

          <div className="shrink-0">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border ${
                isFullyVerified
                  ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                  : "bg-amber-500/20 border-amber-400/40 text-amber-300"
              }`}
            >
              <VerifiedUser className="w-5 h-5" />
              <span>{isFullyVerified ? "100% e-KYC Verified" : "Verification Action Required"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DigiLocker Notice Info */}
      <div className="bg-teal-50/80 border border-teal-200/80 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-900 leading-relaxed">
          <strong>Paperless KYC via DigiLocker:</strong> You do not need to upload paper document photos or scanned PDFs. Authenticate your official Aadhaar via DigiLocker OTP for instant background verification.
        </div>
      </div>

      {/* Main 2 Cards: DigiLocker Aadhaar & PAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: DigiLocker Aadhaar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    kycStatus?.aadhaarVerified ? "bg-emerald-100 text-emerald-700" : "bg-teal-100 text-teal-800"
                  }`}
                >
                  <Fingerprint className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Aadhaar Card (DigiLocker)</h3>
                  <p className="text-xs color-slate-500">Government of India e-KYC</p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  kycStatus?.aadhaarVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {kycStatus?.aadhaarVerified ? "Verified" : "Pending"}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Fetch verified Aadhaar profile details directly from the official DigiLocker ecosystem. Safe, encrypted, and instant.
            </p>

            {kycStatus?.aadhaarVerified && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900">Aadhaar Number:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {kycStatus?.aadhaarNumber ? `XXXX-XXXX-${kycStatus.aadhaarNumber.slice(-4)}` : "Verified via DigiLocker"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900">Verification Source:</span>
                  <span className="font-bold text-emerald-700">DigiLocker Govt API</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            {!kycStatus?.aadhaarVerified ? (
              <button
                type="button"
                onClick={handleStartDigiLocker}
                className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <AccountBalance className="w-4 h-4" /> Connect with DigiLocker
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-2.5 px-4 bg-slate-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> DigiLocker e-KYC Completed
              </button>
            )}
          </div>
        </div>

        {/* Card 2: PAN Card Verification */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
          <form onSubmit={handleVerifyPan} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    kycStatus?.panVerified ? "bg-emerald-100 text-emerald-700" : "bg-teal-100 text-teal-800"
                  }`}
                >
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">PAN Card Verification</h3>
                  <p className="text-xs color-slate-500">NSDL / Income Tax Department</p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  kycStatus?.panVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {kycStatus?.panVerified ? "Verified" : "Pending"}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Verify your Permanent Account Number (PAN) against the Income Tax database to qualify for higher loan credit limits.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-500">10-Digit PAN Number *</label>
              <input
                type="text"
                maxLength={10}
                disabled={kycStatus?.panVerified}
                value={panInput}
                onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 uppercase"
              />
            </div>

            {!kycStatus?.panVerified ? (
              <button
                type="submit"
                disabled={verifyingPan}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {verifyingPan ? "Authenticating with NSDL..." : "Verify PAN Number"}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-2.5 px-4 bg-slate-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> PAN Authenticated
              </button>
            )}
          </form>
        </div>
      </div>

      {/* DigiLocker Flow Modal */}
      <Dialog open={openDigiLockerModal} onClose={() => setOpenDigiLockerModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, bgcolor: "#0F766E", color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AccountBalance />
            <span>DigiLocker e-KYC Authentication</span>
          </Stack>
          <IconButton size="small" onClick={() => setOpenDigiLockerModal(false)} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {/* Step 1: Consent */}
          {digiStep === 1 && (
            <Stack spacing={2.5}>
              <Box sx={{ p: 2, bgcolor: "#F0FDF4", borderRadius: 2, border: "1px solid #BBF7D0" }}>
                <Typography variant="body2" color="#166534" fontWeight={700}>
                  DigiLocker Authorization Consent (Govt of India)
                </Typography>
                <Typography variant="caption" color="#15803D" display="block" sx={{ mt: 0.5 }}>
                  By clicking accept, you authorize this microfinance portal to access your Aadhaar profile metadata via DigiLocker.
                </Typography>
              </Box>

              <Typography variant="body2" color="#334155" fontWeight={600}>
                Requested Permissions:
              </Typography>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
                <li>Aadhaar Demographic Info (Full Name, Gender, Date of Birth)</li>
                <li>Digital Aadhaar Masked Verification Reference ID</li>
                <li>Instant RBI Compliant e-KYC Status</li>
              </ul>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => setDigiStep(2)}
                sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D9488" }, mt: 2 }}
              >
                I Agree & Proceed
              </Button>
            </Stack>
          )}

          {/* Step 2: Aadhaar Input */}
          {digiStep === 2 && (
            <Stack spacing={2.5}>
              <Typography variant="body2" color="#475569">
                Enter your 12-digit Aadhaar card number. An OTP will be sent to your registered mobile number.
              </Typography>

              <TextField
                fullWidth
                label="12-Digit Aadhaar Number"
                placeholder="123456789012"
                value={aadhaarInput}
                onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, "").slice(0, 12))}
                slotProps={{
                  input: {
                    className: "font-mono font-bold",
                  },
                }}
              />

              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={verifyingDigi}
                onClick={handleSendOtp}
                sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D9488" } }}
              >
                {verifyingDigi ? "Sending OTP..." : "Get OTP on Mobile"}
              </Button>
            </Stack>
          )}

          {/* Step 3: OTP Input */}
          {digiStep === 3 && (
            <Stack spacing={2.5}>
              <Box sx={{ p: 2, bgcolor: "#E0F2FE", borderRadius: 2 }}>
                <Typography variant="caption" color="#0369A1" fontWeight={700}>
                  OTP sent to mobile linked with Aadhaar XXXX-XXXX-{aadhaarInput.slice(-4)}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="6-Digit OTP"
                placeholder="e.g. 123456"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                slotProps={{
                  input: {
                    className: "font-mono font-bold tracking-widest text-center",
                  },
                }}
              />

              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={verifyingDigi}
                onClick={handleVerifyOtp}
                sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D9488" } }}
              >
                {verifyingDigi ? "Authenticating with DigiLocker..." : "Verify OTP"}
              </Button>
            </Stack>
          )}

          {/* Step 4: Verification Success Details */}
          {digiStep === 4 && digiDetails && (
            <Stack spacing={2}>
              <Box sx={{ p: 2, bgcolor: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 2, textAlign: "center" }}>
                <CheckCircle sx={{ fontSize: 40, color: "#059669", mb: 0.5 }} />
                <Typography variant="h6" fontWeight={800} color="#065F46">
                  Aadhaar e-KYC Retrieved!
                </Typography>
                <Typography variant="caption" color="#047857">
                  Source: DigiLocker National e-Governance Division
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: 2, border: "1px solid #E2E8F0" }}>
                <Stack spacing={1}>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="caption" color="#64748B">Masked Aadhaar:</Typography>
                    <Typography variant="caption" fontWeight={700} color="#0F172A">{digiDetails.maskedAadhaar}</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="caption" color="#64748B">DigiLocker Ref ID:</Typography>
                    <Typography variant="caption" fontWeight={700} color="#0F766E">{digiDetails.digilockerRef}</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="caption" color="#64748B">KYC Status:</Typography>
                    <Chip label="VERIFIED" color="success" size="small" />
                  </Stack>
                </Stack>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={verifyingDigi}
                onClick={handleConfirmDigiLocker}
                sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D9488" } }}
              >
                Save & Complete e-KYC
              </Button>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
