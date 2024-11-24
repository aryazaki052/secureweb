const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const xss = require('xss');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const Joi = require('joi');  // Import Joi untuk validasi dan sanitasi

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
const csrfProtection = csurf({
  cookie: {
    httpOnly: true, // Hanya dapat diakses oleh server
    secure: false,  // Ubah ke true jika menggunakan HTTPS
    sameSite: 'Strict', // Lindungi dari serangan lintas situs
  },
});


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
  const schema = Joi.object({
    email: Joi.string().email().required().trim(),
    password: Joi.string().min(6).required().trim(),
    nama: Joi.string().min(3).required().trim(),
    nomor_hp: Joi.string().min(10).max(15).required().trim(),
    alamat_web: Joi.string().uri().optional().trim(),
    tempat_lahir: Joi.string().min(3).required().trim(),
    tanggal_lahir: Joi.date().iso().required(),
    no_kk: Joi.string().length(16).required().trim(),
    no_ktp: Joi.string().length(16).required().trim()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: 'Validation failed', error: error.details });
  }

  // Sanitasi data setelah validasi
  const sanitizedData = {
    email: xss(value.email.trim().toLowerCase()),  // Email diubah menjadi lowercase dan sanitasi
    password: xss(value.password),  // Sanitasi password jika diperlukan (biasanya tidak perlu sanitasi untuk password)
    nama: xss(value.nama),  // Sanitasi nama
    nomor_hp: xss(value.nomor_hp.trim()),  // Sanitasi nomor HP
    alamat_web: value.alamat_web ? xss(value.alamat_web) : '',  // Sanitasi alamat web jika ada
    tempat_lahir: xss(value.tempat_lahir),  // Sanitasi tempat lahir
    tanggal_lahir: value.tanggal_lahir,
    no_kk: xss(value.no_kk.trim()),  // Sanitasi no KK
    no_ktp: xss(value.no_ktp.trim())  // Sanitasi no KTP
  };

  const sql = `INSERT INTO users (email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, Object.values(sanitizedData), (err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to register user', error: err.message });
    }
    res.redirect(`http://localhost:3001/?message=Selamat ${sanitizedData.nama}, Anda telah berhasil signup. Silahkan login`);
  });
});


// Endpoint: Signin
app.post('/signin', csrfProtection, (req, res) => {
  // Skema validasi dan sanitasi dengan Joi
  const schema = Joi.object({
    email: Joi.string().email().required().trim(),
    password: Joi.string().min(6).required().trim()
  });

  // Validasi data
  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: 'Validation failed', error: error.details });
  }

  const email = xss(value.email);
  const password = xss(value.password);

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ message: 'Internal server error', error: err.message });
    }

    if (!row || row.password !== password) {
      console.warn('Login attempt failed. Email or password incorrect.');
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    const csrfToken = req.csrfToken();

    console.log('CSRF Token dari klien telah divalidasi.');
    console.log('Detail user:', { id: row.id, nama: row.nama, email: row.email });

    res.cookie('user_id', row.id, { httpOnly: true, secure: false, sameSite: 'Strict' });

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
