const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json()); // Untuk menangani data JSON
app.use(express.urlencoded({ extended: true })); // Untuk menangani form data

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

// Endpoint untuk memverifikasi pengguna
app.post('/verify-user', (req, res) => {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Verifikasi email dan password dengan SQLite
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (row) {
            return res.status(200).json({ valid: true, message: 'Login successful', user: row });
        } else {
            return res.status(401).json({ valid: false, message: 'Invalid email or password' });
        }
    });
});

// Endpoint untuk signup dan menyimpan user baru ke database
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

        // Simpan user baru ke SQLite
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

// Menjalankan server pada port 3000
app.listen(port, () => {
    console.log(`User service running on port ${port}`);
});


// csrf tess