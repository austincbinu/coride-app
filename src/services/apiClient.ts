import { RideOffer, User, ChatMessage, OcrScanResult } from '../types';

export const apiClient = {
  // Check backend health
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      return data.status === 'ok';
    } catch (e) {
      console.warn('Backend offline, using client fallback', e);
      return false;
    }
  },

  // Verify Student ID Server-side
  async verifyStudent(params: {
    name: string;
    idNumber: string;
    branch: string;
    phone: string;
  }): Promise<{ success: boolean; user?: User; error?: string; scanResult?: OcrScanResult }> {
    try {
      const res = await fetch('/api/auth/verify-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Verification failed.' };
      }

      const scanResult: OcrScanResult = {
        success: true,
        extractedName: data.user.name,
        extractedCollege: data.user.collegeName,
        extractedIdNumber: data.user.studentIdNumber,
        extractedEmail: data.user.email,
        extractedDepartment: data.user.department,
        extractedPhone: data.user.phoneNumber,
        rawText: `VERIFIED CAMPUS ID: ${data.user.studentIdNumber}\n${data.user.name}\n${data.user.collegeName}\nDEPT: ${data.user.department}\nPHONE: ${data.user.phoneNumber}`,
      };

      return { success: true, user: data.user, scanResult };
    } catch (err: any) {
      console.error('API Verification error:', err);
      return { success: false, error: err.message || 'Network error connecting to backend.' };
    }
  },

  // Fetch all rides from backend
  async getRides(): Promise<RideOffer[]> {
    try {
      const res = await fetch('/api/rides');
      if (!res.ok) throw new Error('Failed to fetch rides');
      const data = await res.json();
      return data.rides || [];
    } catch (err) {
      console.warn('API getRides failed, falling back to local state:', err);
      return [];
    }
  },

  // Create a new ride offer
  async createRide(rideData: Partial<RideOffer>): Promise<RideOffer | null> {
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rideData),
      });
      if (!res.ok) throw new Error('Failed to create ride');
      const data = await res.json();
      return data.ride;
    } catch (err) {
      console.error('API createRide failed:', err);
      return null;
    }
  },

  // Book a seat on a ride
  async bookRide(rideId: string, passengerName?: string, passengerId?: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/rides/${rideId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passengerName, passengerId }),
      });
      return res.ok;
    } catch (err) {
      console.error('API bookRide failed:', err);
      return false;
    }
  },

  // Cancel/Delete a ride
  async deleteRide(rideId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/rides/${rideId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.error('API deleteRide failed:', err);
      return false;
    }
  },

  // Fetch chat messages
  async getChatMessages(rideId?: string): Promise<ChatMessage[]> {
    try {
      const url = rideId ? `/api/chat/messages?rideId=${encodeURIComponent(rideId)}` : '/api/chat/messages';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      return data.messages || [];
    } catch (err) {
      console.warn('API getChatMessages failed:', err);
      return [];
    }
  },

  // Send a chat message
  async sendChatMessage(msg: {
    rideId: string;
    senderName: string;
    isDriver?: boolean;
    isVerified?: boolean;
    text: string;
  }): Promise<ChatMessage | null> {
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();
      return data.message;
    } catch (err) {
      console.error('API sendChatMessage failed:', err);
      return null;
    }
  },

  // Trigger campus SOS alert
  async triggerSosAlert(payload: {
    userId?: string;
    userName?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<{ success: boolean; alertId?: string; message?: string }> {
    try {
      const res = await fetch('/api/sos/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return { success: res.ok, alertId: data.alertId, message: data.message };
    } catch (err) {
      console.error('API triggerSosAlert failed:', err);
      return { success: false, message: 'Local emergency dispatch triggered' };
    }
  },

  // Server-side accurate fuel computation
  async calculateFuel(payload: {
    distanceKm: number;
    mileageKmpl: number;
    fuelPricePerLiter: number;
    passengerCount: number;
  }) {
    try {
      const res = await fetch('/api/fuel/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Calculation error');
      const data = await res.json();
      return data.breakdown;
    } catch (err) {
      console.error('API calculateFuel failed:', err);
      return null;
    }
  },
};
