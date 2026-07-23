const K_GROQ = "templar_groq_key_v1";

export function getGroqKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(K_GROQ) ?? "";
}
export function setGroqKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(K_GROQ, key);
}
export function clearGroqKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(K_GROQ);
}

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `Você é um assistente técnico de engenharia civil. Reescreva o texto abaixo de forma técnica, objetiva e concisa. Complexidade média: nem muito rígida (leigos devem entender) nem suave demais (deve transmitir conhecimento técnico). NUNCA invente dados que não estão no texto original (medidas, quantidades, locais não citados). Se o texto mencionar 'rachadura', não adicione dimensões não mencionadas. Distinga fissura, trinca e rachadura conforme o contexto. Use português do Brasil na forma passiva/impessoal. Mantenha o sentido original — apenas melhore a linguagem. Responda APENAS com o texto aprimorado, sem prefácios.`;

function mapError(status: number, fallback: string): string {
  if (status === 401) return "Chave de API inválida. Verifique a chave nas Configurações.";
  if (status === 429) return "Muitas solicitações em pouco tempo. Aguarde alguns segundos e tente novamente.";
  return fallback;
}

async function callGroq(apiKey: string, messages: Array<{ role: string; content: string }>, timeoutMs = 30000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 500,
      }),
    });
    if (!resp.ok) {
      let providerMsg = `Erro ${resp.status}`;
      try {
        const j = await resp.json();
        providerMsg = j?.error?.message ?? providerMsg;
      } catch {}
      throw new Error(mapError(resp.status, providerMsg));
    }
    const j = await resp.json();
    const text: string = j?.choices?.[0]?.message?.content ?? "";
    return text.trim();
  } catch (e: unknown) {
    const err = e as { name?: string; message?: string };
    if (err.name === "AbortError") {
      throw new Error("O aprimoramento demorou muito. Tente novamente ou edite manualmente.");
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

export async function testGroqConnection(apiKey: string): Promise<boolean> {
  await callGroq(apiKey, [{ role: "user", content: "ok" }], 15000);
  return true;
}

export interface EnhanceItem {
  id: string;
  itemTitle: string;
  roomName: string;
  original: string;
}

export async function enhanceObservationsGroq(
  apiKey: string,
  items: EnhanceItem[],
): Promise<Record<string, string>> {
  if (!apiKey) throw new Error("Configure sua chave da API Groq nas Configurações antes de usar o aprimoramento por IA");
  if (items.length === 0) return {};

  const results = await Promise.all(
    items.map(async (it) => {
      try {
        const enhanced = await callGroq(apiKey, [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Ambiente: ${it.roomName}\nItem: ${it.itemTitle}\nTexto do vistoriador: ${it.original}` },
        ]);
        return [it.id, enhanced || it.original] as const;
      } catch (e) {
        throw e;
      }
    }),
  );
  const map: Record<string, string> = {};
  for (const [id, text] of results) map[id] = text;
  return map;
}
