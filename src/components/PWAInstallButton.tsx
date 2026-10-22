import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (isInstalled) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Ambient guide for desktop or unsupported
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        aria-label="Install Aplikasi PWA Kletak-Kletik"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install PWA</span>
      </button>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-stone-900 text-base">Install di Smartphone</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700"
                aria-label="Tutup panduan install"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Nikmati akses katalog snack dan lacak pesanan lebih cepat secara offline langsung dari layar utama smartphone Anda:
            </p>
            <ol className="text-xs text-stone-700 space-y-2 mb-5 list-decimal pl-4">
              <li>Buka menu browser (ikon titik tiga atau ikon <strong>Bagikan / Share</strong> di Safari).</li>
              <li>Pilih menu <strong>Tambahkan ke Layar Utama</strong> (<em>Add to Home Screen</em>).</li>
              <li>Klik <strong>Tambah / Install</strong> untuk konfirmasi.</li>
            </ol>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 px-4 rounded-xl bg-amber-500 text-stone-900 font-semibold text-xs hover:bg-amber-600 transition-colors"
            >
              Mengerti, Terima Kasih
            </button>
          </div>
        </div>
      )}
    </>
  );
};
