const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
const port = 3000
const csurf = require ('csurf');
const csrfProtection = csurf({cookie: true});

// Middleware untuk parsing data dari form HTML dan JSON
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())


// Endpoint dasbor dengan otentikasi menggunakan cookie token
app.get('/dasbor',csrfProtection, (req, res) => {
  const token = req.cookies.token

  if (token === 'A001') {
    res.json({ status: 'Halo Administrator' })
  } else {
    res.status(401).json({ status: 'Silahkan Login' })
  }
})

// Endpoint untuk menampilkan form transfer dengan validasi token
app.get('/transfer', csrfProtection, (req, res) => {
  const token = req.cookies.token
  if (token === 'A001') {
    res.send(`
      <html>
        <body>
          <form method="POST" action="/transfer">
          <br><br>
          <input type="text" name="_csrf" value="${req.csrfToken()}">
          <br><br>
            <label for="to">To (Account Number):</label>
            <input type="text" id="to" name="to" required>
            <br><br>
            <label for="amount">Amount:</label>
            <input type="number" id="amount" name="amount" required>
            <br><br>
            <button type="submit">Transfer</button>
          </form>
        </body>
      </html>
    `)
  } else {
    res.status(401).json({ status: 'Silahkan Login' })
  }
})

// Endpoint untuk memproses transfer
app.post('/transfer', (req, res) => {
  const { to, amount } = req.body
  const token = req.cookies.token

  if (token === 'A001') {
    res.json({
      status: 'Transfer Berhasil',
      message: `Dana berhasil ditransfer ke rekening ${to} dengan jumlah ${amount}`
    })
  } else {
    res.status(401).json({ status: 'Silahkan Login' })
  }
})

// Endpoint untuk menampilkan form login
app.get('/login', (req, res) => {
  res.send(`
    <html>
      <body>
        <form method="POST" action="/login">
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" required>
          <br><br>
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" required>
          <br><br>
          <button type="submit">Login</button>
        </form>
      </body>
    </html>
  `)
})

// Endpoint untuk memproses login
app.post('/login', (req, res) => {
  const { username, password } = req.body

  if (username === 'admin' && password === 'admin123') {
    res.cookie('token', 'A001') // Set token dalam cookie
    res.json({ status: 'Login Berhasil' })
  } else {
    res.status(401).json({ status: 'Login Gagal' })
  }
})

// Jalankan server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
