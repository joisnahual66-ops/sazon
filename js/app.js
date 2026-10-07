// Milestone 01: register the service worker (offline support) and report its status on screen.

const statusLine = document.getElementById('offline-status');

function showStatus(text) {
  if (statusLine) {
    statusLine.textContent = text;
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then(() => showStatus('Offline ready ✓'))
      .catch((error) => {
        console.error('Service worker registration failed:', error);
        showStatus('Offline support unavailable');
      });
  });
} else {
  showStatus('Offline support not supported in this browser');
}
