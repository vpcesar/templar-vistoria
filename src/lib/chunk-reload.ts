// After a new deploy, the browser may still hold a cached HTML/route map that
// points at asset filenames that no longer exist, so the lazy route chunk 404s
// with "Failed to fetch dynamically imported module" and the screen goes blank.
// Recover by force-reloading once (guarded so we never loop).

const KEY = "__chunk_reloaded_at";
const COOLDOWN_MS = 30_000;

export function isChunkLoadError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message)
  );
}

export function reloadOnceForChunkError(): boolean {
  if (typeof window === "undefined") return false;
  let last = 0;
  try {
    last = Number(sessionStorage.getItem(KEY) ?? 0);
  } catch {
    /* storage unavailable */
  }
  if (Date.now() - last < COOLDOWN_MS) return false;
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* storage unavailable */
  }
  window.location.reload();
  return true;
}

export function installChunkReloadHandler() {
  if (typeof window === "undefined") return;
  const handle = (error: unknown) => {
    if (isChunkLoadError(error)) reloadOnceForChunkError();
  };
  window.addEventListener("error", (e) => handle(e.error ?? e.message));
  window.addEventListener("unhandledrejection", (e) => handle(e.reason));
}
