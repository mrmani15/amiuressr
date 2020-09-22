const express = require('express')
const mysql = require('mysql')
const router = express.Router()
const auth = require('../middleware/auth')


const db = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
})

router.get('/', (req, res) => res.render('index'))

router.get('/register', (req, res) => res.render('register'))


router.get('/login', (req, res) => res.render('login'))


router.get('/dashboard/:page', auth, (req, res) => {
  db.query('SELECT * FROM blog', (error, response) => {
    if (error) {
      console.log(error)
    } else {
      for (let i = 0; i < response.length; i++) {
        response[i].blog = JSON.parse(response[i].blog)
      }
      response = response.reverse()
      const currentPage = req.params.page
      const postPerPage = 10

      const lastIndex = currentPage * postPerPage
      const firstIndex = lastIndex - postPerPage

      const page = Math.ceil(response.length / postPerPage)
      response = response.slice(firstIndex, lastIndex)
      const id = req.cookies.id
      return res.status(200).render('dashboard', { data: response, page: page, id: id })
    }
  })
})


router.get('/edit/:id', auth, (req, res) => {
  let id = req.params.id
  res.cookie('index', id)
  db.query('SELECT * FROM blog', (error, response) => {
    if (error) {
      console.log(error)
    } else {
      for (let i = 0; i < response.length; i++) {
        response[i].blog = JSON.parse(response[i].blog)
      }
      const dataVal = response.filter(data => data.id == id)
      return res.status(200).render('edit', { data: dataVal })
    }
  })
})


router.get('/read/:id', auth, (req, res) => {
  let id = req.params.id
  db.query('SELECT * FROM blog', (error, response) => {
    if (error) {
      console.log(error)
    } else {
      for (let i = 0; i < response.length; i++) {
        response[i].blog = JSON.parse(response[i].blog)
      }
      const dataVal = response.filter(data => data.id == id)
      return res.status(200).render('read', { data: dataVal })
    }
  })
})

module.exports = router