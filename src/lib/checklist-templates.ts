import type { ChecklistItemTemplate, RoomTemplate } from "./types";

// ============ SHARED (non-bathroom) ITEMS ============
const TOMADAS: ChecklistItemTemplate = {
  id: "tomadas",
  title: "Tomadas, interruptores e iluminação",
  orientacoes: [
    "Tenha em mãos uma lâmpada provisória para realização dos testes dos pontos de luz e interruptores.",
    "Verifique se os módulos estão oxidados; retire a tampa da tomada (com a energia desligada).",
    "Veja se o acabamento das tomadas e interruptores está alinhado (sujeira, massa, marcas de tinta).",
    "Verifique se os conectores estão instalados.",
    "Verifique se os interruptores estão com facilidade para ir de um lado para o outro.",
  ],
  teste: "Use o carregador do celular para testar as tomadas; se tiver uma caneta medidora de tensão, também pode utilizar.",
  atencao: "Se não houver energia disponível, falhas posteriores devem ser tratadas como vícios ocultos pela garantia da construtora. Registre isso com cliente e construtora.",
};

const ELETRICA: ChecklistItemTemplate = {
  id: "eletrica",
  title: "Instalação elétrica",
  orientacoes: [
    "Verifique se o quadro elétrico está identificado corretamente por cômodo.",
    "O quadro não pode estar com fiação exposta — precisa da tampa cega.",
    "Observe se os parafusos estão colocados e o quadro bem fixado, sem oxidação.",
  ],
  teste: "Ligue cada disjuntor para verificar se corresponde à identificação do quadro.",
  atencao: "Falhas sem energia devem ser tratadas como vícios ocultos pela garantia da construtora.",
};

const PAREDES: ChecklistItemTemplate = {
  id: "paredes",
  title: "Paredes",
  orientacoes: [
    "Tenha uma lanterna para verificação precisa.",
    "Verifique marcas de fôrma, dentes, ondulações ou paredes tortas.",
    "Use fissurômetro para identificar fissuras ou trincas.",
    "Verifique se as paredes estão deformadas (indício de manifestação patológica).",
  ],
  teste: "Utilize régua de alumínio para verificar a planicidade das paredes.",
  atencao: "Se houver manifestação patológica grave em parede estrutural, informe cliente e construtora imediatamente.",
};

const TETO: ChecklistItemTemplate = {
  id: "teto",
  title: "Teto",
  orientacoes: [
    "Verifique marcas de fôrma, dentes, fissuras, trincas ou ondulações.",
    "Se houver forro, verifique manchas ou diferença de tonalidade.",
  ],
  teste: "Use lanterna para uma verificação mais precisa.",
  atencao: "Manchas amareladas podem indicar infiltração no forro.",
};

const PISO_CERAMICA: ChecklistItemTemplate = {
  id: "piso_ceramica",
  title: "Pisos - cerâmica",
  orientacoes: [
    "Verifique a paginação da cerâmica conforme projeto.",
    "Verifique se a cerâmica está aderente ao contrapiso (peças ocas).",
    "Aspecto visual: trincas, lascas, quebras, fissuras, mesma tonalidade, recortes alinhados, peças niveladas.",
    "Verifique juntas preenchidas e lisas, sem manchas ou esfarelamento.",
  ],
  teste: "Cabo de vassoura ou martelo oco telescópico para identificar som cavo; balde com bolinhas de gude para caimento.",
  atencao: "Argamassa incorreta pode causar descolamento das peças.",
};

const PISO_CONTRA: ChecklistItemTemplate = {
  id: "piso_contra",
  title: "Pisos - contrapiso sem cerâmica",
  orientacoes: [
    "Verifique nivelamento e regularidade do contrapiso.",
    "Observe se há fissuras estruturais ou desníveis.",
  ],
};

const PORTA_MADEIRA: ChecklistItemTemplate = {
  id: "porta_madeira",
  title: "Esquadrias - Portas de madeira",
  orientacoes: [
    "Calafetações regulares, niveladas e totalmente encaixadas.",
    "Verifique o alinhamento das portas (abra e feche).",
    "Portas devem abrir e fechar sem ruído e sem dificuldade.",
    "Componentes instalados: batente, guarnição, folha, borracha, dobradiças, fechaduras, puxadores.",
    "Ferragens sem oxidação e sem resto de tinta.",
  ],
  teste: "Teste do efeito fantasma: deixe a porta aberta pela metade e verifique se permanece parada. Teste maçaneta e trinco.",
  atencao: "Portas bem instaladas, aprumadas, reguladas, sem folgas — sem efeito fantasma.",
};

