const K_GEMINI = "templar_gemini_key_v1";

export function getGeminiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(K_GEMINI) ?? "";
}
export function setGeminiKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(K_GEMINI, key);
}
export function clearGeminiKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(K_GEMINI);
}

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGemini(apiKey: string, prompt: string, timeoutMs = 30000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
          responseMimeType: "application/json",
        },
      }),
    });
    if (!resp.ok) {
      let msg = `Erro ${resp.status}`;
      try {
        const j = await resp.json();
        msg = j?.error?.message ?? msg;
      } catch {}
      throw new Error(msg);
    }
    const j = await resp.json();
    const text = j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return text;
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

export async function testGeminiConnection(apiKey: string): Promise<boolean> {
  const resp = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "ok" }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 5 },
    }),
  });
  if (!resp.ok) {
    let msg = `Erro ${resp.status}`;
    try {
      const j = await resp.json();
      msg = j?.error?.message ?? msg;
    } catch {}
    throw new Error(msg);
  }
  return true;
}

export interface EnhanceItem {
  id: string;
  itemTitle: string;
  roomName: string;
  original: string;
}

const SYSTEM_PROMPT = `Você é um assistente técnico de engenharia civil. Reescreva cada observação de vistoria abaixo de forma técnica, objetiva e concisa. Complexidade média: nem muito rígida (leigos devem entender) nem suave demais (deve transmitir conhecimento técnico). NUNCA invente dados que não estão no texto original (medidas, quantidades, locais não citados). Se o texto mencionar 'rachadura', não adicione dimensões não mencionadas. Distinga fissura, trinca e rachadura conforme o contexto. Use português do Brasil na forma passiva/impessoal. Mantenha o sentido original — apenas melhore a linguagem.`;

export async function enhanceObservationsGemini(
  apiKey: string,
  items: EnhanceItem[],
): Promise<Record<string, string>> {
  if (!apiKey) throw new Error("Configure sua chave da API Gemini nas Configurações antes de usar o aprimoramento por IA");
  if (items.length === 0) return {};

  const userBlock = items
    .map((it, i) => `[${i + 1}] id="${it.id}" | Ambiente: ${it.roomName} | Item: ${it.itemTitle}\nOriginal: ${it.original}`)
    .join("\n\n---\n\n");

  const prompt = `${SYSTEM_PROMPT}\n\nRetorne APENAS um objeto JSON no formato:\n{ "results": [{ "id": "<id>", "enhanced": "<texto aprimorado>" }, ...] }\n\nIDs esperados: ${items.map((i) => i.id).join(", ")}\n\nObservações a aprimorar:\n\n${userBlock}`;

  const raw = await callGemini(apiKey, prompt);
  let parsed: { results?: Array<{ id: string; enhanced: string }> } = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Try to extract JSON from any surrounding text
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      try { parsed = JSON.parse(m[0]); } catch { parsed = {}; }
    }
  }
  const map: Record<string, string> = {};
  for (const r of parsed.results ?? []) {
    if (r && typeof r.id === "string" && typeof r.enhanced === "string") {
      map[r.id] = r.enhanced.trim();
    }
  }
  for (const it of items) {
    if (!map[it.id]) map[it.id] = it.original;
  }
  return map;
}
