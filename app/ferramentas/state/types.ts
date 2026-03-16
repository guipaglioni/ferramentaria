export type ToolUnitStatus = "disponivel" | "reservada" | "emprestada" | "manutencao";

export type MovementType =
  | "reserva"
  | "retirada"
  | "devolucao"
  | "transferencia_solicitada"
  | "transferencia_aceita"
  | "transferencia_recusada"
  | "cancelamento_reserva";

export interface Ferramenteiro {
  id: string;
  nome: string;
}

export interface ToolModel {
  id: string;
  codigoBase: string;
  nome: string;
  categoria: string;
  fabricante: string;
  localPadrao: string;
  estoqueMinimo: number;
  observacoes: string;
  ativo: boolean;
  createdAt: number;
}

export interface ToolUnit {
  id: string;
  toolModelId: string;
  codigoUnico: string;
  status: ToolUnitStatus;
  holderUserId: string | null;
  reservedForUserId: string | null;
  ultimaMovimentacaoEm: number;
  createdAt: number;
  updatedAt: number;
}

export interface ToolMovement {
  id: string;
  toolUnitId: string;
  toolModelId: string;
  tipo: MovementType;
  deUserId: string | null;
  paraUserId: string | null;
  status: "pendente" | "concluido" | "recusado";
  observacao: string;
  solicitadoEm: number;
  respondidoEm: number | null;
}

export interface TransferRequest {
  id: string;
  toolUnitId: string;
  fromUserId: string;
  toUserId: string;
  status: "pendente" | "aceita" | "recusada";
  observacao: string;
  requestedAt: number;
  respondedAt: number | null;
}
