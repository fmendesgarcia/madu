// __tests__/aulas.test.js
const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o servidor está correto
const pool = require('../config/config'); // Certifique-se de importar o pool de conexão

describe('Rotas de Aulas', () => {

  let aulaId; // Armazena o ID da aula para usar nos testes
  let turmaId = 1; // Simulação de uma turma existente, você pode ajustar conforme seu banco

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
  });

  // Teste para listar todas as aulas
  it('deve listar todas as aulas', async () => {
    const res = await request(app).get('/aulas');
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(Array.isArray(res.body)).toBeTruthy();  // Verifica se o corpo da resposta é um array
  });

  // Teste para buscar uma aula por ID
  it('deve buscar uma aula pelo ID', async () => {
    const res = await request(app).get(`/aulas/${aulaId}`);
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('id', aulaId);  // Verifica se a aula retornada tem o ID correto
  });

  // Teste para atualizar uma aula existente
  it('deve atualizar uma aula existente', async () => {
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
    const res = await request(app).delete(`/aulas/${aulaId}`);
    expect(res.statusCode).toEqual(204);  // Verifica se o status code é 204 (No Content)
  });

  // Teste para buscar uma aula que não existe
  it('deve retornar 404 ao buscar uma aula que não existe', async () => {
    const res = await request(app).get(`/aulas/${aulaId}`);
    expect(res.statusCode).toEqual(404);  // Verifica se o status code é 404 (Not Found)
  });

});


afterAll(async () => {
    await pool.end(); // Fecha a conexão com o banco de dados após todos os testes
  });
