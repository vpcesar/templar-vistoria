// Google Drive (GIS token client) — 100% client-side, opcional.

export const DRIVE_FOLDER_ID = "10t6nAb8nulN9VPFeow2Au_VH3YgQA6Hv";
export const DRIVE_FOLDER_NAME = "Vistoria de recebimento";
export const DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;
const SCOPE = "https://www.googleapis.com/auth/drive.file";

const K_CLIENT_ID = "templar_gdrive_client_id";
const K_TOKEN = "templar_gdrive_token";

interface StoredToken {
  accessToken: string;
  expiresAt: number;
}

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(K_CLIENT_ID) ?? "";
}
export function setClientId(id: string): void {
  if (id.trim()) localStorage.setItem(K_CLIENT_ID, id.trim());
  else localStorage.removeItem(K_CLIENT_ID);
}

function readToken(): StoredToken | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(K_TOKEN);
    return raw ? (JSON.parse(raw) as StoredToken) : null;
  } catch {
    return null;
  }
}
function writeToken(t: StoredToken | null) {
  if (t) localStorage.setItem(K_TOKEN, JSON.stringify(t));
  else localStorage.removeItem(K_TOKEN);
}

export function isDriveConnected(): boolean {
  return !!readToken();
}
export function disconnectDrive(): void {
  writeToken(null);
}

declare global {
  interface Window {
    google?: any;
  }
}

function loadGis(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar o Google Identity Services.")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Falha ao carregar o Google Identity Services."));
    document.head.appendChild(s);
  });
}

function requestToken(prompt: "" | "consent"): Promise<string> {
  const clientId = getClientId();
  if (!clientId) throw new Error("Configure o Google Client ID nas Configurações.");
  return loadGis().then(
    () =>
      new Promise<string>((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPE,
          prompt,
          callback: (resp: any) => {
            if (resp?.error || !resp?.access_token) {
              reject(new Error("Autorização do Google cancelada ou negada."));
              return;
            }
            const token: StoredToken = {
              accessToken: resp.access_token,
              expiresAt: Date.now() + (Number(resp.expires_in ?? 3600) - 60) * 1000,
            };
            writeToken(token);
            resolve(token.accessToken);
          },
          error_callback: () => reject(new Error("Autorização do Google cancelada ou negada.")),
        });
        client.requestAccessToken();
      }),
  );
}

/** Fluxo de conexão inicial (com consentimento). */
export async function connectDrive(): Promise<void> {
  await requestToken("consent");
}

/** Retorna um token válido, renovando silenciosamente quando expirado. */
async function getAccessToken(): Promise<string> {
  const t = readToken();
  if (t && t.expiresAt > Date.now()) return t.accessToken;
  return requestToken("");
}

export interface UploadResult {
  id: string;
  name: string;
  webViewLink?: string;
}

export async function uploadToDrive(blob: Blob, filename: string): Promise<UploadResult> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new Error("Sem conexão. O relatório foi baixado localmente. Tente enviar para o Google Drive quando houver internet.");
  }

  const doUpload = async (token: string) => {
    const metadata = { name: filename, parents: [DRIVE_FOLDER_ID] };
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", blob, filename);
    return fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  };

  let token = await getAccessToken();
  let res = await doUpload(token);

  if (res.status === 401) {
    writeToken(null);
    token = await requestToken("");
    res = await doUpload(token);
  }

  if (res.status === 403 || res.status === 404) {
    throw new Error("Não foi possível acessar a pasta no Google Drive. Verifique se a pasta existe e se você tem permissão.");
  }
  if (!res.ok) {
    throw new Error("Falha ao enviar para o Google Drive. O relatório foi baixado localmente. Tente novamente mais tarde.");
  }
  return (await res.json()) as UploadResult;
}
