const express = require('express');
const axios = require('axios'); // Import axios untuk mengambil token csrf
const app = express();
const port = 3001;

// Halaman Login (Sign In)
app.get('/', async (req, res) => {
  const message = req.query.message || ''; // Mendapatkan pesan dari query string
  try {
    // Mendapatkan csrf token dari server
    const csrfResponse = await axios.get('http://localhost:3002/csrf-token', {
      withCredentials: true // Memastikan cookie dikirim
    });
    const csrfToken = csrfResponse.data.csrfToken;

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign In</title>
      </head>
      <body>
        <h2>Login Form</h2>
        ${message ? `<p>${message}</p>` : ''}
        <form action="http://localhost:3002/signin" method="POST">
          <input type="hidden" name="_csrf" value="${csrfToken}" />
          <label>Email:</label>
          <input type="email" name="email" required><br>
          <label>Password:</label>
          <input type="password" name="password" required><br>
          <button type="submit">Sign In</button>
        </form>
        <a href="/signup">Belum punya akun? Daftar di sini</a>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error fetching CSRF token', error);
    res.status(500).send('Gagal mengambil token CSRF');
  }
});



// Halaman Sign Up
app.get('/signup', async (req, res) => {
  try {
    // Mendapatkan csrf token dari server
    const csrfResponse = await axios.get('http://localhost:3002/csrf-token', {
      withCredentials: true
    });
    const csrfToken = csrfResponse.data.csrfToken;

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign Up</title>
      </head>
      <body>
        <h2>Signup Form</h2>
        <form action="http://localhost:3002/signup" method="POST">
          <input type="hidden" name="_csrf" value="${csrfToken}" />
          <label>Email:</label>
          <input type="email" name="email" required><br>
          <label>Password:</label>
          <input type="password" name="password" required><br>
          <label>Nama:</label>
          <input type="text" name="nama" required><br>
          <label>Nomor HP:</label>
          <input type="text" name="nomor_hp" required><br>
          <label>Alamat Web:</label>
          <input type="text" name="alamat_web" required><br>
          <label>Tempat Lahir:</label>
          <input type="text" name="tempat_lahir" required><br>
          <label>Tanggal Lahir:</label>
          <input type="date" name="tanggal_lahir" required><br>
          <label>No. KK:</label>
          <input type="text" name="no_kk" required><br>
          <label>No. KTP:</label>
          <input type="text" name="no_ktp" required><br>
          <button type="submit">Sign Up</button>
        </form>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Gagal mengambil token CSRF');
  }
});

// Halaman Member (Setelah Login)
app.get('/member', (req, res) => {
  const userName = req.query.userName || 'Member'; // Dapatkan nama pengguna dari query string, default 'Member'

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Member</title>
    </head>
    <body>
      <h2>Selamat datang, ${userName}!</h2>
      <p>Anda berhasil login dan kini berada di halaman member.</p>
    </body>
    </html>
  `);
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Client running at http://localhost:${port}`);
});
