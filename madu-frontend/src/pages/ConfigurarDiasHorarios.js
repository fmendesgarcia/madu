import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, FormControlLabel, Checkbox, TextField, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

// Opções para dias da semana
const diasDaSemanaOptions = [
  { label: 'Segunda', value: 'Segunda' },
  { label: 'Terça', value: 'Terça' },
  { label: 'Quarta', value: 'Quarta' },
  { label: 'Quinta', value: 'Quinta' },
  { label: 'Sexta', value: 'Sexta' },
  { label: 'Sábado', value: 'Sábado' },
  { label: 'Domingo', value: 'Domingo' },
];

const ConfigurarDiasHorarios = () => {
  const { turmaId } = useParams();  // Pegando o id da turma da URL corretamente
  console.log("turmaId:", turmaId);

  const navigate = useNavigate();
  const [diasSelecionados, setDiasSelecionados] = useState([]);
  const [horarios, setHorarios] = useState({});

  // Função para buscar horários ao carregar o componente
  useEffect(() => {
    if (turmaId) {
      api.get(`http://localhost:5001/turmas/${turmaId}/horarios`)
        .then((response) => {
          const horariosSalvos = response.data;
          console.log('Horários salvos:', horariosSalvos);  // Verifique se os dados chegam aqui
          
          // Preencher os dias selecionados e horários com os dados vindos do backend
          const dias = horariosSalvos.map(horario => horario.dia_da_semana);
          setDiasSelecionados([...new Set(dias)]); // Elimina dias duplicados

          const horariosMap = {};
          horariosSalvos.forEach(horario => {
            if (!horariosMap[horario.dia_da_semana]) {
              horariosMap[horario.dia_da_semana] = [];
            }
            horariosMap[horario.dia_da_semana].push(horario.horario.slice(0, 5)); // Remove segundos ao exibir
          });

          console.log('Horários mapeados:', horariosMap);  // Verifique se os horários estão sendo mapeados corretamente
          setHorarios(horariosMap);
        })
        .catch((error) => {
          console.error('Erro ao buscar horários:', error);
        });
    }
  }, [turmaId]);

  // Função para lidar com seleção de dias da semana
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setDiasSelecionados((prevDias) =>
      checked ? [...prevDias, value] : prevDias.filter((dia) => dia !== value)
    );
  };

  // Função para formatar o horário enquanto o usuário digita
  const formatarHorario = (value) => {
    const onlyNumbers = value.replace(/\D/g, ''); // Remove tudo que não é número
    if (onlyNumbers.length <= 2) return onlyNumbers;
    if (onlyNumbers.length <= 4) return `${onlyNumbers.slice(0, 2)}:${onlyNumbers.slice(2, 4)}`;
    return `${onlyNumbers.slice(0, 2)}:${onlyNumbers.slice(2, 4)}`; // Limita a entrada ao formato HH:mm
  };

  // Função para lidar com mudança de horário e formatar o valor
  const handleHorarioChange = (dia, index, value) => {
    const horarioFormatado = formatarHorario(value);
    setHorarios((prevHorarios) => {
      const updatedHorarios = [...(prevHorarios[dia] || [])];
      updatedHorarios[index] = horarioFormatado;
      return { ...prevHorarios, [dia]: updatedHorarios };
    });
  };

  // Função para adicionar horário extra para um dia
  const handleAddHorario = (dia) => {
    setHorarios((prevHorarios) => ({
      ...prevHorarios,
      [dia]: [...(prevHorarios[dia] || []), ''], // Adicionar um campo vazio para digitação
    }));
  };

  // Função para remover um horário
  const handleRemoveHorario = (dia, index) => {
    setHorarios((prevHorarios) => {
      const updatedHorarios = [...prevHorarios[dia]];
      updatedHorarios.splice(index, 1);
      return { ...prevHorarios, [dia]: updatedHorarios };
    });
  };

  // Função para salvar os horários
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!turmaId) {
      console.error('ID da turma está indefinido.');
      return;
    }

    // Filtra horários vazios e formata para o envio
    const horariosFormatados = diasSelecionados.flatMap((dia) =>
      (horarios[dia] || []).filter((horario) => horario.trim() !== '').map((horario) => ({
        dia_da_semana: dia,
        horario,
      }))
    );

    api.post(`http://localhost:5001/turmas/${turmaId}/horarios`, { horarios: horariosFormatados })
      .then(() => navigate('/turmas')) // Navega de volta para a página de turmas
      .catch((error) => console.error('Erro ao salvar horários:', error));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '600px', margin: '0 auto' }}>
      <h2>Configurar Aulas e Horários</h2>

      {/* Checkboxes para Dias da Semana */}
      <Box>
        <label>Dias da Semana:</label>
        {diasDaSemanaOptions.map((option) => (
          <FormControlLabel
            key={option.value}
            control={
              <Checkbox
                value={option.value}
                checked={diasSelecionados.includes(option.value)}
                onChange={handleCheckboxChange}
              />
            }
            label={option.label}
          />
        ))}
      </Box>

      {/* Campo de múltiplos horários por dia da semana */}
      {diasSelecionados.map((dia) => (
        <Box key={dia}>
          <label>{`Horários para ${dia}:`}</label>
          {(horarios[dia] || ['']).map((horario, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                label={`Horário ${index + 1}`}
                value={horario}
                onChange={(e) => handleHorarioChange(dia, index, e.target.value)}
                placeholder="HH:mm"
                inputProps={{
                  maxLength: 5, // Limita a digitação a 5 caracteres (HH:mm)
                }}
                required
              />
              {index > 0 && (
                <IconButton onClick={() => handleRemoveHorario(dia, index)}>
                  <RemoveIcon />
                </IconButton>
              )}
            </Box>
          ))}
          <Button onClick={() => handleAddHorario(dia)} startIcon={<AddIcon />}>
            Adicionar Horário
          </Button>
        </Box>
      ))}

      <Button onClick={handleSubmit} variant="contained" color="primary">
        Salvar Aulas e Horários
      </Button>
    </Box>
  );
};

export default ConfigurarDiasHorarios;
