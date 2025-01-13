import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Box, Typography } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Registra os componentes do Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [dadosMensais, setDadosMensais] = useState([]);
  const [receitasDespesas, setReceitasDespesas] = useState({ receitas: 0, despesas: 0 });
  const [statusReceitas, setStatusReceitas] = useState({ futuras: 0, efetivadas: 0 });
  const [loadingMensal, setLoadingMensal] = useState(true);
  const [loadingReceitasDespesas, setLoadingReceitasDespesas] = useState(true);
  const [loadingStatusReceitas, setLoadingStatusReceitas] = useState(true);

  useEffect(() => {
    api.get('http://localhost:5001/dashboard/saldo-mensal')
      .then((response) => {
        setDadosMensais(response.data);
        setLoadingMensal(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar saldo mensal:', error);
        setLoadingMensal(false);
      });

    api.get('http://localhost:5001/dashboard/receitas-despesas')
      .then((response) => {
        setReceitasDespesas(response.data);
        setLoadingReceitasDespesas(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar receitas e despesas:', error);
        setLoadingReceitasDespesas(false);
      });

    api.get('http://localhost:5001/dashboard/status-receitas')
      .then((response) => {
        setStatusReceitas(response.data);
        setLoadingStatusReceitas(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar status das receitas:', error);
        setLoadingStatusReceitas(false);
      });
  }, []);

  // Dados para o gráfico de Saldo Mensal
  const saldoMensalData = {
    labels: dadosMensais.map(item => item.mes_ano),
    datasets: [
      {
        label: 'Saldo Mensal',
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        data: dadosMensais.map(item => item.saldo),
      }
    ]
  };

  const receitasDespesasData = {
    labels: ['Receitas', 'Despesas'],
    datasets: [
      {
        label: 'Valor',
        data: [receitasDespesas.receitas, receitasDespesas.despesas],
        backgroundColor: ['#36a2eb', '#ff6384'],
      }
    ]
  };

  const statusReceitasData = {
    labels: ['Receitas Futuras', 'Receitas Efetivadas'],
    datasets: [
      {
        label: 'Status das Receitas',
        data: [statusReceitas.futuras, statusReceitas.efetivadas],
        backgroundColor: ['#ffcd56', '#4bc0c0'],
      }
    ]
  };

  // Opções para controlar o tamanho dos gráficos
  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Custom Chart',
      },
    },
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard Financeiro</Typography>

      {/* Seção de Saldo Mensal */}
      <Box mb={5} style={{ height: '300px' }}>
        <Typography variant="h6" gutterBottom>Saldo Mensal (Evolução mês a mês)</Typography>
        {loadingMensal ? <p>Carregando...</p> : <Bar data={saldoMensalData} options={chartOptions} />}
      </Box>

      {/* Seção de Receitas vs Despesas */}
      <Box mb={5} style={{ height: '300px' }}>
        <Typography variant="h6" gutterBottom>Receitas vs Despesas</Typography>
        {loadingReceitasDespesas ? <p>Carregando...</p> : <Pie data={receitasDespesasData} options={chartOptions} />}
      </Box>

      {/* Seção de Status das Receitas */}
      <Box style={{ height: '300px' }}>
        <Typography variant="h6" gutterBottom>Status das Receitas (Futuras vs Efetivadas)</Typography>
        {loadingStatusReceitas ? <p>Carregando...</p> : <Pie data={statusReceitasData} options={chartOptions} />}
      </Box>
    </Box>
  );
};

export default Dashboard;
