// __tests__/matriculas.test.js
const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o servidor está correto
const pool = require('../config/config'); // Certifique-se de importar o pool de conexão


describe('Rotas de Matrículas', () => {

  let matriculaId;  // Armazena o ID da matrícula para usar nos testes
  let alunoId;
  let turmaId;
  let professorId;

  // Insere um aluno e uma turma antes de cada teste
  beforeAll(async () => {
    // Inserir aluno
    const alunoRes = await pool.query(`
      INSERT INTO alunos (nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, foto, contrato)
      VALUES ('Aluno Teste', 'M', '2000-01-01', '11999999999', '12345678901', 'aluno@test.com', false, false, 'Rua A', 'Cidade B', 'SP', 'https://foto.com', 'https://contrato.com')
      RETURNING id;
    `);
    alunoId = alunoRes.rows[0].id;

    const professorRes = await pool.query(`
        INSERT INTO professores (nome, apelido, sexo, cpf, telefone, email)
        VALUES ('Professor Teste', 'Prof', 'M', '12345678901', '11999999999', 'prof@test.com')
        RETURNING id;
      `);
      
    professorId = professorRes.rows[0].id;

    // Insere a turma com o professor válido
    const res = await pool.query(`
    INSERT INTO turmas (nome, modalidade, nivel, professor_id, dias_da_semana, horario, max_alunos)
    VALUES ('Turma Teste', 'Presencial', 'Iniciante', $1, 'Segunda, Quarta, Sexta', '18:00:00', 30)
    RETURNING id;
    `, [professorId]);

    turmaId = res.rows[0].id;
  });

  // Remove a matrícula, o aluno e a turma após cada teste
  afterAll(async () => {
    await pool.query('DELETE FROM matriculas WHERE id = $1', [matriculaId]);
    await pool.query('DELETE FROM turmas WHERE id = $1', [turmaId]);
    await pool.query('DELETE FROM alunos WHERE id = $1', [alunoId]);
  });

  // Teste para criar uma nova matrícula
  it('deve criar uma nova matrícula', async () => {
    const res = await request(app)
      .post('/matriculas')
      .send({
        aluno_id: alunoId,
        turma_id: turmaId,
        status: "ativa",
        mensalidade: 500.00,
        data_vencimento: "2024-10-01",
        data_final_contrato: "2025-09-30",
        desconto: 50.00,
        isencao_taxa: true,
        bolsista: false
      });
    
    expect(res.statusCode).toEqual(201);  // Verifica se o código de status é 201 (Created)
    expect(res.body).toHaveProperty('id');  // Verifica se a resposta contém o campo 'id'
    matriculaId = res.body.id;  // Armazena o ID da matrícula para usar em testes futuros
  });

  // Teste para listar todas as matrículas
  it('deve listar todas as matrículas', async () => {
    const res = await request(app).get('/matriculas');
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(Array.isArray(res.body)).toBeTruthy();  // Verifica se o corpo da resposta é um array
  });

  // Teste para buscar uma matrícula por ID
  it('deve buscar uma matrícula pelo ID', async () => {
    const res = await request(app).get(`/matriculas/${matriculaId}`);
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('id', matriculaId);  // Verifica se a matrícula retornada tem o ID correto
  });

  // Teste para atualizar uma matrícula existente
  it('deve atualizar uma matrícula existente', async () => {
    const res = await request(app)
      .put(`/matriculas/${matriculaId}`)
      .send({
        aluno_id: alunoId,
        turma_id: turmaId,
        status: "inativa",
        mensalidade: 450.00,
        data_vencimento: "2024-11-01",
        data_final_contrato: "2025-08-30",
        desconto: 25.00,
        isencao_taxa: false,
        bolsista: true
      });
    
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('status', "inativa");  // Verifica se o status foi atualizado
    expect(parseFloat(res.body.mensalidade)).toBe(450.00);  // Converte o valor de string para número e compara

    
  });

  // Teste para deletar uma matrícula
  it('deve deletar uma matrícula existente', async () => {
    const res = await request(app).delete(`/matriculas/${matriculaId}`);
    expect(res.statusCode).toEqual(204);  // Verifica se o status code é 204 (No Content)
  });

  // Teste para buscar uma matrícula que não existe
  it('deve retornar 404 ao buscar uma matrícula que não existe', async () => {
    const res = await request(app).get(`/matriculas/${matriculaId}`);
    expect(res.statusCode).toEqual(404);  // Verifica se o status code é 404 (Not Found)
  });

});


afterAll(async () => {
    await pool.end(); // Fecha a conexão com o banco de dados após todos os testes
});
