import type { ChecklistItemTemplate, RoomTemplate } from "./types";

// Standard items derived from the checklist PDF
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

// Room templates keyed by name pattern
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
    items: [TOMADAS, PAREDES, TETO, LOUCAS, PIA, RALO, PISO_CERAMICA, JANELAS, PORTA_MADEIRA, PINTURA, HIDRAULICA, SOLEIRAS, VENTILACAO, LIMPEZA, GERAL],
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
  const upper = name.toUpperCase();
  if (upper.includes("COZINHA") || upper.includes("SERVIÇO") || upper.includes("SERVICO")) return ROOM_TEMPLATES.COZINHA;
  if (upper.includes("BANHEIRO") || upper.includes("LAVABO") || upper.includes("SUÍTE") || upper.includes("SUITE")) {
    if (upper.includes("QUARTO") || upper.includes("SUÍTE") || upper.includes("SUITE")) return ROOM_TEMPLATES.QUARTO;
    return ROOM_TEMPLATES.BANHEIRO;
  }
  if (upper.includes("QUARTO") || upper.includes("DORMIT")) return ROOM_TEMPLATES.QUARTO;
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
