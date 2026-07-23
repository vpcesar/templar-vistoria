import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCompany, getResponsibles, newId, saveCompany, saveResponsibles } from "@/lib/storage";
import type { CompanyInfo, Responsible } from "@/lib/types";
import { ArrowLeft, Plus, Trash2, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — TEMPLAR ENGENHARIA" },
      { name: "description", content: "Cadastre responsáveis técnicos e dados da empresa para as vistorias." },
      { property: "og:title", content: "Configurações — TEMPLAR ENGENHARIA" },
      { property: "og:description", content: "Cadastre responsáveis técnicos e dados da empresa." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [resps, setResps] = useState<Responsible[]>([]);
  const [company, setCompany] = useState<CompanyInfo>(getCompany());
  const [newName, setNewName] = useState("");
  const [newCrea, setNewCrea] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCrea, setEditCrea] = useState("");

  useEffect(() => {
    setResps(getResponsibles());
    setCompany(getCompany());
  }, []);

  const add = () => {
    if (!newName.trim() || !newCrea.trim()) {
      toast.error("Preencha nome e CREA.");
      return;
    }
    const next = [...resps, { id: newId(), name: newName.trim(), crea: newCrea.trim() }];
    setResps(next);
    saveResponsibles(next);
    setNewName("");
    setNewCrea("");
    toast.success("Responsável adicionado");
  };

  const remove = (id: string) => {
    if (!confirm("Remover este responsável?")) return;
    const next = resps.filter((r) => r.id !== id);
    setResps(next);
    saveResponsibles(next);
  };

  const startEdit = (r: Responsible) => {
    setEditingId(r.id);
    setEditName(r.name);
    setEditCrea(r.crea);
  };

  const saveEdit = () => {
    const next = resps.map((r) => (r.id === editingId ? { ...r, name: editName.trim(), crea: editCrea.trim() } : r));
    setResps(next);
    saveResponsibles(next);
    setEditingId(null);
    toast.success("Responsável atualizado");
  };

  const saveCompanyInfo = () => {
    saveCompany(company);
    toast.success("Dados da empresa salvos");
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <AppHeader showSettings={false} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold mb-6">Configurações</h1>

        <section className="rounded-lg bg-card border border-border p-5 mb-6">
          <h2 className="font-semibold text-lg mb-4">Responsáveis Técnicos</h2>

          <div className="space-y-2 mb-4">
            {resps.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum responsável cadastrado.</p>
            )}
            {resps.map((r) => (
              <div key={r.id} className="rounded-md border border-border p-3">
                {editingId === r.id ? (
                  <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome" />
                    <Input value={editCrea} onChange={(e) => setEditCrea(e.target.value)} placeholder="CREA" />
                    <Button size="sm" onClick={saveEdit}><Save className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">CREA {r.crea}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium mb-2">Adicionar novo</p>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome completo" />
              <Input value={newCrea} onChange={(e) => setNewCrea(e.target.value)} placeholder="Número CREA" />
              <Button onClick={add}><Plus className="h-4 w-4" /> Adicionar</Button>
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-card border border-border p-5">
          <h2 className="font-semibold text-lg mb-4">Dados da Empresa</h2>
          <div className="grid gap-4">
            <div>
              <Label>Nome</Label>
              <Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
            </div>
            <div>
              <Label>Site</Label>
              <Input value={company.site} onChange={(e) => setCompany({ ...company, site: e.target.value })} />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input value={company.whatsapp} onChange={(e) => setCompany({ ...company, whatsapp: e.target.value })} />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
            </div>
            <Button onClick={saveCompanyInfo}><Save className="h-4 w-4" /> Salvar dados da empresa</Button>
          </div>
        </section>
      </main>
    </div>
  );
}
