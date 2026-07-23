import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { deleteInspection, getInspections, getResponsibles } from "@/lib/storage";
import type { Inspection } from "@/lib/types";
import { FileText, Trash2, FolderOpen, Plus, MapPin, Calendar, User, AlertCircle, Info, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vistoria de Imóveis — TEMPLAR ENGENHARIA" },
      { name: "description", content: "Vistoria de imóveis" },
      { property: "og:title", content: "Vistoria de Imóveis — TEMPLAR ENGENHARIA" },
      { property: "og:description", content: "Vistoria de imóveis" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Inspection[]>([]);
  const [hasResp, setHasResp] = useState(true);

  useEffect(() => {
    setItems(getInspections());
    setHasResp(getResponsibles().length > 0);
  }, []);

  const onDelete = (id: string) => {
    if (!confirm("Excluir esta vistoria?")) return;
    deleteInspection(id);
    setItems(getInspections());
    toast.success("Vistoria excluída");
  };

  const onNew = () => {
    if (!hasResp) {
      toast.error("Cadastre um responsável técnico nas Configurações antes de iniciar.");
      navigate({ to: "/settings" });
      return;
    }
    navigate({ to: "/vistoria/new" });
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">Vistorias</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas vistorias de imóveis novos.</p>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
          <p>Os dados ficam salvos neste dispositivo. Gere e baixe o relatório após cada vistoria para não perder os dados.</p>
        </div>

        {!hasResp && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
            <AlertCircle className="h-5 w-5 text-warning-foreground shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Nenhum responsável técnico cadastrado.</p>
              <p className="text-muted-foreground">
                <Link to="/settings" className="text-primary underline">Cadastre um responsável</Link> antes de iniciar uma vistoria.
              </p>
            </div>
          </div>
        )}

        <Button size="lg" onClick={onNew} className="w-full h-14 text-base font-semibold mb-6">
          <Plus className="h-5 w-5" /> NOVA VISTORIA
        </Button>

        {items.length === 0 ? (
          <div className="text-center py-16 rounded-lg border border-dashed border-border bg-card">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhuma vistoria salva ainda.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map((it) => (
              <div key={it.id} className="rounded-lg bg-card border border-border p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">{it.client || "Sem cliente"}</h3>
                    <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{it.date || "-"}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{it.location || "-"} {it.unit ? `— Un. ${it.unit}` : ""}</div>
                      <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{it.responsibleName || "-"}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded ${it.completed ? "bg-success/15 text-success" : "bg-warning/15 text-warning-foreground"}`}>
                    {it.completed ? "CONCLUÍDA" : "EM ANDAMENTO"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate({ to: "/vistoria/$id/checklist", params: { id: it.id } })}>
                    <FolderOpen className="h-4 w-4" /> Abrir
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate({ to: "/vistoria/$id/edit", params: { id: it.id } })}>
                    <Pencil className="h-4 w-4" /> Editar cabeçalho
                  </Button>
                  {it.completed && (
                    <Button variant="outline" size="sm" onClick={() => navigate({ to: "/vistoria/$id/report", params: { id: it.id } })}>
                      <FileText className="h-4 w-4" /> Relatório
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onDelete(it.id)}>
                    <Trash2 className="h-4 w-4" /> Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
