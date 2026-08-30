import React, { useState, useEffect } from 'react';
import { TabScreen, User, RideOffer, ChatMessage, OcrScanResult } from './types';
import { INITIAL_USER, INITIAL_RIDES, INITIAL_CHAT_MESSAGES } from './data/initialData';
import { MobileStatusBar } from './components/MobileStatusBar';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { SosModal } from './components/SosModal';
import { HomeScreen } from './screens/HomeScreen';
import { RequestRideScreen } from './screens/RequestRideScreen';
import { OfferRideScreen } from './screens/OfferRideScreen';
import { FuelCalculatorScreen } from './screens/FuelCalculatorScreen';
import { ChatScreen } from './screens/ChatScreen';
import { SafetyCenterScreen } from './screens/SafetyCenterScreen';
import { HistoryRatingsScreen } from './screens/HistoryRatingsScreen';
import { AuthScanScreen } from './screens/AuthScanScreen';
import { Smartphone, Maximize2 } from 'lucide-react';
import { apiClient } from './services/apiClient';

export default function App() {
  // State from CoRideViewModel
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('coride_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.name === 'Ananthu Nair' || parsed.id === 'user_101')) {
          localStorage.removeItem('coride_user');
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return INITIAL_USER;
  });

  const [currentTab, setCurrentTab] = useState<TabScreen>(() => {
    // If not logged in, prompt student verification first
    const saved = localStorage.getItem('coride_user');
    return saved ? 'home' : 'auth';
  });

  const [rideOffers, setRideOffers] = useState<RideOffer[]>(() => {
    const saved = localStorage.getItem('coride_rides');
    if (saved) {
      try {
        const parsed: RideOffer[] = JSON.parse(saved);
        // Filter out legacy mock data
        const cleaned = parsed.filter((r) => !['ride_101', 'ride_102', 'ride_103', 'ride_104'].includes(r.id));
        return cleaned;
      } catch {
        return INITIAL_RIDES;
      }
    }
    return INITIAL_RIDES;
  });

  const [bookedRideIds, setBookedRideIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('coride_booked');
    if (saved) {
      try {
        const parsed: string[] = JSON.parse(saved);
        return parsed.filter((id) => !['ride_101', 'ride_102', 'ride_103', 'ride_104'].includes(id));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('coride_chat');
    if (saved) {
      try {
        const parsed: ChatMessage[] = JSON.parse(saved);
        return parsed.filter((m) => !['msg_1', 'msg_2'].includes(m.id));
      } catch {
        return INITIAL_CHAT_MESSAGES;
      }
    }
    return INITIAL_CHAT_MESSAGES;
  });

  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Load server-persisted rides and chat messages on mount
  useEffect(() => {
    apiClient.getRides().then((serverRides) => {
      if (serverRides && serverRides.length > 0) {
        setRideOffers(serverRides);
      }
    });

    apiClient.getChatMessages().then((serverMessages) => {
      if (serverMessages && serverMessages.length > 0) {
        setChatMessages(serverMessages);
      }
    });
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('coride_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('coride_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('coride_rides', JSON.stringify(rideOffers));
  }, [rideOffers]);

  useEffect(() => {
    localStorage.setItem('coride_booked', JSON.stringify(bookedRideIds));
  }, [bookedRideIds]);

  useEffect(() => {
    localStorage.setItem('coride_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Actions
  const handleLogout = () => {
    localStorage.removeItem('coride_user');
    setCurrentUser(null);
    setCurrentTab('auth');
  };

  const handleBookRide = (rideId: string) => {
    if (!bookedRideIds.includes(rideId)) {
      setBookedRideIds((prev) => [...prev, rideId]);
      setRideOffers((prev) =>
        prev.map((r) =>
          r.id === rideId ? { ...r, availableSeats: Math.max(0, r.availableSeats - 1) } : r
        )
      );
      // Sync with backend API
      apiClient.bookRide(rideId, currentUser?.name, currentUser?.id);
    }
  };

  const handleDeleteRide = (id: string) => {
    setRideOffers((prev) => prev.filter((r) => r.id !== id));
    apiClient.deleteRide(id);
  };

  const handleCreateRide = (
    origin: string,
    destination: string,
    availableSeats: number,
    pricePerSeat: number,
    vehicleModel: string
  ) => {
    const newRidePayload: Partial<RideOffer> = {
      driverName: currentUser?.name || 'Student Driver',
      driverCollege: currentUser
        ? `${currentUser.department} • ${currentUser.collegeName}`
        : 'Campus Carpool',
      driverRating: currentUser?.rating ?? 5.0,
      isDriverVerified: currentUser?.isVerified ?? true,
      vehicleModel,
      vehiclePlate: 'KL-01-XX-2024',
      originName: origin,
      destinationName: destination,
      originLat: 8.5475,
      originLng: 76.9063,
      destLat: 8.487,
      destLng: 76.9528,
      distanceKm: 18.4,
      totalSeats: availableSeats + 1,
      availableSeats,
      basePricePerSeat: pricePerSeat,
      departureTime: 'In 30 mins',
      status: 'UPCOMING',
      routeDeviationPercent: 1.5,
    };

    // Optimistic local update
    const tempRide: RideOffer = {
      ...newRidePayload,
      id: `ride_${Date.now()}`,
    } as RideOffer;

    setRideOffers((prev) => [tempRide, ...prev]);

    // Persist to backend
    apiClient.createRide(newRidePayload).then((savedRide) => {
      if (savedRide) {
        setRideOffers((prev) => prev.map((r) => (r.id === tempRide.id ? savedRide : r)));
      }
    });
  };

  const handleSendMessage = (text: string) => {
    const targetRide = rideOffers.find((r) => bookedRideIds.includes(r.id)) || rideOffers[0];
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      rideId: targetRide?.id || 'ride_live',
      senderName: currentUser?.name || 'Student',
      isDriver: false,
      isVerified: currentUser?.isVerified ?? false,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // Send to backend API
    apiClient.sendChatMessage({
      rideId: newMsg.rideId,
      senderName: newMsg.senderName,
      isDriver: newMsg.isDriver,
      isVerified: newMsg.isVerified,
      text: newMsg.text,
    });
  };

  const handleVerificationComplete = (user: User, _scan: OcrScanResult) => {
    setCurrentUser(user);
  };

  const activeScheduledRide =
    rideOffers.find((r) => bookedRideIds.includes(r.id)) || null;

  return (
    <div className="min-h-screen bg-slate-900 font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 flex flex-col items-center justify-center p-0 sm:p-4 selection:bg-indigo-500 selection:text-white">
      {/* Desktop / Large screen view mode switcher */}
      <div className="hidden sm:flex items-center gap-2 mb-3 z-30">
        <span className="text-[11px] font-bold text-slate-400">Device View:</span>
        <button
          onClick={() => setIsPhoneFrame(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            isPhoneFrame
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Mobile Phone Frame
        </button>
        <button
          onClick={() => setIsPhoneFrame(false)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            !isPhoneFrame
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          Full Mobile View
        </button>
      </div>

      {/* Main Mobile App Phone Container */}
      <div
        className={`w-full bg-slate-100/90 text-slate-800 flex flex-col relative transition-all ${
          isPhoneFrame
            ? 'max-w-[430px] sm:h-[890px] sm:max-h-[92vh] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 sm:shadow-2xl sm:shadow-black/70 overflow-hidden'
            : 'max-w-2xl min-h-screen sm:min-h-[90vh] sm:rounded-3xl sm:border sm:border-slate-700/60 overflow-hidden shadow-2xl'
        }`}
      >
        {/* Native Mobile Status Bar */}
        <MobileStatusBar />

        {/* Mobile Header Navigation */}
        <Navbar
          currentUser={currentUser}
          currentTab={currentTab}
          onNavigate={setCurrentTab}
          onTriggerSos={() => setIsSosOpen(true)}
          onOpenAuth={() => setCurrentTab('auth')}
          onLogout={handleLogout}
        />

        {/* Scrollable Screen Content */}
        <main className="flex-1 overflow-y-auto px-4 pt-3.5 pb-6 no-scrollbar">
          {currentTab === 'home' && (
            <HomeScreen
              currentUser={currentUser}
              activeRide={activeScheduledRide}
              onNavigate={setCurrentTab}
              onSelectRide={() => setCurrentTab('request')}
            />
          )}

          {currentTab === 'request' && (
            <RequestRideScreen
              currentUser={currentUser}
              rideOffers={rideOffers}
              bookedRideIds={bookedRideIds}
              onBookRide={handleBookRide}
              onDeleteRide={handleDeleteRide}
            />
          )}

          {currentTab === 'offer' && (
            <OfferRideScreen
              currentUser={currentUser}
              onCreateRide={handleCreateRide}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'fuel' && <FuelCalculatorScreen />}

          {currentTab === 'chat' && (
            <ChatScreen
              currentUser={currentUser}
              activeRide={activeScheduledRide}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
            />
          )}

          {currentTab === 'safety' && (
            <SafetyCenterScreen
              currentUser={currentUser}
              onTriggerSos={() => setIsSosOpen(true)}
            />
          )}

          {currentTab === 'history' && <HistoryRatingsScreen currentUser={currentUser} />}

          {currentTab === 'auth' && (
            <AuthScanScreen
              currentUser={currentUser}
              onVerificationComplete={handleVerificationComplete}
              onNavigate={setCurrentTab}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav
          currentTab={currentTab}
          onNavigate={setCurrentTab}
        />

        {/* Native Mobile Home Bar Indicator */}
        <div className="bg-white/95 pb-1.5 pt-0.5 flex justify-center items-center">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* SOS Emergency Modal */}
        <SosModal
          currentUser={currentUser}
          isOpen={isSosOpen}
          onDismiss={() => setIsSosOpen(false)}
        />
      </div>
    </div>
  );
}
