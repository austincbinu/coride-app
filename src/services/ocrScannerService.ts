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

  // Handle common country code prefixes (e.g., India +91)
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Accept valid phone numbers (10 digits standard mobile, or 7-15 digits international)
  if (digits.length >= 10 && digits.length <= 15) {
    const formatted =
      digits.length === 10
        ? `${digits.slice(0, 5)} ${digits.slice(5)}`
        : digits;
    return {
      isValid: true,
      cleanPhone: digits,
      displayPhone: formatted,
    };
  }

  if (digits.length < 10) {
    return {
      isValid: false,
      cleanPhone: digits,
      displayPhone: digits,
      errorMessage: `Phone number is too short (${digits.length}/10 digits). Please enter at least 10 digits.`,
    };
  }

  return {
    isValid: true,
    cleanPhone: digits,
    displayPhone: digits,
  };
}

/**
 * Intelligent parser for student ID.
 * Primary format: [college_place][year][branch][roll_no] (e.g., tly25cs001)
 * Also accepts flexible formats (e.g. CET22EC045, 21CS001, KTU2021001, etc.)
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

  if (cleanId.length < 4) {
    return {
      isValid: false,
      errorMessage: 'Student ID / Register number is too short.',
    };
  }

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

  // Fallback: Accept any valid alphanumeric student registration / roll number
  const alphanumericRegex = /^[a-zA-Z0-9]{4,25}$/;
  if (alphanumericRegex.test(cleanId)) {
    return {
      isValid: true,
      formattedId: cleanId.toUpperCase(),
      placeName: 'Campus College',
      branchName: 'Engineering & Technology',
    };
  }

  return {
    isValid: false,
    errorMessage: 'Please enter a valid student ID (letters and numbers).',
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


