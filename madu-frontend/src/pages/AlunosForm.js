// src/pages/AlunoForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, FormControlLabel, Checkbox, TextField, Typography} from '@mui/material';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';

const AlunoForm = () => {
  const [form, setForm] = useState({
    nome: '',
    sexo: '',
    data_nascimento: '',
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
  });

  const [fotoPreview, setFotoPreview] = useState(null);
  const [contratoLink, setContratoLink] = useState(null);
  const [fotoRemovida, setFotoRemovida] = useState(false); // Indica se a foto foi removida
  const [contratoRemovido, setContratoRemovido] = useState(false); // Indica se o contrato foi removido
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5001/alunos/${id}`)
        .then((response) => {
          const aluno = response.data;
  
          // Formatar a data de nascimento no formato 'YYYY-MM-DD' para o campo do tipo date
          if (aluno.data_nascimento) {
            aluno.data_nascimento = new Date(aluno.data_nascimento).toISOString().split('T')[0];
          }
          
          setForm(aluno);
          setFotoPreview(aluno.foto ? `http://localhost:5001/${aluno.foto}` : null);  // Define o link da foto corretamente
          setContratoLink(aluno.contrato ? `http://localhost:5001/${aluno.contrato}` : null);  // Define o link do contrato
        })
        .catch((error) => console.error('Erro ao buscar aluno:', error));
    }
  }, [id]);

  const handleFileChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.files[0] // Captura o arquivo selecionado
    });
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  const handleRemoveFile = (fileType) => {
    if (fileType === 'foto') {
      setForm({ ...form, foto: '' });
      setFotoPreview(null);
      setFotoRemovida(true); // Envia flag de remoção de foto
    } else if (fileType === 'contrato') {
      setForm({ ...form, contrato: '' });
      setContratoLink(null);
      setContratoRemovido(true); // Envia flag de remoção de contrato
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });
  
    // Adicionar informação sobre remoção de arquivos, se aplicável
    if (fotoRemovida) {
      formData.append('fotoRemovida', true);
    }
    if (contratoRemovido) {
      formData.append('contratoRemovido', true);
    }
  
    if (id) {
      // Atualizar aluno existente
      axios.put(`http://localhost:5001/alunos/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(() => navigate('/alunos'))
        .catch((error) => console.error('Erro ao atualizar aluno:', error));
    } else {
      // Adicionar novo aluno
      axios.post('http://localhost:5001/alunos', formData, {
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
      <FormInput label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
      <FormSelect label="Sexo" name="sexo" value={form.sexo} onChange={handleChange} options={sexoOptions} required />
      <FormInput label="Data de Nascimento" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} type="date" required />
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

      {/* Checkbox para Bolsista */}
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

      {/* Exibir preview da foto, se disponível */}
      {fotoPreview && (
        <Box>
          <Typography>Foto Atual:</Typography>
          <img src={fotoPreview} alt="Foto do aluno" width={100} />
          <Button onClick={() => handleRemoveFile('foto')} color="error">Remover Foto</Button>
        </Box>
      )}
      {/* Exibir link do contrato, se disponível */}
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
