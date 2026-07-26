export type PropertyType = "APARTAMENTO" | "CASA" | "GALPÃO" | "LOJA" | "ESCRITÓRIO";
export type ItemStatus = "APROVADO" | "REPROVADO" | "NAO_APLICA" | null;

export interface Responsible {
  id: string;
  name: string;
  crea: string;
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
  exists: boolean | null;
  status: ItemStatus;
  observations: string;
  aiObservations?: string;
  finalObservations?: string;
  photos: string[];
}

export interface RoomState {
  id: string;
  name: string;
  templateKey: string;
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
