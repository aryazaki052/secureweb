const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route untuk menampilkan form (tanpa perlindungan CSRF)
app.get('/form', (req, res) => {
    res.send(`
        <form action="/submit" method="POST">
            <input type="text" name="data" placeholder="Enter some data" required>
            <button type="submit">Submit</button>
        </form>
    `);
});

// Route untuk menangani form submission (tanpa perlindungan CSRF)
app.post('/submit', (req, res) => {
    console.log(req.body.data);
    res.send('Data received!');
});

// Menjalankan server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
