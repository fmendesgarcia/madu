// start.js
const app = require('./server');

// Definindo a porta do servidor (por padrão 5000)
const PORT = process.env.PORT || 5001;

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
