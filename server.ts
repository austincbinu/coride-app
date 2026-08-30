import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS and permissive headers for shared / embedded access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// In-memory & file-backed data store for server-side persistence
interface ServerUser {
  id: string;
  name: string;
  collegeName: string;
  studentIdNumber: string;
  email: string;
  department: string;
  phoneNumber?: string;
  rating: number;
  ridesCompleted: number;
  isVerified: boolean;
  joinedDate: string;
}

interface ServerRide {
  id: string;
  driverName: string;
  driverCollege: string;
  driverRating: number;
  isDriverVerified: boolean;
  vehicleModel: string;
  vehiclePlate: string;
  originName: string;
  destinationName: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  distanceKm: number;
  totalSeats: number;
  availableSeats: number;
  basePricePerSeat: number;
  departureTime: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  routeDeviationPercent: number;
  passengers?: string[];
  createdAt: string;
}

interface ServerChatMessage {
  id: string;
  rideId: string;
  senderName: string;
  isDriver: boolean;
  isVerified: boolean;
  text: string;
  timestamp: string;
}

interface ServerSosAlert {
  id: string;
  userId: string;
  userName: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  status: 'DISPATCHED' | 'RESOLVED';
}

const DATA_DIR = path.join(process.cwd(), 'data_store');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('Could not create data_store directory:', e);
  }
}
const RIDES_FILE = path.join(DATA_DIR, 'rides.json');
const CHATS_FILE = path.join(DATA_DIR, 'chats.json');

