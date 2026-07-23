import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getInspection, saveInspection } from "@/lib/storage";
import type { Inspection } from "@/lib/types";
import { enhanceObservationsGroq, getGroqKey } from "@/lib/groq-client";
import { ArrowLeft, FileText, Sparkles, Check, Loader2, WifiOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vistoria/$id/review")({
  head: () => ({
    meta: [
      { title: "Revisão de Observações — TEMPLAR ENGENHARIA" },
      { name: "description", content: "Revise e aprimore as observações da vistoria antes de gerar o relatório." },
      { property: "og:title", content: "Revisão de Observações — TEMPLAR ENGENHARIA" },
      { property: "og:description", content: "Revise e aprimore as observações antes de gerar o relatório." },
    ],
  }),
  component: ReviewPage,
});

interface Entry {
  roomId: string;
  roomName: string;
  itemIdx: number;
  itemTitle: string;
  original: string;
  enhanced: string;
  accepted: string;
}

function keyFor(roomId: string, itemIdx: number) {
  return `${roomId}::${itemIdx}`;
}

function ReviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [insp, setInsp] = useState<Inspection | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);

  useEffect(() => {
    const i = getInspection(id);
    if (!i) { navigate({ to: "/" }); return; }
    setInsp(i);
    const list: Entry[] = [];
    for (const r of i.rooms) {
      r.items.forEach((it, idx) => {
        if (it.exists === true && it.observations.trim()) {
          list.push({
            roomId: r.id,
            roomName: r.name,
            itemIdx: idx,
            itemTitle: it.title,
            original: it.observations,
            enhanced: it.aiObservations ?? "",
            accepted: it.finalObservations ?? it.observations,
          });
        }
      });
    }
    setEntries(list);
  }, [id, navigate]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const enhanceAll = async () => {
    if (entries.length === 0) return;
    const apiKey = getGeminiKey();
    if (!apiKey) {
      toast.error("Configure sua chave da API Gemini nas Configurações antes de usar o aprimoramento por IA.");
      return;
    }
    if (!navigator.onLine) {
      toast.error("É necessário conexão com internet para o aprimoramento por IA. Você pode editar as observações manualmente.");
      return;
    }
    setBatchLoading(true);
    try {
      const payload = entries.map((e) => ({
        id: keyFor(e.roomId, e.itemIdx),
        itemTitle: e.itemTitle,
        roomName: e.roomName,
        original: e.original,
      }));
      const map = await enhanceObservationsGemini(apiKey, payload);
      setEntries((prev) =>
        prev.map((e) => {
          const k = keyFor(e.roomId, e.itemIdx);
          const enh = map[k] ?? e.original;
          return { ...e, enhanced: enh, accepted: enh };
        }),
      );
      toast.success("Observações aprimoradas");
    } catch (err: any) {
      toast.error(err?.message ?? "Falha na IA");
    } finally {
      setBatchLoading(false);
    }
  };

  const acceptOne = (i: number) => setEntries((prev) => prev.map((e, x) => (x === i ? { ...e, accepted: e.enhanced || e.original } : e)));
  const keepOriginal = (i: number) => setEntries((prev) => prev.map((e, x) => (x === i ? { ...e, accepted: e.original } : e)));
  const editAccepted = (i: number, v: string) => setEntries((prev) => prev.map((e, x) => (x === i ? { ...e, accepted: v } : e)));

  const generate = () => {
    if (!insp) return;
    const next: Inspection = {
      ...insp,
      completed: true,
      rooms: insp.rooms.map((r) => ({
        ...r,
        items: r.items.map((it, idx) => {
          const entry = entries.find((e) => e.roomId === r.id && e.itemIdx === idx);
          if (!entry) return it;
          return {
            ...it,
            aiObservations: entry.enhanced || undefined,
            finalObservations: entry.accepted,
          };
        }),
      })),
    };
    try {
      saveInspection(next);
      navigate({ to: "/vistoria/$id/report", params: { id } });
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao salvar");
    }
  };

  if (!insp) return <div className="p-6 text-center text-muted-foreground">Carregando…</div>;

  const disabledAI = batchLoading || !online;

  return (
    <div className="min-h-screen bg-secondary/40 pb-8">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/vistoria/$id/checklist" params={{ id }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar ao checklist
        </Link>
        <h1 className="text-2xl font-bold mb-2">Revisão de Observações</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Aprimore as observações digitadas com auxílio técnico da IA. Você pode aceitar, editar ou manter o texto original.
        </p>

        {entries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma observação para revisar.</p>
            <Button onClick={generate}><FileText className="h-4 w-4" /> Gerar Relatório</Button>
          </div>
        ) : (
          <>
            <Button
              onClick={enhanceAll}
              disabled={disabledAI}
              title={!online ? "Conecte-se à internet para usar a IA" : undefined}
              className="w-full h-12 mb-2"
            >
              {batchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : online ? <Sparkles className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              {batchLoading ? "Aprimorando…" : online ? "APRIMORAR TODAS" : "SEM INTERNET"}
            </Button>
            {!online && (
              <p className="text-xs text-muted-foreground mb-4 text-center">Conecte-se à internet para usar a IA. Você ainda pode editar manualmente.</p>
            )}

            <div className="space-y-4 mt-4">
              {entries.map((e, i) => (
                <div key={i} className="rounded-lg bg-card border border-border p-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    <span className="font-semibold text-primary">{e.roomName}</span> — {e.itemTitle}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 mt-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">Original</p>
                      <div className="rounded-md bg-secondary/60 p-3 text-sm text-foreground min-h-[80px] whitespace-pre-wrap">{e.original}</div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-semibold text-primary mb-1">Aprimorado (editável)</p>
                      <Textarea
                        rows={4}
                        value={e.accepted}
                        onChange={(ev) => editAccepted(i, ev.target.value)}
                        placeholder={e.enhanced ? "" : "Clique em APRIMORAR TODAS para gerar (ou edite manualmente)"}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {e.enhanced && (
                      <Button size="sm" variant="outline" onClick={() => acceptOne(i)}>
                        <Check className="h-4 w-4" /> Aceitar aprimorado
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => keepOriginal(i)}>
                      Manter original
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" onClick={generate} className="w-full h-14 mt-6 text-base font-semibold">
              <FileText className="h-5 w-5" /> GERAR RELATÓRIO
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
