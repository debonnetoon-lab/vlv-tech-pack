"use client";

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('VLV: ServiceWorker registered');

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update available!
                console.log('VLV: New version available. Please refresh.');
                window.dispatchEvent(new CustomEvent('vlv-update-available'));
              }
            });
          }
        });
      }).catch(err => console.error('VLV: SW registration failed', err));
    });
  }
}
