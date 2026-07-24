import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildRoomsFromNames, getResponsibles, newId, saveInspection } from "@/lib/storage";
import { DEFAULT_ROOMS } from "@/lib/checklist-templates";
import type { PropertyType, Responsible } from "@/lib/types";
import { SortableRoomList, type SortableRoom } from "@/components/SortableRoomList";
import { ArrowLeft, Play } from "lucide-react";
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
  const [type, setType] = useState<PropertyType>("APARTAMENTO");
  const [rooms, setRooms] = useState<SortableRoom[]>(
    DEFAULT_ROOMS.map((n, i) => ({ id: `room_init_${i}`, name: n })),
  );

  useEffect(() => {
    const r = getResponsibles();
    setResps(r);
    if (r.length > 0) setRespId(r[0].id);
  }, []);

  const start = () => {
    if (!client.trim() || !date || !respId) { toast.error("Cliente, data e responsável são obrigatórios."); return; }
    if (rooms.length === 0) { toast.error("Adicione pelo menos um ambiente."); return; }
    const resp = resps.find((r) => r.id === respId)!;
    const id = newId();
    const now = new Date().toISOString();
    try {
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
        rooms: buildRoomsFromNames(rooms.map((r) => r.name)),
        completed: false,
      });
      navigate({ to: "/vistoria/$id/checklist", params: { id } });
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao salvar");
    }
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
            <div><Label>Cliente *</Label><Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Nome do cliente" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Data *</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div>
                <Label>Tipo de imóvel</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as PropertyType)}>
                  <option value="APARTAMENTO">APARTAMENTO</option><option value="CASA">CASA</option><option value="GALPÃO">GALPÃO</option><option value="LOJA">LOJA</option><option value="ESCRITÓRIO">ESCRITÓRIO</option>
                </select>
              </div>
            </div>
            <div><Label>Localização / Endereço</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Rua, número, bairro, cidade" /></div>
            <div><Label>Unidade / Apartamento</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Ex: 302 Bloco B" /></div>
            <div>
              <Label>Responsável da vistoria *</Label>
              {resps.length === 0 ? (
                <p className="text-sm text-warning-foreground">Cadastre um responsável em Configurações.</p>
              ) : (
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={respId} onChange={(e) => setRespId(e.target.value)}>
                  {resps.map((r) => (<option key={r.id} value={r.id}>{r.name} — CREA {r.crea}</option>))}
                </select>
              )}
            </div>
            <div><Label>Responsável da construtora</Label><Input value={constructor} onChange={(e) => setConstructor(e.target.value)} placeholder="Nome de quem recebe a vistoria" /></div>
          </div>
        </section>

        <section className="rounded-lg bg-card border border-border p-5 mb-6">
          <h2 className="font-semibold text-lg mb-2">Ambientes da vistoria</h2>
          <p className="text-xs text-muted-foreground mb-4">Arraste pelo ícone <span className="font-mono">≡</span> para reordenar. Essa também é a ordem do relatório.</p>
          <SortableRoomList items={rooms} onChange={setRooms} />
        </section>

        <Button size="lg" className="w-full h-14 text-base font-semibold" onClick={start}>
          <Play className="h-5 w-5" /> INICIAR CHECKLIST
        </Button>
      </main>
    </div>
  );
}