const PORTA_ALUMINIO: ChecklistItemTemplate = {
  id: "porta_aluminio",
  title: "Esquadrias - Portas de alumínio",
  orientacoes: [
    "Verifique alinhamento, abertura e fechamento sem ruído.",
    "Sem riscos, trincas ou vidros quebrados.",
    "Sem pontos de oxidação; borrachas dos vidros instaladas.",
    "Fechadura funcionando; soleira sem trincas.",
  ],
  teste: "Abra e feche várias vezes; teste maçaneta, dobradiças e trinco.",
};

const JANELAS: ChecklistItemTemplate = {
  id: "janelas",
  title: "Esquadrias - Janelas metálicas",
  orientacoes: [
    "Verifique riscos, amassados, trincas, quebras, abaulamentos.",
    "Sem sujeira, tinta, massa, rebarbas ou excesso de PU.",
    "Vedação com silicone; parafusos sem espaços.",
  ],
  teste: "Abra e feche as janelas para verificar travamento, fechaduras e trepidação.",
  atencao: "Janela não pode estar vedada com rejunte — o material rígido fissura com o movimento.",
};

const PEITORIL: ChecklistItemTemplate = {
  id: "peitoril",
  title: "Peitoril janela",
  orientacoes: [
    "Verifique riscos, trincas, quebras ou imperfeições.",
    "Observe o caimento para fora do empreendimento.",
    "Confira se há pingadeira.",
  ],
  teste: "Aplique água para verificar o caimento.",
};

const RODAPE: ChecklistItemTemplate = {
  id: "rodape",
  title: "Rodapé",
  orientacoes: [
    "Fixação correta ao piso e à parede.",
    "Sem trincas, lascas ou emendas mal-acabadas.",
  ],
};

const SOLEIRAS: ChecklistItemTemplate = {
  id: "soleiras",
  title: "Soleiras / Baguete",
  orientacoes: [
    "Fixação sem trincas, manchas ou imperfeições.",
    "Rejuntamento adequado entre ambientes.",
  ],
};

const PINTURA: ChecklistItemTemplate = {
  id: "pintura",
  title: "Pintura",
  orientacoes: [
    "Ausência de acúmulos de massa.",
    "Sem falhas, manchas, sujeiras, bolhas, diferença de tonalidade, marcas de pincel, respingos ou mofo.",
    "Verifique ondulações ou deformações.",
  ],
  teste: "Use lanterna para uma verificação mais precisa.",
  atencao: "Cuidado com trincas ou fissuras na parede.",
};

const LIMPEZA: ChecklistItemTemplate = {
  id: "limpeza",
  title: "Limpeza",
  orientacoes: [
    "Ambiente entregue limpo, sem resíduos de obra.",
    "Sem respingos de tinta, argamassa ou massa em superfícies.",
  ],
};

const GERAL: ChecklistItemTemplate = {
  id: "geral",
  title: "GERAL (Dimensões)",
  orientacoes: [
    "Verifique se as dimensões estão de acordo com o projeto aprovado.",
  ],
  teste: "Utilize uma trena, preferencialmente a laser.",
};

const LOUCAS: ChecklistItemTemplate = {
  id: "loucas",
  title: "Louças e metais",
  orientacoes: [
    "Sem trincas, manchas, riscos ou lascas em louças, bancadas e metais.",
    "Louças e bancadas fixadas e íntegras.",
    "Metais sem riscos e sem oxidação.",
    "Vedação uniforme; sem vazamentos.",
    "Registros com acabamento; ponto de gás identificado.",
  ],
  teste: "Abra todas as torneiras de uma vez para testar a vazão.",
};

const PIA: ChecklistItemTemplate = {
  id: "pia",
  title: "Pia e bancadas",
  orientacoes: [
    "Sem trincas, manchas, riscos ou lascas.",
    "Bancadas fixadas e íntegras.",
  ],
  teste: "Apoie levemente para verificar a fixação.",
};

const RALO: ChecklistItemTemplate = {
  id: "ralo",
  title: "Ralo",
  orientacoes: [
    "Presença da grelha de proteção.",
    "Verifique entupimento.",
    "Impermeabilização íntegra.",
  ],
  teste: "Jogue água e verifique escoamento.",
};

