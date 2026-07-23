import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCompany, getResponsibles, newId, saveCompany, saveResponsibles } from "@/lib/storage";
import { clearGroqKey, getGroqKey, setGroqKey, testGroqConnection } from "@/lib/groq-client";
import { compressImage } from "@/lib/image-utils";
import type { CompanyInfo, Responsible } from "@/lib/types";
import { ArrowLeft, Plus, Trash2, Pencil, Save, X, Upload, ImageOff, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — TEMPLAR ENGENHARIA" },
      { name: "description", content: "Cadastre responsáveis técnicos, logo da empresa e a chave da API Groq." },
      { property: "og:title", content: "Configurações — TEMPLAR ENGENHARIA" },
      { property: "og:description", content: "Responsáveis, dados da empresa, logo e integração de IA." },
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
  const [groqKey, setGroqKeyState] = useState("");
  const [testing, setTesting] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setResps(getResponsibles());
    setCompany(getCompany());
    setGroqKeyState(getGroqKey());
  }, []);

  const add = () => {
    if (!newName.trim() || !newCrea.trim()) {
      toast.error("Preencha nome e CREA.");
      return;
    }
    const next = [...resps, { id: newId(), name: newName.trim(), crea: newCrea.trim() }];
    setResps(next);
    saveResponsibles(next);
    setNewName(""); setNewCrea("");
    toast.success("Responsável adicionado");
  };

  const remove = (id: string) => {
    if (!confirm("Remover este responsável?")) return;
    const next = resps.filter((r) => r.id !== id);
    setResps(next); saveResponsibles(next);
  };

  const startEdit = (r: Responsible) => { setEditingId(r.id); setEditName(r.name); setEditCrea(r.crea); };
  const saveEdit = () => {
    const next = resps.map((r) => (r.id === editingId ? { ...r, name: editName.trim(), crea: editCrea.trim() } : r));
    setResps(next); saveResponsibles(next); setEditingId(null);
    toast.success("Responsável atualizado");
  };

  const persistCompany = (c: CompanyInfo) => {
    try {
      saveCompany(c);
      setCompany(c);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao salvar");
    }
  };

  const saveCompanyInfo = () => {
    try {
      saveCompany(company);
      toast.success("Dados da empresa salvos");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao salvar");
    }
  };

  const onLogoFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      return;
    }
    try {
      const data = await compressImage(file, 400, 0.85);
      persistCompany({ ...company, logoBase64: data });
      toast.success("Logo atualizado");
    } catch {
      toast.error("Não foi possível processar a imagem.");
    }
  };
  const removeLogo = () => {
    persistCompany({ ...company, logoBase64: undefined });
    if (fileRef.current) fileRef.current.value = "";
    toast.success("Logo removido");
  };

  const saveGroq = () => {
    setGroqKey(groqKey.trim());
    toast.success(groqKey.trim() ? "Chave salva" : "Chave removida");
  };
  const removeGroq = () => {
    clearGroqKey();
    setGroqKeyState("");
    toast.success("Chave removida");
  };
  const testGroq = async () => {
    const k = groqKey.trim();
    if (!k) { toast.error("Informe a chave antes de testar."); return; }
    setTesting(true);
    try {
      await testGroqConnection(k);
      setGroqKey(k);
      toast.success("Conexão OK — chave salva");
    } catch (e: any) {
      toast.error(`Falha: ${e?.message ?? "erro desconhecido"}`);
    } finally { setTesting(false); }
  };

  const keyConfigured = groqKey.trim().length > 0 && getGroqKey() === groqKey.trim();

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
            {resps.length === 0 && (<p className="text-sm text-muted-foreground">Nenhum responsável cadastrado.</p>)}
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

        <section className="rounded-lg bg-card border border-border p-5 mb-6">
          <h2 className="font-semibold text-lg mb-4">Dados da Empresa</h2>

          <div className="mb-5">
            <Label>Logotipo</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="h-24 w-24 rounded-md border border-border bg-secondary/50 flex items-center justify-center overflow-hidden shrink-0">
                {company.logoBase64 ? (
                  <img src={company.logoBase64} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <div className="text-[10px] text-muted-foreground text-center px-1 leading-tight">
                    <ImageOff className="h-5 w-5 mx-auto mb-1" />
                    LOGO DA<br />EMPRESA
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onLogoFile(f); }}
                />
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4" /> {company.logoBase64 ? "Trocar logo" : "Enviar logo"}
                </Button>
                {company.logoBase64 && (
                  <Button type="button" variant="ghost" onClick={removeLogo}>
                    <Trash2 className="h-4 w-4" /> Remover
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">JPG ou PNG, até 5 MB.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div><Label>Nome</Label><Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></div>
            <div><Label>Site</Label><Input value={company.site} onChange={(e) => setCompany({ ...company, site: e.target.value })} /></div>
            <div><Label>WhatsApp</Label><Input value={company.whatsapp} onChange={(e) => setCompany({ ...company, whatsapp: e.target.value })} /></div>
            <div><Label>E-mail</Label><Input value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} /></div>
            <Button onClick={saveCompanyInfo}><Save className="h-4 w-4" /> Salvar dados da empresa</Button>
          </div>
        </section>

        <section className="rounded-lg bg-card border border-border p-5">
          <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><KeyRound className="h-5 w-5" /> Integração de IA</h2>
          <p className="text-xs text-muted-foreground mb-4">
            A chave é usada apenas neste dispositivo para o aprimoramento de observações. Obtenha em{" "}
            <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-primary underline">aistudio.google.com</a>.
          </p>
          <div className="grid gap-3">
            <div>
              <Label>Chave da API Groq</Label>
              <Input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKeyState(e.target.value)}
                placeholder="AIza…"
                autoComplete="off"
              />
              <p className="text-xs mt-1 flex items-center gap-1.5">
                {keyConfigured ? (
                  <span className="text-success inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Chave configurada</span>
                ) : (
                  <span className="text-muted-foreground">Nenhuma chave configurada</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={saveGroq}><Save className="h-4 w-4" /> Salvar chave</Button>
              <Button variant="outline" onClick={testGroq} disabled={testing}>
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Testar conexão
              </Button>
              {getGroqKey() && (
                <Button variant="ghost" onClick={removeGroq}><Trash2 className="h-4 w-4" /> Remover chave</Button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
