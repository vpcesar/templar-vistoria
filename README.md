# App Vistoria Templar

# APLICATIVO DE VISTORIA DE IMÓVEL NOVO — TEMPLAR ENGENHARIA

## ARQUIVOS DE REFERÊNCIA (FAZER UPLOAD)
Antes de começar, farei upload de 2 arquivos PDF que servem como referência visual e estrutural:
1. "Checklist-Vistoria-de-Imovel-Novo.pdf" → referência para a tela de preenchimento (visual, layout, cores, sequência de itens, orientações, testes, atenções)
2. "Relatório fotográfico - checklist vistoria de imóvel novo.pdf" → referência para o documento final gerado (estrutura, layout, formatação)

Use os dois PDFs como guia visual. O app deve reproduzir a mesma estrutura, sequência e estilo visual desses documentos.

---

## OBJETIVO DO APP
Criar um aplicativo mobile (priorizar design responsivo para celular) para vistoria de imóveis novos. O vistoriador preenche um checklist ambiente por ambiente, confirma se cada sistema existe (Sim/Não), avalia itens existentes (Aprovado/Reprovado), tira fotos dos problemas e, ao final, gera um Relatório de Vistoria em PDF ou Word com observações aprimoradas por IA.

---

## IDENTIDADE VISUAL DA EMPRESA
- **Empresa:** TEMPLAR ENGENHARIA
- **Logo:** Escudo heráldico vermelho-tijolo (cor aproximada #8E2E28) com uma cruz templária (cross pattée) dentro. Abaixo do escudo, o texto "TEMPLAR" em fonte serifada maiúscula, e abaixo "ENGENHARIA" em fonte menor. Textos em cinza escuro (#333333). Fundo branco.
- **Site:** www.templarengenharia.com.br
- **WhatsApp:** (21) 98180-8812
- **E-mail:** templarengenharia@hotmail.com
- O logo deve aparecer na capa do relatório gerado e no cabeçalho do app.
- As cores do app devem seguir a paleta: vermelho-tijolo (#8E2E28), cinza escuro (#333333), branco, e cinza claro para fundos.

---

## ESTRUTURA DO APP — TELAS

### TELA 1 — DASHBOARD (Tela Inicial)
- Logo da TEMPLAR ENGENHARIA no topo
- Botão grande "NOVA VISTORIA"
- Lista de vistorias salvas (cada card mostra: Cliente, Data, Localização, Status)
- Cada vistoria salva tem 3 ações: Abrir, Gerar Relatório, Excluir
- Botão de "CONFIGURAÇÕES" no canto superior

### TELA 2 — CONFIGURAÇÕES
Nesta tela o usuário cadastra informações que se repetem em todas as vistorias:
- **Responsáveis Técnicos:** Lista de engenheiros que podem ser responsáveis pela vistoria. Cada cadastro tem:
  - Nome completo
  - Número CREA
  - Botão "Adicionar novo responsável"
  - Botão "Editar" e "Excluir" ao lado de cada um
  - Deve ser flexível — o usuário pode adicionar quantos precisar, a qualquer momento
- **Dados da empresa** (já preenchidos, mas editáveis):
  - Nome: TEMPLAR ENGENHARIA
  - Site: www.templarengenharia.com.br
  - WhatsApp: (21) 98180-8812
  - E-mail: templarengenharia@hotmail.com

### TELA 3 — CABEÇALHO DA NOVA VISTORIA
Antes de começar o checklist, o usuário preenche os dados do cabeçalho:
- **Cliente** (texto livre)
- **Data da vistoria** (seletor de data — padrão: hoje)
- **Localização / Endereço** (texto livre)
- **Unidade / Apartamento** (texto livre)
- **Responsável da vistoria** (caixa de seleção — puxa da lista de responsáveis cadastrados nas Configurações; mostra "Nome — CREA XX")
- **Responsável da construtora** (texto livre — nome de quem recebe a vistoria do lado da construtora)
- **Tipo de imóvel:** (caixa de seleção) NOVO / USADO / REFORMADO
- **Ambientes da vistoria:** Lista padrão pré-carregada (baseada no checklist por cômodos):
  1. Sala
  2. Cozinha e Área de Serviço
  3. Banheiro
  4. Quarto Principal
  5. Quarto Secundário
  6. Área Externa / Varanda
  - O usuário pode: adicionar novo ambiente, remover ambiente, renomear ambiente
  - Esta lista define quais ambientes aparecerão no checklist
- Botão "INICIAR CHECKLIST"

### TELA 4 — CHECKLIST (Preenchimento por ambiente)
Esta é a tela principal do app. Deve ter o visual e estrutura IDÊNTICOS ao arquivo "Checklist-Vistoria-de-Imovel-Novo.pdf".

**Navegação:**
- Barra de progresso no topo mostrando X% concluído
- Abas ou lista lateral com os ambientes selecionados na tela anterior
- O usuário navega de ambiente em ambiente
- Cada ambiente mostra seus itens na mesma sequência do checklist

**ESTRUTURA DE CADA ITEM — FLUXO EM DUAS ETAPAS:**

**Etapa 1 — Confirmação de existência do sistema:**
- **Nome/título do item** (ex: "Piso", "Parede", "Teto", "Esquadrias", "Hidráulica", "Elétrica", etc.)
- **Pergunta:** "EXISTE O SISTEMA?" com duas caixas marcáveis: SIM / NÃO

**Etapa 2 — depende da resposta da Etapa 1:**

🔹 **Se SIM:**
- **Caixas de status:** APROVADO / REPROVADO (marcar uma das duas)
- **Orientações** (texto explicativo do que observar — igual ao checklist, em formato de bullets)
- **Teste** (instrução de como testar o item na prática — igual ao checklist)
- **Atenção** (avisos importantes — igual ao checklist, com destaque visual, ex: ícone de atenção ou fundo amarelado)
- **Observações** (campo de texto livre para o vistoriador digitar o que encontrou)
- **Regra de foto:** Se marcar REPROVADO, aparece automaticamente um campo de foto obrigatório

🔹 **Se NÃO:**
- O item é marcado como "NÃO SE APLICA"
- Não aparece a etapa de APROVADO/REPROVADO
- Não aparece orientações/teste/atenção/observações
- O usuário avança direto para o próximo item
- (Opcional: campo pequeno de observação, não obrigatório, caso queira registrar algo)

**Regra de foto obrigatória:**
- Quando o usuário marca "REPROVADO" em qualquer item, aparece automaticamente um campo de foto
- O vistoriador DEVE anexar pelo menos uma foto daquele item reprovado
- Não pode avançar ou concluir o checklist se houver item REPROVADO sem foto
- Permitir anexar múltiplas fotos por item reprovado
- As fotos podem ser tiradas pela câmera do celular ou escolhidas da galeria

**Botões de navegação:**
- "ANTERIOR" e "PRÓXIMO" entre ambientes
- No último ambiente: "CONCLUIR CHECKLIST"

### TELA 5 — REVISÃO E APRIMORAMENTO DAS OBSERVAÇÕES (IA)
Ao concluir o checklist, antes de gerar o relatório, o app apresenta uma tela de revisão.

**O que esta tela faz:**
- Lista todos os itens que tiveram observação digitada pelo vistoriador
- Para cada observação, mostra dois campos lado a lado:
  - **Texto original** (o que o vistoriador digitou no campo)
  - **Texto aprimorado por IA** (versão técnica revisada)

**REGRAS PARA O APRIMORAMENTO POR IA:**

1. **NUNCA inventar dados** — A IA só pode aprimorar o que foi digitado, nunca adicionar informações que não estão no texto original. Se o vistoriador escreveu "rachadura na parede", a IA NÃO pode dizer "rachadura de 15cm" se o tamanho não foi mencionado.

2. **Tom técnico de complexidade média** — O texto deve ser:
   - Técnico e objetivo (não coloquial)
   - De complexidade média: nem rígido demais a ponto de um leigo não entender, nem suave demais a ponto de parecer amador
   - Usar terminologia correta (ex: distinguir fissura/trinca/rachadura conforme o caso)
   - Exemplo: se o vistoriador digitou "rachadura no canto da parede da sala", a IA pode aprimorar para "Foi constatada a presença de fissura na alvenaria, localizada no encontro entre parede e teto, no canto da sala de estar."

3. **Conciso** — O texto aprimorado deve ser reduzido ao necessário para esclarecimento técnico. Sem enrolação, sem repetições, sem floreios. Direto ao ponto.

4. **Fidelidade ao sentido original** — A IA não pode alterar o significado do que o vistoriador escreveu. Só pode reescrever de forma mais técnica.

5. **Itens sem observação** — Não passam pela IA. Itens aprovados sem observação digitada não geram texto nenhum no relatório.

**Controles do usuário nesta tela:**
- Para cada item, o usuário pode:
  - Aceitar o texto aprimorado pela IA (botão "Aceitar")
  - Editar o texto aprimorado manualmente (campo editável)
  - Manter o texto original (botão "Manter original")
- Botão "APLICAR APRIMORAMENTO A TODAS" para aceitar todas de uma vez
- Botão "GERAR RELATÓRIO" ao final

### TELA 6 — GERAÇÃO DO RELATÓRIO
O app gera o documento "RELATÓRIO DE VISTORIA DE IMÓVEL NOVO" com estrutura IDÊNTICA ao arquivo "Relatório fotográfico - checklist vistoria de imóvel novo.pdf".

**Capa do relatório:**
- Logo da TEMPLAR ENGENHARIA centralizado
- Título: "RELATÓRIO DE VISTORIA DE IMÓVEL NOVO"
- Dados do cabeçalho: Cliente, Data, Localização, Unidade, Responsável da vistoria (nome + CREA), Responsável da construtora, Tipo de imóvel
- Rodapé com contato: site, WhatsApp, e-mail

**Conteúdo do relatório (por ambiente):**
- Nome do ambiente como título da seção
- Lista de itens inspecionados
- Para cada item, mostrar:
  - Status visual com três estados possíveis:
    - ✅ **APROVADO** (destaque verde)
    - ❌ **REPROVADO** (destaque vermelho) — com foto(s) anexada(s) logo abaixo
    - ⚪ **NÃO SE APLICA** (destaque cinza) — para itens marcados como NÃO existe
  - Observações (texto aprimorado aceito na Tela 5, se houver)
- NÃO incluir no relatório os textos de "Orientações", "Teste" e "Atenção" — esses são apenas guias para o vistoriador na tela de preenchimento
- O relatório deve ser limpo e profissional, igual ao arquivo de referência
- **NÃO mencionar em nenhum momento no relatório que houve uso de IA** — o texto aprimorado deve aparecer como texto normal, sem notas, sem rodapés, sem indicação de origem. O relatório deve parecer ter sido escrito integralmente pelo vistoriador/responsável técnico.

**Resumo final do relatório:**
- Ao final do documento, incluir um pequeno resumo:
  - Total de itens verificados
  - X itens APROVADOS
  - Y itens REPROVADOS
  - Z itens NÃO APLICÁVEIS

**Exportação:**
- Botão "GERAR PDF"
- Botão "GERAR WORD (.docx)"
- O usuário escolhe o formato na hora de gerar
- O arquivo gerado deve poder ser baixado / compartilhado (WhatsApp, e-mail, etc.)

---

## LÓGICA E REGRAS IMPORTANTES

1. **Salvamento automático:** O checklist é salvo automaticamente conforme o usuário preenche. Se ele sair do app e voltar, pode continuar de onde parou.
2. **Histórico de vistorias:** Todas as vistorias ficam salvas no dashboard. O usuário pode abrir, revisar, gerar relatório novamente ou excluir.
3. **Validação antes de concluir:** Não permite concluir o checklist se:
   - Houver item REPROVADO sem foto anexada
   - O cabeçalho estiver incompleto (cliente, data, responsável da vistoria)
4. **Edição após conclusão:** Mesmo após gerar o relatório, o usuário pode voltar e editar o checklist, gerando um novo relatório.
5. **Responsáveis técnicos flexíveis:** A lista de responsáveis vem das Configurações. Se não houver nenhum cadastrado, mostrar aviso "Cadastre um responsável técnico nas Configurações antes de iniciar".
6. **Ambientes flexíveis:** A lista de ambientes é pré-carregada com os 6 padrão, mas pode ser modificada antes de iniciar o checklist.

---

## DESIGN E ESTILO
- **Mobile-first:** O app deve ser desenhado primeiro para celular (tela vertical), depois adaptar para tablet/desktop.
- **Cores:** Vermelho-tijolo (#8E2E28) como cor primária, cinza escuro (#333333) para textos, branco para fundos, cinza claro (#F5F5F5) para seções, verde (#2E7D32) para APROVADO, vermelho (#C62828) para REPROVADO, cinza (#9E9E9E) para NÃO SE APLICA.
- **Tipografia:** Fonte limpa e legível (ex: Inter, Roboto ou similar). Títulos em peso bold, corpo em peso regular.
- **Botões:** Grandes, fáceis de tocar no celular (mínimo 44px de altura).
- **Caixas de seleção SIM/NÃO e APROVADO/REPROVADO:** Botões grandes e táteis, com cor de fundo mudando quando selecionados (SIM/APROVADO = verde, NÃO/REPROVADO = vermelho).
- **Campo de foto:** Área grande com ícone de câmera, fácil de tocar.
- **Campo de observações:** Área de texto ampla, com pelo menos 3 linhas visíveis.

---

## RESUMO DO FLUXO
1. Dashboard → Nova Vistoria
2. Preenche cabeçalho (cliente, data, local, responsável, tipo de imóvel, seleciona ambientes)
3. Inicia Checklist → para cada item: confirma Sim/Não → se SIM, avalia Aprovado/Reprovado + orienta/testa/observa → se REPROVADO, tira foto
4. Conclui Checklist
5. Revisão e aprimoramento das observações por IA (com aceite/edição manual)
6. Gera Relatório (PDF ou Word) → baixa ou compartilha
7. Vistoria fica salva no Dashboard para consulta futura

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://templar-vistoria.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b0612994-9590-4f2e-8fa3-76eb4078b16c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