const HIDRAULICA: ChecklistItemTemplate = {
  id: "hidraulica",
  title: "Instalações hidráulicas (Registros, Sifão)",
  orientacoes: [
    "Sem vazamentos ou entupimentos (dentro do shaft e sanca).",
    "Esgoto com escoamento fluido, sem manchas de infiltração.",
    "Sifão limpo e encaixado.",
    "Registros identificados (água quente e fria).",
  ],
};

const VENTILACAO: ChecklistItemTemplate = {
  id: "ventilacao",
  title: "Ventilação forçada",
  orientacoes: [
    "Verifique se a ventilação está instalada e funcionando corretamente.",
  ],
};

const INTERFONE: ChecklistItemTemplate = {
  id: "interfone",
  title: "Interfone",
  orientacoes: [
    "Verifique instalação e funcionamento do interfone.",
  ],
};

// ============ BATHROOM-SPECIFIC ITEMS (exact sequence from spec) ============
const BATH_TOMADAS: ChecklistItemTemplate = {
  id: "bath_tomadas",
  title: "Tomadas e interruptores",
  orientacoes: [
    "Tenha em mãos uma lâmpada provisória para realização dos testes dos pontos de luz e interruptores.",
    "Verifique se os módulos estão oxidados; para isso retire a tampa da tomada (com a energia desligada).",
    "Veja se o acabamento das tomadas e interruptores está alinhado (sujeira, massa, marcas de tinta, acúmulo de massa).",
    "Verifique se os conectores estão instalados.",
    "Verifique se os interruptores estão com facilidade para ir de um lado para o outro.",
  ],
  teste: "Use o carregador do celular para realizar o teste; se tiver uma caneta medidora de tensão pode utilizar também.",
  atencao: "Se não houver energia disponível para testar, as falhas posteriores devem ser consideradas vícios ocultos e atendidas pela garantia da construtora. Registre isso com cliente e construtora.",
};

const BATH_PAREDES: ChecklistItemTemplate = {
  id: "bath_paredes",
  title: "Paredes",
  orientacoes: [
    "Tenha em mãos uma lanterna para fazer a verificação mais precisa.",
    "Verifique se existem marcas de fôrma, dentes nas paredes, ondulações ou paredes tortas.",
    "Tenha em mãos um fissurômetro.",
    "Verifique se existem fissuras ou trincas.",
    "Verifique se as paredes estão deformadas (pode indicar manifestação patológica).",
  ],
  teste: "Leve uma régua de alumínio para verificar a planicidade das paredes — com a parede torta dificulta muito a colocação de móveis projetados.",
  atencao: "Se tiver qualquer manifestação patológica grave e for uma parede estrutural, informe o cliente e a construtora de imediato.",
};

const BATH_TETO: ChecklistItemTemplate = {
  id: "bath_teto",
  title: "Teto",
  orientacoes: [
    "Verifique marcas de fôrma, dentes, fissuras, trincas ou ondulações.",
    "Se o teto estiver com forro, verifique manchas ou diferença de tonalidade de pintura.",
  ],
  teste: "Tenha em mãos uma lanterna para fazer a verificação mais precisa.",
  atencao: "Manchas amareladas ou modificação de tonalidade podem se caracterizar como mancha de umidade — indica possível infiltração no forro.",
};

const BATH_LOUCAS: ChecklistItemTemplate = {
  id: "bath_loucas",
  title: "Louças e metais (Torneiras, Vasos sanitários)",
  orientacoes: [
    "Observar se há TRINCAS, MANCHAS, RISCOS, LASCAS em louças, bancadas e metais.",
    "As louças e bancadas precisam estar FIXADAS e ÍNTEGRAS.",
    "Metais com ausência de RISCOS e OXIDAÇÃO.",
    "Louças LISAS, sem DESCOLAMENTOS, VEDAÇÃO UNIFORME, PLUG/CAP CONECTADO, MESMA TONALIDADE.",
    "Sem VAZAMENTOS NA VEDAÇÃO dos metais.",
    "O registro precisa estar fechado e com o acabamento.",
    "O ponto do gás precisa estar identificado.",
    "COIFAS/CARENAGEM ÍNTEGRAS e DISTRIBUÍDAS.",
    "Vedação do registro sem EXCESSOS, REBARBAS ou FALHAS; sem folga no acabamento do registro.",
    "Torneiras com boa vazão de água.",
  ],
  teste: "Abra todas as torneiras de uma vez só para testar a vazão.",
};

