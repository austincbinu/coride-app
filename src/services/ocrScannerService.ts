import { OcrScanResult, User } from '../types';

export interface ParsedStudentId {
  isValid: boolean;
  placeCode?: string;
  placeName?: string;
  yearOfJoining?: string;
  fullYear?: number;
  branchCode?: string;
  branchName?: string;
  rollNo?: string;
  formattedId?: string;
  errorMessage?: string;
}

export const BRANCH_MAP: Record<string, string> = {
  CS: 'Computer Science & Engineering',
  EC: 'Electronics & Communication Engineering',
  ME: 'Mechanical Engineering',
  CE: 'Civil Engineering',
  EE: 'Electrical & Electronics Engineering',
  IT: 'Information Technology',
  AI: 'Artificial Intelligence & Machine Learning',
  AD: 'Artificial Intelligence & Data Science',
  CH: 'Chemical Engineering',
  BT: 'Biotechnology Engineering',
  BM: 'Biomedical Engineering',
  AE: 'Applied Electronics & Instrumentation',
  MR: 'Marine Engineering',
  RA: 'Robotics & Automation',
  AR: 'Architecture',
};

export const PLACE_MAP: Record<string, string> = {
  TLY: 'College of Engineering Thalassery (TLY)',
  CET: 'College of Engineering Trivandrum (CET)',
  MEC: 'Govt. Model Engineering College (MEC Kochi)',
  GEC: 'Govt. Engineering College (GEC)',
  GECT: 'Govt. Engineering College Thrissur (GECT)',
  GECK: 'Govt. Engineering College Kozhikode (GECK)',
  NIT: 'National Institute of Technology Calicut (NITC)',
  NITC: 'National Institute of Technology Calicut (NITC)',
  RIT: 'Rajiv Gandhi Institute of Technology (RIT)',
  TCR: 'Govt. Engineering College Thrissur (TCR)',
  TVM: 'Trivandrum Campus',
  CLT: 'Calicut Campus',
  EKM: 'Ernakulam Campus',
  KTY: 'Kottayam Campus',
  KPT: 'Wayanad Kalpetta Campus',
  PKD: 'Palakkad Campus',
  KTD: 'Kasaragod Kanhangad Campus',
  KNR: 'Kannur Campus',
  KML: 'Kollam Campus',
  ALP: 'Alappuzha Campus',
  IDK: 'Idukki Campus',
  MLP: 'Malappuram Campus',
};

export function normalizePhoneNumber(rawPhone: string): {
  isValid: boolean;
  cleanPhone: string;
  displayPhone: string;
  errorMessage?: string;
} {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      isValid: false,
      cleanPhone: '',
      displayPhone: '',
      errorMessage: 'Please enter your mobile phone number.',
    };
  }

  // Strip all non-digit characters
  let digits = rawPhone.replace(/\D/g, '');

  // If user included +91 or leading 0, cleanly normalize it
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Standard 10-digit mobile number
  if (digits.length === 10) {
    return {
      isValid: true,
      cleanPhone: digits,
      displayPhone: `${digits.slice(0, 5)} ${digits.slice(5)}`,
    };
  }

  // Also accept numbers with 7 to 15 digits
  if (digits.length >= 7 && digits.length <= 15) {
    return {
      isValid: true,
      cleanPhone: digits,
      displayPhone: digits,
    };
  }

  return {
    isValid: false,
    cleanPhone: digits,
    displayPhone: rawPhone.trim(),
    errorMessage: `Please enter a 10-digit mobile number (currently ${digits.length} digits).`,
  };
}

/**
 * Intelligent parser for student ID.
 * Primary format: [college_place][year][branch][roll_no] (e.g., tly25cs001)
 * Also accepts any student register / roll number directly.
 */
export function parseAndValidateStudentId(rawId: string): ParsedStudentId {
  const trimmed = rawId.trim();

  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: 'Student ID is required.',
    };
  }

  // Clean out spaces, dashes, dots, underscores
  const cleanId = trimmed.replace(/[\s\-_.]/g, '');

  // Primary structured format: [place: 2-5 letters][year: 2-4 digits][branch: 1-4 letters][roll: 1-5 digits]
  // Example: tly25cs001, cet22ec045, gec24ai012
  const structuredRegex = /^([a-zA-Z]{2,6})(\d{2,4})([a-zA-Z]{1,4})(\d{1,5})$/;
  const match = cleanId.match(structuredRegex);

  if (match) {
    const placeCode = match[1].toUpperCase();
    const yearDigits = match[2];
    const branchCode = match[3].toUpperCase();
    const rollNo = match[4];

    const fullYear = yearDigits.length === 2 ? 2000 + parseInt(yearDigits, 10) : parseInt(yearDigits, 10);
    const branchName = BRANCH_MAP[branchCode] || `${branchCode} Department`;
    const placeName = PLACE_MAP[placeCode] || `${placeCode} Campus`;

    return {
      isValid: true,
      placeCode,
      placeName,
      yearOfJoining: yearDigits,
      fullYear,
      branchCode,
      branchName,
      rollNo,
      formattedId: `${placeCode.toLowerCase()}${yearDigits}${branchCode.toLowerCase()}${rollNo}`,
    };
  }

  // Accept any standard student register ID / roll number
  return {
    isValid: true,
    formattedId: cleanId.toUpperCase(),
    placeName: 'Campus College',
    branchName: 'Engineering & Technology',
  };
}

export function convertScanToUser(scanResult: OcrScanResult): User {
  if (!scanResult.success) {
    return {
      id: `usr_${Date.now() % 10000}`,
      name: 'Campus Student',
      collegeName: 'University Campus',
      studentIdNumber: 'UNVERIFIED',
      email: 'student@campus.edu',
      department: 'General',
      rating: 5.0,
      ridesCompleted: 0,
      isVerified: false,
    };
  }

  return {
    id: `usr_${Date.now() % 10000}`,
    name: scanResult.extractedName,
    collegeName: scanResult.extractedCollege,
    studentIdNumber: scanResult.extractedIdNumber,
    email: scanResult.extractedEmail,
    department: scanResult.extractedDepartment,
    phoneNumber: scanResult.extractedPhone,
    rating: 5.0,
    ridesCompleted: 0,
    isVerified: true,
  };
}


