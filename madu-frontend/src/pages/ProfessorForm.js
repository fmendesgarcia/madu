import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';

const ProfessorForm = () => {
  const [form, setForm] = useState({
    nome: '',
    apelido: '',
    email: '',
    sexo: '',
    telefone: '',
    cpf: '',
    tipo_pagamento: '',
    pix: '',
    agencia: '',
    conta: '',
    foto: null,
    contrato: null,
    fotoRemovida: false,
    contratoRemovido: false
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5001/professores/${id}`)
        .then((response) => {
          setForm(response.data);
        })
        .catch((error) => console.error('Erro ao buscar professor:', error));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Adiciona todos os campos ao formData
    Object.keys(form).forEach((key) => {
      if (form[key] !== null && form[key] !== undefined) {
        formData.append(key, form[key]);
      }
    });

    const request = id
      ? axios.put(`http://localhost:5001/professores/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      : axios.post('http://localhost:5001/professores', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

    request
      .then(() => navigate('/professores'))
      .catch((error) => console.error('Erro ao adicionar/atualizar professor:', error));
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.type === 'file' ? e.target.files[0] : e.target.value
    });
  };

  const handleRemoveFile = (fileType) => {
    setForm({
      ...form,
      [`${fileType}Removido`]: true, // Define que o arquivo foi removido
      [fileType]: null // Remove o valor do campo de arquivo
    });
  };

  const sexoOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ];

  const tipoPagamentoOptions = [
    { value: 'pix', label: 'PIX' },
    { value: 'conta', label: 'Agência e Conta' },
  ];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '400px', margin: '0 auto' }}>
      <h2>{id ? 'Editar Professor' : 'Adicionar Professor'}</h2>
      <FormInput label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
      <FormInput label="Apelido" name="apelido" value={form.apelido} onChange={handleChange} required />
      <FormInput label="Email" name="email" value={form.email} onChange={handleChange} type="email" required />
      <FormSelect label="Sexo" name="sexo" value={form.sexo} onChange={handleChange} options={sexoOptions} required />
      <FormInput label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} required />
      <FormInput label="CPF" name="cpf" value={form.cpf} onChange={handleChange} required />

      {/* Novo campo de tipo de pagamento */}
      <FormSelect label="Tipo de Pagamento" name="tipo_pagamento" value={form.tipo_pagamento} onChange={handleChange} options={tipoPagamentoOptions} required />

      {/* Campos condicionalmente exibidos */}
      {form.tipo_pagamento === 'pix' && (
        <FormInput label="Chave PIX" name="pix" value={form.pix} onChange={handleChange} required />
      )}
      {form.tipo_pagamento === 'conta' && (
        <>
          <FormInput label="Agência" name="agencia" value={form.agencia} onChange={handleChange} required />
          <FormInput label="Conta" name="conta" value={form.conta} onChange={handleChange} required />
        </>
      )}

      {/* Upload de arquivos */}
      <div>
        <label>Foto do Professor:</label>
        {form.foto && !form.fotoRemovida ? (
          <div>
            <a href={`http://localhost:5001/${form.foto}`} target="_blank" rel="noopener noreferrer">Ver Foto</a>
            <Button variant="text" color="secondary" onClick={() => handleRemoveFile('foto')}>Remover</Button>
          </div>
        ) : (
          <FormInput label="Upload de Foto" name="foto" type="file" onChange={handleChange} />
        )}
      </div>

      <div>
        <label>Contrato:</label>
        {form.contrato && !form.contratoRemovido ? (
          <div>
            <a href={`http://localhost:5001/${form.contrato}`} target="_blank" rel="noopener noreferrer">Ver Contrato</a>
            <Button variant="text" color="secondary" onClick={() => handleRemoveFile('contrato')}>Remover</Button>
          </div>
        ) : (
          <FormInput label="Upload de Contrato" name="contrato" type="file" onChange={handleChange} />
        )}
      </div>

      <Button type="submit" variant="contained" color="primary">{id ? 'Atualizar' : 'Adicionar'}</Button>
    </Box>
  );
};

export default ProfessorForm;
