// src/app.js - Aplicación Express (versión segura - vulnerabilidades remediadas)
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json());

// FIX #1: Secrets cargados desde variables de entorno (nunca hardcodeados)
const API_KEY = process.env.API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, name TEXT, email TEXT)');
});

// FIX #2: Prepared statements previenen SQL Injection en /login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Parámetro '?' nunca se interpola — SQLite lo escapa internamente
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, row.password);
    if (match) {
      res.json({ success: true, userId: row.id });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// FIX #3: Parámetro parseado e int validado — sin SQL Injection en /user/:id
app.get('/user/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  db.get('SELECT id, name, email FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(row || null);
  });
});

// FIX #4: exec() eliminado — procesamiento seguro sin shell
app.post('/api/data', (req, res) => {
  const { data } = req.body;
  if (typeof data !== 'string' || data.length > 1000) {
    return res.status(400).json({ error: 'Invalid data' });
  }
  res.json({ result: data.trim() });
});

// FIX #5: Contraseña hasheada con bcrypt (cost factor 12)
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || password.length < 8) {
    return res.status(400).json({ error: 'Username required and password must be at least 8 characters' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
      if (err) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      res.json({ success: true, message: 'User registered' });
    });
  } catch {
    res.status(500).json({ error: 'Registration failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // FIX #6: API_KEY no se loguea — nunca imprimir secrets en stdout
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
