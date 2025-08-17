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
    turma_id: '', // única turma
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
        const alunosResponse = await api.get('/alunos');
        setAlunos(alunosResponse.data);

        const turmasResponse = await api.get('/turmas');
        setTurmas(turmasResponse.data);

        if (id) {
          const matriculaResponse = await api.get(`/matriculas/${id}`);
          const matricula = matriculaResponse.data;

          if (matricula.data_matricula) {
            matricula.data_matricula = new Date(matricula.data_matricula);
          }
          if (matricula.data_vencimento) {
            const dt = new Date(matricula.data_vencimento);
            matricula.data_vencimento = dt.getDate(); // guarda apenas o dia (1-31)
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

          // Obter a turma (primeira) a partir de turmas_nomes
          if (turmasResponse.data && matricula.turmas_nomes) {
            const nomes = Array.isArray(matricula.turmas_nomes) ? matricula.turmas_nomes : String(matricula.turmas_nomes).split(',');
            const nomePrimeira = String(nomes[0]).trim();
            const turmaEncontrada = turmasResponse.data.find((t) => t.nome === nomePrimeira);
            if (turmaEncontrada) {
              matricula.turma_id = turmaEncontrada.id;
            }
          }

          setForm({ ...matricula });
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
    const { value } = event.target; // id da turma
    const turmaSelecionada = turmas.find((t) => t.id === value || t.id === Number(value));

    setForm((prevForm) => ({
      ...prevForm,
      turma_id: value,
      mensalidade: turmaSelecionada ? turmaSelecionada.valor_hora : '',
    }));
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
      // envia apenas o dia (número)
      data_vencimento: form.data_vencimento ? Number(form.data_vencimento) : '',
      data_final_contrato: form.data_final_contrato ? form.data_final_contrato.toISOString().split('T')[0] : '',
    };

    if (id) {
      api
        .put(`/matriculas/${id}`, formData)
        .then(() => {
          if (formData.status === 'inativa') {
            setIsInativoSalvo(true); // Define o status "inativa" como salvo
          }
          navigate('/matriculas');
        })
        .catch((error) => console.error('Erro ao atualizar matrícula:', error));
    } else {
      api
        .post('/matriculas', formData)
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
          <InputLabel id="turma-label">Turma</InputLabel>
          <Select
            labelId="turma-label"
            id="turma"
            value={form.turma_id}
            name="turma_id"
            onChange={handleTurmaChange}
            disabled={isInativoSalvo}
            required
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
        <FormControl fullWidth>
          <InputLabel id="dia-venc-label">Dia do Vencimento</InputLabel>
          <Select
            labelId="dia-venc-label"
            name="data_vencimento"
            value={form.data_vencimento || ''}
            onChange={handleChange}
            disabled={parcelasGeradas || isInativoSalvo}
            required
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
              <MenuItem key={dia} value={dia}>{dia}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
