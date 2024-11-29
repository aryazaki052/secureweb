const express = require('express');
const mysql = require('mysql2');

const app = express(); // Deklarasikan app di sini
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pos'
});

app.use(express.json()); // Tambahkan kurung untuk memanggil fungsi
const port = 3000;



app.post('/login', (req, res) => {
  const{username, password} = req.body;
  const query = `select * from users WHERE username = ? AND password = ?`;
  db.query(query, [username, password], (err, result) => {
    if (err) return res.status(500).json({status: 'terjadi error'})
    if (result.length > 0){
      res.status(200).json({status:'login berhasil'});
    }else{
      res.status(404).json({status:'login gagal'});
    }
  });
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))