const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3001;

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

// Halaman signup
app.get('/signup', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sign Up</title>
        </head>
        <body>
            <div class="container">
                <h2>Sign Up</h2>
                <form action="/signup" method="POST">
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <div class="form-group">
                        <label for="nama">Nama:</label>
                        <input type="text" id="nama" name="nama" required>
                    </div>
                    <div class="form-group">
                        <label for="nomor_hp">Nomor HP:</label>
                        <input type="tel" id="nomor_hp" name="nomor_hp" required>
                    </div>
                    <div class="form-group">
                        <label for="alamat_web">Alamat Web:</label>
                        <input type="url" id="alamat_web" name="alamat_web">
                    </div>
                    <div class="form-group">
                        <label for="tempat_lahir">Tempat Lahir:</label>
                        <input type="text" id="tempat_lahir" name="tempat_lahir" required>
                    </div>
                    <div class="form-group">
                        <label for="tanggal_lahir">Tanggal Lahir:</label>
                        <input type="date" id="tanggal_lahir" name="tanggal_lahir" required>
                    </div>
                    <div class="form-group">
                        <label for="no_kk">No. KK:</label>
                        <input type="text" id="no_kk" name="no_kk" required>
                    </div>
                    <div class="form-group">
                        <label for="no_ktp">No. KTP:</label>
                        <input type="text" id="no_ktp" name="no_ktp" required>
                    </div>
                    <button type="submit">Sign Up</button>
                </form>
                <div class="message">
                    ${req.query.message || ''}
                </div>
                <a href="/">Already have an account? Sign in here.</a>
            </div>
        </body>
        </html>
    `);
});

// Tangani form signup
app.post('/signup', (req, res) => {
    const { email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp } = req.body;

    // Validasi jika ada data yang kosong
    if (!email || !password || !nama || !nomor_hp || !alamat_web || !tempat_lahir || !tanggal_lahir || !no_kk || !no_ktp) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Cek apakah email sudah terdaftar
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (row) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Simpan user baru ke SQLite tanpa hashing password
        db.run(
            'INSERT INTO users (email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp],
            function (err) {
                if (err) {
                    return res.status(500).json({ message: 'Failed to register user' });
                }
                return res.status(201).json({ message: 'User registered successfully' });
            }
        );
    });
});

// Endpoint untuk melihat daftar semua pengguna beserta password-nya
app.get('/users', (req, res) => {
    db.all('SELECT id, email, password FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
        res.json({ users: rows });
    });
});

app.listen(port, () => {
    console.log(`Auth service running on http://localhost:${port}`);
});
