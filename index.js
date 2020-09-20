const express = require('express')
const mysql = require('mysql')

const app = express()

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Mr@mani_15',
  database: 'amiuressr',
})

db.connect((err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('mysql connected')
  }
})
app.get('/', (req, res) => res.send('api is running'))

app.listen(5000, () => console.log('server started'))