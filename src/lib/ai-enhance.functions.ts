import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      itemTitle: z.string(),
      roomName: z.string(),
      original: z.string().min(1).max(2000),
    }),
  ).min(1).max(80),
});

export const enhanceObservations = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const system = `Você é um engenheiro civil brasileiro especializado em vistoria de imóveis. Sua tarefa é reescrever observações de vistoria de forma técnica, objetiva e concisa.

REGRAS ABSOLUTAS:
1. NUNCA invente dados que não estão no texto original (medidas, quantidades, locais específicos que o vistoriador não mencionou).
2. Tom técnico de complexidade média — legível por um leigo, mas com terminologia correta (distinga fissura, trinca, rachadura conforme o contexto).
3. Seja conciso — direto ao ponto, sem enrolação nem floreios.
4. Preserve fielmente o sentido do texto original.
5. Escreva em português do Brasil, na forma passiva/impessoal ("Foi constatada...", "Observa-se...").
6. Retorne apenas o texto aprimorado, sem prefácios nem explicações.`;

    const userPrompt = data.items
      .map(
        (it, i) =>
          `[${i + 1}] Ambiente: ${it.roomName} | Item: ${it.itemTitle}\nObservação original: ${it.original}`,
      )
      .join("\n\n---\n\n");

    const finalUser = `Aprimore cada observação abaixo. Retorne um objeto JSON no formato { "results": [{ "id": string, "enhanced": string }, ...] } com um item por observação, na mesma ordem. IDs das observações: ${data.items.map((i) => i.id).join(", ")}.\n\n${userPrompt}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: finalUser },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Falha na IA [${resp.status}]: ${body.slice(0, 300)}`);
    }
    const json = await resp.json();
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: { results?: Array<{ id: string; enhanced: string }> } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { results: [] };
    }
    const map: Record<string, string> = {};
    for (const r of parsed.results ?? []) {
      if (r && typeof r.id === "string" && typeof r.enhanced === "string") {
        map[r.id] = r.enhanced.trim();
      }
    }
    // Fallback: keep original for missing
    for (const it of data.items) {
      if (!map[it.id]) map[it.id] = it.original;
    }
    return { results: map };
  });
