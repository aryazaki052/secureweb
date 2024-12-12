const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = import('node-fetch'); // Untuk melakukan permintaan HTTP ke server 3000

const app = express();
const port = 3001;

// Middleware CORS
app.use(cors());  

// Middleware untuk parsing JSON
app.use(express.json());  

// Middleware untuk melayani file statis frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '')));

// Menyajikan file HTML untuk halaman utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Menangani permintaan edit produk
app.post('/edit', async (req, res) => {
  const { id, name, price } = req.body;

  // Kirim permintaan ke server 3000 untuk mengupdate produk
  try {
    const response = await fetch('http://localhost:3000/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, name, price }),
    });

    if (response.ok) {
      res.status(200).send('Product updated successfully');
    } else {
      res.status(500).send('Failed to update product');
    }
  } catch (error) {
    res.status(500).send('Error connecting to server 3000');
  }
});

// Start server frontend
app.listen(port, () => {
  console.log(`Frontend berjalan di http://localhost:${port}`);
});
