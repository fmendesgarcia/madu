// __tests__/alunos.test.js
const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o servidor está correto
const pool = require('../config/config'); // Certifique-se de importar o pool de conexão


describe('Rotas de Alunos', () => {
  
  let alunoId; // Armazena o ID do aluno para usar nos testes

  // Teste para criar um novo aluno
  it('deve criar um novo aluno', async () => {
    const res = await request(app)
      .post('/alunos')
      .send({
        nome: "João Silva",
        sexo: "M",
        data_nascimento: "1990-05-20",
        telefone: "11999999999",
        cpf: "12345678901",
        email: "joao@gmail.com",
        responsavel_financeiro: false,
        bolsista: true,
        endereco: "Rua ABC, 123",
        cidade: "São Paulo",
        estado: "SP",
        foto: "https://foto-url.com",
        contrato: "https://contrato-url.com"
      });
    
    expect(res.statusCode).toEqual(201);  // Verifica se o código de status é 201 (Created)
    expect(res.body).toHaveProperty('id');  // Verifica se a resposta contém o campo 'id'
    alunoId = res.body.id;  // Armazena o ID do aluno para usar em testes futuros
  });

  // Teste para listar todos os alunos
  it('deve listar todos os alunos', async () => {
    const res = await request(app).get('/alunos');
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(Array.isArray(res.body)).toBeTruthy();  // Verifica se o corpo da resposta é um array
  });

  // Teste para buscar um aluno por ID
  it('deve buscar um aluno pelo ID', async () => {
    const res = await request(app).get(`/alunos/${alunoId}`);
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('id', alunoId);  // Verifica se o aluno retornado tem o ID correto
  });

  // Teste para atualizar um aluno
  it('deve atualizar um aluno existente', async () => {
    const res = await request(app)
      .put(`/alunos/${alunoId}`)
      .send({
        nome: "João Silva Atualizado",
        sexo: "M",
        data_nascimento: "1990-05-20",
        telefone: "11999999999",
        cpf: "12345678901",
        email: "joao_atualizado@gmail.com",
        responsavel_financeiro: true,
        bolsista: false,
        endereco: "Rua ABC, 123",
        cidade: "São Paulo",
        estado: "SP",
        foto: "https://foto-url-atualizado.com",
        contrato: "https://contrato-url-atualizado.com"
      });
    
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('nome', "João Silva Atualizado");  // Verifica se o nome foi atualizado
  });

  // Teste para deletar um aluno
  it('deve deletar um aluno existente', async () => {
    const res = await request(app).delete(`/alunos/${alunoId}`);
    expect(res.statusCode).toEqual(204);  // Verifica se o status code é 204 (No Content)
  });

  // Teste para buscar um aluno que não existe
  it('deve retornar 404 ao buscar um aluno que não existe', async () => {
    const res = await request(app).get(`/alunos/${alunoId}`);
    expect(res.statusCode).toEqual(404);  // Verifica se o status code é 404 (Not Found)
  });

});

afterAll(async () => {
    await pool.end(); // Fecha a conexão com o banco de dados após todos os testes
  });
