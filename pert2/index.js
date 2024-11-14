
//buat server node 
const express = require('express')
const app = express()
const port = 3000

//endpoint 1
app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`ini adalah port ${port}!`))

// buat endpoint baru 
app.get('/pesan', (req, res) => {
  res.send('pesan')


})

