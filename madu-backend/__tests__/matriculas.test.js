const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o servidor está correto
const pool = require('../config/config'); // Certifique-se de importar o pool de conexão

describe('Rotas de Matrículas', () => {

  let matriculaId;  // Armazena o ID da matrícula para usar nos testes0,066
  let alunoId;
  let turmaId1;
  let turmaId2;
  let professorId;
  let mensalidades; // Para armazenar as mensalidades geradas
  let valorTurma1 = 150.00; // Definindo valores das turmas para teste
  let valorTurma2 = 200.00; 

  // Insere um aluno, professor e duas turmas antes de cada teste
  beforeAll(async () => {
    // Inserir aluno
    const alunoRes = await pool.query(`
      INSERT INTO alunos (nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, foto, contrato)
      VALUES ('Aluno Teste', 'M', '2000-01-01', '11999999999', '12345678901', 'aluno@test.com', false, false, 'Rua A', 'Cidade B', 'SP', 'https://foto.com', 'https://contrato.com')
      RETURNING id;
    `);
    alunoId = alunoRes.rows[0].id;

    // Inserir professor
    const professorRes = await pool.query(`
      INSERT INTO professores (nome, apelido, sexo, cpf, telefone, email)
      VALUES ('Professor Teste', 'Prof', 'M', '12345678901', '11999999999', 'prof@test.com')
      RETURNING id;
    `);
    professorId = professorRes.rows[0].id;

    // Inserir primeira turma com valor_hora
    const turmaRes1 = await pool.query(`
      INSERT INTO turmas (nome, modalidade, nivel, professor_id, dias_da_semana, horario, max_alunos, valor_hora)
      VALUES ('Turma Teste 1', 'Presencial', 'Iniciante', $1, 'Segunda, Quarta, Sexta', '18:00:00', 30, $2)
      RETURNING id;
    `, [professorId, valorTurma1]);
    turmaId1 = turmaRes1.rows[0].id;

    // Inserir segunda turma com valor_hora
    const turmaRes2 = await pool.query(`
      INSERT INTO turmas (nome, modalidade, nivel, professor_id, dias_da_semana, horario, max_alunos, valor_hora)
      VALUES ('Turma Teste 2', 'Presencial', 'Intermediário', $1, 'Terça, Quinta', '19:00:00', 25, $2)
      RETURNING id;
    `, [professorId, valorTurma2]);
    turmaId2 = turmaRes2.rows[0].id;
  });

  // Remove a matrícula, o aluno e as turmas após cada teste
  afterAll(async () => {
    await pool.query('DELETE FROM matriculas WHERE id = $1', [matriculaId]);
    await pool.query('DELETE FROM turmas WHERE id IN ($1, $2)', [turmaId1, turmaId2]);
    await pool.query('DELETE FROM alunos WHERE id = $1', [alunoId]);
  });

  // Teste para criar uma nova matrícula com múltiplas turmas
  it('deve criar uma nova matrícula com múltiplas turmas', async () => {
    const res = await request(app)
      .post('/matriculas')
      .send({
        aluno_id: alunoId,
        turmas_ids: [turmaId1, turmaId2], // Inserindo a matrícula com duas turmas
        status: "ativa",
        data_vencimento: "2024-10-01",
        data_final_contrato: "2025-09-30",
        desconto: 50.00,
        isencao_taxa: true,
        bolsista: false
      });
    
    expect(res.statusCode).toEqual(201);  // Verifica se o código de status é 201 (Created)
    expect(res.body).toHaveProperty('matricula.id');  // Verifica se a resposta contém o campo 'id'
    matriculaId = res.body.matricula.id;  // Armazena o ID da matrícula para usar em testes futuros

    // Verificar se o valor da mensalidade foi calculado corretamente
    const valorTotalEsperado = valorTurma1 + valorTurma2 - 50.00;  // Soma dos valores das turmas menos o desconto
    expect(parseFloat(res.body.matricula.mensalidade)).toBe(valorTotalEsperado);  // Verifica o valor da mensalidade

    // Verificar as mensalidades geradas
    const mensalidadeRes = await pool.query(`
      SELECT * FROM mensalidades WHERE matricula_id = $1;
    `, [matriculaId]);
    mensalidades = mensalidadeRes.rows;
    expect(mensalidades.length).toBeGreaterThan(0);  // Verifica se mensalidades foram geradas
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
    expect(res.body).toHaveProperty('turmas_nomes');  // Verifica se retorna os nomes das turmas
    expect(res.body.turmas_nomes.length).toBe(2);  // Verifica se há duas turmas associadas
  });

  // Teste para atualizar uma matrícula existente e verificar as mensalidades
  it('deve atualizar uma matrícula existente e verificar as mensalidades geradas', async () => {
    // Verificar o status das mensalidades antes de atualizar a matrícula
    const mensalidadeAntes = await pool.query(`
      SELECT status FROM mensalidades WHERE matricula_id = $1;
    `, [matriculaId]);

    console.log('Mensalidades antes da atualização:', mensalidadeAntes.rows); // Exibir mensalidades antes da alteração
    expect(mensalidadeAntes.rows[0].status).toBe('pendente');  // Verifica se a mensalidade está pendente

    const res = await request(app)
      .put(`/matriculas/${matriculaId}`)
      .send({
        aluno_id: alunoId,
        turmas_ids: [turmaId1, turmaId2],  // Atualizar com as turmas
        status: "inativa",  // Alterar o status da matrícula
        mensalidade: 450.00,
        data_matricula: "2024-10-01",
        data_vencimento: "2024-11-01",
        data_final_contrato: "2025-08-30",
        desconto: 25.00,
        isencao_taxa: false,
        bolsista: true
      });

    expect(res.statusCode).toEqual(200);  // Verifica se o status code é 200 (OK)
    expect(res.body).toHaveProperty('status', "inativa");  // Verifica se o status foi atualizado
    expect(parseFloat(res.body.mensalidade)).toBe(450.00);  // Verifica se a mensalidade foi atualizada corretamente

    // Verificar o status das mensalidades após a atualização
    const mensalidadeDepois = await pool.query(`
      SELECT status FROM mensalidades WHERE matricula_id = $1;
    `, [matriculaId]);

    console.log('Mensalidades depois da atualização:', mensalidadeDepois.rows); // Exibir mensalidades após a alteração
    expect(mensalidadeDepois.rows[0].status).toBe('cancelada');  // Verifica se as mensalidades foram canceladas com a matrícula inativa
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
