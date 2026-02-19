"use client";

import * as React from "react";
import Box from "@mui/system/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

export default function HistoricoGeralPage() {
  const router = useRouter();
  const [chamados, setChamados] = React.useState<any[]>([]);
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("chamados");
      if (raw) setChamados(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  const items = React.useMemo(() => {
    const sorted = [...chamados].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
    if (!startDate && !endDate) return sorted;

    const startTs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : -Infinity;
    const endTs = endDate ? new Date(`${endDate}T23:59:59`).getTime() : Infinity;

    return sorted.filter((c: any) => {
      const ts = c.timestamp || new Date(c.datetime).getTime() || 0;
      return ts >= startTs && ts <= endTs;
    });
  }, [chamados, startDate, endDate]);

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, sm: 4 }, background: "#f7fafc" }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/moldes")}>Voltar</Button>
      <Typography variant="h4" sx={{ mt: 2, mb: 2, color: "#0b1220", fontWeight: 700 }}>Histórico Geral de Chamados</Typography>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
        <TextField
          label="Data início"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ width: { xs: "100%", sm: 200 } }}
        />
        <TextField
          label="Data fim"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={{ width: { xs: "100%", sm: 200 } }}
        />
        <Button onClick={() => { setStartDate(""); setEndDate(""); }}>Limpar</Button>
        <Box sx={{ flex: 1 }} />
        <Typography variant="body2" sx={{ color: "#334155" }}>{items.length} chamados</Typography>
      </Box>

      {items.length === 0 ? (
        <Typography>Nenhum chamado registrado.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {items.map((c) => (
            <Card key={c.id}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: "#0b1220", fontWeight: 600 }}>{c.datetime} — {c.moldeNome}</Typography>
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
                {c.comment && <Typography sx={{ mt: 1, color: "#334155" }}>{c.comment}</Typography>}
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                <Button size="small" onClick={() => alert(`Abrir detalhe do chamado ${c.id}`)}>Detalhes</Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
