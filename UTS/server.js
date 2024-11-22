const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Tambahkan cors untuk menangani request dari client

const app = express();
const port = 3002;

// Enable CORS
app.use(cors({
    origin: 'http://localhost:3001', // Mengizinkan permintaan dari client di port 3001
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Buat koneksi ke database SQLite
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error("Error opening database", err);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Create users table jika belum ada
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

app.use(express.urlencoded({ extended: true })); // Untuk menangani form data
app.use(express.json()); // Untuk menangani data JSON



// Tangani form signup
app.post('/signup', (req, res) => {
  const { email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp } = req.body;

  // Validasi input
  if (!email || !password || !nama || !nomor_hp || !alamat_web || !tempat_lahir || !tanggal_lahir || !no_kk || !no_ktp) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Simpan user baru ke SQLite tanpa sanitasi
  db.run(
    'INSERT INTO users (email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Failed to register user' });
      }
      // Redirect ke halaman login dengan pesan konfirmasi
      res.redirect(`http://localhost:3001/?message=Selamat ${nama}, Anda telah berhasil signup. Silahkan login`);
    }
  );
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
    console.log(`Auth service running on http://localhost:${port}`);
});
