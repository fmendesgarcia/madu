const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o servidor está correto
const pool = require('../config/config'); // Certifique-se de importar o pool de conexão

describe('Rotas de Professores', () => {

  let professorId;  // Armazena o ID do professor para usar nos testes

  // Teste para criar um novo professor
  it('deve criar um novo professor', async () => {
    const res = await request(app)
      .post('/professores')
      .send({
        nome: "Carlos Silva",
        apelido: "Carlão",
        sexo: "M",
        data_nascimento: "1980-03-15",
        cpf: "12345678901",
        cnpj: "98765432100123",
        email: "carlos@gmail.com",
        telefone: "11988887777",
        endereco: "Rua ABC, 456",
        cidade: "São Paulo",
        estado: "SP",
        valor_hora: 150.50,
        dia_pagamento: 15,
        dados_bancarios: "chave-pix",
        contrato: "https://contrato-url.com"
      });
    
    expect(res.statusCode).toEqual(201);  // Verifica se o código de status é 201 (Created)
    expect(res.body).toHaveProperty('id');  // Verifica se a resposta contém o campo 'id'
    professorId = res.body.id;  // Armazena o ID do professor para usar em testes futuros
  });

  // Teste para listar todos os professores
  it('deve listar todos os professores', async () => {
    const res = await request(app).get('/professores');
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(Array.isArray(res.body)).toBeTruthy();  // Verifica se o corpo da resposta é um array
  });

  // Teste para buscar um professor por ID
  it('deve buscar um professor pelo ID', async () => {
    const res = await request(app).get(`/professores/${professorId}`);
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('id', professorId);  // Verifica se o professor retornado tem o ID correto
  });

  // Teste para atualizar um professor existente
  it('deve atualizar um professor existente', async () => {
    const res = await request(app)
      .put(`/professores/${professorId}`)
      .send({
        nome: "Carlos Silva",
        apelido: "Carlão Atualizado",
        sexo: "M",
        data_nascimento: "1980-03-15",
        cpf: "12345678901",
        cnpj: "98765432100123",
        email: "carlos_atualizado@gmail.com",
        telefone: "11988887777",
        endereco: "Rua XYZ, 456",
        cidade: "São Paulo",
        estado: "SP",
        valor_hora: 180.00,
        dia_pagamento: 20,
        dados_bancarios: "chave-pix-atualizada",
        contrato: "https://contrato-url-atualizado.com"
      });

    console.log("Status:", res.statusCode);
    console.log("Response body:", res.body);
    
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('apelido', "Carlão Atualizado");  // Verifica se o apelido foi atualizado
  });

  // Teste para deletar um professor
  it('deve deletar um professor existente', async () => {
    const res = await request(app).delete(`/professores/${professorId}`);
    expect(res.statusCode).toEqual(204);  // Verifica se o status code é 204 (No Content)
  });

  // Teste para buscar um professor que não existe
  it('deve retornar 404 ao buscar um professor que não existe', async () => {
    const res = await request(app).get(`/professores/${professorId}`);
    expect(res.statusCode).toEqual(404);  // Verifica se o status code é 404 (Not Found)
  });
});

afterAll(async () => {
  await pool.end(); // Fecha a conexão com o banco de dados após todos os testes
});
