import { useState, useEffect } from 'react';
import { customerPortalApi } from '../../api/customer.api';
import { toast } from 'react-toastify';
import { 
  CheckCircle, 
  Clock, 
  Upload, 
  Smartphone,
  CreditCard,
  FileText,
  Shield
} from 'lucide-react';

const EKycVerification = () => {
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyingPan, setVerifyingPan] = useState(false);
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [digilockerInitiating, setDigilockerInitiating] = useState(false);

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      const response = await customerPortalApi.getKycStatus();
      setKycStatus(response.data);
    } catch (error) {
      console.log(error)
      setKycStatus({ aadhaarVerified: false, panVerified: false, digilockerConnected: false });
    } finally {
      setLoading(false);
    }
  };

  const handlePanVerify = async (e) => {
    e.preventDefault();
    if (!panNumber || panNumber.length !== 10) {
      toast.error('Please enter a valid PAN number');
      return;
    }

    setVerifyingPan(true);
    try {
      await customerPortalApi.verifyPan(panNumber.toUpperCase());
      toast.success('PAN verified successfully!');
      fetchKycStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'PAN verification failed');
    } finally {
      setVerifyingPan(false);
    }
  };

  const handleFileUpload = async (type) => {
    const file = type === 'aadhaar' ? aadhaarFile : panFile;
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);

    setUploading(true);
    try {
      if (type === 'aadhaar') {
        await customerPortalApi.uploadAadhaar(formData);
        toast.success('Aadhaar uploaded successfully!');
      } else {
        await customerPortalApi.uploadPan(formData);
        toast.success('PAN card uploaded successfully!');
      }
      fetchKycStatus();
      
      // Clear file input
      if (type === 'aadhaar') setAadhaarFile(null);
      else setPanFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDigilockerInitiate = async () => {
    setDigilockerInitiating(true);
    try {
      const response = await customerPortalApi.initiateDigilocker();
      // Redirect to DigiLocker authorization URL
      if (response.data.authorizationUrl) {
        window.open(response.data.authorizationUrl, '_blank');
        toast.info('Please complete authentication in the DigiLocker window');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate DigiLocker');
    } finally {
      setDigilockerInitiating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">e-KYC Verification</h1>
        <p className="text-gray-600 mt-1">Complete your KYC verification to avail loan services</p>
      </div>

      {/* KYC Status Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">KYC Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-2 ${kycStatus?.aadhaarVerified ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone className={`w-6 h-6 mr-3 ${kycStatus?.aadhaarVerified ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Aadhaar KYC</p>
                  <p className={`text-xs ${kycStatus?.aadhaarVerified ? 'text-green-700' : 'text-gray-500'}`}>
                    {kycStatus?.aadhaarVerified ? 'Verified' : 'Pending'}
                  </p>
                </div>
              </div>
              {kycStatus?.aadhaarVerified ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Clock className="w-6 h-6 text-gray-400" />
              )}
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${kycStatus?.panVerified ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className={`w-6 h-6 mr-3 ${kycStatus?.panVerified ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">PAN KYC</p>
                  <p className={`text-xs ${kycStatus?.panVerified ? 'text-green-700' : 'text-gray-500'}`}>
                    {kycStatus?.panVerified ? 'Verified' : 'Pending'}
                  </p>
                </div>
              </div>
              {kycStatus?.panVerified ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Clock className="w-6 h-6 text-gray-400" />
              )}
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${kycStatus?.digilockerConnected ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className={`w-6 h-6 mr-3 ${kycStatus?.digilockerConnected ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">DigiLocker</p>
                  <p className={`text-xs ${kycStatus?.digilockerConnected ? 'text-green-700' : 'text-gray-500'}`}>
                    {kycStatus?.digilockerConnected ? 'Connected' : 'Not Connected'}
                  </p>
                </div>
              </div>
              {kycStatus?.digilockerConnected ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Clock className="w-6 h-6 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {kycStatus?.aadhaarVerified && kycStatus?.panVerified && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-sm text-green-800 font-medium">
                Congratulations! Your KYC is fully verified. You can now apply for loans.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* PAN Verification */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <CreditCard className="w-6 h-6 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">PAN Verification</h2>
        </div>

        {kycStatus?.panVerified ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-sm text-green-800">Your PAN is already verified</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePanVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter PAN Number
              </label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={verifyingPan || panNumber.length !== 10}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {verifyingPan ? 'Verifying...' : 'Verify PAN'}
            </button>
          </form>
        )}
      </div>

      {/* Document Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Upload className="w-6 h-6 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Upload Documents</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Aadhaar Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Aadhaar Card</h3>
              {kycStatus?.aadhaarVerified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </span>
              )}
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <FileText className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {aadhaarFile ? aadhaarFile.name : 'Drop your Aadhaar PDF here or click to browse'}
              </p>
              <p className="mt-1 text-xs text-gray-500">PDF format, max 2MB</p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setAadhaarFile(e.target.files[0])}
                className="mt-2"
                disabled={kycStatus?.aadhaarVerified}
              />
            </div>
            <button
              onClick={() => handleFileUpload('aadhaar')}
              disabled={!aadhaarFile || uploading || kycStatus?.aadhaarVerified}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : kycStatus?.aadhaarVerified ? 'Already Verified' : 'Upload Aadhaar'}
            </button>
          </div>

          {/* PAN Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">PAN Card</h3>
              {kycStatus?.panVerified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </span>
              )}
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <FileText className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {panFile ? panFile.name : 'Drop your PAN card PDF here or click to browse'}
              </p>
              <p className="mt-1 text-xs text-gray-500">PDF format, max 2MB</p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPanFile(e.target.files[0])}
                className="mt-2"
                disabled={kycStatus?.panVerified}
              />
            </div>
            <button
              onClick={() => handleFileUpload('pan')}
              disabled={!panFile || uploading || kycStatus?.panVerified}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : kycStatus?.panVerified ? 'Already Verified' : 'Upload PAN Card'}
            </button>
          </div>
        </div>
      </div>

      {/* DigiLocker Integration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-6 h-6 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">DigiLocker Integration</h2>
        </div>

        {kycStatus?.digilockerConnected ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-sm text-green-800">Your account is connected to DigiLocker</p>
              </div>
              <button
                onClick={() => toast.info('Disconnect feature coming soon')}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Connect your DigiLocker account to instantly verify your Aadhaar and PAN details. 
              This is a secure and government-approved method for KYC verification.
            </p>
            <button
              onClick={handleDigilockerInitiate}
              disabled={digilockerInitiating}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              {digilockerInitiating ? 'Connecting...' : 'Connect with DigiLocker'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EKycVerification;
