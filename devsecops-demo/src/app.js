// src/app.js - Aplicación Express vulnerable (INTENCIONAL para demo)
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());

// VULNERABILIDAD 1: Secrets hardcoded
const API_KEY = "sk-1234567890abcdefghijklmnopqrstuvwxyz";
const DB_PASSWORD = "admin123password";
const JWT_SECRET = "my-super-secret-key-that-nobody-knows";

// VULNERABILIDAD 2: Database con SQL injection risk
const db = new sqlite3.Database(':memory:');

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  // VULNERABILIDAD 3: SQL Injection
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  
  // VULNERABILIDAD 4: Otra SQL Injection
  const query = `SELECT id, name, email FROM users WHERE id = ${userId}`;
  
  db.get(query, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.post('/api/data', (req, res) => {
  const data = req.body.data;
  
  // VULNERABILIDAD 5: Command injection risk
  const exec = require('child_process').exec;
  exec(`echo ${data}`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ result: stdout });
  });
});

// VULNERABILIDAD 6: Contraseñas en texto plano
app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password; // NO debe guardarse así
  
  const query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;
  
  db.run(query, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, message: 'User registered' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Key: ${API_KEY}`); // VULNERABILIDAD 7: Logs sensibles
});

module.exports = app;
