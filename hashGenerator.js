const bcrypt = require('bcrypt');

const gerarHash = async () => {
  const senha = 'admin_madu_123'; // Substitua pela senha desejada
  const saltRounds = 10;
  const hash = await bcrypt.hash(senha, saltRounds);
  console.log('Senha hash:', hash);
};

gerarHash();
