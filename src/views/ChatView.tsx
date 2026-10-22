import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Store,
  Sparkles,
  HelpCircle,
  Truck,
  Clock,
  Boxes,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const ChatView: React.FC = () => {
  const { role, chatMessages, sendMessage } = useApp();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <span>Chat Live & Auto-Reply Bot</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Online
            </span>
          </h1>
          <p className="text-xs text-stone-500">
            {role === 'pelanggan'
              ? 'Tanyakan langsung ketersediaan snack, ongkir pengiriman, atau info resep warisan.'
              : `Anda sedang login sebagai ${role.toUpperCase()}. Anda dapat membalas chat pelanggan secara langsung.`}
          </p>
        </div>

        <div className="text-xs text-stone-500 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-amber-700" />
          <span>Bot auto-reply aktif untuk pertanyaan FAQ 24/7</span>
        </div>
      </div>

      {/* Quick FAQ Pills for Customers */}
      {role === 'pelanggan' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-stone-400 font-semibold shrink-0">FAQ Cepat:</span>
          <button
            onClick={() => handleQuickQuestion('Jam buka toko dan jadwal pengantaran jam berapa ya?')}
            className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Jam Buka & Kirim</span>
          </button>
          <button
            onClick={() => handleQuickQuestion('Berapa ongkos kirim dan bagaimana cara dapat gratis ongkir?')}
            className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Truck className="w-3 h-3 text-amber-600" />
            <span>Info Ongkir Gratis</span>
          </button>
          <button
            onClick={() => handleQuickQuestion('Apa snack yang paling best seller dan favorit pelanggan?')}
            className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Snack Best Seller</span>
          </button>
          <button
            onClick={() => handleQuickQuestion('Apakah stok keripik pisang dan peyek kacang hari ini ready?')}
            className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Boxes className="w-3 h-3 text-amber-600" />
            <span>Cek Stok Ready</span>
          </button>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs h-[500px] flex flex-col overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {chatMessages.map((msg) => {
            const isMe =
              role === 'pelanggan' ? msg.sender === 'customer' : msg.sender === 'seller';
            const isBot = msg.sender === 'bot';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                  isMe ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                    isBot
                      ? 'bg-amber-600'
                      : msg.sender === 'seller'
                      ? 'bg-stone-800'
                      : 'bg-amber-700'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : msg.sender === 'seller' ? <Store className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-[11px] ${isMe ? 'justify-end' : ''}`}>
                    <span className="font-bold text-stone-700">{msg.senderName}</span>
                    <span className="text-stone-400 tabular-nums">
                      {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                      isMe
                        ? 'bg-amber-600 text-white rounded-tr-xs'
                        : isBot
                        ? 'bg-amber-50 text-stone-900 border border-amber-200/60 rounded-tl-xs'
                        : 'bg-stone-100 text-stone-900 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={
              role === 'pelanggan'
                ? 'Ketik pesan atau pertanyaan untuk penjual / bot...'
                : 'Balas pesan sebagai Penjual Kletak-Kletik...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
          <button
            type="submit"
            aria-label="Kirim pesan chat"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
};
