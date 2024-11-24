const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const xss = require('xss');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const axios = require('axios');

const app = express();
const frontendPort = 3001;
const backendPort = 3002;

// Middleware setup
app.use(cors({
  origin: `http://localhost:${frontendPort}`, // CORS hanya untuk frontend
  credentials: true,
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup CSRF protection
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: false, // Set true jika menggunakan HTTPS
  },
});

// Database setup
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) console.error('Error opening database:', err);
  else console.log('Connected to SQLite database.');
});

// Buat tabel jika belum ada
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      nama TEXT,
      nomor_hp TEXT,
      alamat_web TEXT,
      tempat_lahir TEXT,
      tanggal_lahir TEXT,
      no_kk TEXT,
      no_ktp TEXT
    )
  `);
});

// Frontend Routes (Port 3001)

// Halaman Login (Sign In)
app.get('/', async (req, res) => {
  const message = req.query.message || '';
  try {
    const csrfResponse = await axios.get(`http://localhost:${backendPort}/csrf-token`, {
      withCredentials: true
    });
    const csrfToken = csrfResponse.data.csrfToken;

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign In</title>
      </head>
      <body>
        <h2>Login Form</h2>
        ${message ? `<p>${message}</p>` : ''}
        <form action="http://localhost:${backendPort}/signin" method="POST">
          <input type="hidden" name="_csrf" value="${csrfToken}" />
          <label>Email:</label>
          <input type="email" name="email" required><br>
          <label>Password:</label>
          <input type="password" name="password" required><br>
          <button type="submit">Sign In</button>
        </form>
        <a href="/signup">Belum punya akun? Daftar di sini</a>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error fetching CSRF token', error);
    res.status(500).send('Gagal mengambil token CSRF');
  }
});

// Halaman Sign Up
app.get('/signup', async (req, res) => {
  try {
    const csrfResponse = await axios.get(`http://localhost:${backendPort}/csrf-token`, {
      withCredentials: true
    });
    const csrfToken = csrfResponse.data.csrfToken;

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign Up</title>
      </head>
      <body>
        <h2>Signup Form</h2>
        <form action="http://localhost:${backendPort}/signup" method="POST">
          <input type="hidden" name="_csrf" value="${csrfToken}" />
          <label>Email:</label>
          <input type="email" name="email" required><br>
          <label>Password:</label>
          <input type="password" name="password" required><br>
          <label>Nama:</label>
          <input type="text" name="nama" required><br>
          <label>Nomor HP:</label>
          <input type="text" name="nomor_hp" required><br>
          <label>Alamat Web:</label>
          <input type="text" name="alamat_web" required><br>
          <label>Tempat Lahir:</label>
          <input type="text" name="tempat_lahir" required><br>
          <label>Tanggal Lahir:</label>
          <input type="date" name="tanggal_lahir" required><br>
          <label>No. KK:</label>
          <input type="text" name="no_kk" required><br>
          <label>No. KTP:</label>
          <input type="text" name="no_ktp" required><br>
          <button type="submit">Sign Up</button>
        </form>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Gagal mengambil token CSRF');
  }
});

// Halaman Member (Setelah Login)
app.get('/member', (req, res) => {
  const userName = req.query.userName || 'Member';

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Member</title>
    </head>
    <body>
      <h2>Selamat datang, ${userName}!</h2>
      <p>Anda berhasil login dan kini berada di halaman member.</p>
    </body>
    </html>
  `);
});

// Backend Routes (Port 3002)

// Endpoint untuk mendapatkan token CSRF
app.get('/csrf-token', csrfProtection, (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie('csrf-token', csrfToken);
  res.json({ csrfToken });
});

// Endpoint untuk signup
app.post('/signup', csrfProtection, (req, res) => {
  const { email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp } = req.body;

  db.run(
    `INSERT INTO users 
      (email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [xss(email), xss(password), xss(nama), xss(nomor_hp), xss(alamat_web), xss(tempat_lahir), xss(tanggal_lahir), xss(no_kk), xss(no_ktp)],
    (err) => {
      if (err) return res.status(500).json({ message: 'Gagal mendaftar', error: err.message });
      res.json({ message: `Selamat ${nama}, Anda berhasil mendaftar.` });
    }
  );
});

// Endpoint untuk login
app.post('/signin', csrfProtection, (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password], (err, row) => {
    if (err) return res.status(500).json({ message: 'Login gagal', error: err.message });
    if (!row) return res.status(401).json({ message: 'Email atau password salah.' });

    res.json({ message: `Selamat datang ${row.nama}!`, userName: row.nama });
  });
});

// Jalankan server
app.listen(frontendPort, () => {
  console.log(`Frontend berjalan di http://localhost:${frontendPort}`);
});
app.listen(backendPort, () => {
  console.log(`Backend berjalan di http://localhost:${backendPort}`);
});
