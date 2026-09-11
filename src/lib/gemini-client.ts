const K_GEMINI = "templar_gemini_key_v1";

const MODEL_ID = "google/gemini-3.8-flash";
const MODEL = MODEL_ID.replace("google/", "");
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SYSTEM_PROMPT = `Você é um assistente técnico de engenharia civil. Reescreva o texto abaixo de forma técnica, objetiva e concisa. Use linguagem compreensível para leigos, mas que transmita conhecimento técnico. NUNCA invente dados ausentes no texto original, como medidas, quantidades ou locais. Se o texto mencionar rachadura, não adicione dimensões não informadas. Distinga fissura, trinca e rachadura somente quando o contexto permitir. Use português do Brasil, preferencialmente na forma passiva ou impessoal. Mantenha integralmente o sentido original. Responda somente com o texto aprimorado, sem prefácios.`;

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

function mapError(status: number, fallback: string): string {
  if (status === 400) return "A solicitação ao Gemini não foi aceita. Verifique a chave e tente novamente.";
  if (status === 401 || status === 403) return "Chave da API Gemini inválida ou sem permissão. Verifique a chave nas Configurações.";
  if (status === 429) return "Limite de uso do Gemini atingido. Aguarde alguns instantes e tente novamente.";
  return fallback;
}

async function callGemini(apiKey: string, prompt: string, timeoutMs = 30000): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
      }),
    });

    if (!response.ok) {
      let providerMessage = `Erro ${response.status} ao acessar o Gemini.`;
      try {
        const payload = (await response.json()) as { error?: { message?: string } };
        providerMessage = payload.error?.message ?? providerMessage;
      } catch {
        // Mantém a mensagem baseada no status quando a resposta não contém JSON.
      }
      throw new Error(mapError(response.status, providerMessage));
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) throw new Error("O Gemini não retornou um texto. Tente novamente.");
    return text;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("O aprimoramento demorou muito. Tente novamente ou edite manualmente.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function testGeminiConnection(apiKey: string): Promise<boolean> {
  await callGemini(apiKey, "Responda somente com: OK", 15000);
  return true;
}

export interface EnhanceItem {
  id: string;
  itemTitle: string;
  roomName: string;
  original: string;
}

export async function enhanceObservationsGemini(
  apiKey: string,
  items: EnhanceItem[],
): Promise<Record<string, string>> {
  if (!apiKey) {
    throw new Error("Configure sua chave da API Gemini nas Configurações antes de usar o aprimoramento por IA");
  }
  if (items.length === 0) return {};

  const result: Record<string, string> = {};
  for (const item of items) {
    const enhanced = await callGemini(
      apiKey,
      `Ambiente: ${item.roomName}\nItem: ${item.itemTitle}\nTexto do vistoriador: ${item.original}`,
    );
    result[item.id] = enhanced || item.original;
  }
  return result;
}