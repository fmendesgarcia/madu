import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, FormControlLabel, Checkbox, TextField, MenuItem, Select, InputLabel, FormControl, RadioGroup, Radio, FormLabel } from '@mui/material';
import FormSelect from '../components/FormSelect';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ptBR } from 'date-fns/locale';

const MatriculaForm = () => {
  const [form, setForm] = useState({
    aluno_id: '',
    turmas_ids: [], // Mudança para array para múltiplas turmas
    data_matricula: '',
    status: 'ativa',
    mensalidade: '',
    data_vencimento: '',
    data_final_contrato: '',
    desconto: '',
    isencao_taxa: false,
    bolsista: false,
    gerarMensalidade: false,
    valor_matricula: '', // Novo campo
  });

  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [parcelasGeradas, setParcelasGeradas] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const alunosResponse = await axios.get('http://localhost:5001/alunos');
        setAlunos(alunosResponse.data);
  
        const turmasResponse = await axios.get('http://localhost:5001/turmas');
        setTurmas(turmasResponse.data);
  
        if (id) {
          const matriculaResponse = await axios.get(`http://localhost:5001/matriculas/${id}`);
          const matricula = matriculaResponse.data;
  
          if (matricula.data_matricula) {
            matricula.data_matricula = new Date(matricula.data_matricula);
          }
          if (matricula.data_vencimento) {
            matricula.data_vencimento = new Date(matricula.data_vencimento);
          }
          if (matricula.data_final_contrato) {
            matricula.data_final_contrato = new Date(matricula.data_final_contrato);
          }
  
          if (matricula.parcelasGeradas) {
            setParcelasGeradas(true);
          }
  
          // Mapeia os nomes das turmas para os IDs correspondentes
          if (matricula.turmas_nomes) {
            const turmaIds = turmasResponse.data
              .filter(turma => matricula.turmas_nomes.includes(turma.nome))
              .map(turma => turma.id);
  
            matricula.turmas_ids = turmaIds;
          }
  
          setForm({ ...matricula, turmas_ids: matricula.turmas_ids || [] });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
  
    fetchData();
  }, [id]);
  
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleTurmaChange = (event) => {
    const { value } = event.target;
    setForm({
      ...form,
      turmas_ids: value, // Como o `Select` permite múltiplos, ele já retorna um array
    });
  };
  
  

  const handleDateChange = (name, date) => {
    setForm({
      ...form,
      [name]: date,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      ...form,
      data_matricula: form.data_matricula ? form.data_matricula.toISOString().split('T')[0] : '',
      data_vencimento: form.data_vencimento ? form.data_vencimento.toISOString().split('T')[0] : '',
      data_final_contrato: form.data_final_contrato ? form.data_final_contrato.toISOString().split('T')[0] : '',
    };

    if (id) {
      axios.put(`http://localhost:5001/matriculas/${id}`, formData)
        .then(() => navigate('/matriculas'))
        .catch(error => console.error('Erro ao atualizar matrícula:', error));
    } else {
      axios.post('http://localhost:5001/matriculas', formData)
        .then(() => navigate('/matriculas'))
        .catch(error => console.error('Erro ao adicionar matrícula:', error));
    }
  };

  const alunoOptions = alunos.map(aluno => ({ value: aluno.id, label: aluno.nome }));
  const turmaOptions = turmas.map(turma => ({ value: turma.id, label: turma.nome }));

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '400px', margin: '0 auto' }}>
      <h2>{id ? 'Editar Matrícula' : 'Adicionar Matrícula'}</h2>
      <FormSelect label="Aluno" name="aluno_id" value={form.aluno_id} onChange={handleChange} options={alunoOptions} required />
      {/* Substituindo FormSelect por Select para múltiplas turmas */}
      <FormControl fullWidth>
      <InputLabel id="turmas-label">Turmas</InputLabel>
      <Select
        labelId="turmas-label"
        id="turmas"
        multiple
        value={form.turmas_ids}
        onChange={handleTurmaChange}
        renderValue={(selected) => selected.map(turmaId => turmaOptions.find(turma => turma.value === turmaId)?.label || '').join(', ')} // Mostra os nomes das turmas selecionadas
      >
        {turmaOptions.map((turma) => (
          <MenuItem key={turma.value} value={turma.value}>
            {turma.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>


      {/* Exibindo as turmas selecionadas */}
      {Array.isArray(form.turmas_ids) && form.turmas_ids.map(turmaId => (
        <div key={turmaId}>Turma selecionada: {turmaId}</div>
      ))}
      <DatePicker
        selected={form.data_matricula}
        onChange={date => handleDateChange('data_matricula', date)}
        dateFormat="dd/MM/yyyy"
        locale={ptBR}
        customInput={<TextField label="Data da Matrícula" fullWidth required />}
      />


    <FormControl component="fieldset" required>
      <FormLabel component="legend">Status</FormLabel>
      <RadioGroup
        aria-label="status"
        name="status"
        value={form.status}
        onChange={handleChange}
      >
        <FormControlLabel value="ativa" control={<Radio />} label="Ativa" />
        <FormControlLabel value="inativa" control={<Radio />} label="Inativa" />
      </RadioGroup>
    </FormControl>

      <TextField 
            label="Valor Matricula" 
            name="valor_matricula" 
            value={form.valor_matricula} 
            onChange={handleChange} 
            required 
            disabled={parcelasGeradas} // Desabilitar se as parcelas já foram geradas
          />
      
      <FormControlLabel
        control={
          <Checkbox
            name="gerarMensalidade"
            checked={form.gerarMensalidade !== undefined ? form.gerarMensalidade : false} // Certifique-se de que é booleano
            onChange={handleChange}
            disabled={parcelasGeradas} // Desabilitar o checkbox se as parcelas já foram geradas
          />
        }
        label="Gerar Mensalidade"
      />


      {form.gerarMensalidade && (
        <Box sx={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
          <TextField 
            label="Mensalidade" 
            name="mensalidade" 
            value={form.mensalidade} 
            onChange={handleChange} 
            required 
            disabled={parcelasGeradas} // Desabilitar se as parcelas já foram geradas
          />
          <DatePicker
            selected={form.data_vencimento}
            onChange={date => handleDateChange('data_vencimento', date)}
            dateFormat="dd/MM/yyyy"
            locale={ptBR}
            customInput={<TextField label="Data de Vencimento" fullWidth required disabled={parcelasGeradas} />}
          />
          <DatePicker
            selected={form.data_final_contrato}
            onChange={date => handleDateChange('data_final_contrato', date)}
            dateFormat="dd/MM/yyyy"
            locale={ptBR}
            customInput={<TextField label="Data Final do Contrato" fullWidth required disabled={parcelasGeradas} />}
          />
          <TextField 
            label="Desconto" 
            name="desconto" 
            value={form.desconto} 
            onChange={handleChange} 
            disabled={parcelasGeradas} 
          />
        </Box>
      )}

      <FormControlLabel
        control={
          <Checkbox
            name="isencao_taxa"
            checked={form.isencao_taxa !== undefined ? form.isencao_taxa : false} // Certifique-se de que é booleano
            onChange={handleChange}
          />
        }
        label="Isenção de Taxa"
      />


      <FormControlLabel
        control={
          <Checkbox
            name="bolsista"
            checked={form.bolsista}
            onChange={handleChange}
          />
        }
        label="Bolsista"
      />

      <Button type="submit" variant="contained" color="primary">{id ? 'Atualizar' : 'Adicionar'}</Button>
    </Box>
  );
};

export default MatriculaForm;
