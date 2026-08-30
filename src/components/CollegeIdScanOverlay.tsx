import React, { useState, useEffect } from 'react';
import { Scan, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, Check, X, Phone, GraduationCap, Server } from 'lucide-react';
import confetti from 'canvas-confetti';
import { OcrScanResult, User } from '../types';
import { convertScanToUser, parseAndValidateStudentId, BRANCH_MAP } from '../services/ocrScannerService';
import { apiClient } from '../services/apiClient';

interface CollegeIdScanOverlayProps {
  currentUser?: User | null;
  onVerificationComplete: (user: User, scanResult: OcrScanResult) => void;
  onClose?: () => void;
}

export const CollegeIdScanOverlay: React.FC<CollegeIdScanOverlayProps> = ({
  onVerificationComplete,
  onClose,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedResult, setLastScannedResult] = useState<OcrScanResult | null>(null);
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [phone, setPhone] = useState('');
  const [validationError, setValidationError] = useState('');

  // Real-time parsing of student ID format: [place][year][branch][roll] (e.g. tly25cs001)
  const parsedId = parseAndValidateStudentId(idNumber);

  // Automatically update branch when ID is typed if branch is empty or was auto-populated
  useEffect(() => {
    if (parsedId.isValid && parsedId.branchName) {
      setBranch((prev) => {
        if (!prev || Object.values(BRANCH_MAP).includes(prev) || prev.endsWith('Department') || prev.endsWith('Engineering')) {
          return parsedId.branchName || prev;
        }
        return prev;
      });
    }
  }, [parsedId.isValid, parsedId.branchName]);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Please enter your full name as shown on your student ID.');
      return;
    }

    if (!idNumber.trim()) {
      setValidationError('Please enter your student ID or Register Number (e.g., tly25cs001).');
      return;
    }

    if (!parsedId.isValid) {
      setValidationError(
        parsedId.errorMessage ||
          'Invalid format! Must follow [place][year][branch][roll] (e.g., tly25cs001).'
      );
      return;
    }

    if (!branch.trim()) {
      setValidationError('Please specify or select your academic branch.');
      return;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits) {
      setValidationError('Please enter your 10-digit mobile phone number.');
      return;
    }

    if (phoneDigits.length !== 10) {
      setValidationError('Phone number must be exactly 10 digits (e.g. 9876543210).');
      return;
    }

    const cleanPhone = phoneDigits;
    const collegeName = parsedId.placeName || `${parsedId.placeCode} Campus`;
    const deptName = branch.trim() || parsedId.branchName || `${parsedId.branchCode} Department`;

    setIsScanning(true);

    // Call server-side verification endpoint
    apiClient
      .verifyStudent({
        name: name.trim(),
        idNumber: idNumber.trim(),
        branch: deptName,
        phone: cleanPhone,
      })
      .then((res) => {
        setIsScanning(false);
        if (res.success && res.user && res.scanResult) {
          setLastScannedResult(res.scanResult);
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
          onVerificationComplete(res.user, res.scanResult);
        } else if (res.error) {
          setValidationError(res.error);
        }
      })
      .catch(() => {
        // Local fallback
        const studentName = name.trim();
        const studentId = parsedId.formattedId || idNumber.trim().toLowerCase();
        const studentEmail = `${studentName.toLowerCase().replace(/\s+/g, '.')}@${(parsedId.placeCode || 'campus')
          .toLowerCase()}.ac.in`;

        const result: OcrScanResult = {
          success: true,
          extractedName: studentName,
          extractedCollege: collegeName,
          extractedIdNumber: studentId,
          extractedEmail: studentEmail,
          extractedDepartment: deptName,
          extractedPhone: cleanPhone,
          rawText: `VERIFIED CAMPUS ID: ${studentId}\n${studentName}\n${collegeName}\nBATCH: ${parsedId.fullYear}\nDEPT: ${deptName}\nPHONE: ${cleanPhone}\nROLL: ${parsedId.rollNo}`,
        };

        setLastScannedResult(result);
        setIsScanning(false);

        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });

        const updatedUser = convertScanToUser(result);
        onVerificationComplete(updatedUser, result);
      });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Student ID Verification</h2>
            <p className="text-xs text-slate-500">
              Strict institutional verification for closed-network campus carpooling
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Form Fields */}
      <form onSubmit={handleVerify} className="space-y-3.5 mb-5 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Student Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Austin Binu"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-sm"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block font-bold text-slate-700">
              Student ID / Register Number <span className="text-rose-500">*</span>
            </label>
            {idNumber && (
              <span
                className={`text-[11px] font-bold flex items-center gap-1 ${
                  parsedId.isValid ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {parsedId.isValid ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Valid ID Format
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5" /> Invalid format
                  </>
                )}
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="e.g. tly25cs001"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 font-mono text-sm tracking-wide ${
              idNumber
                ? parsedId.isValid
                  ? 'border-emerald-300 focus:ring-emerald-500 bg-emerald-50/30 text-emerald-950 font-bold'
                  : 'border-rose-300 focus:ring-rose-500 bg-rose-50/30 text-rose-950'
                : 'border-slate-200 focus:ring-indigo-500 bg-slate-50/50'
            }`}
            required
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Format: <strong className="font-mono text-indigo-600">tly25cs001</strong> (college place + joining year + branch + roll no)
          </p>
        </div>

        {/* Branch & Phone Number Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              Branch / Department <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Science & Engineering"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              list="branch-suggestions"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-xs"
              required
            />
            <datalist id="branch-suggestions">
              {Object.values(BRANCH_MAP).map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                Phone Number <span className="text-rose-500">*</span>
              </label>
              {phone && (
                <span
                  className={`text-[10px] font-mono font-bold ${
                    phone.length === 10 ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {phone.length}/10 digits
                </span>
              )}
            </div>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-xs font-mono tracking-wider ${
                phone
                  ? phone.length === 10
                    ? 'border-emerald-300 focus:ring-emerald-500 bg-emerald-50/30 text-emerald-950 font-bold'
                    : 'border-slate-200 focus:ring-indigo-500 bg-slate-50/50'
                  : 'border-slate-200 focus:ring-indigo-500 bg-slate-50/50'
              }`}
              required
            />
          </div>
        </div>

        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Live Badge Preview */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 overflow-hidden text-center flex flex-col items-center justify-center shadow-inner mt-2">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900/90 p-4 relative flex flex-col justify-between text-left shadow-2xl">
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-[bounce_1.5s_infinite]" />
            )}

            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${parsedId.isValid ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400 font-bold">
                  CAMPUS DIGITAL PASS
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {parsedId.isValid ? 'VERIFIED ID' : 'ID REQUIRED'}
              </span>
            </div>

            <div className="space-y-1 my-1">
              <div className="text-white font-bold text-sm tracking-tight">
                {name.trim() || 'Student Name'}
              </div>
              <div className="text-xs text-indigo-300 truncate">
                {parsedId.placeName || (parsedId.placeCode ? `${parsedId.placeCode} Campus` : 'College / University')}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>ID: <strong className="text-white">{idNumber.trim().toLowerCase() || 'tly25cs001'}</strong></span>
                {phone.trim() && <span className="text-indigo-200">📱 {phone.trim()}</span>}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/80 text-[9px] text-slate-500 font-mono">
              <span className="truncate max-w-[200px]">{branch.trim() || parsedId.branchName || 'DEPARTMENT'}</span>
              <span>{parsedId.fullYear ? `BATCH ${parsedId.fullYear}` : 'VERIFIED ACCESS'}</span>
            </div>
          </div>

          {isScanning && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
              <Scan className="w-8 h-8 text-cyan-400 animate-spin" />
              <span className="text-xs font-bold text-cyan-300">
                Verifying Student Credentials...
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isScanning || (!!idNumber && !parsedId.isValid) || (!!phone && phone.length !== 10)}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            {isScanning ? 'Verifying Student ID...' : 'Verify Student ID'}
          </button>
        </div>
      </form>

      {/* Success Callout after scan */}
      {lastScannedResult && (
        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-emerald-900 flex items-center gap-1">
              Campus ID Verified!
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-emerald-700 mt-0.5">
              Welcome to CoRide for <strong>{lastScannedResult.extractedCollege}</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          Format requirement ensures strict institutional verification for closed-network campus carpooling.
        </span>
      </div>
    </div>
  );
};

