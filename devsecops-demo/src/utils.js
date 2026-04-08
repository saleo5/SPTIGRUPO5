// src/utils.js - Utilidades con vulnerabilidades
const crypto = require('crypto');

// VULNERABILIDAD: Secrets hardcoded
const SLACK_WEBHOOK = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX";
const STRIPE_KEY = "sk_live_4eC39HqLyjWDarhtT657A7Q2";
const AWS_SECRET = "aws_secret_access_key_1234567890abcdefghijklmnop";
const DB_URL = "postgresql://admin:password123@localhost:5432/mydb";

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
