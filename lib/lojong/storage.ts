import { emptyProgress, parseProgress, type Progress } from "./engine";

export const STORAGE_KEY = "thusness:lojong:progress:v1";

export function createProgressStore() {
  let snapshot: Progress | null = null;
  let loaded = false;
  let message = "";
  const listeners = new Set<() => void>();
  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? parseProgress(JSON.parse(raw)) : null;
      snapshot = parsed ?? emptyProgress();
      if (raw && !parsed) message = "Saved progress could not be read. Starting a new session will replace the unreadable copy.";
    } catch {
      snapshot = emptyProgress();
      message = "Browser storage is unavailable. You can still study; export progress before leaving to keep this session.";
    }
  }
  return {
    getSnapshot() { load(); return snapshot; },
    getServerSnapshot() { return null; },
    getMessage() { return message; },
    subscribe(listener: () => void) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return;
        loaded = false;
        load();
        listeners.forEach(fn => fn());
      };
      window.addEventListener("storage", onStorage);
      return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
    },
    update(next: Progress) {
      snapshot = next;
      loaded = true;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        message = "";
      } catch {
        message = "This session is only in memory. Export progress before leaving to keep it.";
      }
      listeners.forEach(fn => fn());
    },
  };
}
