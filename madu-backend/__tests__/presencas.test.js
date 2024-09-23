// __tests__/presencas.test.js
const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o servidor está correto
const pool = require('../config/config'); // Certifique-se de importar o pool de conexão

describe('Rotas de Presenças', () => {
  let presencaId;
  let alunoId;
  let aulaId;

  beforeAll(async () => {
    // Inserir um aluno para os testes
    const alunoRes = await pool.query(`
      INSERT INTO alunos (nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado)
      VALUES ('Aluno Teste', 'M', '2000-01-01', '11999999999', '12345678901', 'aluno@test.com', true, false, 'Rua Teste', 'São Paulo', 'SP')
      RETURNING id;
    `);
    alunoId = alunoRes.rows[0].id;

    // Inserir um professor
    const professorRes = await pool.query(`
      INSERT INTO professores (nome, apelido, sexo, cpf, telefone, email)
      VALUES ('Professor Teste', 'Prof', 'M', '12345678902', '11999999998', 'prof@test.com')
      RETURNING id;
    `);
    const professorId = professorRes.rows[0].id;

    // Inserir uma turma
    const turmaRes = await pool.query(`
      INSERT INTO turmas (nome, modalidade, nivel, professor_id, dias_da_semana, horario, max_alunos)
      VALUES ('Turma Teste', 'Presencial', 'Iniciante', $1, 'Segunda, Quarta, Sexta', '18:00:00', 30)
      RETURNING id;
    `, [professorId]);
    const turmaId = turmaRes.rows[0].id;

    // Inserir uma aula para essa turma
    const aulaRes = await pool.query(`
      INSERT INTO aulas (turma_id, data, horario, duracao)
      VALUES ($1, '2024-09-25', '18:00:00', 60)
      RETURNING id;
    `, [turmaId]);
    aulaId = aulaRes.rows[0].id;
  });

  afterAll(async () => {
    // Limpar a tabela de presenças
    await pool.query('DELETE FROM presencas WHERE aula_id = $1', [aulaId]);

    // Limpar as dependências: aulas, turmas, professores e alunos
    await pool.query('DELETE FROM aulas WHERE id = $1', [aulaId]);
    await pool.query('DELETE FROM turmas WHERE id = (SELECT turma_id FROM aulas WHERE id = $1)', [aulaId]);
    await pool.query('DELETE FROM professores WHERE id = (SELECT professor_id FROM turmas WHERE id = (SELECT turma_id FROM aulas WHERE id = $1))', [aulaId]);
    await pool.query('DELETE FROM alunos WHERE id = $1', [alunoId]);

    await pool.end(); // Fecha a conexão com o banco de dados
  });

  // Teste para registrar uma nova presença
  it('deve registrar uma nova presença', async () => {
    const res = await request(app)
      .post('/presencas')
      .send({
        aluno_id: alunoId,
        aula_id: aulaId,
        presente: true
      });
    
    expect(res.statusCode).toEqual(201);  // Verifica se o código de status é 201 (Created)
    expect(res.body).toHaveProperty('id');  // Verifica se a resposta contém o campo 'id'
    presencaId = res.body.id;  // Armazena o ID da presença para usar em testes futuros
  });

  // Teste para listar todas as presenças
  it('deve listar todas as presenças', async () => {
    const res = await request(app).get('/presencas');
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(Array.isArray(res.body)).toBeTruthy();  // Verifica se o corpo da resposta é um array
  });

  // Teste para buscar uma presença por ID
  it('deve buscar uma presença pelo ID', async () => {
    const res = await request(app).get(`/presencas/${presencaId}`);
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('id', presencaId);  // Verifica se a presença retornada tem o ID correto
  });

  // Teste para atualizar uma presença existente
  it('deve atualizar uma presença existente', async () => {
    const res = await request(app)
      .put(`/presencas/${presencaId}`)
      .send({
        aluno_id: alunoId,
        aula_id: aulaId,
        presente: false
      });
    
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('presente', false);  // Verifica se o status de presença foi atualizado corretamente
  });

  // Teste para deletar uma presença
  it('deve deletar uma presença existente', async () => {
    const res = await request(app).delete(`/presencas/${presencaId}`);
    expect(res.statusCode).toEqual(204);  // Verifica se o status code é 204 (No Content)
  });

  // Teste para buscar uma presença que não existe
  it('deve retornar 404 ao buscar uma presença que não existe', async () => {
    const res = await request(app).get(`/presencas/${presencaId}`);
    expect(res.statusCode).toEqual(404);  // Verifica se o status code é 404 (Not Found)
  });

});