const BATH_PIA: ChecklistItemTemplate = {
  id: "bath_pia",
  title: "Pia e bancada",
  orientacoes: [
    "Observar se há TRINCAS, MANCHAS, RISCOS, LASCAS.",
    "As bancadas precisam estar FIXADAS e ÍNTEGRAS.",
  ],
  teste: "Se apoie levemente para verificar se a pia e a bancada estão devidamente fixadas.",
};

const BATH_RALO: ChecklistItemTemplate = {
  id: "bath_ralo",
  title: "Ralo",
  orientacoes: [
    "Observar se há proteção do ralo (grelha de proteção) — se não houver, o ralo já pode ter sido danificado por materiais de obra.",
    "Verificar se o ralo apresenta ENTUPIMENTO.",
    "Observe a IMPERMEABILIZAÇÃO do ralo e verifique se está ÍNTEGRA.",
  ],
  teste: "Jogue água e verifique se há dificuldade de escoamento.",
};

const BATH_JANELAS: ChecklistItemTemplate = {
  id: "bath_janelas",
  title: "Esquadrias - Janelas metálicas",
  orientacoes: [
    "Verifique se há RISCOS, AMASSADOS, TRINCAS, QUEBRAS, ABAULAMENTOS.",
    "Verifique se há SUJEIRA, TINTA, MASSA, REBARBAS/EXCESSO DE PU, MANCHAS.",
    "As janelas precisam estar SEM EMENDAS e sem dentes, no mesmo aspecto que as paredes.",
    "Verifique a vedação da janela (silicone).",
    "Parafusos da janela não podem ter espaços — precisam ser preenchidos para evitar infiltração.",
  ],
  teste: "Faça abertura e fechamento das janelas para observar o travamento; verifique fechaduras e trepidação ao movimentar.",
  atencao: "A janela não pode estar vedada com rejunte — material rígido fissura com a movimentação da janela e infiltra.",
};

const BATH_PEITORIL: ChecklistItemTemplate = {
  id: "bath_peitoril",
  title: "Peitoril janela",
  orientacoes: [
    "Verifique se há RISCOS, TRINCAS, QUEBRAS OU IMPERFEIÇÕES no peitoril.",
    "Observe se o peitoril está com caimento para fora do empreendimento ou para dentro.",
    "Confira se há pingadeira no peitoril.",
  ],
  teste: "Aplique água para verificar o caimento do peitoril.",
};

const BATH_PISO: ChecklistItemTemplate = {
  id: "bath_piso",
  title: "Piso e azulejo cerâmico",
  orientacoes: [
    "Verifique a paginação da cerâmica conforme o projeto.",
    "Verifique se a cerâmica está aderente ao piso de assentamento (peças ocas).",
    "Aspecto visual: RISCOS, MANCHAS, TRINCAS, LASCAS, QUEBRAS, FISSURAS, MESMA TONALIDADE, RECORTES ALINHADOS, PEÇAS NIVELADAS, SHAFT.",
    "Note se há RESSALTOS ENTRE PEÇAS SENSÍVEIS AO TATO ou se está de fato nivelada.",
    "Verifique se há empoçamento.",
    "As peças devem estar LIMPAS — sem SUJEIRAS, RESPINGOS OU ESCORRIMENTO DE TINTA.",
    "JUNTAS PREENCHIDAS E LISAS, sem manchas ou esfarelamento — atenção ao rejunte do ralo e box.",
    "No encontro entre shaft de drywall e a parede deve haver silicone (nunca rejunte).",
  ],
  teste: "Use cabo de vassoura ou martelo oco telescópico para identificar som cavo (indica falta de aderência). Use também balde com bolinhas de gude para verificar empoçamento e caimento.",
  atencao: "Argamassa incorreta, ausente ou tipo errado (AC2 no lugar de AC3) pode causar descolamento das peças cerâmicas.",
};

