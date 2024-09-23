// __tests__/aulas.test.js
const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o servidor está correto
const pool = require('../config/config'); // Certifique-se de importar o pool de conexão


let turmaId;
let aulaId;
let professorId;


beforeAll(async () => {
    // Insere um professor antes de inserir a turma
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

  afterAll(async () => {
    // Remove a aula criada no teste
    await pool.query('DELETE FROM aulas WHERE turma_id = $1', [turmaId]);
  
    // Remove a turma criada no teste
    await pool.query('DELETE FROM turmas WHERE id = $1', [turmaId]);
  
    // Remove o professor associado à turma
    await pool.query('DELETE FROM professores WHERE id = $1', [professorId]);
  });
  



describe('Rotas de Aulas', () => {

  // Teste para criar uma nova aula
  it('deve criar uma nova aula', async () => {
    const res = await request(app)
      .post('/aulas')
      .send({
        turma_id: turmaId,
        data: "2024-09-25",
        horario: "18:00:00",
        duracao: 60
      });
    
    expect(res.statusCode).toEqual(201);  // Verifica se o código de status é 201 (Created)
    expect(res.body).toHaveProperty('id');  // Verifica se a resposta contém o campo 'id'
    aulaId = res.body.id;  // Armazena o ID da aula para usar em testes futuros
    console.log(`aulaId: ${aulaId}`);  // Corrige para console.log no Node.js

  });

  // Teste para listar todas as aulas
  it('deve listar todas as aulas', async () => {
    console.log(`aulaId: ${aulaId}`);  // Corrige para console.log no Node.js

    const res = await request(app).get('/aulas');
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(Array.isArray(res.body)).toBeTruthy();  // Verifica se o corpo da resposta é um array
  });

  // Teste para buscar uma aula por ID
  it('deve buscar uma aula pelo ID', async () => {
    console.log(`aulaId: ${aulaId}`);  // Corrige para console.log no Node.js
    const res = await request(app).get(`/aulas/${aulaId}`);
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('id', aulaId);  // Verifica se a aula retornada tem o ID correto
  });

  // Teste para atualizar uma aula existente
  it('deve atualizar uma aula existente', async () => {
    console.log(`aulaId: ${aulaId}`); 
    const res = await request(app)
      .put(`/aulas/${aulaId}`)
      .send({
        turma_id: turmaId,
        data: "2024-09-26",
        horario: "19:00:00",
        duracao: 90
      });
    
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('duracao', 90);  // Verifica se a aula foi atualizada corretamente
  });

  // Teste para deletar uma aula
  it('deve deletar uma aula existente', async () => {
    console.log(`aulaId: ${aulaId}`); 
    const res = await request(app).delete(`/aulas/${aulaId}`);
    expect(res.statusCode).toEqual(204);  // Verifica se o status code é 204 (No Content)
  });

  // Teste para buscar uma aula que não existe
  it('deve retornar 404 ao buscar uma aula que não existe', async () => {
    console.log(`aulaId: ${aulaId}`); 
    const res = await request(app).get(`/aulas/${aulaId}`);
    expect(res.statusCode).toEqual(404);  // Verifica se o status code é 404 (Not Found)
  });

});


afterAll(async () => {
    await pool.end(); // Fecha a conexão com o banco de dados após todos os testes
  });
