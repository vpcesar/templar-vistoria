import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildRoomsFromNames, getResponsibles, newId, saveInspection } from "@/lib/storage";
import { DEFAULT_ROOMS } from "@/lib/checklist-templates";
import type { PropertyType, Responsible } from "@/lib/types";
import { ArrowLeft, Plus, Trash2, Play } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vistoria/new")({
  head: () => ({
    meta: [
      { title: "Nova Vistoria — TEMPLAR ENGENHARIA" },
      { name: "description", content: "Preencha os dados do cabeçalho e ambientes para iniciar uma nova vistoria de imóvel." },
      { property: "og:title", content: "Nova Vistoria — TEMPLAR ENGENHARIA" },
      { property: "og:description", content: "Preencha os dados do cabeçalho e ambientes para iniciar uma vistoria." },
    ],
  }),
  component: NewInspection,
});

function NewInspection() {
  const navigate = useNavigate();
  const [resps, setResps] = useState<Responsible[]>([]);
  const [client, setClient] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [unit, setUnit] = useState("");
  const [respId, setRespId] = useState("");
  const [constructor, setConstructor] = useState("");
  const [type, setType] = useState<PropertyType>("NOVO");
  const [rooms, setRooms] = useState<string[]>(DEFAULT_ROOMS);
  const [newRoom, setNewRoom] = useState("");

  useEffect(() => {
    const r = getResponsibles();
    setResps(r);
    if (r.length > 0) setRespId(r[0].id);
  }, []);

  const addRoom = () => {
    if (!newRoom.trim()) return;
    setRooms([...rooms, newRoom.trim()]);
    setNewRoom("");
  };

  const removeRoom = (idx: number) => setRooms(rooms.filter((_, i) => i !== idx));

  const rename = (idx: number, val: string) => {
    setRooms(rooms.map((r, i) => (i === idx ? val : r)));
  };

  const start = () => {
    if (!client.trim() || !date || !respId) {
      toast.error("Cliente, data e responsável são obrigatórios.");
      return;
    }
    if (rooms.length === 0) {
      toast.error("Adicione pelo menos um ambiente.");
      return;
    }
    const resp = resps.find((r) => r.id === respId)!;
    const id = newId();
    const now = new Date().toISOString();
    saveInspection({
      id,
      createdAt: now,
      updatedAt: now,
      client: client.trim(),
      date,
      location: location.trim(),
      unit: unit.trim(),
      responsibleId: resp.id,
      responsibleName: resp.name,
      responsibleCrea: resp.crea,
      constructorResponsible: constructor.trim(),
      propertyType: type,
      rooms: buildRoomsFromNames(rooms),
      completed: false,
    });
    navigate({ to: "/vistoria/$id/checklist", params: { id } });
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold mb-6">Nova Vistoria</h1>

        <section className="rounded-lg bg-card border border-border p-5 mb-6">
          <h2 className="font-semibold text-lg mb-4">Cabeçalho</h2>
          <div className="grid gap-4">
            <div>
              <Label>Cliente *</Label>
              <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Data *</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label>Tipo de imóvel</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value as PropertyType)}
                >
                  <option value="NOVO">NOVO</option>
                  <option value="USADO">USADO</option>
                  <option value="REFORMADO">REFORMADO</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Localização / Endereço</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Rua, número, bairro, cidade" />
            </div>
            <div>
              <Label>Unidade / Apartamento</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Ex: 302 Bloco B" />
            </div>
            <div>
              <Label>Responsável da vistoria *</Label>
              {resps.length === 0 ? (
                <p className="text-sm text-warning-foreground">Cadastre um responsável em Configurações.</p>
              ) : (
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={respId}
                  onChange={(e) => setRespId(e.target.value)}
                >
                  {resps.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} — CREA {r.crea}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <Label>Responsável da construtora</Label>
              <Input value={constructor} onChange={(e) => setConstructor(e.target.value)} placeholder="Nome de quem recebe a vistoria" />
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-card border border-border p-5 mb-6">
          <h2 className="font-semibold text-lg mb-2">Ambientes da vistoria</h2>
          <p className="text-xs text-muted-foreground mb-4">A lista abaixo será usada como base do checklist. Pode editar, remover ou adicionar.</p>
          <div className="space-y-2 mb-4">
            {rooms.map((r, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input value={r} onChange={(e) => rename(idx, e.target.value)} />
                <Button variant="ghost" size="sm" onClick={() => removeRoom(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="Ex: Suíte, Corredor, Lavabo…" onKeyDown={(e) => e.key === "Enter" && addRoom()} />
            <Button variant="outline" onClick={addRoom}><Plus className="h-4 w-4" /> Adicionar</Button>
          </div>
        </section>

        <Button size="lg" className="w-full h-14 text-base font-semibold" onClick={start}>
          <Play className="h-5 w-5" /> INICIAR CHECKLIST
        </Button>
      </main>
    </div>
  );
}
