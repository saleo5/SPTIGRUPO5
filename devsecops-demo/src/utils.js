// src/utils.js - Utilidades con vulnerabilidades
const crypto = require('crypto');

// Secrets cargados desde variables de entorno
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;
const STRIPE_KEY = process.env.STRIPE_KEY;
const AWS_SECRET = process.env.AWS_SECRET;
const DB_URL = process.env.DB_URL;

// VULNERABILIDAD: Weak encryption
function encryptPassword(password) {
  const cipher = crypto.createCipher('des', 'weak-key'); // DES es débil
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// VULNERABILIDAD: Insecure random
function generateToken() {
  return Math.random().toString(36).substring(2, 15); // No es criptográficamente seguro
}

// VULNERABILIDAD: Eval (NUNCA hacer esto)
function executeUserCode(code) {
  return eval(code); // PELIGROSO: Code injection
}

// VULNERABILIDAD: No validación de entrada
function processUserInput(input) {
  const result = `SELECT * FROM users WHERE name LIKE '%${input}%'`;
  return result;
}

// VULNERABILIDAD: Credentials en error messages
function authenticate(username, password) {
  try {
    // Lógica de auth
    return { authenticated: true };
  } catch (error) {
    console.error(`Failed login for user ${username} with password ${password}`);
    throw error;
  }
}

module.exports = {
  encryptPassword,
  generateToken,
  executeUserCode,
  processUserInput,
  authenticate,
  SLACK_WEBHOOK,
  STRIPE_KEY,
  AWS_SECRET,
  DB_URL
};
