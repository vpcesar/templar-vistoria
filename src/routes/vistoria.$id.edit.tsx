import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildRoomFromName, getInspection, getResponsibles, saveInspection } from "@/lib/storage";
import type { Inspection, PropertyType, Responsible, RoomState } from "@/lib/types";
import { SortableRoomList, type SortableRoom } from "@/components/SortableRoomList";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vistoria/$id/edit")({
  head: () => ({
    meta: [
      { title: "Editar Cabeçalho — TEMPLAR ENGENHARIA" },
      { name: "description", content: "Edite os dados do cabeçalho e os ambientes da vistoria." },
      { property: "og:title", content: "Editar Cabeçalho — TEMPLAR ENGENHARIA" },
      { property: "og:description", content: "Edite dados do cabeçalho e ambientes da vistoria." },
    ],
  }),
  component: EditHeaderPage,
});

function EditHeaderPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [insp, setInsp] = useState<Inspection | null>(null);
  const [resps, setResps] = useState<Responsible[]>([]);
  const [client, setClient] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [unit, setUnit] = useState("");
  const [respId, setRespId] = useState("");
  const [constructor, setConstructor] = useState("");
  const [type, setType] = useState<PropertyType>("NOVO");
  const [rooms, setRooms] = useState<SortableRoom[]>([]);

  useEffect(() => {
    const i = getInspection(id);
    if (!i) { navigate({ to: "/" }); return; }
    setInsp(i);
    setClient(i.client); setDate(i.date); setLocation(i.location);
    setUnit(i.unit); setRespId(i.responsibleId); setConstructor(i.constructorResponsible);
    setType(i.propertyType);
    setRooms(i.rooms.map((r) => ({ id: r.id, name: r.name })));
    setResps(getResponsibles());
  }, [id, navigate]);

  const save = () => {
    if (!insp) return;
    if (!client.trim() || !date || !respId) { toast.error("Cliente, data e responsável são obrigatórios."); return; }
    if (rooms.length === 0) { toast.error("Adicione pelo menos um ambiente."); return; }
    const resp = resps.find((r) => r.id === respId);
    if (!resp) { toast.error("Responsável inválido."); return; }

    // Reconcile rooms: keep existing state by id, build fresh for new ones
    const existing = new Map(insp.rooms.map((r) => [r.id, r] as const));
    const nextRooms: RoomState[] = rooms.map((r) => {
      const prev = existing.get(r.id);
      if (prev) return { ...prev, name: r.name };
      return buildRoomFromName(r.name);
    });

    try {
      saveInspection({
        ...insp,
        client: client.trim(),
        date,
        location: location.trim(),
        unit: unit.trim(),
        responsibleId: resp.id,
        responsibleName: resp.name,
        responsibleCrea: resp.crea,
        constructorResponsible: constructor.trim(),
        propertyType: type,
        rooms: nextRooms,
      });
      toast.success("Cabeçalho atualizado");
      navigate({ to: "/vistoria/$id/checklist", params: { id } });
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao salvar");
    }
  };

  if (!insp) return <div className="p-6 text-center text-muted-foreground">Carregando…</div>;

  return (
    <div className="min-h-screen bg-secondary/40">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold mb-2">Editar Cabeçalho</h1>
        {insp.completed && (
          <p className="text-xs text-warning-foreground mb-4">Esta vistoria está concluída. Após editar, gere o relatório novamente para atualizá-lo.</p>
        )}

        <section className="rounded-lg bg-card border border-border p-5 mb-6">
          <h2 className="font-semibold text-lg mb-4">Cabeçalho</h2>
          <div className="grid gap-4">
            <div><Label>Cliente *</Label><Input value={client} onChange={(e) => setClient(e.target.value)} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Data *</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div>
                <Label>Tipo de imóvel</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as PropertyType)}>
                  <option value="NOVO">NOVO</option><option value="USADO">USADO</option><option value="REFORMADO">REFORMADO</option>
                </select>
              </div>
            </div>
            <div><Label>Localização / Endereço</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
            <div><Label>Unidade / Apartamento</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
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
            <div><Label>Responsável da construtora</Label><Input value={constructor} onChange={(e) => setConstructor(e.target.value)} /></div>
          </div>
        </section>

        <section className="rounded-lg bg-card border border-border p-5 mb-6">
          <h2 className="font-semibold text-lg mb-2">Ambientes</h2>
          <p className="text-xs text-muted-foreground mb-4">Arraste pelo ícone <span className="font-mono">≡</span> para reordenar. Novos ambientes serão adicionados vazios; ambientes removidos perdem os dados preenchidos.</p>
          <SortableRoomList items={rooms} onChange={setRooms} />
        </section>

        <Button size="lg" className="w-full h-14 text-base font-semibold" onClick={save}>
          <Save className="h-5 w-5" /> SALVAR ALTERAÇÕES
        </Button>
      </main>
    </div>
  );
}
