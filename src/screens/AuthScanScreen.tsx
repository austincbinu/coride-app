import React from 'react';
import { User, OcrScanResult, TabScreen } from '../types';
import { CollegeIdScanOverlay } from '../components/CollegeIdScanOverlay';

interface AuthScanScreenProps {
  currentUser: User | null;
  onVerificationComplete: (user: User, scanResult: OcrScanResult) => void;
  onNavigate: (tab: TabScreen) => void;
}

export const AuthScanScreen: React.FC<AuthScanScreenProps> = ({
  currentUser,
  onVerificationComplete,
  onNavigate,
}) => {
  return (
    <div className="py-4 pb-16 animate-fade-in">
      <CollegeIdScanOverlay
        currentUser={currentUser}
        onVerificationComplete={(user, scan) => {
          onVerificationComplete(user, scan);
          setTimeout(() => {
            onNavigate('home');
          }, 1500);
        }}
      />
    </div>
  );
};
