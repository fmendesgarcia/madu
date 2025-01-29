import React, { useState, useEffect } from 'react';
import InputMask from 'react-input-mask';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, TextField } from '@mui/material';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ptBR } from 'date-fns/locale';

const ProfessorForm = () => {
  const [form, setForm] = useState({
    nome: '',
    apelido: '',
    email: '',
    sexo: '',
    telefone: '',
    cpf: '',
    cnpj: '',
    data_nascimento: '',
    endereco: '',
    cidade: '',
    estado: '',
    valor_hora: '',
    dia_pagamento: '',
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
      api.get(`/professores/${id}`)
        .then((response) => {
          const data = response.data;
          data.data_nascimento = data.data_nascimento ? new Date(data.data_nascimento) : null;
          setForm(data);
        })
        .catch((error) => console.error('Erro ao buscar professor:', error));
    }
  }, [id]);


  const handleRemoveFile = (fileType) => {
    setForm({
      ...form,
      [`${fileType}Removido`]: true, // Define que o arquivo foi removido
      [fileType]: null // Remove o valor do campo de arquivo
    });
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
  
    // Adiciona todos os campos ao FormData
    Object.keys(form).forEach((key) => {
      if (key === 'data_nascimento' && form.data_nascimento) {
        formData.append('data_nascimento', form.data_nascimento.toISOString().split('T')[0]); // Formata a data de nascimento
      } else if (key === 'dia_pagamento') {
        formData.append('dia_pagamento', parseInt(form.dia_pagamento, 10)); // Garante que dia_pagamento é um número inteiro
      } else if (form[key] !== null && form[key] !== undefined) {
        formData.append(key, form[key]);
      }
    });
  
    const request = id
      ? api.put(`/professores/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      : api.post('/professores', formData, {
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

  const handleDateChange = (date) => {
    setForm({
      ...form,
      data_nascimento: date,
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

      {/* Telefone com Máscara */}
      <InputMask mask="(99) 99999-9999" value={form.telefone} onChange={handleChange}>
        {(inputProps) => <TextField {...inputProps} label="Telefone" name="telefone" required />}
      </InputMask>

      {/* CPF com Máscara */}
      <InputMask mask="999.999.999-99" value={form.cpf} onChange={handleChange}>
        {(inputProps) => <TextField {...inputProps} label="CPF" name="cpf" required />}
      </InputMask>

      {/* Data de Nascimento com Máscara */}
      <InputMask mask="99/99/9999" value={form.data_nascimento} onChange={handleChange}>
        {(inputProps) => <TextField {...inputProps} label="Data de Nascimento" name="data_nascimento" required />}
      </InputMask>

      {/* CNPJ com Máscara */}
      <InputMask mask="99.999.999/0001-99" value={form.cnpj} onChange={handleChange}>
        {(inputProps) => <TextField {...inputProps} label="CNPJ" name="cnpj" />}
      </InputMask>

      <FormInput label="Endereço" name="endereco" value={form.endereco} onChange={handleChange} required />
      <FormInput label="Cidade" name="cidade" value={form.cidade} onChange={handleChange} required />
      <FormInput label="Estado" name="estado" value={form.estado} onChange={handleChange} required />
      <FormInput label="Valor por Hora" name="valor_hora" value={form.valor_hora} onChange={handleChange} required />
      <FormInput label="Dia de Pagamento" name="dia_pagamento" value={form.dia_pagamento} onChange={handleChange} required />

      <FormSelect label="Tipo de Pagamento" name="tipo_pagamento" value={form.tipo_pagamento} onChange={handleChange} options={tipoPagamentoOptions} required />

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
            <a href={`${api.defaults.baseURL}/${form.foto}`} target="_blank" rel="noopener noreferrer">Ver Foto</a>
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
            <a href={`${api.defaults.baseURL}/${form.contrato}`} target="_blank" rel="noopener noreferrer">Ver Contrato</a>
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
