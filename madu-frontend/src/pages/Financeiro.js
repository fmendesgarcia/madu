import React, { useEffect, useState, useMemo } from 'react';
import { Box, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Typography, Divider, Button, Modal, TextField, Checkbox, FormControlLabel } from '@mui/material';
import api from '../services/api';
import { useLocation } from 'react-router-dom';

const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const Financeiro = () => {
  const location = useLocation();
  const now = new Date();
  const defaultMes = String(now.getMonth() + 1).padStart(2, '0');
  const defaultAno = String(now.getFullYear());

  const [tab, setTab] = useState(0);
  const [mes, setMes] = useState(defaultMes);
  const [ano, setAno] = useState(defaultAno);
  const [groupReceber, setGroupReceber] = useState('aluno'); // aluno | turma
  const [receberAlunos, setReceberAlunos] = useState([]);
  const [receberTurmas, setReceberTurmas] = useState([]);
  const [pagarProfessores, setPagarProfessores] = useState([]);

  // Ajusta aba via querystring (?tab=pay | recv | 1 | 0)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('tab');
    if (t === 'pay' || t === '1') setTab(1);
    else if (t === 'recv' || t === '0') setTab(0);
  }, [location.search]);

  // Modal de pagamento de professor
  const [payOpen, setPayOpen] = useState(false);
  const [payProfessor, setPayProfessor] = useState(null); // { id, nome, valor_hora }
  const [aulasNaoPagas, setAulasNaoPagas] = useState([]); // [{id, start, end_time, turma_nome}]
  const [selectedAulas, setSelectedAulas] = useState(new Set());
  const [dataPagamento, setDataPagamento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const loadReceber = () => {
    if (groupReceber === 'aluno') {
      api.get('/financeiro/receber-alunos', { params: { mes, ano } }).then(r => setReceberAlunos(r.data));
    } else {
      api.get('/financeiro/receber-turmas', { params: { mes, ano } }).then(r => setReceberTurmas(r.data));
    }
  };

  useEffect(() => {
    loadReceber();
    api.get('/financeiro/pagar-professores', { params: { mes, ano } }).then(r => setPagarProfessores(r.data));
  }, [mes, ano, groupReceber]);

  const totaisReceber = useMemo(() => {
    const src = groupReceber === 'aluno' ? receberAlunos : receberTurmas;
    const acc = { pendente: 0, vencido: 0, pago: 0, receber: 0 };
    for (const r of src) {
      acc.pendente += Number(r.total_pendente || 0);
      acc.vencido += Number(r.total_vencido || 0);
      acc.pago += Number(r.total_pago || 0);
      acc.receber += Number(r.total_receber || 0);
    }
    return acc;
  }, [receberAlunos, receberTurmas, groupReceber]);

  const totaisPagar = useMemo(() => {
    const acc = { horas: 0, pagar: 0 };
    for (const p of pagarProfessores) {
      acc.horas += Number(p.total_horas || 0);
      acc.pagar += Number(p.total_pagar || 0);
    }
    return acc;
  }, [pagarProfessores]);

  const totalHorasSelecionadas = useMemo(() => {
    if (!aulasNaoPagas.length || selectedAulas.size === 0) return 0;
    return aulasNaoPagas.reduce((sum, a) => {
      if (!selectedAulas.has(a.id)) return sum;
      const start = new Date(a.start);
      const end = new Date(a.end_time);
      const horas = Math.max(0, (end - start) / 3600000);
      return sum + horas;
    }, 0);
  }, [aulasNaoPagas, selectedAulas]);

  const totalPagarSelecionado = useMemo(() => {
    if (!payProfessor) return 0;
    return totalHorasSelecionadas * Number(payProfessor.valor_hora || 0);
  }, [totalHorasSelecionadas, payProfessor]);

  const abrirPagamentoProfessor = async (prof) => {
    setPayProfessor({ id: prof.professor_id, nome: prof.professor_nome, valor_hora: prof.valor_hora });
    const hoje = new Date().toISOString().split('T')[0];
    setDataPagamento(hoje);
    setFormaPagamento('');
    setObservacoes('');
    try {
      const res = await api.get(`/financeiro/professores/${prof.professor_id}/aulas-nao-pagas`, { params: { mes, ano } });
      setAulasNaoPagas(res.data || []);
      setSelectedAulas(new Set((res.data || []).map(a => a.id))); // marca todas
    } catch (e) {
      setAulasNaoPagas([]);
      setSelectedAulas(new Set());
    }
    setPayOpen(true);
  };

  const toggleAula = (id) => {
    setSelectedAulas(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const confirmarPagamentoProfessor = async () => {
    if (!payProfessor) return;
    const aula_ids = Array.from(selectedAulas);
    if (aula_ids.length === 0) {
      alert('Selecione ao menos uma aula.');
      return;
    }
    try {
      await api.post(`/financeiro/professores/${payProfessor.id}/pagamentos`, {
        mes,
        ano,
        aula_ids,
        data_pagamento: dataPagamento,
        forma_pagamento: formaPagamento,
        observacoes
      });
      setPayOpen(false);
      // recarregar lista de pagar
      const r = await api.get('/financeiro/pagar-professores', { params: { mes, ano } });
      setPagarProfessores(r.data);
    } catch (e) {
      alert('Erro ao registrar pagamento do professor: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Financeiro</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Mês</InputLabel>
          <Select value={mes} label="Mês" onChange={(e) => setMes(e.target.value)}>
            {monthNames.map((label, idx) => {
              const val = String(idx + 1).padStart(2, '0');
              return <MenuItem key={val} value={val}>{label}</MenuItem>;
            })}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Ano</InputLabel>
          <Select value={ano} label="Ano" onChange={(e) => setAno(e.target.value)}>
            {[String(now.getFullYear() - 1), String(now.getFullYear()), String(now.getFullYear() + 1)].map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {tab === 0 && (
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Agrupar por</InputLabel>
            <Select value={groupReceber} label="Agrupar por" onChange={(e) => setGroupReceber(e.target.value)}>
              <MenuItem value="aluno">Aluno</MenuItem>
              <MenuItem value="turma">Turma</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="A Receber" />
        <Tab label="A Pagar (Professores)" />
      </Tabs>

      {tab === 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body1">Pendente: <strong>{totaisReceber.pendente.toFixed(2)}</strong></Typography>
            <Typography variant="body1">Vencido: <strong>{totaisReceber.vencido.toFixed(2)}</strong></Typography>
            <Typography variant="body1">Pago: <strong>{totaisReceber.pago.toFixed(2)}</strong></Typography>
            <Typography variant="body1">Total a Receber: <strong>{totaisReceber.receber.toFixed(2)}</strong></Typography>
          </Box>
          <Divider sx={{ mb: 1 }} />

          {groupReceber === 'aluno' && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Aluno</TableCell>
                  <TableCell align="right">Pendente</TableCell>
                  <TableCell align="right">Vencido</TableCell>
                  <TableCell align="right">Pago</TableCell>
                  <TableCell align="right">Total a Receber</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receberAlunos.map((r) => (
                  <TableRow key={r.aluno_id}>
                    <TableCell>{r.aluno_nome}</TableCell>
                    <TableCell align="right">{r.total_pendente?.toFixed(2)}</TableCell>
                    <TableCell align="right">{r.total_vencido?.toFixed(2)}</TableCell>
                    <TableCell align="right">{r.total_pago?.toFixed(2)}</TableCell>
                    <TableCell align="right">{r.total_receber?.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {groupReceber === 'turma' && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Turma</TableCell>
                  <TableCell align="right">Pendente</TableCell>
                  <TableCell align="right">Vencido</TableCell>
                  <TableCell align="right">Pago</TableCell>
                  <TableCell align="right">Total a Receber</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receberTurmas.map((t) => (
                  <TableRow key={t.turma_id}>
                    <TableCell>{t.turma_nome}</TableCell>
                    <TableCell align="right">{t.total_pendente?.toFixed(2)}</TableCell>
                    <TableCell align="right">{t.total_vencido?.toFixed(2)}</TableCell>
                    <TableCell align="right">{t.total_pago?.toFixed(2)}</TableCell>
                    <TableCell align="right">{t.total_receber?.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}

      {tab === 1 && (
        <>
          <Box sx={{ display: 'flex', gap: 3, mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="body1">Total de Horas: <strong>{totaisPagar.horas.toFixed(2)}</strong></Typography>
            <Typography variant="body1">Total a Pagar: <strong>{totaisPagar.pagar.toFixed(2)}</strong></Typography>
          </Box>
          <Divider sx={{ mb: 1 }} />

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Professor</TableCell>
                <TableCell align="right">Valor Hora</TableCell>
                <TableCell align="right">Total de Horas</TableCell>
                <TableCell align="right">Total a Pagar</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagarProfessores.map((p) => (
                <TableRow key={p.professor_id}>
                  <TableCell>{p.professor_nome}</TableCell>
                  <TableCell align="right">{Number(p.valor_hora || 0).toFixed(2)}</TableCell>
                  <TableCell align="right">{Number(p.total_horas || 0).toFixed(2)}</TableCell>
                  <TableCell align="right">{Number(p.total_pagar || 0).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Button variant="contained" size="small" onClick={() => abrirPagamentoProfessor(p)} disabled={Number(p.total_horas || 0) === 0}>Pagar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {/* Modal de Pagamento de Professor */}
      <Modal open={payOpen} onClose={() => setPayOpen(false)}>
        <div style={{ padding: 20, backgroundColor: 'white', width: 600, maxWidth: '95%', margin: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 8 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Pagamento de Professor</Typography>
          {payProfessor && (
            <Box sx={{ mb: 2 }}>
              <Typography>Professor: <strong>{payProfessor.nome}</strong></Typography>
              <Typography>Valor hora: <strong>{Number(payProfessor.valor_hora || 0).toFixed(2)}</strong></Typography>
              <Typography>Período: <strong>{monthNames[parseInt(mes, 10) - 1]}/{ano}</strong></Typography>
            </Box>
          )}

          <Box sx={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #eee', borderRadius: 1, mb: 2, p: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Turma</TableCell>
                  <TableCell>Início</TableCell>
                  <TableCell>Fim</TableCell>
                  <TableCell align="right">Horas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {aulasNaoPagas.map(a => {
                  const start = new Date(a.start);
                  const end = new Date(a.end_time);
                  const horas = Math.max(0, (end - start) / 3600000);
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <Checkbox checked={selectedAulas.has(a.id)} onChange={() => toggleAula(a.id)} />
                      </TableCell>
                      <TableCell>{a.turma_nome}</TableCell>
                      <TableCell>{start.toLocaleString('pt-BR')}</TableCell>
                      <TableCell>{end.toLocaleString('pt-BR')}</TableCell>
                      <TableCell align="right">{horas.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField label="Data de Pagamento" type="date" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 220 }} />
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Forma de Pagamento</InputLabel>
              <Select value={formaPagamento} label="Forma de Pagamento" onChange={(e) => setFormaPagamento(e.target.value)}>
                <MenuItem value="pix">Pix</MenuItem>
                <MenuItem value="transferencia">Transferência</MenuItem>
                <MenuItem value="dinheiro">Dinheiro</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} fullWidth />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography>Total de horas selecionadas: <strong>{totalHorasSelecionadas.toFixed(2)}</strong></Typography>
            <Typography>Total a pagar: <strong>{totalPagarSelecionado.toFixed(2)}</strong></Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setPayOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={confirmarPagamentoProfessor} disabled={selectedAulas.size === 0}>Confirmar Pagamento</Button>
          </Box>
        </div>
      </Modal>
    </Box>
  );
};

export default Financeiro;
