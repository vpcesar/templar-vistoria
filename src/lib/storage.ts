import type { CompanyInfo, Inspection, Responsible, RoomState } from "./types";
import { detectTemplate } from "./checklist-templates";

const K_INSPECTIONS = "templar_inspections_v1";
const K_RESPONSIBLES = "templar_responsibles_v1";
const K_COMPANY = "templar_company_v1";

const DEFAULT_COMPANY: CompanyInfo = {
  name: "TEMPLAR ENGENHARIA",
  site: "www.templarengenharia.com.br",
  whatsapp: "(21) 98180-8812",
  email: "templarengenharia@hotmail.com",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getCompany(): CompanyInfo {
  return read(K_COMPANY, DEFAULT_COMPANY);
}
export function saveCompany(c: CompanyInfo): void {
  write(K_COMPANY, c);
}

export function getResponsibles(): Responsible[] {
  return read<Responsible[]>(K_RESPONSIBLES, []);
}
export function saveResponsibles(list: Responsible[]): void {
  write(K_RESPONSIBLES, list);
}

export function getInspections(): Inspection[] {
  const list = read<Inspection[]>(K_INSPECTIONS, []);
  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export function getInspection(id: string): Inspection | undefined {
  return getInspections().find((x) => x.id === id);
}
export function saveInspection(insp: Inspection): void {
  const list = read<Inspection[]>(K_INSPECTIONS, []);
  const idx = list.findIndex((x) => x.id === insp.id);
  insp.updatedAt = new Date().toISOString();
  if (idx >= 0) list[idx] = insp;
  else list.push(insp);
  write(K_INSPECTIONS, list);
}
export function deleteInspection(id: string): void {
  const list = read<Inspection[]>(K_INSPECTIONS, []).filter((x) => x.id !== id);
  write(K_INSPECTIONS, list);
}

export function buildRoomsFromNames(names: string[]): RoomState[] {
  return names.map((name, idx) => {
    const tpl = detectTemplate(name);
    return {
      id: `${Date.now()}_${idx}`,
      name,
      templateKey: tpl.id,
      items: tpl.items.map((t) => ({
        templateId: t.id,
        title: t.title,
        exists: null,
        status: null,
        observations: "",
        photos: [],
      })),
    };
  });
}

export function newId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
