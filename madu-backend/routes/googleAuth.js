// googleAuth.js

const { google } = require('googleapis');

// Substitua pelos valores do seu projeto
const CLIENT_ID = '865017931813-v09dfjbd9oov7ht49bo9li3ejtgcnror.apps.googleusercontent.com';
const CLIENT_SECRET = 'SEU_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:5000/auth/google/callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// URL para solicitar autorização
const SCOPES = [
  'https://www.googleapis.com/auth/calendar'
];

// Função para gerar o link de autenticação
const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Garante que obtenha o refresh token
    scope: SCOPES,
  });
};

// Função para obter o token de acesso
const getTokens = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};

module.exports = { getAuthUrl, getTokens, oauth2Client };
