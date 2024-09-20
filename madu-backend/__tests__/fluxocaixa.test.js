// __tests__/fluxocaixa.test.js
const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o servidor está correto
const pool = require('../config/config'); // Certifique-se de importar o pool de conexão

describe('Rotas de Fluxo de Caixa', () => {

  let movimentoId; // Armazena o ID do movimento para usar nos testes

  // Teste para criar um novo movimento no fluxo de caixa
  it('deve criar um novo movimento no fluxo de caixa', async () => {
    const res = await request(app)
      .post('/fluxo_caixa')
      .send({
        tipo: "Entrada",
        descricao: "Recebimento de mensalidade",
        valor: 500.00,
        data_movimento: "2024-09-25"
      });
    
    expect(res.statusCode).toEqual(201);  // Verifica se o código de status é 201 (Created)
    expect(res.body).toHaveProperty('id');  // Verifica se a resposta contém o campo 'id'
    movimentoId = res.body.id;  // Armazena o ID do movimento para usar em testes futuros
  });

  // Teste para listar todos os movimentos no fluxo de caixa
  it('deve listar todos os movimentos no fluxo de caixa', async () => {
    const res = await request(app).get('/fluxo_caixa');
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(Array.isArray(res.body)).toBeTruthy();  // Verifica se o corpo da resposta é um array
  });

  // Teste para buscar um movimento no fluxo de caixa por ID
  it('deve buscar um movimento no fluxo de caixa pelo ID', async () => {
    const res = await request(app).get(`/fluxo_caixa/${movimentoId}`);
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('id', movimentoId);  // Verifica se o movimento retornado tem o ID correto
  });

  // Teste para atualizar um movimento existente no fluxo de caixa
  it('deve atualizar um movimento existente no fluxo de caixa', async () => {
    const res = await request(app)
      .put(`/fluxo_caixa/${movimentoId}`)
      .send({
        tipo: "Saída",
        descricao: "Pagamento de fornecedor",
        valor: 300.00,
        data_movimento: "2024-09-26"
      });
    
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('tipo', "Saída");  // Verifica se o tipo foi atualizado
    expect(parseFloat(res.body.valor)).toBe(300.00);  // Converte o valor de string para número e compara
  });

  // Teste para deletar um movimento no fluxo de caixa
  it('deve deletar um movimento no fluxo de caixa existente', async () => {
    const res = await request(app).delete(`/fluxo_caixa/${movimentoId}`);
    expect(res.statusCode).toEqual(204);  // Verifica se o status code é 204 (No Content)
  });

  // Teste para buscar um movimento que não existe
  it('deve retornar 404 ao buscar um movimento que não existe', async () => {
    const res = await request(app).get(`/fluxo_caixa/${movimentoId}`);
    expect(res.statusCode).toEqual(404);  // Verifica se o status code é 404 (Not Found)
  });

});



afterAll(async () => {
    await pool.end(); // Fecha a conexão com o banco de dados após todos os testes
  });
