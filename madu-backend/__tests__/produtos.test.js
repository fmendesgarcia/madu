// __tests__/produtos.test.js
const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o servidor está correto
const pool = require('../config/config'); // Certifique-se de importar o pool de conexão


describe('Rotas de Produtos', () => {

  let produtoId;  // Armazena o ID do produto para usar nos testes

  // Teste para criar um novo produto
  it('deve criar um novo produto', async () => {
    const res = await request(app)
      .post('/produtos')
      .send({
        nome: "Produto Exemplo",
        descricao: "Descrição do produto exemplo",
        preco: 100.00,
        quantidade_estoque: 10
      });
    
    expect(res.statusCode).toEqual(201);  // Verifica se o código de status é 201 (Created)
    expect(res.body).toHaveProperty('id');  // Verifica se a resposta contém o campo 'id'
    produtoId = res.body.id;  // Armazena o ID do produto para usar em testes futuros
  });

  // Teste para listar todos os produtos
  it('deve listar todos os produtos', async () => {
    const res = await request(app).get('/produtos');
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(Array.isArray(res.body)).toBeTruthy();  // Verifica se o corpo da resposta é um array
  });

  // Teste para buscar um produto por ID
  it('deve buscar um produto pelo ID', async () => {
    const res = await request(app).get(`/produtos/${produtoId}`);
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('id', produtoId);  // Verifica se o produto retornado tem o ID correto
  });

  // Teste para atualizar um produto existente
  it('deve atualizar um produto existente', async () => {
    const res = await request(app)
      .put(`/produtos/${produtoId}`)
      .send({
        nome: "Produto Atualizado",
        descricao: "Nova descrição do produto atualizado",
        preco: 150.00,
        quantidade_estoque: 15
      });
    
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('nome', "Produto Atualizado");  // Verifica se o nome foi atualizado
    expect(res.body).toHaveProperty('preco', 150.00);  // Verifica se o preço foi atualizado
  });

  // Teste para deletar um produto
  it('deve deletar um produto existente', async () => {
    const res = await request(app).delete(`/produtos/${produtoId}`);
    expect(res.statusCode).toEqual(204);  // Verifica se o status code é 204 (No Content)
  });

  // Teste para buscar um produto que não existe
  it('deve retornar 404 ao buscar um produto que não existe', async () => {
    const res = await request(app).get(`/produtos/${produtoId}`);
    expect(res.statusCode).toEqual(404);  // Verifica se o status code é 404 (Not Found)
  });

});


afterAll(async () => {
    await pool.end(); // Fecha a conexão com o banco de dados após todos os testes
  });

