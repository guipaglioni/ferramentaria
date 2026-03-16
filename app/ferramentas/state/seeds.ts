import type { Ferramenteiro, ToolModel, ToolUnit, TransferRequest, ToolMovement } from "./types";

const now = Date.now();

export const seedUsers: Ferramenteiro[] = [
  { id: "user-joao", nome: "Joao" },
  { id: "user-maria", nome: "Maria" },
  { id: "user-carlos", nome: "Carlos" },
  { id: "user-ana", nome: "Ana" },
];

export const seedModels: ToolModel[] = [
  {
    id: "model-paquimetro",
    codigoBase: "FR-PAQ-001",
    nome: "Paquimetro Digital",
    categoria: "Medicao",
    fabricante: "Mitutoyo",
    localPadrao: "Armario A1",
    estoqueMinimo: 2,
    observacoes: "Uso controlado para medicao de precisao.",
    ativo: true,
    createdAt: now,
  },
  {
    id: "model-micrometro",
    codigoBase: "FR-MIC-002",
    nome: "Micrometro Externo",
    categoria: "Medicao",
    fabricante: "Starrett",
    localPadrao: "Armario A2",
    estoqueMinimo: 1,
    observacoes: "Evitar impacto durante movimentacao.",
    ativo: true,
    createdAt: now,
  },
];

export const seedUnits: ToolUnit[] = [
  {
    id: "unit-paq-01",
    toolModelId: "model-paquimetro",
    codigoUnico: "FR-PAQ-001-U01",
    status: "disponivel",
    holderUserId: null,
    reservedForUserId: null,
    ultimaMovimentacaoEm: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "unit-paq-02",
    toolModelId: "model-paquimetro",
    codigoUnico: "FR-PAQ-001-U02",
    status: "reservada",
    holderUserId: null,
    reservedForUserId: "user-joao",
    ultimaMovimentacaoEm: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "unit-mic-01",
    toolModelId: "model-micrometro",
    codigoUnico: "FR-MIC-002-U01",
    status: "emprestada",
    holderUserId: "user-maria",
    reservedForUserId: null,
    ultimaMovimentacaoEm: now,
    createdAt: now,
    updatedAt: now,
  },
];

export const seedMovements: ToolMovement[] = [];
export const seedTransferRequests: TransferRequest[] = [];
