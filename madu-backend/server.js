const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Configurar variáveis de ambiente
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Testar rota inicial
app.get('/', (req, res) => {
  res.send('API da Madu está funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
