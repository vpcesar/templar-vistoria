// Google Drive via conector nativo do Lovable (server functions).
// Aqui ficam apenas a seleção de pasta (localStorage) e helpers de nome de arquivo.

export const DEFAULT_FOLDER_ID = "10t6nAb8nulN9VPFeow2Au_VH3YgQA6Hv";
export const DEFAULT_FOLDER_NAME = "Vistoria de recebimento";

const K_FOLDER = "templar_gdrive_folder";

export interface DriveFolder {
  id: string;
  name: string;
}

export function getSelectedFolder(): DriveFolder {
  if (typeof window === "undefined") return { id: DEFAULT_FOLDER_ID, name: DEFAULT_FOLDER_NAME };
  try {
    const raw = localStorage.getItem(K_FOLDER);
    if (raw) {
      const f = JSON.parse(raw) as DriveFolder;
      if (f?.id && f?.name) return f;
    }
  } catch {
    /* ignore */
  }
  return { id: DEFAULT_FOLDER_ID, name: DEFAULT_FOLDER_NAME };
}

export function setSelectedFolder(folder: DriveFolder): void {
  localStorage.setItem(K_FOLDER, JSON.stringify(folder));
}

export function folderUrl(id: string): string {
  return `https://drive.google.com/drive/folders/${id}`;
}

/** VISTORIA_[Cliente]_[DD-MM-AAAA].[ext] */
export function reportFilename(client: string, isoDate: string, ext: string): string {
  const [yyyy, mm, dd] = (isoDate ?? "").split("-");
  const dateBr = yyyy ? `${dd}-${mm}-${yyyy}` : (isoDate ?? "");
  const safeClient = (client || "cliente").replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  return `VISTORIA_${safeClient}_${dateBr}.${ext}`;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo gerado."));
    reader.readAsDataURL(blob);
  });
}
