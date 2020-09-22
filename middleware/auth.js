const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {

  const token = req.cookies.jwt
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
        if (err) {
          console.log(err.message)
          res.redirect('/login')
        } else {
          next()
        }
      });
    } catch (err) {

    }
  } else {
    res.redirect('/login')
  }
};
