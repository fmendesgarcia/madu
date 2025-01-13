import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, FormControlLabel, Checkbox, TextField, MenuItem, Select, InputLabel, FormControl, RadioGroup, Radio, FormLabel } from '@mui/material';
import FormInput from '../components/FormInput'; // Usando FormInput
import FormSelect from '../components/FormSelect'; // Usando FormSelect
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ptBR } from 'date-fns/locale';

const MatriculaForm = () => {
  const [form, setForm] = useState({
    aluno_id: '',
    turmas_ids: [], // Mudança para array para múltiplas turmas
    data_matricula: '',
    status: 'ativa', // Valor padrão ativo
    mensalidade: '',
    data_vencimento: '',
    data_final_contrato: '',
    desconto: '',
    isencao_taxa: false,
    bolsista: false,
    valor_matricula: '', // Novo campo
  });

  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [parcelasGeradas, setParcelasGeradas] = useState(false);
  const [isInativoSalvo, setIsInativoSalvo] = useState(false); // Novo estado para controlar se o status "inativa" foi salvo
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const alunosResponse = await api.get('http://localhost:5001/alunos');
        setAlunos(alunosResponse.data);

        const turmasResponse = await api.get('http://localhost:5001/turmas');
        setTurmas(turmasResponse.data);

        if (id) {
          const matriculaResponse = await api.get(`http://localhost:5001/matriculas/${id}`);
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

          if (matricula.status === 'inativa') {
            setIsInativoSalvo(true); // Define que o status "inativa" foi salvo anteriormente
          }

          if (turmasResponse.data && matricula.turmas_nomes) {
            const turmaIds = turmasResponse.data
              .filter((turma) => matricula.turmas_nomes.includes(turma.nome))
              .map((turma) => turma.id);

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

    setForm((prevForm) => ({
      ...prevForm,
      turmas_ids: typeof value === 'string' ? value.split(',') : value, // Certificar que sempre é um array
    }));

    // Fetch para buscar os valores das turmas selecionadas e calcular a mensalidade total
    if (value.length > 0) {
      api
        .post('http://localhost:5001/turmas/valores', { turma_ids: value })
        .then((response) => {
          const { valores } = response.data;
          const totalMensalidade = valores.reduce((acc, val) => acc + val, 0);
          setForm((prevForm) => ({
            ...prevForm,
            mensalidade: totalMensalidade, // Atualiza o campo de mensalidade com o valor total
          }));
        });
    } else {
      setForm((prevForm) => ({ ...prevForm, mensalidade: 0 }));
    }
  };

  const handleDateChange = (name, date) => { // Agora 'name' é um argumento explícito
    setForm((prevForm) => ({
      ...prevForm,
      [name]: date, // Atualiza o campo específico usando o valor de 'name'
    }));
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
      api
        .put(`http://localhost:5001/matriculas/${id}`, formData)
        .then(() => {
          if (formData.status === 'inativa') {
            setIsInativoSalvo(true); // Define o status "inativa" como salvo
          }
          navigate('/matriculas');
        })
        .catch((error) => console.error('Erro ao atualizar matrícula:', error));
    } else {
      api
        .post('http://localhost:5001/matriculas', formData)
        .then(() => navigate('/matriculas'))
        .catch((error) => console.error('Erro ao adicionar matrícula:', error));
    }
  };

  const alunoOptions = alunos.map((aluno) => ({ value: aluno.id, label: aluno.nome }));
  const turmaOptions = turmas.map((turma) => ({ value: turma.id, label: turma.nome }));

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '400px', margin: '0 auto' }}>
      <h2>{id ? 'Editar Matrícula' : 'Adicionar Matrícula'}</h2>
      <FormSelect
        label="Aluno"
        name="aluno_id"
        value={form.aluno_id}
        onChange={handleChange}
        options={alunoOptions}
        required
        disabled={isInativoSalvo} // Desabilita todos os campos se "inativa" foi salva
      />

      {turmas.length > 0 ? (
        <FormControl fullWidth>
          <InputLabel id="turmas-label">Turmas</InputLabel>
          <Select
            labelId="turmas-label"
            id="turmas"
            multiple
            value={form.turmas_ids}
            onChange={handleTurmaChange}
            renderValue={(selected) =>
              selected
                .map((turmaId) => turmaOptions.find((turma) => turma.value === turmaId)?.label || '')
                .join(', ')
            }
            disabled={isInativoSalvo}
          >
            {turmaOptions.map((turma) => (
              <MenuItem key={turma.value} value={turma.value}>
                {turma.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <p>Carregando turmas...</p>
      )}

      <DatePicker
        selected={form.data_matricula}
        onChange={(date) => handleDateChange('data_matricula', date)}
        dateFormat="dd/MM/yyyy"
        locale={ptBR}
        customInput={<TextField label="Data da Matrícula" fullWidth required disabled={isInativoSalvo} />}
      />

      <FormControl component="fieldset" required>
        <FormLabel component="legend">Status</FormLabel>
        <RadioGroup aria-label="status" name="status" value={form.status} onChange={handleChange} disabled={isInativoSalvo}>
          <FormControlLabel value="ativa" control={<Radio />} label="Ativa" />
          <FormControlLabel value="inativa" control={<Radio />} label="Inativa" />
        </RadioGroup>
      </FormControl>

      <FormInput
        label="Valor Matricula"
        name="valor_matricula"
        value={form.valor_matricula}
        onChange={handleChange}
        required
        disabled={parcelasGeradas || isInativoSalvo}
      />

      {/* Parte de geração de mensalidades */}
      <Box sx={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
        <TextField
          label="Mensalidade"
          name="mensalidade"
          value={form.mensalidade}
          onChange={handleChange} // Permitir que o usuário altere
          required
          disabled={parcelasGeradas || isInativoSalvo}
        />
        <DatePicker
          selected={form.data_vencimento}
          onChange={(date) => handleDateChange('data_vencimento', date)}
          dateFormat="dd/MM/yyyy"
          locale={ptBR}
          customInput={<TextField label="Data de Vencimento" fullWidth required disabled={parcelasGeradas || isInativoSalvo} />}
        />
        <DatePicker
          selected={form.data_final_contrato}
          onChange={(date) => handleDateChange('data_final_contrato', date)}
          dateFormat="dd/MM/yyyy"
          locale={ptBR}
          customInput={<TextField label="Data Final do Contrato" fullWidth required disabled={parcelasGeradas || isInativoSalvo} />}
        />
        <TextField
          label="Desconto"
          name="desconto"
          value={form.desconto}
          onChange={handleChange}
          disabled={parcelasGeradas || isInativoSalvo}
        />
      </Box>

      <FormControlLabel
        control={<Checkbox name="isencao_taxa" checked={form.isencao_taxa} onChange={handleChange} />}
        label="Isenção de Taxa"
        disabled={isInativoSalvo}
      />
      <FormControlLabel
        control={<Checkbox name="bolsista" checked={form.bolsista} onChange={handleChange} />}
        label="Bolsista"
        disabled={isInativoSalvo}
      />

      <Button type="submit" variant="contained" color="primary" disabled={isInativoSalvo}>
        {id ? 'Atualizar' : 'Adicionar'}
      </Button>
    </Box>
  );
};

export default MatriculaForm;
