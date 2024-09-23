// __tests__/pagamentos.test.js
const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o servidor está correto
const pool = require('../config/config'); // Certifique-se de importar o pool de conexão


describe('Rotas de Pagamentos', () => {

  let pagamentoId;  // Armazena o ID do pagamento para usar nos testes
  let alunoId;
  let turmaId;
  let professorId;

// Insere um aluno e uma turma antes de cada teste
beforeAll(async () => {
// Inserir aluno
    const alunoRes = await pool.query(`
        INSERT INTO alunos (nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, foto, contrato)
        VALUES ('Aluno Teste', 'M', '2000-01-01', '11999999999', '12345678901', 'aluno@test.com', false, false, 'Rua A', 'Cidade B', 'SP', 'https://foto.com', 'https://contrato.com')
        RETURNING id;
    `);
    alunoId = alunoRes.rows[0].id;

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

// Remove a matrícula, o aluno e a turma após cada teste
afterAll(async () => {
await pool.query('DELETE FROM pagamentos WHERE id = $1', [pagamentoId]);
await pool.query('DELETE FROM turmas WHERE id = $1', [turmaId]);
await pool.query('DELETE FROM alunos WHERE id = $1', [alunoId]);
});


    

  // Teste para criar um novo pagamento
  it('deve criar um novo pagamento', async () => {
    const res = await request(app)
      .post('/pagamentos')
      .send({
        aluno_id: alunoId,
        turma_id: turmaId,
        data_pagamento: "2024-09-25",
        valor_pago: 500.00,
        forma_pagamento: "cartão"
      });
    
    expect(res.statusCode).toEqual(201);  // Verifica se o código de status é 201 (Created)
    expect(res.body).toHaveProperty('id');  // Verifica se a resposta contém o campo 'id'
    pagamentoId = res.body.id;  // Armazena o ID do pagamento para usar em testes futuros
  });

  // Teste para listar todos os pagamentos
  it('deve listar todos os pagamentos', async () => {
    const res = await request(app).get('/pagamentos');
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(Array.isArray(res.body)).toBeTruthy();  // Verifica se o corpo da resposta é um array
  });

  // Teste para buscar um pagamento por ID
  it('deve buscar um pagamento pelo ID', async () => {
    const res = await request(app).get(`/pagamentos/${pagamentoId}`);
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('id', pagamentoId);  // Verifica se o pagamento retornado tem o ID correto
  });

  // Teste para atualizar um pagamento existente
  it('deve atualizar um pagamento existente', async () => {
    const res = await request(app)
      .put(`/pagamentos/${pagamentoId}`)
      .send({
        aluno_id: alunoId,
        turma_id: turmaId,
        data_pagamento: "2024-09-26",
        valor_pago: 450.00,
        forma_pagamento: "boleto"
      });
    
    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(parseFloat(res.body.valor_pago)).toBe(450.00);  // Converte o valor de string para número e compara

    expect(res.body).toHaveProperty('forma_pagamento', "boleto");  // Verifica se a forma de pagamento foi atualizada
  });

  // Teste para deletar um pagamento
  it('deve deletar um pagamento existente', async () => {
    const res = await request(app).delete(`/pagamentos/${pagamentoId}`);
    expect(res.statusCode).toEqual(204);  // Verifica se o status code é 204 (No Content)
  });

  // Teste para buscar um pagamento que não existe
  it('deve retornar 404 ao buscar um pagamento que não existe', async () => {
    const res = await request(app).get(`/pagamentos/${pagamentoId}`);
    expect(res.statusCode).toEqual(404);  // Verifica se o status code é 404 (Not Found)
  });

});


afterAll(async () => {
    await pool.end(); // Fecha a conexão com o banco de dados após todos os testes
  });
