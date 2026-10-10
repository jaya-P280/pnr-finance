import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  FormControlLabel,
  Checkbox,
} from "@mui/material";

export default function EKycVerification() {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // DigiLocker Modal State
  const [openDigiLockerModal, setOpenDigiLockerModal] = useState(false);
  const [digiStep, setDigiStep] = useState(1); // 1: Consent, 2: Aadhaar Input, 3: OTP Input, 4: Review Details, 5: Confirmed Success
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [verifyingDigi, setVerifyingDigi] = useState(false);
  const [confirmingKyc, setConfirmingKyc] = useState(false);
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const [digiDetails, setDigiDetails] = useState(null);
  const [referenceId, setReferenceId] = useState(null);
  const [viewVerifiedModal, setViewVerifiedModal] = useState(false);

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
    setDetailsConfirmed(false);
    setReferenceId(null);
    setOpenDigiLockerModal(true);
  };

  const handleSendOtp = async () => {
    if (!aadhaarInput || aadhaarInput.length !== 12) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }
    setVerifyingDigi(true);
    try {
      const response = await customerPortalApi.generateAadhaarOtp({ aadhaarNumber: aadhaarInput });
      const data = response.data?.data;
      setReferenceId(data?.reference_id);
      setDigiStep(3);
      toast.success(data?.message || "OTP sent successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate OTP");
    } finally {
      setVerifyingDigi(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length < 4) {
      toast.error("Please enter a valid OTP (e.g. 123456)");
      return;
    }
    setVerifyingDigi(true);
    try {
      const response = await customerPortalApi.verifyAadhaarOtp({
        reference_id: referenceId,
        otp: otpInput,
        aadhaarNumber: aadhaarInput,
      });
      const data = response.data?.data;
      
      const last4 = aadhaarInput.replace(/\D/g, "").slice(-4);
      const details = {
        name: data?.name || data?.full_name || "Verified Customer",
        dob: data?.date_of_birth || data?.dob,
        gender: data?.gender === "M" ? "Male" : data?.gender === "F" ? "Female" : data?.gender,
        care_of: data?.care_of,
        full_address: data?.full_address,
        maskedAadhaar: data?.maskedAadhaar || (last4 ? `XXXX-XXXX-${last4}` : "XXXX-XXXX-XXXX"),
        digilockerRef: data?.reference_id || referenceId,
        photo: data?.photo,
      };
      setDigiDetails(details);
      setDetailsConfirmed(false);
      setDigiStep(4);
      toast.success("Aadhaar details fetched from Sandbox! Please review and confirm.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifyingDigi(false);
    }
  };

  const handleConfirmAadhaarDetails = async () => {
    if (!detailsConfirmed) {
      toast.error("Please check the confirmation box to confirm that the retrieved Aadhaar details belong to you.");
      return;
    }
    setConfirmingKyc(true);
    try {
      await customerPortalApi.confirmAadhaarKyc({
        reference_id: digiDetails?.digilockerRef || referenceId,
        maskedAadhaar: digiDetails?.maskedAadhaar,
        name: digiDetails?.name,
        dob: digiDetails?.dob,
        gender: digiDetails?.gender,
        full_address: digiDetails?.full_address,
      });

      toast.success("Aadhaar e-KYC confirmed & completed successfully!");
      setDigiStep(5);
      fetchKycStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to confirm Aadhaar KYC");
    } finally {
      setConfirmingKyc(false);
    }
  };

  const handleRejectOrCancelDetails = () => {
    setDigiDetails(null);
    setOtpInput("");
    setDetailsConfirmed(false);
    setDigiStep(2);
    toast.info("Aadhaar verification cancelled. Please re-enter your Aadhaar number.");
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

      {/* KYC Status Banner & Action */}
      {isFullyVerified ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-emerald-950">
                  Aadhaar & PAN Verification Completed!
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-200 text-emerald-900 border border-emerald-300">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                Your identity is 100% verified. You are pre-approved and eligible to submit loan applications.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/customer/apply-loan")}
            className="shrink-0 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-700/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Apply for Loan Now</span>
            <ArrowForward className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">
                Loan Application Requirement
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Both <strong>Aadhaar e-KYC</strong> and <strong>PAN Verification</strong> must be completed before applying for a loan.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs font-semibold">
                <span className={`inline-flex items-center gap-1 ${kycStatus?.aadhaarVerified ? "text-emerald-700" : "text-amber-800"}`}>
                  {kycStatus?.aadhaarVerified ? "✓ Aadhaar Verified" : "⏳ Aadhaar Pending"}
                </span>
                <span className={`inline-flex items-center gap-1 ${kycStatus?.panVerified ? "text-emerald-700" : "text-amber-800"}`}>
                  {kycStatus?.panVerified ? "✓ PAN Verified" : "⏳ PAN Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900">Aadhaar Number:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {kycStatus?.aadhaarNumber ? (kycStatus.aadhaarNumber.length === 12 ? `XXXX-XXXX-${kycStatus.aadhaarNumber.slice(-4)}` : kycStatus.aadhaarNumber) : "Verified via Sandbox"}
                  </span>
                </div>
                {(kycStatus?.firstName || kycStatus?.lastName) && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-900">Name:</span>
                    <span className="font-bold text-emerald-800">
                      {`${kycStatus.firstName || ""} ${kycStatus.lastName || ""}`.trim()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900">Verification Source:</span>
                  <span className="font-bold text-emerald-700">Sandbox Aadhaar API (UIDAI)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900">Status:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200 text-emerald-900">
                    VERIFIED & CONFIRMED
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 space-y-2">
            {!kycStatus?.aadhaarVerified ? (
              <button
                type="button"
                onClick={handleStartDigiLocker}
                className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <AccountBalance className="w-4 h-4" /> Verify with Sandbox Aadhaar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setViewVerifiedModal(true)}
                  className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <VerifiedUser className="w-4 h-4 text-emerald-600" /> View Confirmed Aadhaar Details
                </button>
                <button
                  type="button"
                  disabled
                  className="w-full py-2 px-4 bg-slate-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Aadhaar e-KYC Completed
                </button>
              </>
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
            <span>Sandbox Aadhaar e-KYC Authentication</span>
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
                {verifyingDigi ? "Authenticating with Sandbox..." : "Verify OTP"}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                size="large"
                disabled={verifyingDigi}
                onClick={handleSendOtp}
                sx={{ color: "#0F766E", borderColor: "#0F766E", "&:hover": { borderColor: "#0D9488", bgcolor: "#F0FDF4" } }}
              >
                Resend OTP
              </Button>
            </Stack>
          )}

          {/* Step 4: Review Details Before Confirming */}
          {digiStep === 4 && digiDetails && (
            <Stack spacing={2.5}>
              <Box sx={{ p: 2, bgcolor: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Info sx={{ color: "#166534" }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} color="#166534">
                      Review Aadhaar Profile (UIDAI Sandbox)
                    </Typography>
                    <Typography variant="caption" color="#15803D" display="block">
                      Please inspect the retrieved information carefully. You must review and confirm these details before finalizing your e-KYC.
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Official Aadhaar Card Style Preview */}
              <Box
                sx={{
                  border: "2px solid #CBD5E1",
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                }}
              >
                {/* Government Header Bar */}
                <Box sx={{ bgcolor: "#0F766E", color: "#FFFFFF", px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
                    GOVERNMENT OF INDIA • UIDAI E-KYC
                  </Typography>
                  <Chip
                    label="AWAITING CONFIRMATION"
                    size="small"
                    sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 800, fontSize: "0.65rem", height: 20 }}
                  />
                </Box>

                <Box sx={{ p: 2.5 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems={{ xs: "center", sm: "flex-start" }}>
                    {/* Left: Photograph */}
                    <Box sx={{ textAlign: "center", flexShrink: 0 }}>
                      {digiDetails.photo ? (
                        <img
                          src={digiDetails.photo.startsWith("data:") ? digiDetails.photo : `data:image/jpeg;base64,${digiDetails.photo}`}
                          alt="Aadhaar Photo"
                          style={{
                            width: 100,
                            height: 115,
                            borderRadius: 8,
                            objectFit: "cover",
                            border: "2px solid #0F766E",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 100,
                            height: 115,
                            borderRadius: 2,
                            bgcolor: "#F1F5F9",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px dashed #CBD5E1",
                          }}
                        >
                          <Fingerprint sx={{ fontSize: 44, color: "#0F766E" }} />
                          <Typography variant="caption" color="#64748B" sx={{ fontSize: "0.65rem", mt: 0.5 }}>
                            Aadhaar Photo
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Right: Core Demographic Info */}
                    <Stack spacing={1} sx={{ flexGrow: 1, width: "100%" }}>
                      <Box>
                        <Typography variant="caption" color="#64748B" display="block">
                          Full Name (as on Aadhaar)
                        </Typography>
                        <Typography variant="h6" fontWeight={900} color="#0F172A" sx={{ lineHeight: 1.2 }}>
                          {digiDetails.name}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={3} sx={{ pt: 0.5 }}>
                        {digiDetails.dob && (
                          <Box>
                            <Typography variant="caption" color="#64748B" display="block">
                              Date of Birth
                            </Typography>
                            <Typography variant="body2" fontWeight={800} color="#0F172A">
                              {digiDetails.dob}
                            </Typography>
                          </Box>
                        )}
                        {digiDetails.gender && (
                          <Box>
                            <Typography variant="caption" color="#64748B" display="block">
                              Gender
                            </Typography>
                            <Typography variant="body2" fontWeight={800} color="#0F172A">
                              {digiDetails.gender}
                            </Typography>
                          </Box>
                        )}
                      </Stack>

                      {digiDetails.care_of && (
                        <Box sx={{ pt: 0.5 }}>
                          <Typography variant="caption" color="#64748B" display="block">
                            Care Of (Father / Husband / Relative)
                          </Typography>
                          <Typography variant="body2" fontWeight={700} color="#334155">
                            {digiDetails.care_of}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Stack>

                  {/* Address Box */}
                  {digiDetails.full_address && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: "#F8FAFC", borderRadius: 2, border: "1px solid #E2E8F0" }}>
                      <Typography variant="caption" color="#64748B" fontWeight={700} display="block">
                        Residential Address:
                      </Typography>
                      <Typography variant="body2" color="#1E293B" fontWeight={600} sx={{ mt: 0.3, lineHeight: 1.4 }}>
                        {digiDetails.full_address}
                      </Typography>
                    </Box>
                  )}

                  {/* Masked Aadhaar Footer Strip */}
                  <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px dashed #CBD5E1", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                    <Box>
                      <Typography variant="caption" color="#64748B" display="block">
                        Masked Aadhaar:
                      </Typography>
                      <Typography variant="body1" fontWeight={900} fontFamily="monospace" color="#0F766E">
                        {digiDetails.maskedAadhaar}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" color="#64748B" display="block">
                        Sandbox Ref ID:
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color="#334155">
                        {digiDetails.digilockerRef || referenceId || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Mandatory Confirmation Checkbox */}
              <Box sx={{ p: 1.5, bgcolor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={detailsConfirmed}
                      onChange={(e) => setDetailsConfirmed(e.target.checked)}
                      color="success"
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                  }
                  label={
                    <Typography variant="caption" color="#92400E" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                      I hereby confirm that the retrieved Aadhaar details above belong to me and are accurate. I authorize PNRG Finance to record my e-KYC.
                    </Typography>
                  }
                />
              </Box>

              {/* Action Buttons: Confirm vs Reject */}
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={!detailsConfirmed || confirmingKyc}
                  onClick={handleConfirmAadhaarDetails}
                  startIcon={<CheckCircle />}
                  sx={{
                    bgcolor: "#059669",
                    "&:hover": { bgcolor: "#047857" },
                    py: 1.3,
                    fontWeight: 800,
                    textTransform: "none",
                    fontSize: "0.95rem",
                  }}
                >
                  {confirmingKyc ? "Confirming & Saving e-KYC..." : "Confirm & Complete e-KYC"}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  size="medium"
                  disabled={confirmingKyc}
                  onClick={handleRejectOrCancelDetails}
                  startIcon={<Close />}
                  sx={{
                    color: "#DC2626",
                    borderColor: "#FCA5A5",
                    "&:hover": { borderColor: "#DC2626", bgcolor: "#FEF2F2" },
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Incorrect Details / Re-enter Aadhaar
                </Button>
              </Stack>
            </Stack>
          )}

          {/* Step 5: Confirmed Success State */}
          {digiStep === 5 && (
            <Stack spacing={3} sx={{ textAlign: "center", py: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    bgcolor: "#ECFDF5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <CheckCircle sx={{ fontSize: 50, color: "#059669" }} />
                </Box>
              </Box>

              <Box>
                <Typography variant="h5" fontWeight={900} color="#065F46">
                  Aadhaar e-KYC Confirmed!
                </Typography>
                <Typography variant="body2" color="#047857" sx={{ mt: 0.5 }}>
                  Your identity has been verified and confirmed against Government UIDAI Sandbox records.
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: 2, border: "1px solid #E2E8F0", textAlign: "left" }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="#64748B">Aadhaar Holder:</Typography>
                    <Typography variant="caption" fontWeight={800} color="#0F172A">{digiDetails?.name}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="#64748B">Aadhaar Number:</Typography>
                    <Typography variant="caption" fontWeight={800} color="#0F766E">{digiDetails?.maskedAadhaar}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="#64748B">KYC Status:</Typography>
                    <Chip label="VERIFIED" color="success" size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800 }} />
                  </Stack>
                </Stack>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => setOpenDigiLockerModal(false)}
                sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D9488" }, py: 1.2, fontWeight: 800 }}
              >
                Done & View Portal
              </Button>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* View Confirmed Aadhaar Details Modal */}
      <Dialog open={viewVerifiedModal} onClose={() => setViewVerifiedModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, bgcolor: "#0F766E", color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <VerifiedUser />
            <span>Verified Aadhaar Profile Details</span>
          </Stack>
          <IconButton size="small" onClick={() => setViewVerifiedModal(false)} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Box sx={{ p: 2, bgcolor: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircle sx={{ color: "#059669", fontSize: 28 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#065F46">
                    Aadhaar e-KYC Verified & Confirmed
                  </Typography>
                  <Typography variant="caption" color="#047857">
                    Authenticated via Government UIDAI Sandbox API
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ p: 2.5, bgcolor: "#F8FAFC", borderRadius: 3, border: "1px solid #E2E8F0" }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="#64748B">Aadhaar Holder Name:</Typography>
                  <Typography variant="body2" fontWeight={800} color="#0F172A">
                    {`${kycStatus?.firstName || ""} ${kycStatus?.lastName || ""}`.trim() || "Verified Borrower"}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="#64748B">Masked Aadhaar Number:</Typography>
                  <Typography variant="body2" fontWeight={900} fontFamily="monospace" color="#0F766E">
                    {kycStatus?.aadhaarNumber ? (kycStatus.aadhaarNumber.length === 12 ? `XXXX-XXXX-${kycStatus.aadhaarNumber.slice(-4)}` : kycStatus.aadhaarNumber) : "Verified"}
                  </Typography>
                </Stack>

                {kycStatus?.gender && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="#64748B">Gender:</Typography>
                    <Typography variant="body2" fontWeight={700} color="#0F172A">
                      {kycStatus.gender}
                    </Typography>
                  </Stack>
                )}

                {kycStatus?.dateOfBirth && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="#64748B">Date of Birth:</Typography>
                    <Typography variant="body2" fontWeight={700} color="#0F172A">
                      {new Date(kycStatus.dateOfBirth).toLocaleDateString("en-IN")}
                    </Typography>
                  </Stack>
                )}

                {kycStatus?.address && (
                  <Box sx={{ pt: 1, borderTop: "1px dashed #CBD5E1" }}>
                    <Typography variant="caption" color="#64748B" fontWeight={700} display="block">
                      Registered Address:
                    </Typography>
                    <Typography variant="body2" color="#334155" fontWeight={600} sx={{ mt: 0.3 }}>
                      {kycStatus.address}
                    </Typography>
                  </Box>
                )}

                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: "1px dashed #CBD5E1" }}>
                  <Typography variant="caption" color="#64748B">Verification Date:</Typography>
                  <Typography variant="caption" fontWeight={700} color="#0F172A">
                    {kycStatus?.verifiedAt ? new Date(kycStatus.verifiedAt).toLocaleDateString("en-IN") : "Verified"}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="#64748B">Audit Remarks:</Typography>
                  <Typography variant="caption" fontWeight={700} color="#0F766E">
                    {kycStatus?.remarks || "Verified via Sandbox Aadhaar OTP"}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => setViewVerifiedModal(false)}
              sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D9488" } }}
            >
              Close
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </div>
  );
}
