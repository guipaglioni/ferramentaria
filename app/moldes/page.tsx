"use client";

import * as React from "react";
// Drawer/sidebar handled by global layout
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import VideocamIcon from "@mui/icons-material/Videocam";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/system/Box";
import { useRouter } from "next/navigation";

const initialMoldes = [
  { id: 1, nome: "Molde A", descricao: "Descrição do Molde A" },
  { id: 2, nome: "Molde B", descricao: "Descrição do Molde B" },
  { id: 3, nome: "Molde C", descricao: "Descrição do Molde C" },
];

export default function MoldesPage() {
  const [moldes, setMoldes] = React.useState(initialMoldes);
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(
    () => moldes.filter((m) => m.nome.toLowerCase().includes(query.toLowerCase())),
    [query, moldes]
  );

  const [open, setOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewName("");
    setNewDesc("");
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const nextId = moldes.length ? Math.max(...moldes.map((m) => m.id)) + 1 : 1;
    setMoldes((prev) => [...prev, { id: nextId, nome: newName.trim(), descricao: newDesc.trim() }]);
    handleClose();
  };

  // chamados (em memória)
  const [chamados, setChamados] = React.useState([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("chamados");
      if (raw) setChamados(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  const [chamadoOpen, setChamadoOpen] = React.useState(false);
  const [selectedMolde, setSelectedMolde] = React.useState(null as any);
  const [chamadoFile, setChamadoFile] = React.useState<File | null>(null);
  const [chamadoPreview, setChamadoPreview] = React.useState<string | null>(null);
  const [chamadoComment, setChamadoComment] = React.useState("");
  const [chamadoMachine, setChamadoMachine] = React.useState("");
  const [chamadoInsumos, setChamadoInsumos] = React.useState("");
  const [chamadoDatetime, setChamadoDatetime] = React.useState("");

  const handleOpenChamado = (molde: any) => {
    setSelectedMolde(molde);
    setChamadoDatetime(new Date().toLocaleString());
    setChamadoComment("");
    setChamadoMachine("");
    setChamadoInsumos("");
    setChamadoFile(null);
    setChamadoPreview(null);
    setChamadoOpen(true);
  };

  const handleCloseChamado = () => {
    setChamadoOpen(false);
    setSelectedMolde(null);
    if (chamadoPreview) {
      URL.revokeObjectURL(chamadoPreview);
    }
    setChamadoPreview(null);
    setChamadoFile(null);
    setChamadoComment("");
    setChamadoMachine("");
    setChamadoInsumos("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (chamadoPreview) URL.revokeObjectURL(chamadoPreview);
    const url = URL.createObjectURL(f);
    setChamadoFile(f);
    setChamadoPreview(url);
  };

  const handleSubmitChamado = () => {
    if (!selectedMolde) return;
    const nextId = chamados.length ? Math.max(...chamados.map((c: any) => c.id)) + 1 : 1;
    const novo = {
      id: nextId,
      moldeId: selectedMolde.id,
      moldeNome: selectedMolde.nome,
      videoName: chamadoFile?.name || null,
      videoUrl: chamadoPreview,
      machineNumber: chamadoMachine || null,
      insumos: chamadoInsumos || null,
      datetime: chamadoDatetime || new Date().toLocaleString(),
      timestamp: Date.now(),
      comment: chamadoComment,
    };
    const updated = [...chamados, novo];
    setChamados(updated);
    try {
      localStorage.setItem("chamados", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
    // feedback simples
    alert("Chamado criado com sucesso.");
    handleCloseChamado();
  };
  
  // histórico
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [historyMolde, setHistoryMolde] = React.useState(null as any);

  const handleOpenHistory = (molde: any) => {
    setHistoryMolde(molde);
    setHistoryOpen(true);
  };

  const handleCloseHistory = () => {
    setHistoryOpen(false);
    setHistoryMolde(null);
  };

  // histórico geral handled in separate page
  return (
    <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 4 }, minHeight: "100vh", background: "#f4f4f5" }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ color: "#0b1220", fontWeight: 700 }}>
            Lista de Moldes
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar moldes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", sm: 720 } }}
          />

          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={{ width: { xs: "100%", sm: "auto" } }}>
            Adicionar Molde
          </Button>
        </Box>

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Adicionar Molde</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField label="Nome do Molde" value={newName} onChange={(e) => setNewName(e.target.value)} fullWidth />
              <TextField label="Descrição" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} fullWidth multiline rows={3} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button variant="contained" onClick={handleCreate} disabled={!newName.trim()}>
              Criar
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "flex-start" }}>
          {filtered.map((molde) => (
            <Card key={molde.id} sx={{ width: { xs: "100%", sm: 300 }, mb: 2 }}>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ color: "#0b1220", fontWeight: 700 }}>
                  {molde.nome}
                </Typography>
                <Typography sx={{ mt: 1, color: "#334155" }}>
                  {molde.descricao}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2, gap: 1, flexDirection: { xs: "column", sm: "row" }, alignItems: "center" }}>
                <Button size="small" variant="outlined" sx={{ minWidth: 140, width: { xs: "100%", sm: "auto" } }} onClick={() => handleOpenHistory(molde)}>
                  Histórico
                </Button>
                <Button size="small" variant="contained" sx={{ minWidth: 140, width: { xs: "100%", sm: "auto" } }} onClick={() => handleOpenChamado(molde)}>
                  Abrir Novo Chamado
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>

        <Dialog open={chamadoOpen} onClose={handleCloseChamado} fullWidth maxWidth="sm">
          <DialogTitle>Abrir Novo Chamado{selectedMolde ? ` - ${selectedMolde.nome}` : ""}</DialogTitle>
          <DialogContent>
            <Typography variant="body2">Data/Hora: {chamadoDatetime}</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <Button variant="outlined" component="label" startIcon={<VideocamIcon />}>
                Escolher vídeo
                <input hidden accept="video/*" type="file" onChange={handleFileChange} />
              </Button>
              {chamadoPreview && (
                <video src={chamadoPreview} controls style={{ maxWidth: "100%", borderRadius: 8 }} />
              )}
              <TextField label="Número da máquina" value={chamadoMachine} onChange={(e) => setChamadoMachine(e.target.value)} fullWidth />
              <TextField label="Insumos (lista ou observações)" value={chamadoInsumos} onChange={(e) => setChamadoInsumos(e.target.value)} fullWidth multiline rows={2} sx={{ mt: 1 }} />
              <TextField label="Comentário" value={chamadoComment} onChange={(e) => setChamadoComment(e.target.value)} fullWidth multiline rows={4} sx={{ mt: 1 }} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseChamado}>Cancelar</Button>
            <Button variant="contained" onClick={handleSubmitChamado} disabled={!chamadoFile}>
              Enviar Chamado
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={historyOpen} onClose={handleCloseHistory} fullWidth maxWidth="md">
          <DialogTitle>Histórico{historyMolde ? ` - ${historyMolde.nome}` : ""}</DialogTitle>
          <DialogContent>
            {historyMolde ? (
              (() => {
                const items = chamados.filter((c: any) => c.moldeId === historyMolde.id);
                if (!items.length) {
                  return <Typography>Nenhum chamado para este molde.</Typography>;
                }
                return (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {items.map((c: any) => (
                      <Box key={c.id} sx={{ border: "1px solid #eee", borderRadius: 1, p: 2 }}>
                        <Typography variant="subtitle2">{c.datetime}</Typography>
                        {c.machineNumber && (
                          <Typography sx={{ mt: 0.5, color: "#475569" }}>Máquina: {c.machineNumber}</Typography>
                        )}
                        {c.machineNumber && (
                          <Typography sx={{ mt: 0.5, color: "#475569" }}>Máquina: {c.machineNumber}</Typography>
                        )}
                        {c.insumos && (
                          <Typography sx={{ mt: 0.5, color: "#475569" }}>Insumos: {c.insumos}</Typography>
                        )}
                        {c.videoUrl && (
                          <video src={c.videoUrl} controls style={{ width: "100%", marginTop: 8, borderRadius: 6 }} />
                        )}
                        {c.comment && (
                          <Typography sx={{ mt: 1 }}>{c.comment}</Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                );
              })()
            ) : (
              <Typography>Selecione um molde para ver o histórico.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseHistory}>Fechar</Button>
          </DialogActions>
        </Dialog>
        
        {/* Histórico geral moved to its own page */}
    </Box>
  );
}
