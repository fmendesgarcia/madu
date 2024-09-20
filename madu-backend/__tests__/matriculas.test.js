// __tests__/matriculas.test.js
const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o servidor está correto
const pool = require('../config/config'); // Certifique-se de importar o pool de conexão


describe('Rotas de Matrículas', () => {

  let matriculaId;  // Armazena o ID da matrícula para usar nos testes
  let alunoId = 1;  // Simulação de um aluno existente
  let turmaId = 1;  // Simulação de uma turma existente

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
    expect(res.body).toHaveProperty('mensalidade', 450.00);  // Verifica se a mensalidade foi atualizada
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
