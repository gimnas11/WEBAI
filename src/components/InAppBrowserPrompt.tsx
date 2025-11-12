import { useState, useEffect } from 'react';

export function InAppBrowserPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed
    const dismissed = localStorage.getItem('in-app-browser-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < oneDay) {
        setIsDismissed(true);
        return;
      }
    }

    // Detect in-app browser
    const isInAppBrowser = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Already installed as PWA
      if (standalone) {
        return false;
      }

      // Check for in-app browser indicators
      const inAppIndicators = [
        'instagram', // Instagram in-app browser
        'fban', // Facebook in-app browser
        'fbav', // Facebook in-app browser
        'line', // LINE in-app browser
        'wv', // WebView (but exclude Chrome WebView which is normal)
        'whatsapp', // WhatsApp in-app browser
        'twitter', // Twitter in-app browser
        'linkedinapp', // LinkedIn in-app browser
        'snapchat', // Snapchat in-app browser
        'messenger', // Messenger in-app browser
      ];

      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      
      if (isMobile) {
        // Check for in-app browser user agents
        for (const indicator of inAppIndicators) {
          if (ua.includes(indicator)) {
            return true;
          }
        }
        
        // Check for Instagram WebView (Instagram uses custom WebView)
        // Instagram's in-app browser often has specific patterns
        if (ua.includes('instagram')) {
          // Instagram in-app browser detected
          return true;
        }
        
        // Check for Android WebView that's not Chrome
        if (ua.includes('android') && ua.includes('version') && !ua.includes('chrome')) {
          const hasServiceWorker = 'serviceWorker' in navigator;
          if (!hasServiceWorker) {
            return true;
          }
        }
      }

      return false;
    };

    // Check immediately if in-app browser
    if (isInAppBrowser()) {
      setShowPrompt(true);
      return;
    }

    // Also check after a delay in case detection needs time
    const timer = setTimeout(() => {
      if (isInAppBrowser()) {
        setShowPrompt(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('in-app-browser-dismissed', Date.now().toString());
  };

  const getBrowserInstructions = () => {
    const ua = window.navigator.userAgent.toLowerCase();
    
    if (ua.includes('iphone') || ua.includes('ipad')) {
      return {
        title: 'Buka di Safari',
        steps: [
          '1. Tap tombol menu (⋯) di pojok kanan atas',
          '2. Pilih "Buka di Safari"',
          '3. Install PWA dari menu Share di Safari'
        ]
      };
    } else if (ua.includes('android')) {
      return {
        title: 'Buka di Chrome',
        steps: [
          '1. Tap tombol menu (⋮) di pojok kanan atas',
          '2. Pilih "Buka di Browser" atau "Open in Chrome"',
          '3. Install PWA dari menu Chrome'
        ]
      };
    } else {
      return {
        title: 'Buka di Browser',
        steps: [
          '1. Buka link ini di browser default Anda (Chrome, Safari, dll)',
          '2. Install PWA dari browser untuk pengalaman terbaik'
        ]
      };
    }
  };

  const instructions = getBrowserInstructions();

  if (!showPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-600 border-b border-yellow-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-yellow-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-1">
              {instructions.title} untuk Install PWA
            </h3>
            <div className="text-xs text-yellow-100 space-y-0.5 mb-2">
              {instructions.steps.map((step, index) => (
                <p key={index}>{step}</p>
              ))}
            </div>
            <p className="text-xs text-yellow-200 mt-2">
              💡 PWA tidak dapat diinstall dari in-app browser. Buka di browser default untuk fitur lengkap.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-yellow-100 hover:text-white transition-colors p-1"
            aria-label="Tutup"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

