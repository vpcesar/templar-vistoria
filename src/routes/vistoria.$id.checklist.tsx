import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getInspection, saveInspection } from "@/lib/storage";
import { ROOM_TEMPLATES } from "@/lib/checklist-templates";
import { compressImage } from "@/lib/image-utils";
import type { ChecklistItemState, Inspection, ItemStatus } from "@/lib/types";
import { AlertTriangle, ArrowLeft, ArrowRight, Camera, Check, CheckCircle2, ClipboardCheck, Info, Lightbulb, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vistoria/$id/checklist")({
  head: () => ({
    meta: [
      { title: "Checklist da Vistoria — TEMPLAR ENGENHARIA" },
      { name: "description", content: "Preencha o checklist da vistoria, ambiente por ambiente, com fotos e observações." },
      { property: "og:title", content: "Checklist da Vistoria — TEMPLAR ENGENHARIA" },
      { property: "og:description", content: "Preencha o checklist ambiente por ambiente com fotos e observações." },
    ],
  }),
  component: ChecklistPage,
});

function findTemplate(key: string) {
  return Object.values(ROOM_TEMPLATES).find((t) => t.id === key) ?? ROOM_TEMPLATES.SALA;
}

function ChecklistPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [insp, setInsp] = useState<Inspection | null>(null);
  const [roomIdx, setRoomIdx] = useState(0);

  useEffect(() => {
    const i = getInspection(id);
    if (!i) {
      toast.error("Vistoria não encontrada");
      navigate({ to: "/" });
      return;
    }
    setInsp(i);
  }, [id, navigate]);

  const progress = useMemo(() => {
    if (!insp) return 0;
    let total = 0, done = 0;
    for (const r of insp.rooms) for (const it of r.items) {
      total++;
      if (it.exists === false || (it.exists === true && it.status !== null)) done++;
    }
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }, [insp]);

  if (!insp) return <div className="p-6 text-center text-muted-foreground">Carregando…</div>;

  const room = insp.rooms[roomIdx];
  const template = findTemplate(room.templateKey);

  const updateItem = (itemIdx: number, patch: Partial<ChecklistItemState>) => {
    const next: Inspection = {
      ...insp,
      rooms: insp.rooms.map((r, ri) =>
        ri !== roomIdx ? r : {
          ...r,
          items: r.items.map((it, ii) => (ii === itemIdx ? { ...it, ...patch } : it)),
        },
      ),
    };
    setInsp(next);
    try {
      saveInspection(next);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao salvar");
    }
  };

  const goPrev = () => setRoomIdx(Math.max(0, roomIdx - 1));
  const goNext = () => {
    if (roomIdx < insp.rooms.length - 1) setRoomIdx(roomIdx + 1);
    else finalize();
  };

  const finalize = () => {
    // Validate: no reproved without photo
    for (const r of insp.rooms) {
      for (const it of r.items) {
        if (it.exists === true && it.status === "REPROVADO" && it.photos.length === 0) {
          toast.error(`"${it.title}" em ${r.name} está REPROVADO sem foto.`);
          const rIdx = insp.rooms.findIndex((rr) => rr.id === r.id);
          setRoomIdx(rIdx);
          return;
        }
      }
    }
    navigate({ to: "/vistoria/$id/review", params: { id } });
  };

  return (
    <div className="min-h-screen bg-secondary/40 pb-24">
      <AppHeader />

      {/* Progress */}
      <div className="sticky top-[65px] z-30 bg-white border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-foreground truncate">{insp.client}</span>
            <span className="text-muted-foreground shrink-0 ml-2">{progress}% concluído</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          {/* Room tabs */}
          <div className="mt-2 -mx-4 px-4 overflow-x-auto flex gap-2 pb-2">
            {insp.rooms.map((r, i) => {
              const active = i === roomIdx;
              const roomDone = r.items.every((it) => it.exists === false || (it.exists === true && it.status !== null));
              return (
                <button
                  key={r.id}
                  onClick={() => setRoomIdx(i)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : roomDone
                      ? "bg-success/15 text-success border border-success/30"
                      : "bg-secondary text-foreground border border-border"
                  }`}
                >
                  {r.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-primary">{room.name}</h2>
          <p className="text-xs text-muted-foreground">Ambiente {roomIdx + 1} de {insp.rooms.length} — {room.items.length} itens</p>
        </div>

        <div className="space-y-4">
          {room.items.map((it, idx) => (
            <ItemCard
              key={it.templateId + idx}
              index={idx + 1}
              state={it}
              template={template.items.find((t) => t.id === it.templateId)}
              onUpdate={(patch) => updateItem(idx, patch)}
            />
          ))}
        </div>

        {/* Nav */}
        <div className="mt-6 flex gap-2">
          <Button variant="outline" onClick={goPrev} disabled={roomIdx === 0} className="flex-1">
            <ArrowLeft className="h-4 w-4" /> Anterior
          </Button>
          {roomIdx < insp.rooms.length - 1 ? (
            <Button onClick={goNext} className="flex-1">
              Próximo <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finalize} className="flex-1">
              <ClipboardCheck className="h-4 w-4" /> Concluir Checklist
            </Button>
          )}
        </div>

        <Link to="/" className="mt-6 block text-center text-xs text-muted-foreground">
          Salvar e sair
        </Link>
      </main>
    </div>
  );
}

function ItemCard({
  index,
  state,
  template,
  onUpdate,
}: {
  index: number;
  state: ChecklistItemState;
  template: any;
  onUpdate: (patch: Partial<ChecklistItemState>) => void;
}) {
  const setExists = (v: boolean) => {
    if (v === false) onUpdate({ exists: false, status: null, photos: [], observations: "" });
    else onUpdate({ exists: true });
  };
  const setStatus = (s: ItemStatus) => {
    if (s !== "REPROVADO") onUpdate({ status: s });
    else onUpdate({ status: s });
  };

  const addPhoto = async (files: FileList | null) => {
    if (!files) return;
    const newPhotos: string[] = [];
    for (const f of Array.from(files)) {
      const data = await compressImage(f);
      newPhotos.push(data);
    }
    onUpdate({ photos: [...state.photos, ...newPhotos] });
  };

  const removePhoto = (i: number) => {
    onUpdate({ photos: state.photos.filter((_, x) => x !== i) });
  };

  return (
    <div className="rounded-lg bg-card border border-border p-4 shadow-sm">
      <h3 className="font-semibold text-foreground flex items-start gap-2">
        <span className="text-primary shrink-0">{index}.</span>
        <span>{template?.title ?? state.title}</span>
      </h3>

      {/* Etapa 1 */}
      <div className="mt-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">EXISTE O SISTEMA?</p>
        <div className="grid grid-cols-2 gap-2">
          <ChoiceBtn selected={state.exists === true} onClick={() => setExists(true)} variant="success">SIM</ChoiceBtn>
          <ChoiceBtn selected={state.exists === false} onClick={() => setExists(false)} variant="na">NÃO</ChoiceBtn>
        </div>
      </div>

      {/* Etapa 2 */}
      {state.exists === true && (
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">STATUS</p>
            <div className="grid grid-cols-2 gap-2">
              <ChoiceBtn selected={state.status === "APROVADO"} onClick={() => setStatus("APROVADO")} variant="success">
                <Check className="h-4 w-4" /> APROVADO
              </ChoiceBtn>
              <ChoiceBtn selected={state.status === "REPROVADO"} onClick={() => setStatus("REPROVADO")} variant="destructive">
                <X className="h-4 w-4" /> REPROVADO
              </ChoiceBtn>
            </div>
          </div>

          {template?.orientacoes && (
            <div className="rounded-md bg-secondary/60 p-3 text-xs">
              <p className="flex items-center gap-1.5 font-semibold text-foreground mb-1"><Info className="h-3.5 w-3.5" /> Orientações</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {template.orientacoes.map((o: string, i: number) => <li key={i}>{o}</li>)}
              </ul>
            </div>
          )}
          {template?.teste && (
            <div className="rounded-md bg-accent p-3 text-xs">
              <p className="flex items-center gap-1.5 font-semibold text-accent-foreground mb-1"><Lightbulb className="h-3.5 w-3.5" /> Teste</p>
              <p className="text-foreground">{template.teste}</p>
            </div>
          )}
          {template?.atencao && (
            <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs">
              <p className="flex items-center gap-1.5 font-semibold text-warning-foreground mb-1"><AlertTriangle className="h-3.5 w-3.5" /> Atenção</p>
              <p className="text-foreground">{template.atencao}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Observações</p>
            <Textarea
              rows={3}
              value={state.observations}
              onChange={(e) => onUpdate({ observations: e.target.value })}
              placeholder="Descreva o que encontrou…"
            />
          </div>

          {state.status === "REPROVADO" && (
            <div>
              <p className="text-xs font-medium text-destructive mb-2">Foto obrigatória do problema</p>
              <label className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-destructive/40 bg-destructive/5 p-4 cursor-pointer hover:bg-destructive/10">
                <Camera className="h-6 w-6 text-destructive" />
                <span className="text-xs text-foreground mt-1">Tirar foto ou escolher da galeria</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  onChange={(e) => addPhoto(e.target.files)}
                />
              </label>
              {state.photos.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {state.photos.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded overflow-hidden bg-secondary">
                      <img src={p} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1"
                        aria-label="Remover foto"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {state.exists === false && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-na" />
          Marcado como NÃO SE APLICA
        </div>
      )}
    </div>
  );
}

function ChoiceBtn({
  selected,
  onClick,
  children,
  variant,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant: "success" | "destructive" | "na";
}) {
  const colors: Record<string, string> = {
    success: selected ? "bg-success text-success-foreground border-success" : "bg-white text-foreground border-border hover:border-success",
    destructive: selected ? "bg-destructive text-destructive-foreground border-destructive" : "bg-white text-foreground border-border hover:border-destructive",
    na: selected ? "bg-na text-na-foreground border-na" : "bg-white text-foreground border-border hover:border-na",
  };
  return (
    <button
      onClick={onClick}
      className={`h-12 rounded-md border-2 font-semibold text-sm transition-colors inline-flex items-center justify-center gap-1.5 ${colors[variant]}`}
    >
      {children}
    </button>
  );
}

