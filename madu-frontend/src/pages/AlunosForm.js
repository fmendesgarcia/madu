// src/pages/AlunoForm.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, FormControlLabel, Checkbox, TextField, Typography} from '@mui/material';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importa a localização para português


const AlunoForm = () => {
  const [form, setForm] = useState({
    codigo: '',
    nome: '',
    sexo: '',
    data_nascimento: null,
    telefone: '',
    cpf: '',
    email: '',
    responsavel_financeiro: false,
    bolsista: false,
    endereco: '',
    cidade: '',
    estado: '',
    foto: '',
    contrato: '',
    // Campos do responsável financeiro
    responsavel_nome: '',
    responsavel_cpf: '',
    responsavel_telefone: '',
    responsavel_email: '',
    responsavel_parentesco: '',
  });

  const [fotoPreview, setFotoPreview] = useState(null);
  const [contratoLink, setContratoLink] = useState(null);
  const [fotoRemovida, setFotoRemovida] = useState(false); // Indica se a foto foi removida
  const [contratoRemovido, setContratoRemovido] = useState(false); // Indica se o contrato foi removido
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.get(`/alunos/${id}`)
        .then((response) => {
          const aluno = response.data;
  
          // Converter a data de nascimento para um objeto Date
          if (aluno.data_nascimento) {
            aluno.data_nascimento = parseISO(aluno.data_nascimento);
          }
  
          // Se já existem dados de responsável, marcar o checkbox para exibir os campos
          const hasResponsavel = !!(
            aluno.responsavel_nome ||
            aluno.responsavel_cpf ||
            aluno.responsavel_telefone ||
            aluno.responsavel_email ||
            aluno.responsavel_parentesco
          );
          if (hasResponsavel) {
            aluno.responsavel_financeiro = true;
          }

          setForm(aluno);
          setFotoPreview(aluno.foto ? `${api.defaults.baseURL}/${aluno.foto}` : null);
          setContratoLink(aluno.contrato ? `${api.defaults.baseURL}/${aluno.contrato}` : null);
        })
        .catch((error) => console.error('Erro ao buscar aluno:', error));
    }
  }, [id]);

  const handleFileChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.files[0]
    });
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'responsavel_financeiro' && !checked) {
      setForm({
        ...form,
        [name]: checked,
        responsavel_nome: '',
        responsavel_cpf: '',
        responsavel_telefone: '',
        responsavel_email: '',
        responsavel_parentesco: '',
      });
    } else {
      setForm({
        ...form,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  const handleDateChange = (date) => {
    setForm({
      ...form,
      data_nascimento: date
    });
  };
  const handleRemoveFile = (fileType) => {
    if (fileType === 'foto') {
      setForm({ ...form, foto: '' });
      setFotoPreview(null);
      setFotoRemovida(true);
    } else if (fileType === 'contrato') {
      setForm({ ...form, contrato: '' });
      setContratoLink(null);
      setContratoRemovido(true);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
  
    const formData = new FormData();
  
    Object.keys(form).forEach((key) => {
      if (key === 'data_nascimento' && form.data_nascimento) {
        formData.append('data_nascimento', format(form.data_nascimento, 'yyyy-MM-dd'));
      } else {
        formData.append(key, form[key]);
      }
    });
  
    if (fotoRemovida) {
      formData.append('fotoRemovida', 'true');
    }
    if (contratoRemovido) {
      formData.append('contratoRemovido', 'true');
    }
  
    if (id) {
      api.put(`/alunos/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(() => navigate('/alunos'))
        .catch((error) => console.error('Erro ao atualizar aluno:', error));
    } else {
      api.post('/alunos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(() => navigate('/alunos'))
        .catch((error) => console.error('Erro ao adicionar aluno:', error));
    }
  };
  

  const sexoOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '400px', margin: '0 auto' }}>
      <h2>{id ? 'Editar Aluno' : 'Adicionar Aluno'}</h2>
      <FormInput label="Código" name="codigo" value={form.codigo || ''} onChange={handleChange} />
      <FormInput label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
      <FormSelect label="Sexo" name="sexo" value={form.sexo} onChange={handleChange} options={sexoOptions} required />

      {/* Campo de data com react-datepicker estilizado */}
      <DatePicker
        selected={form.data_nascimento}
        onChange={handleDateChange}
        dateFormat="dd/MM/yyyy"
        locale={ptBR}
        customInput={<TextField label="Data de Nascimento" fullWidth required />}
      />

      <FormInput label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} required />
      <FormInput label="CPF" name="cpf" value={form.cpf} onChange={handleChange} required />
      <FormInput label="Email" name="email" value={form.email} onChange={handleChange} type="email" required />
      <FormInput label="Endereço" name="endereco" value={form.endereco} onChange={handleChange} />
      <FormInput label="Cidade" name="cidade" value={form.cidade} onChange={handleChange} />
      <FormInput label="Estado" name="estado" value={form.estado} onChange={handleChange} />
      {/* Checkbox para Responsável Financeiro */}
      <FormControlLabel
        control={
          <Checkbox
            name="responsavel_financeiro"
            checked={form.responsavel_financeiro}
            onChange={handleChange}
          />
        }
        label="Responsável Financeiro"
      />

      {/* Campos do Responsável Financeiro - aparecem apenas quando marcado */}
      {form.responsavel_financeiro && (
        <Box sx={{ 
          border: '1px solid #ddd', 
          borderRadius: 2, 
          p: 2, 
          mt: 2, 
          backgroundColor: '#f9f9f9' 
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
            Dados do Responsável Financeiro
          </Typography>
          <FormInput 
            label="Nome do Responsável" 
            name="responsavel_nome" 
            value={form.responsavel_nome} 
            onChange={handleChange} 
            required 
          />
          <FormInput 
            label="CPF do Responsável" 
            name="responsavel_cpf" 
            value={form.responsavel_cpf} 
            onChange={handleChange} 
            required 
          />
          <FormInput 
            label="Telefone do Responsável" 
            name="responsavel_telefone" 
            value={form.responsavel_telefone} 
            onChange={handleChange} 
            required 
          />
          <FormInput 
            label="Email do Responsável" 
            name="responsavel_email" 
            value={form.responsavel_email} 
            onChange={handleChange} 
            type="email" 
            required 
          />
          <FormSelect 
            label="Parentesco" 
            name="responsavel_parentesco" 
            value={form.responsavel_parentesco} 
            onChange={handleChange} 
            options={[
              { value: 'Pai', label: 'Pai' },
              { value: 'Mãe', label: 'Mãe' },
              { value: 'Avô', label: 'Avô' },
              { value: 'Avó', label: 'Avó' },
              { value: 'Tio', label: 'Tio' },
              { value: 'Tia', label: 'Tia' },
              { value: 'Irmão', label: 'Irmão' },
              { value: 'Irmã', label: 'Irmã' },
              { value: 'Outro', label: 'Outro' },
            ]} 
            required 
          />
        </Box>
      )}

      <FormControlLabel
        control={<Checkbox name="bolsista" checked={form.bolsista} onChange={handleChange} />}
        label="Bolsista"
      />

      {fotoPreview && (
        <Box>
          <Typography>Foto Atual:</Typography>
          <img src={fotoPreview} alt="Foto do aluno" width={100} />
          <Button onClick={() => handleRemoveFile('foto')} color="error">Remover Foto</Button>
        </Box>
      )}
      {contratoLink && (
        <Box>
          <Typography>Contrato Atual:</Typography>
          <a href={contratoLink} target="_blank" rel="noopener noreferrer">Ver contrato</a>
          <Button onClick={() => handleRemoveFile('contrato')} color="error">Remover Contrato</Button>
        </Box>
      )}
      
      <TextField type="file" name="foto" onChange={handleFileChange} label="Foto" InputLabelProps={{ shrink: true }} />
      <TextField type="file" name="contrato" onChange={handleFileChange} label="Contrato" InputLabelProps={{ shrink: true }} />

      <Button type="submit" variant="contained" color="primary">{id ? 'Atualizar' : 'Adicionar'}</Button>
    </Box>
  );
};

export default AlunoForm;
