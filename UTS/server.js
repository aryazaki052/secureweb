const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const xss = require('xss');

const app = express();
const port = 3002;

// Enable CORS
app.use(cors());

const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database.');
  }
});

/// Create users table jika belum ada
db.serialize(() => {
  db.run("DROP TABLE IF EXISTS users"); // Menghapus tabel jika sudah ada
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

// Tangani form signup
app.post('/signup', (req, res) => {
  // Gunakan xss untuk menyaring input
  const email = xss(req.body.email);
  const password = xss(req.body.password);
  const nama = xss(req.body.nama);
  const nomor_hp = xss(req.body.nomor_hp);
  const alamat_web = xss(req.body.alamat_web);
  const tempat_lahir = xss(req.body.tempat_lahir);
  const tanggal_lahir = xss(req.body.tanggal_lahir);
  const no_kk = xss(req.body.no_kk);
  const no_ktp = xss(req.body.no_ktp);

  db.run(
    `INSERT INTO users 
      (email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp],
    (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to register user' });
      }
      // Redirect ke halaman login dengan pesan konfirmasi
      res.redirect(`http://localhost:3001/?message=Selamat ${nama}, Anda telah berhasil signup. Silahkan login`);
      // res.json({ message: 'User registered successfully' });
    }
    
  );
});

// Tangani form signin
app.post('/signin', (req, res) => {
  // Sanitasi input menggunakan xss
  const email = xss(req.body.email);
  const password = xss(req.body.password);

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password harus diisi' });
  }

  // Cari pengguna berdasarkan email
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error', error: err.message });
    }

    if (!row) {
      return res.status(400).json({ message: 'Email tidak ditemukan' });
    }

    // Cek apakah password cocok
    if (row.password !== password) {
      return res.status(400).json({ message: 'Password salah' });
    }
    // Redirect ke halaman member dengan output yang sudah aman
    res.redirect(`http://localhost:3001/member?userName=${encodeURIComponent(row.nama)}&email=${email}`);
  });
});

// Endpoint untuk melihat daftar semua pengguna beserta password-nya
app.get('/users', (req, res) => {
  // Ganti query untuk memilih semua kolom
  db.all('SELECT * FROM users', [], (err, rows) => {
      if (err) {
          return res.status(500).json({ message: 'Internal server error', error: err.message });
      }
      res.json({ users: rows });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
