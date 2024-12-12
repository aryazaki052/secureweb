const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express(); 
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pos'
});

// Middleware untuk menangani JSON
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Untuk menangani data dari form


// home
app.get('/product', (req, res) => {
  const query = 'SELECT * FROM product';

  db.query(query, (err, result) => {
    // Tidak perlu prepare statement karena tidak ada input dari pengguna
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'terjadi error', error: err.message });
    }

    // Jika data ditemukan
    if (result.length > 0) {
      return res.status(200).json({
        status: 'data berhasil ditampilkan',
        data: result
      });
    } else {
      return res.status(404).json({ status: 'tidak ada data' });
    }
  });
});



app.post('/create', (req, res) => {
  const { name, price } = req.body; // Pastikan req.body memiliki nilai
  if (!name || !price) {
    return res.status(400).json({ status: 'terjadi error', error: 'Name atau Price tidak boleh kosong' });
  }

  const query = 'INSERT INTO product (name, price) VALUES (?, ?)';
  const values = [name, price];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'terjadi error', error: err.message });
    }

    res.status(201).json({ status: 'produk berhasil ditambahkan', data: { id: result.insertId, name, price } });
  });
});



// edit
app.put('/edit/:id', (req, res) => {
  const id = req.params.id; // Ambil ID dari parameter URL
  const { name, price } = req.body; // Ambil Name dan Price dari body permintaan

  if (!name || !price || !id) {
    return res.status(400).json({ status: 'terjadi error', error: 'ID, Name, atau Price tidak boleh kosong' });
  }

  // Bangun query SQL dengan menggunakan prepared statement
  const query = 'UPDATE product SET name = ?, price = ? WHERE id = ?';
  const values = [name, price, id];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'terjadi error', error: err.message });
    }

    if (result.affectedRows > 0) {
      res.status(200).json({ status: 'produk berhasil diubah', data: { id, name, price } });
    } else {
      res.status(404).json({ status: 'produk tidak ditemukan' });
    }
  });
});






// delete

app.delete('/delete/:id', (req, res) => {
  const { id } = req.params; // Mengambil id dari parameter URL

  const query = 'DELETE FROM product WHERE id = ?';
  const values = [id];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'terjadi error', error: err.message });
    }

    if (result.affectedRows > 0) {
      res.status(200).json({ status: 'produk berhasil dihapus', id });
    } else {
      res.status(404).json({ status: 'produk tidak ditemukan' });
    }
  });
});


// Server mulai mendengarkan
const port = 3000;
app.listen(port, () => console.log(`Server berjalan di http://localhost:${port}`));
