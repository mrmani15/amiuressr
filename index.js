const express = require('express')
const mysql = require('mysql')
const path = require('path')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
dotenv.config({ path: './.env' })

const app = express()

const publicDirectory = path.join(__dirname, './public')
app.use(express.static(publicDirectory))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())

app.set('view engine', 'ejs')

const db = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
})

db.connect((err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('mysql connected')
  }
})


app.use('/', require('./routes/pages'))
app.use('/auth', require('./routes/auth'))

app.listen(80, () => console.log('server started'))