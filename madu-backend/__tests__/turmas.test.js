const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o servidor está correto
const pool = require('../config/config'); // Certifique-se de importar o pool de conexão

describe('Rotas de Turmas', () => {

  let turmaId;  // Armazena o ID da turma para usar nos testes
  let professorId;  // Armazena o ID do professor para criar turmas

  beforeAll(async () => {
    // Insere um professor antes de testar as turmas
    const professorRes = await pool.query(`
      INSERT INTO professores (nome, apelido, sexo, cpf, email, telefone) 
      VALUES ('Professor Teste', 'Prof Teste', 'M', '12345678901', 'prof@teste.com', '1199999999')
      RETURNING id;
    `);
    professorId = professorRes.rows[0].id;  // Armazena o ID do professor para usar nos testes de turma
  });

  afterAll(async () => {
    // Deleta o professor após todos os testes
    await pool.query('DELETE FROM professores WHERE id = $1', [professorId]);
    await pool.end(); // Fecha a conexão com o banco de dados após todos os testes
  });

  // Teste para criar uma nova turma
  it('deve criar uma nova turma', async () => {
    const res = await request(app)
      .post('/turmas')
      .send({
        nome: "Turma de Ballet Avançado",
        modalidade: "Presencial",
        tipo: "Grupo",
        nivel: "Avançado",
        professor_id: professorId,
        dias_da_semana: ["Segunda", "Quarta", "Sexta"],  // Mudança para array de strings
        horario: "18:00:00",
        max_alunos: 20,
        valor_hora: 20.50,
      });
    
    expect(res.statusCode).toEqual(201);  // Verifica se o código de status é 201 (Created)
    expect(res.body).toHaveProperty('id');  // Verifica se a resposta contém o campo 'id'
    turmaId = res.body.id;  // Armazena o ID da turma para usar em testes futuros
  });

  // Teste para listar todas as turmas
  it('deve listar todas as turmas', async () => {
    const res = await request(app).get('/turmas');
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(Array.isArray(res.body)).toBeTruthy();  // Verifica se o corpo da resposta é um array
  });

  // Teste para buscar uma turma por ID
  it('deve buscar uma turma pelo ID', async () => {
    const res = await request(app).get(`/turmas/${turmaId}`);
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('id', turmaId);  // Verifica se a turma retornada tem o ID correto
  });

  // Teste para atualizar uma turma existente
  it('deve atualizar uma turma existente', async () => {
    const res = await request(app)
      .put(`/turmas/${turmaId}`)
      .send({
        nome: "Turma de Ballet Intermediário",
        modalidade: "Online",
        tipo: "Aula Particular",  // Adiciona o campo tipo
        nivel: "Intermediário",
        professor_id: professorId,
        dias_da_semana: ["Terça", "Quinta"],  // Mudança para array de strings
        horario: "19:00:00",
        max_alunos: 25,
        valor_hora: 30.75  // Atualizando o valor_hora
      });
    
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('nome', "Turma de Ballet Intermediário");  // Verifica se o nome foi atualizado
  });

  // Teste para deletar uma turma
  it('deve deletar uma turma existente', async () => {
    const res = await request(app).delete(`/turmas/${turmaId}`);
    expect(res.statusCode).toEqual(204);  // Verifica se o status code é 204 (No Content)
  });

  // Teste para buscar uma turma que não existe
  it('deve retornar 404 ao buscar uma turma que não existe', async () => {
    const res = await request(app).get(`/turmas/${turmaId}`);
    expect(res.statusCode).toEqual(404);  // Verifica se o status code é 404 (Not Found)
  });
});
