"use client";

import * as React from "react";
import Box from "@mui/system/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ReplayIcon from "@mui/icons-material/Replay";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import Inventory2Icon from "@mui/icons-material/Inventory2";

import { readList, writeList } from "./state/storage";
import { seedModels, seedMovements, seedTransferRequests, seedUnits, seedUsers } from "./state/seeds";
import type { Ferramenteiro, ToolModel, ToolMovement, ToolUnit, TransferRequest } from "./state/types";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString("pt-BR");
}

function statusLabel(status: ToolUnit["status"]): string {
  if (status === "disponivel") return "Disponivel";
  if (status === "reservada") return "Reservada";
  if (status === "emprestada") return "Emprestada";
  return "Manutencao";
}

function movementLabel(tipo: ToolMovement["tipo"]): string {
  const labels: Record<ToolMovement["tipo"], string> = {
    reserva: "Reserva",
    retirada: "Retirada",
    devolucao: "Devolucao",
    transferencia_solicitada: "Transferencia solicitada",
    transferencia_aceita: "Transferencia aceita",
    transferencia_recusada: "Transferencia recusada",
    cancelamento_reserva: "Cancelamento de reserva",
  };
  return labels[tipo];
}

export default function FerramentasPage() {
  const [users, setUsers] = React.useState<Ferramenteiro[]>([]);
  const [models, setModels] = React.useState<ToolModel[]>([]);
  const [units, setUnits] = React.useState<ToolUnit[]>([]);
  const [movements, setMovements] = React.useState<ToolMovement[]>([]);
  const [transferRequests, setTransferRequests] = React.useState<TransferRequest[]>([]);

  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"estoque" | "pendencias" | "historico">("estoque");

  const [viewerUserId, setViewerUserId] = React.useState("");

  const [modelDialogOpen, setModelDialogOpen] = React.useState(false);
  const [newModel, setNewModel] = React.useState({
    codigoBase: "",
    nome: "",
    categoria: "",
    fabricante: "",
    localPadrao: "",
    estoqueMinimo: "0",
    observacoes: "",
  });

  const [unitDialogOpen, setUnitDialogOpen] = React.useState(false);
  const [unitModelId, setUnitModelId] = React.useState("");
  const [unitQty, setUnitQty] = React.useState("1");

  const [reserveDialogOpen, setReserveDialogOpen] = React.useState(false);
  const [reserveUnitId, setReserveUnitId] = React.useState("");
  const [reserveUserId, setReserveUserId] = React.useState("");
  const [reserveObs, setReserveObs] = React.useState("");

  const [withdrawDialogOpen, setWithdrawDialogOpen] = React.useState(false);
  const [withdrawUnitId, setWithdrawUnitId] = React.useState("");
  const [withdrawUserId, setWithdrawUserId] = React.useState("");
  const [withdrawObs, setWithdrawObs] = React.useState("");

  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [transferUnitId, setTransferUnitId] = React.useState("");
  const [transferFromUserId, setTransferFromUserId] = React.useState("");
  const [transferToUserId, setTransferToUserId] = React.useState("");
  const [transferObs, setTransferObs] = React.useState("");

  const [historyStartDate, setHistoryStartDate] = React.useState("");
  const [historyEndDate, setHistoryEndDate] = React.useState("");
  const [historyUserFilter, setHistoryUserFilter] = React.useState("");
  const [historyUnitCodeFilter, setHistoryUnitCodeFilter] = React.useState("");
  const [historyTypeFilter, setHistoryTypeFilter] = React.useState("");

  React.useEffect(() => {
    const loadedUsers = readList<Ferramenteiro>("users");
    const loadedModels = readList<ToolModel>("models");
    const loadedUnits = readList<ToolUnit>("units");
    const loadedMovements = readList<ToolMovement>("movements");
    const loadedTransfers = readList<TransferRequest>("transferRequests");

    const finalUsers = loadedUsers.length ? loadedUsers : seedUsers;
    const finalModels = loadedModels.length ? loadedModels : seedModels;
    const finalUnits = loadedUnits.length ? loadedUnits : seedUnits;
    const finalMovements = loadedMovements.length ? loadedMovements : seedMovements;
    const finalTransfers = loadedTransfers.length ? loadedTransfers : seedTransferRequests;

    setUsers(finalUsers);
    setModels(finalModels);
    setUnits(finalUnits);
    setMovements(finalMovements);
    setTransferRequests(finalTransfers);

    setViewerUserId(finalUsers[0]?.id || "");
    setReserveUserId(finalUsers[0]?.id || "");
    setWithdrawUserId(finalUsers[0]?.id || "");
    setTransferToUserId(finalUsers[0]?.id || "");

    if (!loadedUsers.length) writeList("users", finalUsers);
    if (!loadedModels.length) writeList("models", finalModels);
    if (!loadedUnits.length) writeList("units", finalUnits);
    if (!loadedMovements.length) writeList("movements", finalMovements);
    if (!loadedTransfers.length) writeList("transferRequests", finalTransfers);
  }, []);

  const userNameById = React.useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => {
      map[u.id] = u.nome;
    });
    return map;
  }, [users]);

  const modelById = React.useMemo(() => {
    const map: Record<string, ToolModel> = {};
    models.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [models]);

  const unitById = React.useMemo(() => {
    const map: Record<string, ToolUnit> = {};
    units.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [units]);

  const filteredModels = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return models;
    return models.filter((m) => {
      return (
        m.nome.toLowerCase().includes(q) ||
        m.codigoBase.toLowerCase().includes(q) ||
        m.categoria.toLowerCase().includes(q)
      );
    });
  }, [models, query]);

  const modelStats = React.useMemo(() => {
    const map: Record<string, { total: number; disponivel: number; reservada: number; emprestada: number; manutencao: number }> = {};
    for (const m of models) {
      map[m.id] = { total: 0, disponivel: 0, reservada: 0, emprestada: 0, manutencao: 0 };
    }
    for (const u of units) {
      if (!map[u.toolModelId]) continue;
      map[u.toolModelId].total += 1;
      map[u.toolModelId][u.status] += 1;
    }
    return map;
  }, [models, units]);

  const pendingForViewer = React.useMemo(() => {
    if (!viewerUserId) return [];
    return transferRequests.filter((r) => r.toUserId === viewerUserId && r.status === "pendente");
  }, [transferRequests, viewerUserId]);

  const historyItems = React.useMemo(() => {
    const sorted = [...movements].sort((a, b) => b.solicitadoEm - a.solicitadoEm);

    const startTs = historyStartDate ? new Date(`${historyStartDate}T00:00:00`).getTime() : -Infinity;
    const endTs = historyEndDate ? new Date(`${historyEndDate}T23:59:59`).getTime() : Infinity;

    return sorted.filter((item) => {
      if (item.solicitadoEm < startTs || item.solicitadoEm > endTs) return false;

      if (historyTypeFilter && item.tipo !== historyTypeFilter) return false;

      if (historyUserFilter) {
        const involvesUser = item.deUserId === historyUserFilter || item.paraUserId === historyUserFilter;
        if (!involvesUser) return false;
      }

      if (historyUnitCodeFilter.trim()) {
        const unit = unitById[item.toolUnitId];
        const unitCode = unit?.codigoUnico?.toLowerCase() || "";
        if (!unitCode.includes(historyUnitCodeFilter.toLowerCase().trim())) return false;
      }

      return true;
    });
  }, [
    movements,
    historyStartDate,
    historyEndDate,
    historyTypeFilter,
    historyUserFilter,
    historyUnitCodeFilter,
    unitById,
  ]);

  function persistUnits(next: ToolUnit[]): void {
    setUnits(next);
    writeList("units", next);
  }

  function persistModels(next: ToolModel[]): void {
    setModels(next);
    writeList("models", next);
  }

  function persistMovements(next: ToolMovement[]): void {
    setMovements(next);
    writeList("movements", next);
  }

  function persistTransferRequests(next: TransferRequest[]): void {
    setTransferRequests(next);
    writeList("transferRequests", next);
  }

  function pushMovement(item: Omit<ToolMovement, "id">): void {
    const movement: ToolMovement = {
      ...item,
      id: makeId("mov"),
    };
    persistMovements([...movements, movement]);
  }

  function handleCreateModel(): void {
    if (!newModel.nome.trim() || !newModel.codigoBase.trim()) return;

    const model: ToolModel = {
      id: makeId("model"),
      codigoBase: newModel.codigoBase.trim().toUpperCase(),
      nome: newModel.nome.trim(),
      categoria: newModel.categoria.trim() || "Geral",
      fabricante: newModel.fabricante.trim(),
      localPadrao: newModel.localPadrao.trim(),
      estoqueMinimo: Number(newModel.estoqueMinimo) || 0,
      observacoes: newModel.observacoes.trim(),
      ativo: true,
      createdAt: Date.now(),
    };

    persistModels([...models, model]);
    setModelDialogOpen(false);
    setNewModel({
      codigoBase: "",
      nome: "",
      categoria: "",
      fabricante: "",
      localPadrao: "",
      estoqueMinimo: "0",
      observacoes: "",
    });
  }

  function openGenerateUnits(modelId: string): void {
    setUnitModelId(modelId);
    setUnitQty("1");
    setUnitDialogOpen(true);
  }

  function handleGenerateUnits(): void {
    const model = modelById[unitModelId];
    const qty = Number(unitQty);
    if (!model || !qty || qty < 1) return;

    const modelUnits = units.filter((u) => u.toolModelId === model.id);
    let seq = modelUnits.length;

    const now = Date.now();
    const created: ToolUnit[] = [];

    for (let i = 0; i < qty; i += 1) {
      seq += 1;
      const unitCode = `${model.codigoBase}-U${String(seq).padStart(2, "0")}`;
      created.push({
        id: makeId("unit"),
        toolModelId: model.id,
        codigoUnico: unitCode,
        status: "disponivel",
        holderUserId: null,
        reservedForUserId: null,
        ultimaMovimentacaoEm: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    persistUnits([...units, ...created]);
    setUnitDialogOpen(false);
  }

  function openReserve(unitId: string): void {
    setReserveUnitId(unitId);
    setReserveUserId(users[0]?.id || "");
    setReserveObs("");
    setReserveDialogOpen(true);
  }

  function handleReserve(): void {
    const unit = unitById[reserveUnitId];
    if (!unit || !reserveUserId) return;
    if (unit.status !== "disponivel") {
      alert("Apenas unidades disponiveis podem ser reservadas.");
      return;
    }

    const now = Date.now();
    const nextUnits = units.map((u) => {
      if (u.id !== unit.id) return u;
      return {
        ...u,
        status: "reservada" as const,
        reservedForUserId: reserveUserId,
        updatedAt: now,
        ultimaMovimentacaoEm: now,
      };
    });

    persistUnits(nextUnits);
    pushMovement({
      toolUnitId: unit.id,
      toolModelId: unit.toolModelId,
      tipo: "reserva",
      deUserId: null,
      paraUserId: reserveUserId,
      status: "concluido",
      observacao: reserveObs.trim(),
      solicitadoEm: now,
      respondidoEm: now,
    });

    setReserveDialogOpen(false);
  }

  function cancelReserve(unit: ToolUnit): void {
    if (unit.status !== "reservada") return;

    const now = Date.now();
    const nextUnits = units.map((u) => {
      if (u.id !== unit.id) return u;
      return {
        ...u,
        status: "disponivel" as const,
        reservedForUserId: null,
        updatedAt: now,
        ultimaMovimentacaoEm: now,
      };
    });

    persistUnits(nextUnits);
    pushMovement({
      toolUnitId: unit.id,
      toolModelId: unit.toolModelId,
      tipo: "cancelamento_reserva",
      deUserId: unit.reservedForUserId,
      paraUserId: null,
      status: "concluido",
      observacao: "Reserva cancelada",
      solicitadoEm: now,
      respondidoEm: now,
    });
  }

  function openWithdraw(unitId: string): void {
    setWithdrawUnitId(unitId);
    setWithdrawUserId(users[0]?.id || "");
    setWithdrawObs("");
    setWithdrawDialogOpen(true);
  }

  function handleWithdraw(): void {
    const unit = unitById[withdrawUnitId];
    if (!unit || !withdrawUserId) return;

    if (unit.status === "manutencao" || unit.status === "emprestada") {
      alert("Nao e possivel retirar esta unidade no status atual.");
      return;
    }

    if (unit.status === "reservada" && unit.reservedForUserId !== withdrawUserId) {
      alert("Esta unidade esta reservada para outro ferramenteiro.");
      return;
    }

    const now = Date.now();
    const nextUnits = units.map((u) => {
      if (u.id !== unit.id) return u;
      return {
        ...u,
        status: "emprestada" as const,
        holderUserId: withdrawUserId,
        reservedForUserId: null,
        updatedAt: now,
        ultimaMovimentacaoEm: now,
      };
    });

    persistUnits(nextUnits);
    pushMovement({
      toolUnitId: unit.id,
      toolModelId: unit.toolModelId,
      tipo: "retirada",
      deUserId: null,
      paraUserId: withdrawUserId,
      status: "concluido",
      observacao: withdrawObs.trim(),
      solicitadoEm: now,
      respondidoEm: now,
    });

    setWithdrawDialogOpen(false);
  }

  function handleReturn(unit: ToolUnit): void {
    if (unit.status !== "emprestada") return;

    const now = Date.now();
    const nextUnits = units.map((u) => {
      if (u.id !== unit.id) return u;
      return {
        ...u,
        status: "disponivel" as const,
        holderUserId: null,
        updatedAt: now,
        ultimaMovimentacaoEm: now,
      };
    });

    persistUnits(nextUnits);
    pushMovement({
      toolUnitId: unit.id,
      toolModelId: unit.toolModelId,
      tipo: "devolucao",
      deUserId: unit.holderUserId,
      paraUserId: null,
      status: "concluido",
      observacao: "Devolucao ao estoque",
      solicitadoEm: now,
      respondidoEm: now,
    });
  }

  function openTransfer(unit: ToolUnit): void {
    if (!unit.holderUserId) return;
    setTransferUnitId(unit.id);
    setTransferFromUserId(unit.holderUserId);
    const firstDifferent = users.find((u) => u.id !== unit.holderUserId);
    setTransferToUserId(firstDifferent?.id || "");
    setTransferObs("");
    setTransferDialogOpen(true);
  }

  function handleTransferRequest(): void {
    const unit = unitById[transferUnitId];
    if (!unit || !transferFromUserId || !transferToUserId) return;

    if (transferFromUserId === transferToUserId) {
      alert("Nao e permitido transferir para o mesmo ferramenteiro.");
      return;
    }

    if (unit.status !== "emprestada" || unit.holderUserId !== transferFromUserId) {
      alert("A unidade precisa estar emprestada para o usuario de origem.");
      return;
    }

    const hasPending = transferRequests.some(
      (r) => r.toolUnitId === unit.id && r.status === "pendente"
    );
    if (hasPending) {
      alert("Ja existe solicitacao pendente para esta unidade.");
      return;
    }

    const now = Date.now();
    const request: TransferRequest = {
      id: makeId("trf"),
      toolUnitId: unit.id,
      fromUserId: transferFromUserId,
      toUserId: transferToUserId,
      status: "pendente",
      observacao: transferObs.trim(),
      requestedAt: now,
      respondedAt: null,
    };

    persistTransferRequests([...transferRequests, request]);
    pushMovement({
      toolUnitId: unit.id,
      toolModelId: unit.toolModelId,
      tipo: "transferencia_solicitada",
      deUserId: transferFromUserId,
      paraUserId: transferToUserId,
      status: "pendente",
      observacao: transferObs.trim(),
      solicitadoEm: now,
      respondidoEm: null,
    });

    setTransferDialogOpen(false);
  }

  function handleTransferDecision(request: TransferRequest, decision: "aceita" | "recusada"): void {
    if (request.status !== "pendente") {
      alert("Solicitacao ja foi respondida.");
      return;
    }

    const unit = unitById[request.toolUnitId];
    if (!unit) return;

    const now = Date.now();

    const nextRequests = transferRequests.map((r) => {
      if (r.id !== request.id) return r;
      return { ...r, status: decision, respondedAt: now };
    });
    persistTransferRequests(nextRequests);

    if (decision === "aceita") {
      const nextUnits = units.map((u) => {
        if (u.id !== request.toolUnitId) return u;
        return {
          ...u,
          holderUserId: request.toUserId,
          status: "emprestada" as const,
          updatedAt: now,
          ultimaMovimentacaoEm: now,
        };
      });
      persistUnits(nextUnits);
    }

    pushMovement({
      toolUnitId: request.toolUnitId,
      toolModelId: unit.toolModelId,
      tipo: decision === "aceita" ? "transferencia_aceita" : "transferencia_recusada",
      deUserId: request.fromUserId,
      paraUserId: request.toUserId,
      status: decision === "aceita" ? "concluido" : "recusado",
      observacao: request.observacao,
      solicitadoEm: request.requestedAt,
      respondidoEm: now,
    });
  }

  function hardResetSeeds(): void {
    persistModels(seedModels);
    persistUnits(seedUnits);
    persistMovements(seedMovements);
    persistTransferRequests(seedTransferRequests);
    writeList("users", seedUsers);
    setUsers(seedUsers);
    setViewerUserId(seedUsers[0]?.id || "");
  }

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, sm: 4 }, background: "#f7fafc" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 2, flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
        <Typography variant="h4" sx={{ color: "#0b1220", fontWeight: 700 }}>
          Modulo de Ferramentas
        </Typography>
        <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
          <Button variant="outlined" startIcon={<ReplayIcon />} onClick={hardResetSeeds} sx={{ width: { xs: "100%", sm: "auto" } }}>
            Resetar dados
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModelDialogOpen(true)} sx={{ width: { xs: "100%", sm: "auto" } }}>
            Nova ferramenta
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Button variant={activeTab === "estoque" ? "contained" : "outlined"} onClick={() => setActiveTab("estoque")}>Estoque</Button>
        <Button variant={activeTab === "pendencias" ? "contained" : "outlined"} onClick={() => setActiveTab("pendencias")}>Transferencias pendentes</Button>
        <Button variant={activeTab === "historico" ? "contained" : "outlined"} onClick={() => setActiveTab("historico")}>Historico</Button>
      </Box>

      {activeTab === "estoque" && (
        <>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nome, codigo ou categoria"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredModels.map((model) => {
              const stats = modelStats[model.id] || {
                total: 0,
                disponivel: 0,
                reservada: 0,
                emprestada: 0,
                manutencao: 0,
              };
              const modelUnits = units.filter((u) => u.toolModelId === model.id);

              return (
                <Card key={model.id}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0b1220" }}>
                          {model.nome}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#475569" }}>
                          Codigo base: {model.codigoBase} | Categoria: {model.categoria} | Local: {model.localPadrao || "Nao informado"}
                        </Typography>
                        {model.observacoes && (
                          <Typography variant="body2" sx={{ color: "#334155", mt: 1 }}>
                            {model.observacoes}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignContent: "flex-start" }}>
                        <Chip label={`Total: ${stats.total}`} />
                        <Chip label={`Disponivel: ${stats.disponivel}`} color="success" variant="outlined" />
                        <Chip label={`Reservada: ${stats.reservada}`} color="warning" variant="outlined" />
                        <Chip label={`Emprestada: ${stats.emprestada}`} color="info" variant="outlined" />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {modelUnits.length === 0 ? (
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        Nenhuma unidade cadastrada para esta ferramenta.
                      </Typography>
                    ) : (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {modelUnits.map((unit) => (
                          <Box key={unit.id} sx={{ border: "1px solid #e2e8f0", borderRadius: 1, p: 1.5 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                              <Box>
                                <Typography sx={{ fontWeight: 700 }}>{unit.codigoUnico}</Typography>
                                <Typography variant="body2" sx={{ color: "#475569" }}>
                                  Status: {statusLabel(unit.status)}
                                  {unit.holderUserId ? ` | Com: ${userNameById[unit.holderUserId] || unit.holderUserId}` : ""}
                                  {unit.reservedForUserId ? ` | Reservada para: ${userNameById[unit.reservedForUserId] || unit.reservedForUserId}` : ""}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#64748b" }}>
                                  Ultima movimentacao: {formatDate(unit.ultimaMovimentacaoEm)}
                                </Typography>
                              </Box>

                              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                {unit.status === "disponivel" && (
                                  <Button size="small" variant="outlined" onClick={() => openReserve(unit.id)}>
                                    Reservar
                                  </Button>
                                )}

                                {(unit.status === "disponivel" || unit.status === "reservada") && (
                                  <Button size="small" variant="contained" onClick={() => openWithdraw(unit.id)}>
                                    Retirar
                                  </Button>
                                )}

                                {unit.status === "reservada" && (
                                  <Button size="small" variant="outlined" color="error" onClick={() => cancelReserve(unit)}>
                                    Cancelar reserva
                                  </Button>
                                )}

                                {unit.status === "emprestada" && (
                                  <Button size="small" variant="outlined" color="success" onClick={() => handleReturn(unit)}>
                                    Devolver
                                  </Button>
                                )}

                                {unit.status === "emprestada" && (
                                  <Button size="small" variant="outlined" startIcon={<CompareArrowsIcon />} onClick={() => openTransfer(unit)}>
                                    Transferir
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                    <Button startIcon={<Inventory2Icon />} onClick={() => openGenerateUnits(model.id)}>
                      Gerar unidades
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </Box>
        </>
      )}

      {activeTab === "pendencias" && (
        <Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
            <Typography variant="h6" sx={{ color: "#0b1220" }}>Caixa de aceite</Typography>
            <TextField
              select
              size="small"
              label="Ferramenteiro destino"
              value={viewerUserId}
              onChange={(e) => setViewerUserId(e.target.value)}
              sx={{ minWidth: 260 }}
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.nome}</MenuItem>
              ))}
            </TextField>
          </Box>

          {pendingForViewer.length === 0 ? (
            <Typography>Nao ha transferencias pendentes para este usuario.</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {pendingForViewer.map((request) => {
                const unit = unitById[request.toolUnitId];
                const model = unit ? modelById[unit.toolModelId] : null;
                return (
                  <Card key={request.id}>
                    <CardContent>
                      <Typography sx={{ fontWeight: 700 }}>
                        {unit?.codigoUnico || "Unidade removida"} - {model?.nome || "Ferramenta"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#334155", mt: 1 }}>
                        De: {userNameById[request.fromUserId] || request.fromUserId} | Para: {userNameById[request.toUserId] || request.toUserId}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                        Solicitado em: {formatDate(request.requestedAt)}
                      </Typography>
                      {request.observacao && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Observacao: {request.observacao}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2, gap: 1 }}>
                      <Button color="error" variant="outlined" onClick={() => handleTransferDecision(request, "recusada")}>Recusar</Button>
                      <Button color="success" variant="contained" onClick={() => handleTransferDecision(request, "aceita")}>Aceitar</Button>
                    </CardActions>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {activeTab === "historico" && (
        <Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
            <TextField
              label="Data inicio"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={historyStartDate}
              onChange={(e) => setHistoryStartDate(e.target.value)}
            />
            <TextField
              label="Data fim"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={historyEndDate}
              onChange={(e) => setHistoryEndDate(e.target.value)}
            />
            <TextField
              select
              size="small"
              label="Usuario"
              value={historyUserFilter}
              onChange={(e) => setHistoryUserFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.nome}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Tipo"
              value={historyTypeFilter}
              onChange={(e) => setHistoryTypeFilter(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="reserva">Reserva</MenuItem>
              <MenuItem value="retirada">Retirada</MenuItem>
              <MenuItem value="devolucao">Devolucao</MenuItem>
              <MenuItem value="transferencia_solicitada">Transferencia solicitada</MenuItem>
              <MenuItem value="transferencia_aceita">Transferencia aceita</MenuItem>
              <MenuItem value="transferencia_recusada">Transferencia recusada</MenuItem>
              <MenuItem value="cancelamento_reserva">Cancelamento de reserva</MenuItem>
            </TextField>
            <TextField
              size="small"
              label="Codigo da unidade"
              value={historyUnitCodeFilter}
              onChange={(e) => setHistoryUnitCodeFilter(e.target.value)}
            />
            <Button onClick={() => {
              setHistoryStartDate("");
              setHistoryEndDate("");
              setHistoryUserFilter("");
              setHistoryTypeFilter("");
              setHistoryUnitCodeFilter("");
            }}>
              Limpar filtros
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: "#475569", mb: 2 }}>
            {historyItems.length} eventos
          </Typography>

          {historyItems.length === 0 ? (
            <Typography>Nenhum evento encontrado para os filtros aplicados.</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {historyItems.map((item) => {
                const unit = unitById[item.toolUnitId];
                const model = modelById[item.toolModelId];
                return (
                  <Card key={item.id}>
                    <CardContent>
                      <Typography sx={{ fontWeight: 700 }}>
                        {movementLabel(item.tipo)} - {unit?.codigoUnico || "Unidade"} - {model?.nome || "Ferramenta"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#334155", mt: 0.5 }}>
                        De: {item.deUserId ? userNameById[item.deUserId] || item.deUserId : "-"} | Para: {item.paraUserId ? userNameById[item.paraUserId] || item.paraUserId : "-"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                        Solicitado em: {formatDate(item.solicitadoEm)}
                        {item.respondidoEm ? ` | Respondido em: ${formatDate(item.respondidoEm)}` : ""}
                      </Typography>
                      {item.observacao && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Observacao: {item.observacao}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      <Dialog open={modelDialogOpen} onClose={() => setModelDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Cadastrar ferramenta</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Codigo base" value={newModel.codigoBase} onChange={(e) => setNewModel((p) => ({ ...p, codigoBase: e.target.value }))} required />
            <TextField label="Nome" value={newModel.nome} onChange={(e) => setNewModel((p) => ({ ...p, nome: e.target.value }))} required />
            <TextField label="Categoria" value={newModel.categoria} onChange={(e) => setNewModel((p) => ({ ...p, categoria: e.target.value }))} />
            <TextField label="Fabricante/Marca" value={newModel.fabricante} onChange={(e) => setNewModel((p) => ({ ...p, fabricante: e.target.value }))} />
            <TextField label="Local de armazenagem" value={newModel.localPadrao} onChange={(e) => setNewModel((p) => ({ ...p, localPadrao: e.target.value }))} />
            <TextField label="Estoque minimo" type="number" value={newModel.estoqueMinimo} onChange={(e) => setNewModel((p) => ({ ...p, estoqueMinimo: e.target.value }))} />
            <TextField label="Observacoes" multiline rows={3} value={newModel.observacoes} onChange={(e) => setNewModel((p) => ({ ...p, observacoes: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModelDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateModel} disabled={!newModel.codigoBase.trim() || !newModel.nome.trim()}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={unitDialogOpen} onClose={() => setUnitDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Gerar unidades</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              type="number"
              label="Quantidade"
              value={unitQty}
              onChange={(e) => setUnitQty(e.target.value)}
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnitDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleGenerateUnits}>Gerar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reserveDialogOpen} onClose={() => setReserveDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reservar unidade</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              select
              label="Ferramenteiro"
              value={reserveUserId}
              onChange={(e) => setReserveUserId(e.target.value)}
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.nome}</MenuItem>
              ))}
            </TextField>
            <TextField label="Observacao" value={reserveObs} onChange={(e) => setReserveObs(e.target.value)} multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReserveDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleReserve} disabled={!reserveUserId}>Reservar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={withdrawDialogOpen} onClose={() => setWithdrawDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Retirar unidade</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              select
              label="Usuario retirante"
              value={withdrawUserId}
              onChange={(e) => setWithdrawUserId(e.target.value)}
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.nome}</MenuItem>
              ))}
            </TextField>
            <TextField label="Observacao" value={withdrawObs} onChange={(e) => setWithdrawObs(e.target.value)} multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleWithdraw} disabled={!withdrawUserId}>Confirmar retirada</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Solicitar transferencia</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="De"
              value={userNameById[transferFromUserId] || ""}
              disabled
            />
            <TextField
              select
              label="Para"
              value={transferToUserId}
              onChange={(e) => setTransferToUserId(e.target.value)}
            >
              {users
                .filter((u) => u.id !== transferFromUserId)
                .map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.nome}</MenuItem>
                ))}
            </TextField>
            <TextField label="Observacao" value={transferObs} onChange={(e) => setTransferObs(e.target.value)} multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleTransferRequest} disabled={!transferToUserId}>Enviar solicitacao</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
