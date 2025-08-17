const pool = require('./madu-backend/config/config');

function parseAluno(rawNome) {
  if (!rawNome) return null;
  // Ex.: "2025-97 Maria Clara Mariano Braga (Gabriela Mariano da Silva)"
  const match = rawNome.match(/^\s*([A-Za-z0-9_-]+)\s+(.+?)(?:\s*\((.+)\)\s*)?$/);
  // O padrão acima pode não pegar bem quando há hífen após o código. Alternativa:
  // Split no primeiro espaço: token1 = código (com hífen), resto = nome + (resp)
  let codigo = null, nome = rawNome, responsavel = null;

  const firstSpace = rawNome.indexOf(' ');
  if (firstSpace > 0) {
    const maybeCodigo = rawNome.slice(0, firstSpace).trim();
    const resto = rawNome.slice(firstSpace + 1).trim();
    codigo = maybeCodigo;
    // Extrai responsável entre parênteses se existir
    const respMatch = resto.match(/^(.*?)(?:\s*\((.+)\)\s*)?$/);
    if (respMatch) {
      nome = respMatch[1].trim();
      responsavel = (respMatch[2] || '').trim() || null;
    } else {
      nome = resto;
    }
  }

  // Limpezas
  if (codigo && codigo.length > 64) codigo = codigo.slice(0, 64);
  if (responsavel && responsavel.length > 255) responsavel = responsavel.slice(0, 255);
  return { codigo, nome, responsavel_nome: responsavel };
}

async function normalize() {
  try {
    console.log('Carregando alunos...');
    const res = await pool.query('SELECT id, nome FROM alunos');
    let updates = 0;

    for (const row of res.rows) {
      const parsed = parseAluno(row.nome);
      if (!parsed || !parsed.codigo) continue; // só normaliza quando reconhece um código

      const { codigo, nome, responsavel_nome } = parsed;
      // Atualiza apenas campos que mudam
      await pool.query(
        `UPDATE alunos
         SET codigo = COALESCE($1, codigo),
             nome = COALESCE($2, nome),
             responsavel_nome = COALESCE($3, responsavel_nome),
             updated_at = NOW()
         WHERE id = $4`,
        [codigo, nome, responsavel_nome, row.id]
      );
      updates++;
      console.log(`Atualizado id=${row.id} -> codigo='${codigo}', nome='${nome}', responsavel='${responsavel_nome || ''}'`);
    }

    console.log(`Concluído. Registros atualizados: ${updates}`);
  } catch (e) {
    console.error('Erro ao normalizar alunos:', e);
  } finally {
    await pool.end();
  }
}

normalize();
