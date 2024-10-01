const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o servidor está correto
const pool = require('../config/config'); // Certifique-se de importar o pool de conexão

describe('Rotas de Vendas', () => {

  let vendaId;  // Armazena o ID da venda para usar nos testes
  let alunoId;  // Armazena o ID do aluno para criar vendas
  let produtoId;  // Armazena o ID do produto para criar vendas

  beforeAll(async () => {
    // Insere um aluno antes de testar as vendas
    const alunoRes = await pool.query(`
      INSERT INTO alunos (nome, sexo, data_nascimento, telefone, cpf, email)
      VALUES ('Aluno Teste', 'M', '1990-01-01', '11999999999', '12345678901', 'aluno@teste.com')
      RETURNING id;
    `);
    alunoId = alunoRes.rows[0].id;

    // Insere um produto antes de testar as vendas
    const produtoRes = await pool.query(`
      INSERT INTO produtos (nome, descricao, preco, quantidade_estoque)
      VALUES ('Produto Teste', 'Descrição do produto', 50.00, 100)
      RETURNING id;
    `);
    produtoId = produtoRes.rows[0].id;
  });

  afterAll(async () => {
    // Deleta o aluno e o produto após todos os testes
    await pool.query('DELETE FROM alunos WHERE id = $1', [alunoId]);
    await pool.query('DELETE FROM produtos WHERE id = $1', [produtoId]);
    await pool.end(); // Fecha a conexão com o banco de dados após todos os testes
  });

  // Teste para criar uma nova venda
  it('deve criar uma nova venda', async () => {
    const res = await request(app)
      .post('/vendas')
      .send({
        aluno_id: alunoId,
        produto_id: produtoId,
        quantidade: 3,
        valor_total: 150.00,
        data_venda: "2024-09-25"
      });
    
    expect(res.statusCode).toEqual(201);  // Verifica se o código de status é 201 (Created)
    expect(res.body).toHaveProperty('id');  // Verifica se a resposta contém o campo 'id'
    vendaId = res.body.id;  // Armazena o ID da venda para usar em testes futuros
  });

  // Teste para listar todas as vendas
  it('deve listar todas as vendas', async () => {
    const res = await request(app).get('/vendas');
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(Array.isArray(res.body)).toBeTruthy();  // Verifica se o corpo da resposta é um array
  });

  // Teste para buscar uma venda por ID
  it('deve buscar uma venda pelo ID', async () => {
    const res = await request(app).get(`/vendas/${vendaId}`);
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('id', vendaId);  // Verifica se a venda retornada tem o ID correto
  });

  // Teste para atualizar uma venda existente
  it('deve atualizar uma venda existente', async () => {
    const res = await request(app)
      .put(`/vendas/${vendaId}`)
      .send({
        aluno_id: alunoId,
        produto_id: produtoId,
        quantidade: 5,
        valor_total: 250.00,
        data_venda: "2024-09-26"
      });
    
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('quantidade', 5);  // Verifica se a quantidade foi atualizada
  });

  // Teste para deletar uma venda
  it('deve deletar uma venda existente', async () => {
    const res = await request(app).delete(`/vendas/${vendaId}`);
    expect(res.statusCode).toEqual(204);  // Verifica se o status code é 204 (No Content)
  });

  // Teste para buscar uma venda que não existe
  it('deve retornar 404 ao buscar uma venda que não existe', async () => {
    const res = await request(app).get(`/vendas/${vendaId}`);
    expect(res.statusCode).toEqual(404);  // Verifica se o status code é 404 (Not Found)
  });
});
