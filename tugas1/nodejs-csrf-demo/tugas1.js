const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CSRF Protection Middleware
const csrfProtection = csrf({ cookie: true });

// Route untuk menampilkan form
app.get('/form', csrfProtection, (req, res) => {
    res.send(`
        <form action="/submit" method="POST">
            <input type="hidden" name="_csrf" value="${req.csrfToken()}">
            <input type="text" name="data" placeholder="Enter some data" required>
            <button type="submit">Submit</button>
        </form>
    `);
});

// Route untuk menangani form submission
app.post('/submit', csrfProtection, (req, res) => {
    // Proses data yang diterima
    console.log(req.body.data);
    res.send('Data received and CSRF token verified!');
});

// Menangani error CSRF
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        // CSRF token tidak valid
        return res.status(403).send('Invalid CSRF token');
    }
    next(err);       
});

// Menjalankan server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
