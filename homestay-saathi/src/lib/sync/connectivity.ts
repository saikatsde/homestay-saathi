// Connectivity Detector with Debounced Reachability per docs/02-pwa-architecture.md

export type ConnectivityStatus = 'online' | 'offline';

type ConnectivityListener = (status: ConnectivityStatus) => void;
const listeners = new Set<ConnectivityListener>();

let currentStatus: ConnectivityStatus = typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
let debounceTimeout: any = null;

function setStatus(newStatus: ConnectivityStatus) {
  if (currentStatus !== newStatus) {
    currentStatus = newStatus;
    listeners.forEach(fn => fn(currentStatus));
  }
}

async function probeNetwork(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('/manifest.json?probe=' + Date.now(), {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    return res.ok || res.status === 304;
  } catch {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
}

export function initConnectivityDetector(): () => void {
  const handleOnline = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
      const reachable = await probeNetwork();
      setStatus(reachable ? 'online' : 'offline');
    }, 400);
  };

  const handleOffline = () => {
    clearTimeout(debounceTimeout);
    setStatus('offline');
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(async () => {
      if (navigator.onLine) {
        const reachable = await probeNetwork();
        setStatus(reachable ? 'online' : 'offline');
      } else {
        setStatus('offline');
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }

  return () => {};
}

export function subscribeConnectivity(listener: ConnectivityListener): () => void {
  listeners.add(listener);
  listener(currentStatus);
  return () => {
    listeners.delete(listener);
  };
}

export function getConnectivityStatus(): ConnectivityStatus {
  return currentStatus;
}

export function setSimulatedConnectivity(status: ConnectivityStatus): void {
  setStatus(status);
}
