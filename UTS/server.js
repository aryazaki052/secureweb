const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const xss = require('xss');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

const app = express();
const port = 3003;

// Enable CORS with credentials
app.use(cors({
  origin: 'http://localhost:3001', // Client origin
  credentials: true               // Allow credentials (cookies)
}));

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup CSRF protection
const csrfProtection = csurf({ cookie: true });

// Initialize SQLite Database
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


// Endpoint: Signup
app.post('/signup', csrfProtection, (req, res) => {
  const sanitizedData = {
    email: xss(req.body.email),
    password: xss(req.body.password),
    nama: xss(req.body.nama),
    nomor_hp: xss(req.body.nomor_hp),
    alamat_web: xss(req.body.alamat_web),
    tempat_lahir: xss(req.body.tempat_lahir),
    tanggal_lahir: xss(req.body.tanggal_lahir),
    no_kk: xss(req.body.no_kk),
    no_ktp: xss(req.body.no_ktp)
  };

  const sql = `
    INSERT INTO users 
    (email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, Object.values(sanitizedData), (err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to register user', error: err.message });
    }
    res.redirect(`http://localhost:3001/?message=Selamat ${sanitizedData.nama}, Anda telah berhasil signup. Silahkan login`);
  });
});

// Endpoint: Signin
// Endpoint: Signin
app.post('/signin', csrfProtection, (req, res) => {
  const email = xss(req.body.email);
  const password = xss(req.body.password);

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password harus diisi' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ message: 'Internal server error', error: err.message });
    }

    // Periksa kecocokan email dan password
    if (!row || row.password !== password) {
      console.warn('Login attempt failed. Email or password incorrect.');
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    // Token CSRF sudah diverifikasi oleh middleware
    const csrfToken = req.csrfToken(); // Token baru jika diperlukan

    console.log('CSRF Token dari klien telah divalidasi.');
    console.log('Detail user:', { id: row.id, nama: row.nama, email: row.email });

    // Set cookie sesi pengguna
    res.cookie('user_id', row.id, { httpOnly: true, secure: false, sameSite: 'Strict' });

    // Redirect ke halaman member
    res.redirect(`http://localhost:3001/member?userName=${encodeURIComponent(row.nama)}&csrfToken=${csrfToken}`);
  });
});



app.get('/csrf-token', csrfProtection, (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie('XSRF-TOKEN', csrfToken, { httpOnly: false, secure: false }); // Cookie untuk client
  res.json({ csrfToken }); // Respons JSON untuk validasi manual
});




// Endpoint: View Users
app.get('/users', (req, res) => {
  db.all('SELECT id, email, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
    res.json({ users: rows });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
