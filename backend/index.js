import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Connessione MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'todo_user',
  password: process.env.DB_PASSWORD || 'todo_pass',
  database: process.env.DB_NAME || 'todo_db'
};

let db;

// funzione retries
async function connectWithRetry() {
  let connected = false;
  while (!connected) {
    try {
      db = await mysql.createConnection(dbConfig);
      console.log('Connesso a MySQL con successo!');
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          text VARCHAR(255) NOT NULL,
          completed BOOLEAN DEFAULT false
        )
      `);
      console.log('Tabella "todos" verificata/creata.');
      connected = true;
    } catch (err) {
      console.log('⏳ Attesa avvio MySQL... nuovo tentativo tra 3 secondi.');
      await new Promise(res => setTimeout(res, 3000));
    }
  }
}

connectWithRetry();

// --- API ENDPOINTS ---

// GET /api/todos
app.get('/api/todos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM todos');

    const todos = rows.map(t => ({ ...t, completed: Boolean(t.completed) }));
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/todos
app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Il testo è obbligatorio' });

    const [result] = await db.query('INSERT INTO todos (text, completed) VALUES (?, ?)', [text, false]);
    res.status(201).json({ id: result.insertId, text, completed: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/todos/:id
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    await db.query('UPDATE todos SET completed = ? WHERE id = ?', [completed, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/todos/:id
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM todos WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server Backend in ascolto sulla porta ${PORT}`);
});