import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { getCompany, getInspection } from "@/lib/storage";
import type { Inspection } from "@/lib/types";
import { downloadBlob, generateDOCX, generatePDF, shareBlob } from "@/lib/report-generator";
import { ArrowLeft, FileDown, FileText, Loader2, Pencil, Share2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vistoria/$id/report")({
  head: () => ({
    meta: [
      { title: "Relatório de Vistoria — TEMPLAR ENGENHARIA" },
      { name: "description", content: "Gere, baixe e compartilhe o relatório da vistoria em PDF ou Word." },
      { property: "og:title", content: "Relatório de Vistoria — TEMPLAR ENGENHARIA" },
      { property: "og:description", content: "Gere, baixe e compartilhe o relatório em PDF ou Word." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [insp, setInsp] = useState<Inspection | null>(null);
  const [busy, setBusy] = useState<"pdf" | "docx" | "share" | null>(null);

  useEffect(() => {
    const i = getInspection(id);
    if (!i) { navigate({ to: "/" }); return; }
    setInsp(i);
  }, [id, navigate]);

  const filename = (ext: string) => {
    const safe = (s: string) => s.replace(/[^\w\-]+/g, "_").slice(0, 40);
    return `Vistoria_${safe(insp?.client ?? "cliente")}_${insp?.date ?? ""}.${ext}`;
  };

  const doPDF = async (share = false) => {
    if (!insp) return;
    setBusy(share ? "share" : "pdf");
    try {
      const blob = await generatePDF(insp, getCompany());
      const name = filename("pdf");
      if (share) {
        const ok = await shareBlob(blob, name, `Vistoria — ${insp.client}`);
        if (!ok) { downloadBlob(blob, name); toast.success("PDF baixado (compartilhamento indisponível)"); }
        else toast.success("Compartilhado");
      } else {
        downloadBlob(blob, name);
        toast.success("PDF gerado");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao gerar PDF");
    } finally { setBusy(null); }
  };

  const doDOCX = async () => {
    if (!insp) return;
    setBusy("docx");
    try {
      const blob = await generateDOCX(insp, getCompany());
      downloadBlob(blob, filename("docx"));
      toast.success("Word gerado");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao gerar Word");
    } finally { setBusy(null); }
  };

  const editHeader = () => {
    if (insp?.completed) {
      if (!confirm("Ao editar o cabeçalho, você precisará gerar o relatório novamente. Deseja continuar?")) return;
    }
    navigate({ to: "/vistoria/$id/edit", params: { id } });
  };

  if (!insp) return <div className="p-6 text-center text-muted-foreground">Carregando…</div>;

  const totals = { approved: 0, reproved: 0, na: 0 };
  for (const r of insp.rooms) for (const it of r.items) {
    if (it.exists === false) totals.na++;
    else if (it.status === "APROVADO") totals.approved++;
    else if (it.status === "REPROVADO") totals.reproved++;
  }

  return (
    <div className="min-h-screen bg-secondary/40 pb-8">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar ao dashboard
        </Link>

        <div className="rounded-lg bg-card border border-border p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <h1 className="text-2xl font-bold">Relatório pronto</h1>
            <Button size="sm" variant="outline" onClick={editHeader}>
              <Pencil className="h-4 w-4" /> Editar cabeçalho
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Cliente: <span className="font-medium text-foreground">{insp.client}</span> — {insp.date}</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatBox label="Aprovados" value={totals.approved} tone="success" />
            <StatBox label="Reprovados" value={totals.reproved} tone="destructive" />
            <StatBox label="Não se aplica" value={totals.na} tone="na" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button size="lg" className="h-14" onClick={() => doPDF(false)} disabled={busy !== null}>
              {busy === "pdf" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
              GERAR PDF
            </Button>
            <Button size="lg" variant="outline" className="h-14" onClick={doDOCX} disabled={busy !== null}>
              {busy === "docx" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileDown className="h-5 w-5" />}
              GERAR WORD (.docx)
            </Button>
            <Button size="lg" variant="secondary" className="h-14 sm:col-span-2" onClick={() => doPDF(true)} disabled={busy !== null}>
              {busy === "share" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}
              COMPARTILHAR PDF (WhatsApp, e-mail…)
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold mb-3">Continuar editando</h2>
          <p className="text-sm text-muted-foreground mb-3">Você pode voltar ao checklist ou refazer a revisão de observações a qualquer momento.</p>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => navigate({ to: "/vistoria/$id/checklist", params: { id } })}>
              Editar checklist
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/vistoria/$id/review", params: { id } })}>
              Revisar observações
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatBox({ label, value, tone }: { label: string; value: number; tone: "success" | "destructive" | "na" }) {
  const c: Record<string, string> = {
    success: "bg-success/10 text-success border-success/30",
    destructive: "bg-destructive/10 text-destructive border-destructive/30",
    na: "bg-na/10 text-foreground border-na/30",
  };
  return (
    <div className={`rounded-md border p-3 text-center ${c[tone]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[10px] uppercase font-semibold tracking-wide">{label}</div>
    </div>
  );
}
