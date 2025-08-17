const pool = require('./madu-backend/config/config');

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com o banco Neon...');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Conexão bem-sucedida!');
    console.log('Hora atual do banco:', result.rows[0].current_time);
    return true;
  } catch (err) {
    console.error('❌ Erro na conexão:', err.message);
    return false;
  }
}

async function listUsers() {
  try {
    console.log('\n📋 Verificando usuários existentes...');
    const result = await pool.query('SELECT id, name, email FROM users');
    
    if (result.rows.length === 0) {
      console.log('Nenhum usuário encontrado no banco.');
    } else {
      console.log('Usuários encontrados:');
      result.rows.forEach(user => {
        console.log(`  ID: ${user.id} | Nome: ${user.name} | Email: ${user.email}`);
      });
    }
    return result.rows;
  } catch (err) {
    console.error('❌ Erro ao listar usuários:', err.message);
    return [];
  }
}

async function createSimpleUser(name, email, password) {
  try {
    console.log(`\n👤 Criando usuário: ${name} (${email})`);
    
    // Verificar se o usuário já existe
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('❌ Usuário já existe com este email!');
      return false;
    }

    // Inserir novo usuário (sem criptografia por enquanto)
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, password]
    );

    const newUser = result.rows[0];
    console.log('✅ Usuário criado com sucesso!');
    console.log('ID:', newUser.id);
    console.log('Nome:', newUser.name);
    console.log('Email:', newUser.email);
    console.log('Senha:', password, '(guarde esta senha!)');
    console.log('\n⚠️  ATENÇÃO: Esta senha não está criptografada. Use apenas para teste!');
    return true;
  } catch (err) {
    console.error('❌ Erro ao criar usuário:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Testando conexão com o banco Neon...\n');
  
  // Testar conexão
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Não foi possível conectar ao banco. Verifique as credenciais.');
    process.exit(1);
  }
  
  // Listar usuários existentes
  const users = await listUsers();
  
  // Se não há usuários, criar um admin
  if (users.length === 0) {
    console.log('\n🔧 Nenhum usuário encontrado. Criando usuário admin...');
    await createSimpleUser('Admin', 'admin@madu.com', '123456');
  } else {
    console.log('\n💡 Usuários já existem no banco. Você pode usar um deles para fazer login.');
    console.log('Ou criar um novo usuário executando:');
    console.log('node testConnection.js create "Seu Nome" "seu@email.com" "sua_senha"');
  }
  
  await pool.end();
  console.log('\n✅ Teste concluído! Agora você pode rodar o backend.');
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const command = args[0];

if (command === 'create') {
  const name = args[1];
  const email = args[2];
  const password = args[3];
  
  if (!name || !email || !password) {
    console.log('❌ Uso: node testConnection.js create "Nome" "email@exemplo.com" "senha"');
    process.exit(1);
  }
  
  testConnection().then(connected => {
    if (connected) {
      createSimpleUser(name, email, password).then(() => pool.end());
    }
  });
} else {
  main();
} 