const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const xss = require('xss'); // Untuk sanitasi input
const helmet = require('helmet'); // Untuk perlindungan HTTP Headers
const bcrypt = require('bcrypt'); // Untuk hashing password
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

// Middleware
app.use(helmet()); // Menambahkan perlindungan HTTP headers
app.use(helmet.xssFilter()); // Menambahkan perlindungan XSS
app.use(express.urlencoded({ extended: true })); // Untuk menangani form data
app.use(express.json()); // Untuk menangani data JSON

// Fungsi untuk menghindari eksekusi skrip JavaScript pada output
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (char) {
        return `&#${char.charCodeAt(0)};`;
    });
}

// Halaman signup
app.get('/signup', (req, res) => {
    // Sanitasi pesan yang mungkin dikirim melalui query string
    const message = req.query.message ? xss(req.query.message) : ''; // Sanitasi pesan

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
                        <input type="text" id="email" name="email" required>
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
                        <input type="text" id="alamat_web" name="alamat_web">
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
                    ${message} <!-- Pastikan data disanitasi atau diencode -->
                </div>
                <a href="/">Already have an account? Sign in here.</a>
            </div>
        </body>
        </html>
    `);
});

// Tangani form signup
app.post('/signup', (req, res) => {
    const {
        email,
        password,
        nama,
        nomor_hp,
        alamat_web,
        tempat_lahir,
        tanggal_lahir,
        no_kk,
        no_ktp,
    } = req.body;

    // Sanitasi semua input untuk mencegah XSS
    const sanitizedData = {
        email: xss(email),
        password: xss(password),
        nama: xss(nama),
        nomor_hp: xss(nomor_hp),
        alamat_web: xss(alamat_web),
        tempat_lahir: xss(tempat_lahir),
        tanggal_lahir: xss(tanggal_lahir),
        no_kk: xss(no_kk),
        no_ktp: xss(no_ktp),
    };

    // Validasi jika ada data yang kosong
    if (
        !sanitizedData.email ||
        !sanitizedData.password ||
        !sanitizedData.nama ||
        !sanitizedData.nomor_hp ||
        !sanitizedData.alamat_web ||
        !sanitizedData.tempat_lahir ||
        !sanitizedData.tanggal_lahir ||
        !sanitizedData.no_kk ||
        !sanitizedData.no_ktp
    ) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Hash password sebelum disimpan
    bcrypt.hash(sanitizedData.password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password' });
        }

        // Simpan user baru ke SQLite
        db.run(
            'INSERT INTO users (email, password, nama, nomor_hp, alamat_web, tempat_lahir, tanggal_lahir, no_kk, no_ktp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                sanitizedData.email,
                hashedPassword,
                sanitizedData.nama,
                sanitizedData.nomor_hp,
                sanitizedData.alamat_web,
                sanitizedData.tempat_lahir,
                sanitizedData.tanggal_lahir,
                sanitizedData.no_kk,
                sanitizedData.no_ktp,
            ],
            function (err) {
                if (err) {
                    return res.status(500).json({ message: 'Failed to register user' });
                }
                return res.status(201).json({ message: 'User registered successfully' });
            }
        );
    });
});

// Endpoint untuk melihat daftar semua pengguna (tanpa password)
app.get('/users', (req, res) => {
    db.all('SELECT id, email, nama, nomor_hp FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
        res.json({ users: rows });
    });
});

app.listen(port, () => {
    console.log(`Auth service running on http://localhost:${port}`);
});
