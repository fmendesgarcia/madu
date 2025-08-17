const bcrypt = require('bcryptjs');
const pool = require('./madu-backend/config/config');

async function updatePassword(email, newPassword) {
  try {
    console.log(`🔧 Atualizando senha para: ${email}`);
    
    // Criptografar a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Atualizar a senha no banco
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, name, email',
      [hashedPassword, email]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado!');
      return false;
    }
    
    const user = result.rows[0];
    console.log('✅ Senha atualizada com sucesso!');
    console.log('ID:', user.id);
    console.log('Nome:', user.name);
    console.log('Email:', user.email);
    console.log('Nova senha:', newPassword, '(guarde esta senha!)');
    return true;
  } catch (err) {
    console.error('❌ Erro ao atualizar senha:', err.message);
    return false;
  } finally {
    await pool.end();
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const email = args[0];
const password = args[1];

if (!email || !password) {
  console.log('❌ Uso: node updatePassword.js "email@exemplo.com" "nova_senha"');
  console.log('💡 Exemplo: node updatePassword.js "felipe@madu.com" "123456"');
  process.exit(1);
}

updatePassword(email, password); 