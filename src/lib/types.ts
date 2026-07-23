export type PropertyType = "NOVO" | "USADO" | "REFORMADO";
export type ItemStatus = "APROVADO" | "REPROVADO" | "NAO_APLICA" | null;

export interface Responsible {
  id: string;
  name: string;
  crea: string;
}

export interface CompanyInfo {
  name: string;
  site: string;
  whatsapp: string;
  email: string;
}

export interface ChecklistItemTemplate {
  id: string;
  title: string;
  orientacoes?: string[];
  teste?: string;
  atencao?: string;
}

export interface RoomTemplate {
  id: string;
  name: string;
  items: ChecklistItemTemplate[];
}

export interface ChecklistItemState {
  templateId: string;
  title: string;
  exists: boolean | null; // null = not answered, true = SIM, false = NAO
  status: ItemStatus; // only when exists === true
  observations: string;
  aiObservations?: string;
  finalObservations?: string; // accepted text
  photos: string[]; // base64 data URLs
}

export interface RoomState {
  id: string;
  name: string;
  templateKey: string; // key of template used
  items: ChecklistItemState[];
}

export interface Inspection {
  id: string;
  createdAt: string;
  updatedAt: string;
  client: string;
  date: string;
  location: string;
  unit: string;
  responsibleId: string;
  responsibleName: string;
  responsibleCrea: string;
  constructorResponsible: string;
  propertyType: PropertyType;
  rooms: RoomState[];
  completed: boolean;
}
