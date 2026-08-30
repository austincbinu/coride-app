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

/**
 * Strict parser for student ID in the format:
 * [college_place (3-4 letters)][year (2 digits)][branch (2 letters)][roll_no (3 digits)]
 * Example: tly25cs001
 * - tly = college place
 * - 25 = year of joining (2025)
 * - cs = branch (Computer Science)
 * - 001 = roll no
 */
export function parseAndValidateStudentId(rawId: string): ParsedStudentId {
  const trimmed = rawId.trim();

  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: 'Student ID is required.',
    };
  }

  // Strict format matching: 3-4 letters place, 2 digits year, 2 letters branch, 3 digits roll
  const regex = /^([a-zA-Z]{3,4})(\d{2})([a-zA-Z]{2})(\d{3})$/;
  const match = trimmed.match(regex);

  if (!match) {
    return {
      isValid: false,
      errorMessage:
        "Student ID must follow format: [place][year][branch][roll] (e.g., tly25cs001).",
    };
  }

  const placeCode = match[1].toUpperCase();
  const yearDigits = match[2];
  const branchCode = match[3].toUpperCase();
  const rollNo = match[4];

  const fullYear = 2000 + parseInt(yearDigits, 10);
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


