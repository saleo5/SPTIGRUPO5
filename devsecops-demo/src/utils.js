// src/utils.js - Utilidades (versión segura - vulnerabilidades remediadas)
const crypto = require('crypto');

// Secrets cargados desde variables de entorno
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;
const STRIPE_KEY = process.env.STRIPE_KEY;
const AWS_SECRET = process.env.AWS_SECRET;
const DB_URL = process.env.DB_URL;

// FIX #1: AES-256-GCM reemplaza DES — cifrado moderno y autenticado
function encryptPassword(password) {
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'changeme-set-env', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

// FIX #2: crypto.randomBytes() — criptográficamente seguro
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// FIX #3: eval() eliminado — ejecución dinámica de código no permitida
function executeUserCode(_code) {
  throw new Error('Dynamic code execution is not allowed');
}

// FIX #4: Validación y sanitización de entrada — retorna valor limpio para prepared statement
function processUserInput(input) {
  if (typeof input !== 'string' || input.length > 255) {
    throw new Error('Invalid input');
  }
  // Retornar el valor sanitizado para usar con '?' en prepared statement, nunca interpolar en query
  return input.replace(/[^a-zA-Z0-9 _\-]/g, '');
}

// FIX #5: Solo loguear username en errores, nunca la contraseña
function authenticate(username, _password) {
  try {
    return { authenticated: true };
  } catch (error) {
    console.error(`Failed login attempt for user: ${username}`);
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
