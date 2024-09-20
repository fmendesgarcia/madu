// __tests__/presencas.test.js
const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o servidor está correto
const pool = require('../config/config'); // Certifique-se de importar o pool de conexão


describe('Rotas de Presenças', () => {

  let presencaId;  // Armazena o ID da presença para usar nos testes
  let alunoId = 1;  // Simulação de um aluno existente
  let aulaId = 1;  // Simulação de uma aula existente

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


afterAll(async () => {
    await pool.end(); // Fecha a conexão com o banco de dados após todos os testes
  });
