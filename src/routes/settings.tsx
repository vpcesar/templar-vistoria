import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getResponsibles, newId, saveResponsibles } from "@/lib/storage";
import { clearGroqKey, getGroqKey, setGroqKey, testGroqConnection } from "@/lib/groq-client";
import {
  DRIVE_FOLDER_ID,
  DRIVE_FOLDER_NAME,
  connectDrive,
  disconnectDrive,
  getClientId,
  isDriveConnected,
  setClientId,
} from "@/lib/google-drive";
import type { Responsible } from "@/lib/types";
import { ArrowLeft, Plus, Trash2, Pencil, Save, X, CheckCircle2, KeyRound, Loader2, HardDrive } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — TEMPLAR ENGENHARIA" },
      { name: "description", content: "Cadastre responsáveis técnicos, a chave da API Groq e conecte o Google Drive." },
      { property: "og:title", content: "Configurações — TEMPLAR ENGENHARIA" },
      { property: "og:description", content: "Responsáveis técnicos, integração de IA e Google Drive." },
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
  const [groqKey, setGroqKeyState] = useState("");
  const [testing, setTesting] = useState(false);
  const [clientId, setClientIdState] = useState("");
  const [driveOn, setDriveOn] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    setResps(getResponsibles());
    setGroqKeyState(getGroqKey());
    setClientIdState(getClientId());
    setDriveOn(isDriveConnected());
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

  const saveClientId = () => {
    setClientId(clientId);
    toast.success(clientId.trim() ? "Client ID salvo" : "Client ID removido");
  };

  const doConnectDrive = async () => {
    if (!getClientId()) { toast.error("Salve o Google Client ID antes de conectar."); return; }
    setConnecting(true);
    try {
      await connectDrive();
      setDriveOn(true);
      toast.success("Google Drive conectado ✓");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao conectar o Google Drive");
    } finally { setConnecting(false); }
  };
  const doDisconnectDrive = () => {
    disconnectDrive();
    setDriveOn(false);
    toast.success("Google Drive desconectado");
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
            A chave é usada apenas neste dispositivo para o aprimoramento de observações. Obtenha sua chave gratuita em{" "}
            <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-primary underline">console.groq.com</a>.
          </p>
          <div className="grid gap-3">
            <div>
              <Label>Chave da API Groq</Label>
              <Input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKeyState(e.target.value)}
                placeholder="gsk_…"
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

        <section className="rounded-lg bg-card border border-border p-5">
          <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><HardDrive className="h-5 w-5" /> Google Drive</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Envie os relatórios gerados para uma pasta no seu Google Drive. Crie seu Client ID em{" "}
            <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-primary underline">console.cloud.google.com</a>{" "}
            (ative a Google Drive API).
          </p>
          <div className="grid gap-4">
            <div>
              <Label>Google Client ID</Label>
              <Input
                value={clientId}
                onChange={(e) => setClientIdState(e.target.value)}
                placeholder="000000000000-xxxxxxxx.apps.googleusercontent.com"
                autoComplete="off"
              />
              <p className="text-xs mt-1">
                {getClientId() ? (
                  <span className="text-success inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Configurado</span>
                ) : (
                  <span className="text-muted-foreground">Não configurado</span>
                )}
              </p>
            </div>

            <div>
              <Label>Pasta do Google Drive</Label>
              <Input value={DRIVE_FOLDER_NAME} readOnly disabled />
              <p className="text-[11px] text-muted-foreground mt-1 break-all">ID: {DRIVE_FOLDER_ID}</p>
            </div>

            <p className="text-xs">
              {driveOn ? (
                <span className="text-success inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Google Drive conectado</span>
              ) : (
                <span className="text-muted-foreground">Google Drive desconectado</span>
              )}
            </p>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={saveClientId}><Save className="h-4 w-4" /> Salvar Client ID</Button>
              <Button onClick={doConnectDrive} disabled={connecting}>
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <HardDrive className="h-4 w-4" />} Conectar Google Drive
              </Button>
              {driveOn && (
                <Button variant="ghost" onClick={doDisconnectDrive}><Trash2 className="h-4 w-4" /> Desconectar</Button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