const BATH_PORTA_MADEIRA: ChecklistItemTemplate = {
  id: "bath_porta_madeira",
  title: "Esquadrias - Portas de madeira",
  orientacoes: [
    "Portas com CALAFETAÇÕES REGULARES, NIVELADAS e TOTALMENTE ENCAIXADAS.",
    "Verifique o alinhamento das portas (abra, feche e observe).",
    "Portas devem abrir e fechar sem ruído e sem dificuldade.",
    "Sem portas QUEBRADAS ou com FISSURAS.",
    "Componentes instalados: batente, guarnição, folha, borracha amortecedora, dobradiças, fechaduras, puxadores.",
    "Ferragens encaixadas, sem oxidação e sem resto de tinta.",
    "Calafetação sem FALHA, FISSURA, DESCOLAMENTO, REBARBAS, AMARELAMENTO ou MANCHA.",
    "Pintura sem FALHAS, MANCHAS, SUJEIRAS, BOLHAS, DIFERENÇA DE TONALIDADE/BRILHO, MARCAS DE PINCEL, RESPINGOS/ESCORRIMENTO ou MOFO.",
    "Soleira fixada sem trincas, manchas ou imperfeições.",
  ],
  teste: "Teste do efeito fantasma: deixe a porta aberta pela metade e veja se permanece parada. Teste abertura/fechamento, maçaneta, dobradiças e trinco (deve fechar 100%). Verifique ruídos, raspas, dificuldade no fechamento e chaves. Use espelho para verificar acabamentos em cima e embaixo da porta.",
  atencao: "Portas devem estar BEM INSTALADAS, APRUMADAS, FUNCIONANDO SEM FOLGAS OU DIFICULDADES, REGULADAS, NIVELADAS, com maçaneta e dobradiças funcionando e ausência do efeito fantasma.",
};

const BATH_PINTURA: ChecklistItemTemplate = {
  id: "bath_pintura",
  title: "Pintura",
  orientacoes: [
    "Ausência de ACÚMULOS DE MASSA.",
    "Se for textura, sem TRECHOS LISOS ou PULVERULENTOS.",
    "Ausência de FALHAS, MANCHAS, SUJEIRAS, BOLHAS, DIFERENÇA DE TONALIDADE/BRILHO, MARCAS DE PINCEL, RESPINGOS/ESCORRIMENTO ou MOFO.",
    "Verifique ondulações ou deformações na pintura.",
  ],
  teste: "Tenha em mãos uma lanterna para uma verificação mais precisa.",
  atencao: "Atenção a possíveis trincas ou fissuras na parede.",
};

const BATH_PORTA_ALUMINIO: ChecklistItemTemplate = {
  id: "bath_porta_aluminio",
  title: "Esquadrias - Portas de alumínio",
  orientacoes: [
    "Verifique o alinhamento das portas (abra, feche e observe).",
    "Portas devem abrir e fechar sem ruído e sem dificuldade.",
    "Sem portas com risco, trincas ou vidros quebrados.",
    "Todos os componentes instalados.",
    "Sem ponto de oxidação.",
    "Sem vidros quebrados.",
    "Borrachas dos vidros instaladas.",
    "Fechadura funcionando corretamente.",
    "Soleira fixada sem trincas, manchas ou imperfeições.",
  ],
  teste: "Abra e feche para testar maçaneta e dobradiças. Trinco deve fechar 100%. Verifique ruídos, raspas, dificuldade no fechamento e chaves.",
  atencao: "Portas devem estar BEM INSTALADAS, APRUMADAS, FUNCIONANDO SEM FOLGAS OU DIFICULDADES, REGULADAS, NIVELADAS, com maçaneta e dobradiças funcionando.",
};

const BATH_INSTALACOES: ChecklistItemTemplate = {
  id: "bath_instalacoes",
  title: "Instalações sanitárias",
  orientacoes: [
    "Verificar se há VAZAMENTOS e ENTUPIMENTOS (dentro do shaft e sanca).",
    "Esgoto com ESCOAMENTO FLUIDO, sem manchas de infiltração.",
    "Sifão limpo e encaixado.",
    "Sem fissuras ou trincas.",
    "Registros identificados (água quente e fria) com o local de alimentação de cada um.",
  ],
  teste: "Movimente o sifão e verifique a fixação. Passe a mão em todas as conexões para checar vazamento. Coloque o tampão na pia, abra todas as torneiras, e ao abrir o tampão verifique se há vazamento — a pressão da água ajuda a identificar melhor.",
};

const BATH_SOLEIRA: ChecklistItemTemplate = {
  id: "bath_soleira",
  title: "Soleira / Baguete",
  orientacoes: [
    "Verifique se está aderido à superfície colada.",
    "Sem RISCOS, TRINCAS, QUEBRAS ou IMPERFEIÇÕES.",
    "JUNTAS PREENCHIDAS E LISAS, sem manchas.",
  ],
  teste: "Tente mover com a mão para verificar se está bem fixado.",
};

