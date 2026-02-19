"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

export default function DashboardPage() {
  const [chamados, setChamados] = React.useState<any[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("chamados");
      if (raw) setChamados(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  const totals = React.useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();

    const today = chamados.filter((c: any) => {
      const ts = c.timestamp || new Date(c.datetime).getTime() || 0;
      return ts >= startOfDay && ts <= endOfDay;
    }).length;

    const total = chamados.length;

    const uniqueMoldes = Array.from(new Set(chamados.map((c: any) => c.moldeNome))).length;

    return { today, total, uniqueMoldes };
  }, [chamados]);

  const byMachine = React.useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();

    const todayItems = chamados.filter((c: any) => {
      const ts = c.timestamp || new Date(c.datetime).getTime() || 0;
      return ts >= startOfDay && ts <= endOfDay;
    });

    const map: Record<string, number> = {};
    for (const c of todayItems) {
      const key = c.machineNumber || "(Não informado)";
      map[key] = (map[key] || 0) + 1;
    }

    return Object.entries(map)
      .map(([machine, count]) => ({ machine, count }))
      .sort((a, b) => b.count - a.count);
  }, [chamados]);

  // helper: counts per day for last N days
  const getCountsPerDay = (days = 7, mapUnique = false) => {
    const now = new Date();
    const result: number[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const start = d.getTime();
      const end = start + 24 * 60 * 60 * 1000 - 1;
      if (!mapUnique) {
        const count = chamados.filter((c: any) => {
          const ts = c.timestamp || new Date(c.datetime).getTime() || 0;
          return ts >= start && ts <= end;
        }).length;
        result.push(count);
      } else {
        const set = new Set<string>();
        chamados.forEach((c: any) => {
          const ts = c.timestamp || new Date(c.datetime).getTime() || 0;
          if (ts >= start && ts <= end && c.moldeNome) set.add(c.moldeNome);
        });
        result.push(set.size);
      }
    }
    return result;
  };

  const seriesLast7 = React.useMemo(() => getCountsPerDay(7, false), [chamados]);
  const seriesUniqueMoldes7 = React.useMemo(() => getCountsPerDay(7, true), [chamados]);

  const MiniBarChart: React.FC<{ data: number[]; color?: string; height?: number }> = ({ data, color = '#0b1220', height = 48 }) => {
    const max = Math.max(...data, 1);
    const w = Math.max(data.length, 1);
    const viewH = height;
    const viewW = w;
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${viewW} ${viewH}`} preserveAspectRatio="none">
        {data.map((v, i) => {
          const barH = (v / max) * viewH;
          const y = viewH - barH;
          const bw = 0.7; // relative width in view coords
          return <rect key={i} x={i + (1 - bw) / 2} y={y} width={bw} height={barH} fill={color} rx={0.15} />;
        })}
      </svg>
    );
  };

  const [machineDialogOpen, setMachineDialogOpen] = React.useState(false);
  const [selectedMachine, setSelectedMachine] = React.useState<string | null>(null);

  const machineItems = React.useMemo(() => {
    if (!selectedMachine) return [];
    const key = selectedMachine === "(Não informado)" ? null : selectedMachine;
    return chamados.filter((c: any) => {
      if (key === null) return !c.machineNumber;
      return c.machineNumber === key;
    }).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [chamados, selectedMachine]);

  const openMachineDialog = (machine: string) => {
    setSelectedMachine(machine);
    setMachineDialogOpen(true);
  };

  const closeMachineDialog = () => {
    setMachineDialogOpen(false);
    setSelectedMachine(null);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#0b1220', fontWeight: 700 }}>Dashboard</Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ width: { xs: '100%', sm: 'calc(33.333% - 16px)' } }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }} elevation={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#334155' }}>Chamados hoje</Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{totals.today}</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <MiniBarChart data={seriesLast7} />
            </Box>
          </Paper>
        </Box>

        <Box sx={{ width: { xs: '100%', sm: 'calc(33.333% - 16px)' } }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }} elevation={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#334155' }}>Chamados totais (últimos 7 dias)</Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{totals.total}</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <MiniBarChart data={seriesLast7} color="#2563eb" />
            </Box>
          </Paper>
        </Box>

        <Box sx={{ width: { xs: '100%', sm: 'calc(33.333% - 16px)' } }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }} elevation={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#334155' }}>Moldes com chamados (7d)</Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{totals.uniqueMoldes}</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <MiniBarChart data={seriesUniqueMoldes7} color="#16a34a" />
            </Box>
          </Paper>
        </Box>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 2 }} elevation={1}>
          <Typography variant="h6" sx={{ mb: 1 }}>Chamados por máquina (hoje)</Typography>
          {byMachine.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#475569' }}>Nenhum chamado com máquina informado hoje.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {byMachine.map((m) => (
                  <Box key={m.machine} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', p: 1, borderRadius: 1, '&:hover': { bgcolor: '#f1f5f9' } }} onClick={() => openMachineDialog(m.machine)}>
                    <Typography sx={{ color: '#0b1220' }}>{m.machine}</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{m.count}</Typography>
                  </Box>
                ))}
            </Box>
          )}
        </Paper>
      </Box>

        <Dialog open={machineDialogOpen} onClose={closeMachineDialog} fullWidth maxWidth="md">
          <DialogTitle>Histórico da máquina {selectedMachine}</DialogTitle>
          <DialogContent dividers>
            {machineItems.length === 0 ? (
              <Typography>Nenhuma ocorrência encontrada para essa máquina.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {machineItems.map((c: any) => (
                  <Paper key={c.id} sx={{ p: 2 }} variant="outlined">
                    <Typography variant="subtitle2">{c.datetime} — {c.moldeNome}</Typography>
                    {c.videoUrl && <video src={c.videoUrl} controls style={{ width: '100%', marginTop: 8, borderRadius: 6 }} />}
                    {c.comment && <Typography sx={{ mt: 1 }}>{c.comment}</Typography>}
                  </Paper>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeMachineDialog}>Fechar</Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
}
