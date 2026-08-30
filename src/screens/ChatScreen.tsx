import React, { useState } from 'react';
import { Send, MessageSquare, ShieldCheck, Phone } from 'lucide-react';
import { ChatMessage, RideOffer, User } from '../types';

interface ChatScreenProps {
  currentUser: User | null;
  activeRide: RideOffer | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  currentUser,
  activeRide,
  messages,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-16 animate-fade-in flex flex-col h-[calc(100vh-140px)]">
      {/* Header with Driver info */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
            {activeRide ? activeRide.driverName.slice(0, 2).toUpperCase() : 'CC'}
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
              {activeRide ? activeRide.driverName : 'Campus Carpool Chat'}
              {activeRide?.isDriverVerified && (
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            <div className="text-xs text-slate-500">
              {activeRide ? `${activeRide.driverCollege} • ${activeRide.vehicleModel}` : 'Direct peer-to-peer ride coordination'}
            </div>
          </div>
        </div>

        {activeRide && (
          <div className="flex items-center gap-2">
            <a
              href="tel:+919876543210"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              title="Call driver"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto bg-slate-50 rounded-3xl p-4 border border-slate-200/70 space-y-3">
        {/* Campus Safety Reminder */}
        <div className="text-center my-2">
          <span className="text-[11px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 font-medium">
            🔒 Verified campus ride coordination
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No messages yet</p>
            <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
              Send a quick message to coordinate pickup locations and departure timings.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = currentUser ? msg.senderName === currentUser.name : !msg.isDriver;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[10px] text-slate-400 mb-1 px-1 flex items-center gap-1">
                  <span>{msg.senderName}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isCurrentUser
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          placeholder="Type message to driver..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs"
        />
        <button
          type="submit"
          className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md flex items-center justify-center transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

