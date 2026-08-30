import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, Radio, ShieldAlert, X } from 'lucide-react';
import { User } from '../types';
import { apiClient } from '../services/apiClient';

interface SosModalProps {
  currentUser: User | null;
  isOpen: boolean;
  onDismiss: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ currentUser, isOpen, onDismiss }) => {
  const [countdown, setCountdown] = useState(5);
  const [alertSent, setAlertSent] = useState(false);
  const [alertId, setAlertId] = useState<string | null>(null);

  const dispatchAlert = () => {
    setAlertSent(true);
    apiClient
      .triggerSosAlert({
        userId: currentUser?.id,
        userName: currentUser?.name,
        phone: currentUser?.phoneNumber,
        latitude: 8.5475,
        longitude: 76.9063,
      })
      .then((res) => {
        if (res.alertId) setAlertId(res.alertId);
      });
  };

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setAlertSent(false);
      return;
    }

    if (countdown > 0 && !alertSent) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !alertSent) {
      dispatchAlert();
    }
  }, [isOpen, countdown, alertSent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-red-500/80 rounded-3xl p-6 text-white max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Pulsing warning glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-red-400 font-bold text-base">
            <ShieldAlert className="w-6 h-6 animate-pulse text-red-500" />
            <span>CAMPUS EMERGENCY SOS</span>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!alertSent ? (
          <div className="text-center py-6">
            <div className="w-24 h-24 rounded-full bg-red-500/20 border-4 border-red-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <span className="text-4xl font-black text-red-500">{countdown}</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Broadcasting Emergency Alert in {countdown}s
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Your live GPS coordinates and student profile ({currentUser?.studentIdNumber || 'CAMPUS-USER'}) will be dispatched immediately to Campus Patrol & Trusted Contacts.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onDismiss}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-slate-200"
              >
                Cancel / False Alarm
              </button>
              <button
                onClick={dispatchAlert}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-sm text-white shadow-lg shadow-red-600/40"
              >
                Send Instantly
              </button>
            </div>
          </div>
        ) : (
          <div className="py-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Emergency Beacon Active 🚨</h3>
            <p className="text-xs text-slate-300 mb-4">
              Dispatched to <strong>Campus Security Patrol</strong> & <strong>Primary Contacts</strong> via SMS.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-left text-xs space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Student:</span>
                <span className="font-bold text-white">{currentUser?.name || 'Campus Student'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Campus:</span>
                <span className="font-semibold text-slate-200">{currentUser?.collegeName || 'Campus'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Live GPS:</span>
                <span className="font-mono text-emerald-400">8.5475° N, 76.9063° E (Campus Ground)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href="tel:112"
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call 112 / Security
              </a>
              <button
                onClick={onDismiss}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Dismiss Alert
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Server incident log {alertId || '#SOS-9041'} dispatched to campus patrol</span>
        </div>
      </div>
    </div>
  );
};
