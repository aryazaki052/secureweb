const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const xss = require('xss');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

const app = express();
const port = 3002;

// Enable CORS
app.use(cors());



// Use cookie-parser and CSRF protection
app.use(cookieParser());
const csrfProtection = csurf({ cookie: { httpOnly: true, secure: false } }); // secure: true untuk produksi

// Database Setup
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create users table if not exists
db.serialize(() => {
  db.run("DROP TABLE IF EXISTS users"); // Drop table if already exists
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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handle form signup with CSRF protection
app.post('/signup', csrfProtection, (req, res) => {
  // Log CSRF token from form and cookie
  console.log('CSRF Token from form:', req.body._csrf);  // Token dari form
  console.log('CSRF Token from cookie:', req.cookies['csrf-token']);  // Token dari cookie

  // Pastikan CSRF token yang diterima cocok dengan yang ada di cookie
  if (req.body._csrf !== req.cookies['csrf-token']) {
    return res.status(403).json({ message: 'CSRF Token tidak valid' });
  }

  // Sanitasi input dengan xss untuk mencegah serangan XSS
  const email = xss(req.body.email);
  const password = xss(req.body.password);
  const nama = xss(req.body.nama);
  const nomor_hp = xss(req.body.nomor_hp);
  const alamat_web = xss(req.body.alamat_web);
  const tempat_lahir = xss(req.body.tempat_lahir);
  const tanggal_lahir = xss(req.body.tanggal_lahir);
  const no_kk = xss(req.body.no_kk);
  const no_ktp = xss(req.body.no_ktp);

  // Simpan data ke database
  db.run(
    `INSERT INTO users 
      (email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp],
    (err) => {
      if (err) {
        return res.status(500).json({ message: 'Gagal mendaftar pengguna', error: err.message });
      }
      // Jika berhasil, arahkan ke halaman login dengan pesan sukses
      res.redirect(`http://localhost:3001/?message=Selamat ${nama}, Anda telah berhasil signup. Silahkan login`);
    }
  );
});

// Endpoint untuk mengambil token CSRF
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() }); // Mengirimkan token CSRF ke client
});

// Mulai server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
