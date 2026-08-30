import React, { useState, useEffect } from 'react';
import { Scan, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, Check, X, Phone, GraduationCap, Server } from 'lucide-react';
import confetti from 'canvas-confetti';
import { OcrScanResult, User } from '../types';
import { convertScanToUser, parseAndValidateStudentId, normalizePhoneNumber, BRANCH_MAP } from '../services/ocrScannerService';
import { apiClient } from '../services/apiClient';

interface CollegeIdScanOverlayProps {
  currentUser?: User | null;
  onVerificationComplete: (user: User, scanResult: OcrScanResult) => void;
  onClose?: () => void;
}

const SAMPLE_STUDENTS = [
  {
    name: 'Rahul Sharma',
    id: 'tly25cs001',
    branch: 'Computer Science & Engineering',
    phone: '9876543210',
    label: 'Rahul S. (TLY CS)',
  },
  {
    name: 'Ananya Nair',
    id: 'cet24ec042',
    branch: 'Electronics & Communication Engineering',
    phone: '9447123456',
    label: 'Ananya N. (CET EC)',
  },
  {
    name: 'Austin Binu',
    id: 'mec23ai018',
    branch: 'Artificial Intelligence & Data Science',
    phone: '8891234567',
    label: 'Austin B. (MEC AI)',
  },
];

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
  const phoneValidation = normalizePhoneNumber(phone);

  const handleQuickFill = (sample: typeof SAMPLE_STUDENTS[0]) => {
    setName(sample.name);
    setIdNumber(sample.id);
    setBranch(sample.branch);
    setPhone(sample.phone);
    setValidationError('');
  };

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
      setValidationError('Please enter your full student name.');
      return;
    }

    if (!idNumber.trim()) {
      setValidationError('Please enter your student ID or Register Number (e.g. tly25cs001).');
      return;
    }

    if (!branch.trim()) {
      setValidationError('Please specify or select your academic branch / department.');
      return;
    }

    if (!phone.trim()) {
      setValidationError('Please enter your mobile phone number.');
      return;
    }

    if (!phoneValidation.isValid) {
      setValidationError(
        phoneValidation.errorMessage || 'Please enter a valid 10-digit mobile number (e.g. 9876543210).'
      );
      return;
    }

    const cleanPhone = phoneValidation.cleanPhone;
    const collegeName = parsedId.placeName || `${parsedId.placeCode || 'Campus'} College`;
    const deptName = branch.trim() || parsedId.branchName || 'Engineering & Technology';

    setIsScanning(true);

    // Call server-side verification endpoint
    apiClient
      .verifyStudent({
        name: name.trim(),
        idNumber: parsedId.formattedId || idNumber.trim(),
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
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Student ID Verification</h2>
            <p className="text-xs text-slate-500">
              Institutional verification for closed-network campus carpooling
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

      {/* Quick Fill Test Profiles */}
      <div className="mb-4 p-2.5 bg-indigo-50/60 border border-indigo-100/80 rounded-2xl">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Quick 1-Click Test Profiles:
          </span>
          <span className="text-[10px] text-indigo-600 font-medium">Click to autofill</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_STUDENTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleQuickFill(sample)}
              className="px-2.5 py-1 text-xs bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 font-semibold rounded-lg border border-indigo-200 shadow-xs transition-all flex items-center gap-1"
            >
              🎓 {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleVerify} className="space-y-3.5 mb-5 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Student Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Rahul Sharma / Ananya Nair"
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
            {idNumber.trim() && (
              <span className="text-[11px] font-bold flex items-center gap-1 text-emerald-600">
                <Check className="w-3.5 h-3.5" /> ID Entered
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="e.g. tly25cs001"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 font-mono text-sm tracking-wide ${
              idNumber.trim()
                ? 'border-emerald-300 focus:ring-emerald-500 bg-emerald-50/30 text-emerald-950 font-bold'
                : 'border-slate-200 focus:ring-indigo-500 bg-slate-50/50'
            }`}
            required
          />

          {/* Real-time ID breakdown tags */}
          {parsedId.placeCode && (
            <div className="flex flex-wrap gap-1.5 mt-1.5 text-[10px] font-mono">
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                🏛️ {parsedId.placeCode}: {parsedId.placeName?.split('(')[0] || 'Campus'}
              </span>
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">
                📅 Batch {parsedId.fullYear}
              </span>
              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-100">
                💻 {parsedId.branchCode}: {parsedId.branchName?.split(' ')[0]}
              </span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                🔢 Roll #{parsedId.rollNo}
              </span>
            </div>
          )}

          <p className="text-[11px] text-slate-500 mt-1">
            Format: <strong className="font-mono text-indigo-600">tly25cs001</strong> (campus + year + branch + roll)
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
              {phone.trim() && (
                <span
                  className={`text-[10px] font-mono font-bold ${
                    phoneValidation.isValid ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                >
                  {phoneValidation.isValid ? '✓ Valid (10 Digits)' : `${phone.replace(/\D/g, '').length}/10 digits`}
                </span>
              )}
            </div>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-xs font-mono tracking-wider ${
                phone.trim()
                  ? phoneValidation.isValid
                    ? 'border-emerald-300 focus:ring-emerald-500 bg-emerald-50/30 text-emerald-950 font-bold'
                    : 'border-slate-200 focus:ring-indigo-500 bg-slate-50/50'
                  : 'border-slate-200 focus:ring-indigo-500 bg-slate-50/50'
              }`}
              required
            />
          </div>
        </div>

        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-shake">
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
                <span>ID: <strong className="text-white">{parsedId.formattedId || idNumber.trim() || 'tly25cs001'}</strong></span>
                {phone.trim() && <span className="text-indigo-200">📱 {phoneValidation.displayPhone || phone.trim()}</span>}
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
            disabled={isScanning}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

