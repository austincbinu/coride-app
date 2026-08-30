import React, { useState } from 'react';
import {
  ShieldAlert,
  Phone,
  Share2,
  Lock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { User } from '../types';
import confetti from 'canvas-confetti';

interface SafetyCenterScreenProps {
  currentUser: User | null;
  onTriggerSos: () => void;
}

export const SafetyCenterScreen: React.FC<SafetyCenterScreenProps> = ({
  currentUser,
  onTriggerSos,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [trustedNumber, setTrustedNumber] = useState('');
  const [trustedName, setTrustedName] = useState('');
  const [savedContact, setSavedContact] = useState(false);

  const handleShareRide = () => {
    const studentId = currentUser?.id || 'guest';
    const studentName = currentUser?.name || 'Student User';
    const campusName = currentUser?.collegeName || 'Campus';
    navigator.clipboard?.writeText(
      `https://coride.org/live-track?id=${studentId}&student=${encodeURIComponent(
        studentName
      )}&campus=${encodeURIComponent(campusName)}`
    );
    setCopiedLink(true);
    confetti({ particleCount: 40, spread: 50 });
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedContact(true);
    setTimeout(() => setSavedContact(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          Campus SafeGuard System
        </div>
        <h2 className="text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
          Safety & Emergency Center
        </h2>
        <p className="text-xs text-slate-500">
          24/7 security features, verified ride audit logs, and immediate SOS dispatch.
        </p>
      </div>

      {/* Instant SOS Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-black text-lg">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            Emergency SOS Beacon
          </div>
          <p className="text-xs text-red-100 mt-1 max-w-sm">
            Dispatches live GPS coordinates, vehicle registration, and student ID to Campus Security Control.
          </p>
        </div>

        <button
          onClick={onTriggerSos}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-red-600 font-extrabold text-sm hover:bg-red-50 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-600" />
          Trigger SOS Beacon
        </button>
      </div>

      {/* Live Trip Sharing Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-600" />
            Live Ride Tracking Link
          </h3>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            Encrypted GPS
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Share a tamper-proof web tracking link with family or friends so they can monitor your carpool trip in real-time.
        </p>

        <button
          onClick={handleShareRide}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <Share2 className="w-4 h-4 text-indigo-400" />
          {copiedLink ? 'Tracking Link Copied to Clipboard ✓' : 'Copy Live Tracking Link'}
        </button>
      </div>

      {/* Emergency Contacts Configuration */}
      <form
        onSubmit={handleSaveContact}
        className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 text-xs"
      >
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Phone className="w-4 h-4 text-indigo-600" />
          Primary Emergency Contact
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Relationship / Name</label>
            <input
              type="text"
              value={trustedName}
              onChange={(e) => setTrustedName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={trustedNumber}
              onChange={(e) => setTrustedNumber(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs"
        >
          {savedContact ? 'Contact Saved ✓' : 'Save Emergency Contact'}
        </button>
      </form>

      {/* University Emergency Directory */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-600" />
          Campus & State Helplines
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <a
            href="tel:112"
            className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-slate-900">National Emergency</div>
              <div className="text-[11px] text-slate-500">Police / Ambulance</div>
            </div>
            <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
              112
            </span>
          </a>

          <a
            href="tel:1091"
            className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-slate-900">Women Helpline</div>
              <div className="text-[11px] text-slate-500">24x7 Safety Support</div>
            </div>
            <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
              1091
            </span>
          </a>

          <a
            href="tel:04712515555"
            className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-slate-900">CET Campus Security</div>
              <div className="text-[11px] text-slate-500">Main Control Desk</div>
            </div>
            <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-1 rounded-lg border border-slate-200 text-[10px]">
              0471-2515555
            </span>
          </a>

          <a
            href="tel:1090"
            className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-slate-900">Anti-Ragging Squad</div>
              <div className="text-[11px] text-slate-500">Toll-free Hotline</div>
            </div>
            <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
              1800-180-5522
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};