const BATH_VENTILACAO: ChecklistItemTemplate = {
  id: "bath_ventilacao",
  title: "Ventilação forçada",
  orientacoes: [
    "Confira se os exaustores estão funcionando corretamente.",
    "Verifique se o acabamento do ventokit está alinhado e sem riscos.",
  ],
  teste: "Assim que iniciar a vistoria deixe-o ligado e, após alguns minutos, verifique se está funcionando corretamente.",
};

const BATH_LIMPEZA: ChecklistItemTemplate = {
  id: "bath_limpeza",
  title: "Limpeza",
  orientacoes: [
    "Observe MATERIAIS NÃO DESMOBILIZADOS, RESÍDUOS, ACÚMULOS DE SUJEIRAS.",
    "Verifique manchas de tinta no piso por falta de limpeza.",
  ],
  atencao: "Item aparentemente simples, mas a sujeira cobre muitas imperfeições. O cliente precisa receber o imóvel NOVO, não sujo.",
};

const BATH_GERAL: ChecklistItemTemplate = {
  id: "bath_geral",
  title: "GERAL (Dimensões)",
  orientacoes: [
    "Verifique se as dimensões estão de acordo com o projeto aprovado.",
  ],
  teste: "Utilize uma trena, preferencialmente a laser.",
};

// ============ ROOM TEMPLATES ============
export const ROOM_TEMPLATES: Record<string, RoomTemplate> = {
  SALA: {
    id: "sala",
    name: "Sala",
    items: [TOMADAS, ELETRICA, PAREDES, TETO, PISO_CONTRA, PISO_CERAMICA, PORTA_MADEIRA, PORTA_ALUMINIO, JANELAS, PEITORIL, RODAPE, SOLEIRAS, PINTURA, LIMPEZA, GERAL],
  },
  COZINHA: {
    id: "cozinha",
    name: "Cozinha e Área de Serviço",
    items: [TOMADAS, PAREDES, TETO, LOUCAS, PIA, RALO, PISO_CERAMICA, JANELAS, PORTA_MADEIRA, PORTA_ALUMINIO, PEITORIL, PINTURA, HIDRAULICA, SOLEIRAS, VENTILACAO, INTERFONE, LIMPEZA, GERAL],
  },
  BANHEIRO: {
    id: "banheiro",
    name: "Banheiro",
    items: [
      BATH_TOMADAS,
      BATH_PAREDES,
      BATH_TETO,
      BATH_LOUCAS,
      BATH_PIA,
      BATH_RALO,
      BATH_JANELAS,
      BATH_PEITORIL,
      BATH_PISO,
      BATH_PORTA_MADEIRA,
      BATH_PINTURA,
      BATH_PORTA_ALUMINIO,
      BATH_INSTALACOES,
      BATH_SOLEIRA,
      BATH_VENTILACAO,
      BATH_LIMPEZA,
      BATH_GERAL,
    ],
  },
  QUARTO: {
    id: "quarto",
    name: "Quarto",
    items: [TOMADAS, ELETRICA, PAREDES, TETO, PISO_CERAMICA, PORTA_MADEIRA, JANELAS, PEITORIL, RODAPE, SOLEIRAS, PINTURA, LIMPEZA, GERAL],
  },
  AREA_EXTERNA: {
    id: "area_externa",
    name: "Área Externa / Varanda",
    items: [TOMADAS, PAREDES, TETO, PISO_CERAMICA, PORTA_ALUMINIO, JANELAS, PEITORIL, PINTURA, RALO, LIMPEZA, GERAL],
  },
};

export function detectTemplate(name: string): RoomTemplate {
  const upper = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  // Bathrooms first — includes banheiro, lavabo, wc, sanitario
  const isBathroom = /(BANHEIRO|LAVABO|\bWC\b|SANITARIO)/.test(upper);
  if (isBathroom) return ROOM_TEMPLATES.BANHEIRO;

  if (upper.includes("COZINHA") || upper.includes("SERVICO")) return ROOM_TEMPLATES.COZINHA;
  if (upper.includes("QUARTO") || upper.includes("DORMIT") || upper.includes("SUITE")) return ROOM_TEMPLATES.QUARTO;
  if (upper.includes("VARANDA") || upper.includes("EXTERNA") || upper.includes("SACADA") || upper.includes("GARDEN")) return ROOM_TEMPLATES.AREA_EXTERNA;
  return ROOM_TEMPLATES.SALA;
}

export const DEFAULT_ROOMS = [
  "Sala",
  "Cozinha e Área de Serviço",
  "Banheiro",
  "Quarto Principal",
  "Quarto Secundário",
  "Área Externa / Varanda",
];
