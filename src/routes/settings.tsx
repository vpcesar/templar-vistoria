import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getResponsibles, newId, saveResponsibles } from "@/lib/storage";
import { clearGeminiKey, getGeminiKey, setGeminiKey, testGeminiConnection } from "@/lib/gemini-client";
import { getSelectedFolder, setSelectedFolder, folderUrl, type DriveFolder } from "@/lib/google-drive";
import { listDriveFolders } from "@/lib/drive.functions";
import type { Responsible } from "@/lib/types";
import {
  ArrowLeft, Plus, Trash2, Pencil, Save, X, CheckCircle2, KeyRound, Loader2, HardDrive,
  FolderOpen, ExternalLink, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";


export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — TEMPLAR ENGENHARIA" },
      { name: "description", content: "Cadastre responsáveis técnicos, configure a integração Gemini e conecte o Google Drive." },
      { property: "og:title", content: "Configurações — TEMPLAR ENGENHARIA" },
      { property: "og:description", content: "Responsáveis técnicos, integração de IA e Google Drive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [resps, setResps] = useState<Responsible[]>([]);
  const [newName, setNewName] = useState("");
  const [newCrea, setNewCrea] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCrea, setEditCrea] = useState("");
  const [geminiKey, setGeminiKeyState] = useState("");
  const [testing, setTesting] = useState(false);
  const [folder, setFolder] = useState<DriveFolder | null>(null);
  const [picking, setPicking] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [folderQuery, setFolderQuery] = useState("");
  const fetchFolders = useServerFn(listDriveFolders);

  useEffect(() => {
    setResps(getResponsibles());
    setGeminiKeyState(getGeminiKey());
    setFolder(getSelectedFolder());
  }, []);

  const openPicker = async () => {
    setPicking(true);
    setLoadingFolders(true);
    try {
      const list = await fetchFolders({ data: {} });
      setFolders(list);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao listar pastas do Google Drive");
    } finally {
      setLoadingFolders(false);
    }
  };

  const chooseFolder = (f: DriveFolder) => {
    setSelectedFolder(f);
    setFolder(f);
    setPicking(false);
    toast.success(`Pasta selecionada: ${f.name}`);
  };


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

  const saveGemini = () => {
    setGeminiKey(geminiKey.trim());
    toast.success(geminiKey.trim() ? "Chave salva" : "Chave removida");
  };
  const removeGemini = () => {
    clearGeminiKey();
    setGeminiKeyState("");
    toast.success("Chave removida");
  };
  const testGemini = async () => {
    const k = geminiKey.trim();
    if (!k) { toast.error("Informe a chave antes de testar."); return; }
    setTesting(true);
    try {
      await testGeminiConnection(k);
      setGeminiKey(k);
      toast.success("Conexão OK — chave salva");
    } catch (e: any) {
      toast.error(`Falha: ${e?.message ?? "erro desconhecido"}`);
    } finally { setTesting(false); }
  };

  const keyConfigured = geminiKey.trim().length > 0 && getGeminiKey() === geminiKey.trim();

  const visibleFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(folderQuery.trim().toLowerCase()),
  );


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
          <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><KeyRound className="h-5 w-5" /> Integração de IA</h2>
          <p className="text-xs text-muted-foreground mb-4">
             A chave é usada apenas neste dispositivo para o aprimoramento de observações. Obtenha sua chave em{" "}
             <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary underline">Google AI Studio</a>.
          </p>
          <div className="grid gap-3">
            <div>
               <Label>Chave da API Gemini</Label>
              <Input
                type="password"
                 value={geminiKey}
                 onChange={(e) => setGeminiKeyState(e.target.value)}
                 placeholder="Cole sua chave do Google AI Studio"
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
               <Button onClick={saveGemini}><Save className="h-4 w-4" /> Salvar chave</Button>
               <Button variant="outline" onClick={testGemini} disabled={testing}>
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Testar conexão
              </Button>
               {getGeminiKey() && (
                 <Button variant="ghost" onClick={removeGemini}><Trash2 className="h-4 w-4" /> Remover chave</Button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-card border border-border p-5">
          <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><HardDrive className="h-5 w-5" /> Google Drive</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Os relatórios gerados são salvos automaticamente na pasta selecionada no seu Google Drive.
          </p>
          <p className="text-sm text-success inline-flex items-center gap-1 mb-4">
            <CheckCircle2 className="h-4 w-4" /> Google Drive conectado
          </p>

          <div className="grid gap-3">
            <div>
              <Label>Pasta de destino</Label>
              <p className="text-sm font-medium mt-1 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                Pasta selecionada: {folder?.name ?? "—"}
              </p>
            </div>

            {picking && (
              <div className="rounded-md border border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={folderQuery}
                    onChange={(e) => setFolderQuery(e.target.value)}
                    placeholder="Buscar pasta…"
                  />
                  <Button size="sm" variant="ghost" onClick={openPicker} disabled={loadingFolders}>
                    <RefreshCw className={`h-4 w-4 ${loadingFolders ? "animate-spin" : ""}`} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPicking(false)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-border">
                  {loadingFolders && <p className="text-sm text-muted-foreground p-2">Carregando pastas…</p>}
                  {!loadingFolders && visibleFolders.length === 0 && (
                    <p className="text-sm text-muted-foreground p-2">Nenhuma pasta encontrada.</p>
                  )}
                  {!loadingFolders && visibleFolders.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => chooseFolder(f)}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-secondary/60 flex items-center gap-2"
                    >
                      <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={openPicker} disabled={loadingFolders}>
                {loadingFolders ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderOpen className="h-4 w-4" />} Trocar pasta
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.open(folderUrl(folder?.id ?? ""), "_blank")}
                disabled={!folder}
              >
                <ExternalLink className="h-4 w-4" /> Abrir pasta no Drive
              </Button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
