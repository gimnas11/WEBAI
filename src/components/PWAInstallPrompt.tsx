import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show prompt after 2 seconds if not dismissed
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      } else {
        const dismissedTime = parseInt(dismissed, 10);
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - dismissedTime >= sevenDays) {
          setShowPrompt(true);
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Use native install prompt if available
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Install prompt error:', error);
        // Fallback to manual instructions
        setShowManualInstructions(true);
      }
    } else {
      // Show manual instructions if no native prompt available
      setShowManualInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowManualInstructions(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const getManualInstructions = () => {
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);

    if (isIOS) {
      return {
        title: 'Cara Install di iPhone/iPad',
        steps: [
          '1. Tap tombol Share (kotak dengan panah) di bagian bawah',
          '2. Scroll ke bawah dan pilih "Add to Home Screen"',
          '3. Tap "Add" di pojok kanan atas',
          '4. Aplikasi akan muncul di home screen Anda'
        ]
      };
    } else if (isAndroid) {
      return {
        title: 'Cara Install di Android',
        steps: [
          '1. Tap menu (⋮) di pojok kanan atas browser',
          '2. Pilih "Install app" atau "Add to Home screen"',
          '3. Tap "Install" pada popup yang muncul',
          '4. Aplikasi akan terinstall dan muncul di home screen'
        ]
      };
    } else {
      return {
        title: 'Cara Install PWA',
        steps: [
          '1. Lihat address bar browser Anda',
          '2. Klik ikon install (+) atau "Add to Home screen"',
          '3. Konfirmasi instalasi',
          '4. Aplikasi akan terinstall'
        ]
      };
    }
  };

  if (isInstalled) {
    return null;
  }

  if (!showPrompt && !showManualInstructions) {
    return null;
  }

  const instructions = getManualInstructions();

  return (
    <>
      {showManualInstructions ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-chat-dark border border-chat-border rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 0 002-2V5a2 0 00-2-2H8a2 0 00-2 2v14a2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">{instructions.title}</h3>
            </div>
            <div className="space-y-2 mb-6">
              {instructions.steps.map((step, index) => (
                <p key={index} className="text-sm text-gray-300">{step}</p>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => setShowManualInstructions(false)}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-chat-darker border border-chat-border rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 0 002-2V5a2 0 00-2-2H8a2 0 00-2 2v14a2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Install G Chat</p>
                <p className="text-xs text-gray-400">Install untuk akses lebih cepat dan pengalaman yang lebih baik</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Nanti
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                {deferredPrompt ? 'Install Sekarang' : 'Lihat Cara Install'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
