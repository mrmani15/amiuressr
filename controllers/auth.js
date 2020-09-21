const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const db = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
})


exports.register = (req, res) => {
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password

  if ((name === '') || (email === '') || (password === '')) {
    return res.render('register', { message: 'Please fill form properly' })
  }

  db.query('SELECT email FROM user WHERE email = ?', [email], async (error, results) => {
    if (error) {
      console.log(error)
    }
    if (results.length > 0) {
      return res.render('register', { message: 'Email already exits' })
    }

    let hashedPassword = await bcrypt.hash(password, 8)

    db.query('INSERT INTO user SET ?', { name: name, email: email, password: hashedPassword }, (error, resuts) => {
      if (error) {
        console.log(error)
      } else {
        res.status(200).redirect('/dashboard/1')
      }
    })
  })
}



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if ((email === '') || (password === '')) {
      return res.status(400).render('login', { message: 'Please fill form properly' })
    }

    db.query('SELECT * FROM user WHERE email = ?', [email], async (error, results) => {
      if (!results || !(await bcrypt.compare(password, results[0].password))) {
        return res.status(401).render('login', {
          message: 'Email or Password is incorrect'
        })
      } else {
        const id = results[0].id
        const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
          expiresIn: process.env.JWT_EXPIRES_TIME
        })

        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
        }
        res.cookie('jwt', token, cookieOptions)
        res.cookie('id', id)
        res.status(200).redirect('/dashboard/1')
      }
    })

  } catch (error) {
    console.log(error)
  }
}


exports.logout = (req, res) => {
  res.clearCookie('jwt')
  res.clearCookie('id')
  res.status(200).redirect('/login')
}

exports.blog = (req, res) => {
  const { title, blog } = req.body
  const id = req.cookies.id

  const raw = {
    title: title,
    blog: blog
  }
  const data = JSON.stringify(raw)
  
  if ((title === '') || (blog === '')) {
    return res.status(401).render('dashboard', {
      message: 'field is empty'
    })
  }

  db.query('INSERT INTO blog SET ?', { blogId: id, blog: data }, (error, results) => {
    if (error) {
      console.log(error)
    } else {
      return res.status(200).redirect('/dashboard/1')
    }
  })
}

exports.edit = (req, res) => {
  const { title, blog } = req.body
  const usercookie = req.headers.cookie
  let cookieValues = usercookie.split(' ')
  cookieValues = cookieValues.sort()
  let cookieValue = cookieValues[1]
  const conversion = cookieValue + ''
  const idString = conversion.split('=')
  const id = parseInt(idString[1])
  console.log(req.cookies.id, id, 'hello');
  const raw = {
    title: title,
    blog: blog
  }
  const data = JSON.stringify(raw)
  if ((title === '') || (blog === '')) {
    return res.status(401).render('dashboard', {
      message: 'field is empty'
    })
  }
  db.query('SELECT * FROM blog', (error, response) => {
    if (error) {
      console.log(error)
    } else {
      const len = response.length
      const idValueForUpdate = len - id

      db.query('UPDATE blog SET blog = ? WHERE id = ?', [data, idValueForUpdate], (err, resp) => {
        if (err) {
          console.log(err)
        } else {
          return res.status(200).redirect('/dashboard/1')
        }
      })
    }
  })

}
