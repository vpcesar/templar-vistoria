## Plano de atualizações — App de Vistoria TEMPLAR

Aplicar as 8 mudanças em conjunto, mantendo o app 100% client-side (localStorage), sem backend nem Lovable AI.

### 1. Armazenamento local e compressão de fotos
- Manter `localStorage` como única persistência (já é o caso em `src/lib/storage.ts`).
- Criar `src/lib/image-utils.ts` com função `compressImage(file)` que redimensiona para máx. 800px de largura e exporta JPEG qualidade 0.7 em base64.
- Aplicar a compressão em toda captura de foto no checklist antes de salvar.
- Envolver `saveInspection` em try/catch: se `QuotaExceededError`, exibir toast: *"Espaço de armazenamento cheio. Exclua vistorias antigas ou gere os relatórios e exclua as vistorias já concluídas."*
- No dashboard (`src/routes/index.tsx`), adicionar aviso sutil: *"Os dados ficam salvos neste dispositivo. Gere e baixe o relatório após cada vistoria para não perder os dados."*

### 2. Geração de PDF e Word client-side
- Já usa `jspdf` e `docx` no cliente — manter.
- Adicionar botão de compartilhar via Web Share API (`navigator.share`) na tela de relatório, com fallback para download quando não suportado.

### 3. Logo editável nas Configurações
- Estender `CompanyInfo` em `src/lib/types.ts` com `logoBase64?: string`.
- Em `src/routes/settings.tsx`, na seção "Dados da empresa":
  - Adicionar input file (aceita JPG/PNG, até 5MB), preview, botões "Trocar" e "Remover".
  - Comprimir para máx. 400px de largura antes de salvar.
- Em `src/components/AppHeader.tsx`, usar `company.logoBase64` quando existir; senão, o logo padrão.
- No `report-generator.ts`, usar o logo da empresa na capa (centralizado). Se ausente, desenhar placeholder "LOGO DA EMPRESA".

### 4. Drag and drop para ordenar ambientes
- Instalar `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- Em `src/routes/vistoria.new.tsx`, transformar a lista de ambientes em componentes `SortableItem` com handle `≡` (ícone `GripVertical`). Suporta toque e mouse.
- Aplicar o mesmo no editor de cabeçalho (item 7).

### 5. Itens automáticos para banheiros
- Em `src/lib/checklist-templates.ts`:
  - Atualizar `detectTemplate` para reconhecer nomes contendo "banheiro", "lavabo", "wc" ou "sanitário" (case-insensitive).
  - Criar `BATHROOM_TEMPLATE` com os 17 itens detalhados na sequência exata do briefing (Tomadas/Interruptores, Paredes, Teto, Louças e Metais, Pia e Bancada, Ralo, Janelas Metálicas, Peitoril, Piso/Azulejo, Porta de Madeira, Pintura, Porta de Alumínio, Instalações Sanitárias, Soleira/Baguete, Ventilação Forçada, Limpeza, Geral/Dimensões), cada um com `orientacoes[]`, `teste`, `atencao`.
- O fluxo Existe? → Aprovado/Reprovado + observações + foto já funciona genericamente.

### 6. Hyperlinks no relatório
- **PDF (`jspdf`)**: usar `doc.textWithLink(label, x, y, { url })` para telefone (`https://wa.me/5521981808812`), site (`https://www.templarengenharia.com.br`) e e-mail (`mailto:...`). Cor herdada do texto (sem sublinhado agressivo).
- **DOCX (`docx`)**: usar `ExternalHyperlink` com `TextRun` sem estilo `Hyperlink` (mantém cor do texto) para os mesmos três alvos.

### 7. Editar cabeçalho após conclusão
- Extrair a UI do cabeçalho de `vistoria.new.tsx` para um componente reutilizável `<InspectionHeaderForm />` (usado por new e edit).
- Criar rota `src/routes/vistoria.$id.edit.tsx` que carrega a vistoria, pré-preenche o formulário, permite editar todos os campos e reordenar/adicionar/remover ambientes.
- Ao salvar: reconciliar `rooms` — manter estados de ambientes existentes (por `id`), adicionar novos vazios (via `buildRoomsFromNames`), remover excluídos. Preservar `completed`.
- Adicionar botão "EDITAR CABEÇALHO" na tela de relatório (`vistoria.$id.report.tsx`) e no dashboard (ao abrir vistoria concluída), com confirmação: *"Ao editar o cabeçalho, você precisará gerar o relatório novamente. Deseja continuar?"*

### 8. Gemini API própria (remover Lovable AI)
- Adicionar `geminiApiKey?: string` em `CompanyInfo` (ou nova chave de storage `templar_gemini_key`).
- Na tela de Configurações, nova seção "Integração de IA":
  - Input password para chave; status "Chave configurada ✓" / "Nenhuma chave configurada".
  - Link: *Obtenha sua chave em aistudio.google.com*.
  - Botão "Testar conexão" (faz um `generateContent` mínimo e mostra toast de sucesso/erro).
  - Botão "Remover chave".
- Criar `src/lib/gemini-client.ts` (client-side) com `enhanceObservationsGemini(items, apiKey)`:
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=...`
  - Prompt conforme especificado, temperature 0.3, maxOutputTokens 500.
  - Processa um item por chamada (loop com pequena espera) ou envia todos em um único prompt pedindo JSON — usar a abordagem JSON já existente para reduzir chamadas.
- Refatorar `src/routes/vistoria.$id.review.tsx`:
  - Substituir `useServerFn(enhanceObservations)` por chamada direta ao `gemini-client`.
  - Se chave ausente: toast *"Configure sua chave da API Gemini nas Configurações antes de usar o aprimoramento por IA"*.
  - Se `navigator.onLine === false`: desabilitar botão "APRIMORAR TODAS" com tooltip *"Conecte-se à internet para usar a IA"*; usuário ainda pode editar manualmente.
  - Tratar timeout (AbortController 30s) e erros da API relaying a mensagem do Google.
- Excluir `src/lib/ai-enhance.functions.ts` e qualquer referência a `LOVABLE_API_KEY`.

### Arquivos afetados (resumo técnico)
- **Criar**: `src/lib/image-utils.ts`, `src/lib/gemini-client.ts`, `src/components/InspectionHeaderForm.tsx`, `src/components/SortableRoomList.tsx`, `src/routes/vistoria.$id.edit.tsx`.
- **Modificar**: `src/lib/types.ts`, `src/lib/storage.ts`, `src/lib/checklist-templates.ts`, `src/lib/report-generator.ts`, `src/components/AppHeader.tsx`, `src/routes/index.tsx`, `src/routes/settings.tsx`, `src/routes/vistoria.new.tsx`, `src/routes/vistoria.$id.checklist.tsx`, `src/routes/vistoria.$id.review.tsx`, `src/routes/vistoria.$id.report.tsx`.
- **Excluir**: `src/lib/ai-enhance.functions.ts`.
- **Dependências**: `bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.
