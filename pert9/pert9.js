const express = require('express');
const mysql = require('mysql2');

const app = express(); 
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pos'
});

app.use(express.json());
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

app.get('/post', function (req, res) {
  const query = `SELECT * FROM post`;

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
})


app.get('/post/detail/:id', function (req, res) {
  const { id } = req.params; 
  const query = `SELECT * FROM post WHERE id= ?`; 

  db.query(query,[id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        status: 'Error', 
        error: err.message 
      });
    }

    if (result.length > 0) {
      res.status(200).json({
        data: result
      });
    } else {
      res.status(404).json({
        message: 'Data tidak ditemukan'
      });
    }
  });
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`))