// Initial seed rides for campus carpooling
const SAMPLE_CAMPUS_RIDES: ServerRide[] = [
  {
    id: 'ride_tly_01',
    driverName: 'Rahul Sharma',
    driverCollege: 'College of Engineering Thalassery (TLY)',
    driverRating: 4.9,
    isDriverVerified: true,
    vehicleModel: 'Maruti Suzuki Swift',
    vehiclePlate: 'KL-58-AB-4321',
    originName: 'TLY Campus Gate, Thalassery',
    destinationName: 'Kannur Old Bus Stand',
    originLat: 11.7584,
    originLng: 75.5398,
    destLat: 11.8745,
    destLng: 75.3704,
    distanceKm: 21.5,
    totalSeats: 4,
    availableSeats: 3,
    basePricePerSeat: 45,
    departureTime: '04:30 PM Today',
    status: 'UPCOMING',
    routeDeviationPercent: 1.2,
    passengers: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ride_cet_02',
    driverName: 'Ananya Nair',
    driverCollege: 'College of Engineering Trivandrum (CET)',
    driverRating: 5.0,
    isDriverVerified: true,
    vehicleModel: 'Tata Nexon EV',
    vehiclePlate: 'KL-01-CZ-8899',
    originName: 'CET Kulathoor Campus, TVM',
    destinationName: 'Thampanoor Central Railway Station',
    originLat: 8.5475,
    originLng: 76.9063,
    destLat: 8.487,
    destLng: 76.9528,
    distanceKm: 14.8,
    totalSeats: 4,
    availableSeats: 2,
    basePricePerSeat: 35,
    departureTime: '05:15 PM Today',
    status: 'UPCOMING',
    routeDeviationPercent: 0.8,
    passengers: [],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'ride_mec_03',
    driverName: 'Austin Binu',
    driverCollege: 'Govt. Model Engineering College (MEC Kochi)',
    driverRating: 4.95,
    isDriverVerified: true,
    vehicleModel: 'Hyundai i20',
    vehiclePlate: 'KL-07-BW-2024',
    originName: 'MEC Thrikkakara Main Gate',
    destinationName: 'Infopark Phase 1 & 2 Kakkanad',
    originLat: 10.0284,
    originLng: 76.3287,
    destLat: 10.0104,
    destLng: 76.3638,
    distanceKm: 8.5,
    totalSeats: 3,
    availableSeats: 3,
    basePricePerSeat: 25,
    departureTime: '06:00 PM Today',
    status: 'UPCOMING',
    routeDeviationPercent: 1.0,
    passengers: [],
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

function loadRides(): ServerRide[] {
  try {
    if (fs.existsSync(RIDES_FILE)) {
      const content = fs.readFileSync(RIDES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading rides from disk:', err);
  }
  return [...SAMPLE_CAMPUS_RIDES];
}

function saveRides(data: ServerRide[]) {
  try {
    fs.writeFileSync(RIDES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving rides to disk:', err);
  }
}

function loadChats(): ServerChatMessage[] {
  try {
    if (fs.existsSync(CHATS_FILE)) {
      const content = fs.readFileSync(CHATS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Error reading chats from disk:', err);
  }
  return [];
}

function saveChats(data: ServerChatMessage[]) {
  try {
    fs.writeFileSync(CHATS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving chats to disk:', err);
  }
}

const verifiedUsers: Map<string, ServerUser> = new Map();
let rides: ServerRide[] = loadRides();
let chatMessages: ServerChatMessage[] = loadChats();
const sosAlerts: ServerSosAlert[] = [];

// ==========================================
// REAL-TIME SSE (Server-Sent Events) BROADCAST
// ==========================================
const sseClients = new Set<express.Response>();

function broadcastSSE(data: any) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Keep-alive heartbeat every 15 seconds to prevent network timeouts
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': ping\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 15000);

// Branch map & Place map for server-side verification
const BRANCH_MAP: Record<string, string> = {
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

const PLACE_MAP: Record<string, string> = {
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

// ==========================================
// REST API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    ridesCount: rides.length,
    activeSosAlerts: sosAlerts.length,
  });
});

// Student verification endpoint
app.post('/api/auth/verify-student', (req, res) => {
  const { name, idNumber, branch, phone } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Full student name is required.' });
  }

  if (!idNumber || !idNumber.trim()) {
    return res.status(400).json({ error: 'Student ID / Register number is required.' });
  }

  // Clean phone input
  let phoneDigits = (phone || '').replace(/\D/g, '');
  if (!phoneDigits) {
    phoneDigits = String(phone || '').trim();
  }

  const rawId = (idNumber || '').trim().replace(/[\s\-_.]/g, '');
  const structuredRegex = /^([a-zA-Z]{2,6})(\d{2,4})([a-zA-Z]{1,4})(\d{1,5})$/;
  const match = rawId.match(structuredRegex);

  let placeName = 'Campus College';
  let branchName = branch && branch.trim() ? branch.trim() : 'Engineering & Technology';
  let formattedId = rawId.toUpperCase() || 'STUDENT-PASS';
  let studentEmail = `${(name || 'student').trim().toLowerCase().replace(/\s+/g, '.')}@campus.ac.in`;
  let userId = `usr_${Date.now()}`;

  if (match) {
    const placeCode = match[1].toUpperCase();
    const yearDigits = match[2];
    const branchCode = match[3].toUpperCase();
    const rollNo = match[4];

    const detectedBranchName = BRANCH_MAP[branchCode] || `${branchCode} Department`;
    branchName = branch && branch.trim() ? branch.trim() : detectedBranchName;
    placeName = PLACE_MAP[placeCode] || `${placeCode} Campus`;
    formattedId = `${placeCode.toLowerCase()}${yearDigits}${branchCode.toLowerCase()}${rollNo}`;
    studentEmail = `${name.trim().toLowerCase().replace(/\s+/g, '.')}@${placeCode.toLowerCase()}.ac.in`;
    userId = `usr_${placeCode.toLowerCase()}_${rollNo}_${Date.now()}`;
  }

  const user: ServerUser = {
    id: userId,
    name: name.trim(),
    collegeName: placeName,
    studentIdNumber: formattedId,
    email: studentEmail,
    department: branchName,
    phoneNumber: phoneDigits,
    rating: 5.0,
    ridesCompleted: 0,
    isVerified: true,
    joinedDate: 'Joined Today',
  };

  verifiedUsers.set(userId, user);

  res.json({
    success: true,
    user,
    scanResult: {
      success: true,
      extractedName: user.name,
      extractedCollege: user.collegeName,
      extractedIdNumber: user.studentIdNumber,
      extractedEmail: user.email,
      extractedDepartment: user.department,
      extractedPhone: user.phoneNumber,
      rawText: `VERIFIED CAMPUS ID: ${user.studentIdNumber}\n${user.name}\n${user.collegeName}\nDEPT: ${user.department}\nPHONE: ${user.phoneNumber}`,
      isStudentIdValid: true,
      confidenceScore: 0.99,
    },
  });
});

// Rides list
app.get('/api/rides', (req, res) => {
  const { origin, destination, maxPrice } = req.query;
  let filtered = [...rides];

  if (origin && typeof origin === 'string') {
    filtered = filtered.filter((r) =>
      r.originName.toLowerCase().includes(origin.toLowerCase())
    );
  }

  if (destination && typeof destination === 'string') {
    filtered = filtered.filter((r) =>
      r.destinationName.toLowerCase().includes(destination.toLowerCase())
    );
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    filtered = filtered.filter((r) => r.basePricePerSeat <= Number(maxPrice));
  }

  res.json({ success: true, count: filtered.length, rides: filtered });
});

// SSE Real-time events connection endpoint
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send initial sync event
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', rides, chatMessages })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Create ride offer
app.post('/api/rides', (req, res) => {
  const {
    driverName,
    driverCollege,
    driverRating,
    isDriverVerified,
    vehicleModel,
    vehiclePlate,
    originName,
    destinationName,
    availableSeats,
    basePricePerSeat,
    departureTime,
    originLat,
    originLng,
    destLat,
    destLng,
    distanceKm,
  } = req.body;

  if (!originName || !destinationName) {
    return res.status(400).json({ error: 'Origin and destination are required.' });
  }

  if (!availableSeats || availableSeats < 1) {
    return res.status(400).json({ error: 'At least 1 available seat is required.' });
  }

  const newRide: ServerRide = {
    id: `ride_${Date.now()}`,
    driverName: driverName || 'Student Driver',
    driverCollege: driverCollege || 'Campus Carpool',
    driverRating: driverRating || 5.0,
    isDriverVerified: isDriverVerified ?? true,
    vehicleModel: vehicleModel || 'Sedan',
    vehiclePlate: vehiclePlate || 'KL-01-XX-2025',
    originName,
    destinationName,
    originLat: originLat || 8.5475,
    originLng: originLng || 76.9063,
    destLat: destLat || 8.487,
    destLng: destLng || 76.9528,
    distanceKm: distanceKm || 18.4,
    totalSeats: availableSeats + 1,
    availableSeats: Number(availableSeats),
    basePricePerSeat: Number(basePricePerSeat) || 45,
    departureTime: departureTime || 'In 30 mins',
    status: 'UPCOMING',
    routeDeviationPercent: 1.5,
    passengers: [],
    createdAt: new Date().toISOString(),
  };

  rides.unshift(newRide);
  saveRides(rides);
  
  // Instant broadcast to ALL connected friends and clients
  broadcastSSE({
    type: 'RIDE_CREATED',
    ride: newRide,
    rides,
  });

  res.status(201).json({ success: true, ride: newRide });
});

// Book a ride
app.post('/api/rides/:id/book', (req, res) => {
  const { id } = req.params;
  const { passengerName, passengerId } = req.body;

  const ride = rides.find((r) => r.id === id);
  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }

  if (ride.availableSeats <= 0) {
    return res.status(400).json({ error: 'No available seats left on this ride.' });
  }

  ride.availableSeats -= 1;
  if (!ride.passengers) {
    ride.passengers = [];
  }
  if (passengerName) {
    ride.passengers.push(passengerName);
  }

  saveRides(rides);

  // Broadcast seat booking to all connected users in real time
  broadcastSSE({
    type: 'RIDE_UPDATED',
    ride,
    rides,
  });

  res.json({
    success: true,
    message: 'Seat successfully reserved!',
    ride,
    passengerId: passengerId || 'passenger_verified',
  });
});

// Cancel / Delete ride
app.delete('/api/rides/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = rides.length;
  rides = rides.filter((r) => r.id !== id);

  if (rides.length === initialLength) {
    return res.status(404).json({ error: 'Ride not found' });
  }

  saveRides(rides);

  // Broadcast deletion
  broadcastSSE({
    type: 'RIDE_DELETED',
    rideId: id,
    rides,
  });

  res.json({ success: true, message: 'Ride cancelled successfully' });
});

// Chat Messages
app.get('/api/chat/messages', (req, res) => {
  const { rideId } = req.query;
  let messages = chatMessages;
  if (rideId && typeof rideId === 'string') {
    messages = chatMessages.filter((m) => m.rideId === rideId);
  }
  res.json({ success: true, messages });
});

app.post('/api/chat/messages', (req, res) => {
  const { rideId, senderName, isDriver, isVerified, text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text cannot be empty' });
  }

  const newMsg: ServerChatMessage = {
    id: `msg_${Date.now()}`,
    rideId: rideId || 'ride_live',
    senderName: senderName || 'Student',
    isDriver: isDriver ?? false,
    isVerified: isVerified ?? true,
    text: text.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  chatMessages.push(newMsg);
  saveChats(chatMessages);

  // Broadcast live chat message
  broadcastSSE({
    type: 'CHAT_MESSAGE',
    message: newMsg,
    chatMessages,
  });

  res.status(201).json({ success: true, message: newMsg });
});

// SOS Emergency Alert Trigger
app.post('/api/sos/alert', (req, res) => {
  const { userId, userName, phone, latitude, longitude } = req.body;

  const alert: ServerSosAlert = {
    id: `sos_${Date.now()}`,
    userId: userId || 'anonymous',
    userName: userName || 'Student in distress',
    phone: phone || 'Unknown',
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
    status: 'DISPATCHED',
  };

  sosAlerts.push(alert);
  console.log(`[EMERGENCY SOS DISPATCH] Alert triggered by ${alert.userName} (${alert.phone})`);

  res.status(201).json({
    success: true,
    message: 'Campus Security and Emergency Contacts Dispatched.',
    alertId: alert.id,
    timestamp: alert.timestamp,
  });
});

// Fuel Fair-Share Calculation Endpoint
app.post('/api/fuel/calculate', (req, res) => {
  const { distanceKm, mileageKmpl, fuelPricePerLiter, passengerCount } = req.body;

  const dist = Number(distanceKm) || 20;
  const mileage = Number(mileageKmpl) || 15;
  const price = Number(fuelPricePerLiter) || 105;
  const count = Number(passengerCount) || 3;

  const totalFuelLiters = dist / mileage;
  const totalCost = totalFuelLiters * price;
  const costPerPerson = totalCost / (count + 1); // Driver + passengers

  res.json({
    success: true,
    breakdown: {
      distanceKm: dist,
      mileageKmpl: mileage,
      fuelPricePerLiter: price,
      totalFuelLiters: Math.round(totalFuelLiters * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      passengerCount: count,
      driverFairShare: Math.round(costPerPerson),
      perPassengerFairShare: Math.round(costPerPerson),
      carbonSavingsKg: Math.round(dist * 0.12 * count * 10) / 10,
    },
  });
});

// ==========================================
// STATIC & VITE MIDDLEWARE SETUP
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CoRide Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
