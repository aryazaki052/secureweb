const express = require('express');
const mysql = require('mysql2');

const app = express(); 
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pos'
});

// Middleware untuk menangani JSON
app.use(express.json());


// home
app.post('/', (req, res) => {
  const query = `SELECT * FROM product`;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'terjadi error', error: err.message });
    }

    if (result.length > 0) {
      res.status(200).json({
        status: 'data berhasil ditampilkan',
        data: result
      });
    } else {
      res.status(404).json({ status: 'tidak ada data' });
    }
  });
});

// created
app.post('/create', (req, res) => {
  const { name, price } = req.body;

  const query = `INSERT INTO product (name, price) VALUES ('${name}', ${price})`;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'terjadi error', error: err.message });
    }

    res.status(201).json({ status: 'produk berhasil ditambahkan', data: { id: result.insertId, name, price } });
  });
});



// edit
app.put('/edit/:id', (req, res) => {
  const { id } = req.params; // Mengambil id dari parameter URL
  const { name, price } = req.body; // Mengambil data baru dari body request

  const query = `UPDATE product SET name = '${name}', price = ${price} WHERE id = ${id}`;

  db.query(query, (err, result) => {
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

  const query = `DELETE FROM product WHERE id = ${id}`;

  db.query(query, (err, result) => {
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
