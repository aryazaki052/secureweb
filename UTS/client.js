const express = require('express');
const axios = require('axios'); // Import axios to handle HTTP requests
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const Joi = require('joi');  // Import Joi untuk validasi dan sanitasi

const app = express();
const port = 3001;

// Middleware untuk parsing URL-encoded body dan cookies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CSRF Protection middleware
const csrfProtection = csrf({ cookie: true });

// Halaman Login (Sign In)
app.get('/', (req, res) => {
  res.send(`
    <script>
      // Script untuk mengambil CSRF token dari server
      async function fetchCsrfToken() {
        try {
          const response = await fetch('http://localhost:3003/csrf-token', {
            credentials: 'include' // Pastikan cookie diterima
          });
          const data = await response.json();
          const csrfToken = data.csrfToken;

          // Sisipkan token ke input _csrf
          const csrfInput = document.querySelector('input[name="_csrf"]');
          if (csrfInput) {
            csrfInput.value = csrfToken;
          }
        } catch (error) {
          console.error('Error fetching CSRF token:', error.message);
        }
      }

      // Jalankan fungsi saat halaman selesai dimuat
      window.onload = fetchCsrfToken;
    </script>
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign In</title>
    </head>
    <body>
      <h2>Login Form</h2>
      <form action="http://localhost:3003/signin" method="POST">
        <input type="hidden" name="_csrf" value=""> <!-- CSRF Token akan disisipkan di sini -->
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
});






// Halaman Sign Up
app.get('/signup', csrfProtection, (req, res) => {
  const csrfToken = req.csrfToken();  // Generate CSRF token
  // console.log('CSRF Token:', csrfToken);  // Pastikan token valid
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign Up</title>
      <script>
        function validateForm(event) {
          event.preventDefault(); // Mencegah pengiriman form jika tidak valid

          const email = document.forms["signupForm"]["email"].value;
          const password = document.forms["signupForm"]["password"].value;
          const nama = document.forms["signupForm"]["nama"].value;
          const nomor_hp = document.forms["signupForm"]["nomor_hp"].value;
          const alamat_web = document.forms["signupForm"]["alamat_web"].value;
          const tempat_lahir = document.forms["signupForm"]["tempat_lahir"].value;
          const tanggal_lahir = document.forms["signupForm"]["tanggal_lahir"].value;
          const no_kk = document.forms["signupForm"]["no_kk"].value;
          const no_ktp = document.forms["signupForm"]["no_ktp"].value;

          const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
          const urlRegex = /^(https?:\\/\\/)?(www\\.)?[^\\s$.?#].[^\\s]*$/;
          const phoneRegex = /^\\d+$/;

          if (!emailRegex.test(email)) {
            alert("Email harus berformat email yang valid.");
            return false;
          }
          if (password.length < 6) {
            alert("Password harus minimal 6 karakter.");
            return false;
          }
          if (nama.length < 3) {
            alert("Nama harus minimal 3 karakter.");
            return false;
          }
          if (!phoneRegex.test(nomor_hp)) {
            alert("Nomor HP harus berbentuk angka.");
            return false;
          }
          if (!urlRegex.test(alamat_web)) {
            alert("Alamat web harus berbentuk URL yang valid.");
            return false;
          }
          if (tempat_lahir.length < 3) {
            alert("Tempat lahir harus minimal 3 karakter.");
            return false;
          }
          if (tanggal_lahir.length < 3) {
            alert("Tanggal lahir harus minimal 3 karakter.");
            return false;
          }
          if (no_kk.length !== 16 || !phoneRegex.test(no_kk)) {
            alert("No. KK harus 16 karakter dan berupa angka.");
            return false;
          }
          if (no_ktp.length !== 16 || !phoneRegex.test(no_ktp)) {
            alert("No. KTP harus 16 karakter dan berupa angka.");
            return false;
          }

          // Jika semua validasi lolos, submit form
          document.forms["signupForm"].submit();
        }
      </script>
    </head>
    <body>
      <h2>Signup Form</h2>
      <form action="http://localhost:3003/signup" method="POST">
        <input type="hidden" name="_csrf" value="${csrfToken}">  <!-- CSRF Token -->
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

});



// Halaman Member (Setelah Login)



// Menjalankan server
app.listen(port, () => {
  console.log(`Client running at http://localhost:${port}`);
});
