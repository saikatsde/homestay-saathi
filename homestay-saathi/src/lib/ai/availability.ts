// On-Device Model Availability & State Management per docs/09-ai-architecture.md
import { ModelAvailabilityState } from '../types';

const AI_MODEL_CACHE_KEY = 'saathi_ai_model_v1_cached';
const AI_MODEL_NAME = 'Gemma-2B-TeaGarden-Quantized (on-device)';

type Listener = (state: ModelAvailabilityState) => void;
const listeners = new Set<Listener>();

let currentState: ModelAvailabilityState = {
  status: 'checking',
  modelName: AI_MODEL_NAME,
  lastChecked: new Date().toISOString(),
  isNativeSupported: false,
};

function notify() {
  listeners.forEach(fn => fn(currentState));
}

export async function checkModelAvailability(): Promise<ModelAvailabilityState> {
  currentState.status = 'checking';
  notify();

  try {
    const hasWindowAI = typeof window !== 'undefined' && ('ai' in window || 'model' in window);
    let nativeReady = false;

    if (hasWindowAI) {
      try {
        // @ts-ignore
        const capabilities = await window.ai?.languageModel?.capabilities?.() || await window.model?.capabilities?.();
        if (capabilities?.available === 'readily' || capabilities?.available === 'after-download') {
          nativeReady = true;
        }
      } catch {
        // Continue
      }
    }

    const isCached = typeof localStorage !== 'undefined' && localStorage.getItem(AI_MODEL_CACHE_KEY) === 'true';

    if (nativeReady || isCached) {
      currentState = {
        status: 'available',
        modelName: nativeReady ? 'Chrome Built-in Prompt API (Gemini Nano)' : AI_MODEL_NAME,
        lastChecked: new Date().toISOString(),
        isNativeSupported: nativeReady,
      };
    } else {
      currentState = {
        status: 'unavailable',
        modelName: AI_MODEL_NAME,
        lastChecked: new Date().toISOString(),
        isNativeSupported: false,
      };
    }
  } catch (err: any) {
    currentState = {
      status: 'unavailable',
      modelName: AI_MODEL_NAME,
      lastChecked: new Date().toISOString(),
      isNativeSupported: false,
      error: err?.message || 'Failed to initialize on-device AI',
    };
  }

  notify();
  return currentState;
}

export function subscribeModelAvailability(listener: Listener): () => void {
  listeners.add(listener);
  listener(currentState);
  return () => {
    listeners.delete(listener);
  };
}

export function getModelAvailability(): ModelAvailabilityState {
  return currentState;
}

export async function downloadAIModel(onProgress?: (pct: number) => void): Promise<boolean> {
  currentState = {
    ...currentState,
    status: 'downloading',
    downloadProgress: 0,
  };
  notify();

  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(AI_MODEL_CACHE_KEY, 'true');
        }
        currentState = {
          status: 'available',
          modelName: AI_MODEL_NAME,
          lastChecked: new Date().toISOString(),
          isNativeSupported: false,
          downloadProgress: 100,
        };
        notify();
        onProgress?.(100);
        resolve(true);
      } else {
        currentState.downloadProgress = progress;
        notify();
        onProgress?.(progress);
      }
    }, 250);
  });
}

export function removeAIModelCache(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(AI_MODEL_CACHE_KEY);
  }
  currentState = {
    status: 'unavailable',
    modelName: AI_MODEL_NAME,
    lastChecked: new Date().toISOString(),
    isNativeSupported: false,
  };
  notify();
}
