const pool = require('../config/conn')
const logger = require('../config/logger')
const tokenService = require('../services/token.services')
const validation = require('../validation/user.validation');
const jwt = require(`jsonwebtoken`)
const createError = require(`http-errors`)



exports.authenticate = async (req, res, next) => {
  try {
    const result = await validation
      .authenticate()
      .validateAsync(req.body, { abortEarly: false })

    console.log('authent', result.email)
    const { email, password } = result
    const response = await pool.query(
      'SELECT * FROM profile WHERE email = $1',
      [email]
    )
    console.log('response', response)

    if (response.rows[0] != null && response.rows[0].password == password) {
      const token = await tokenService.signToken(response.rows[0].userid)
      if (token) {
        res.cookie('authorization', token, {
          maxAge: 1000 * 60 * 60 * 24 * 1,
          httpOnly: true
        })
      }

      return res.status(200).json({ message: 'User Logined Successfully' })
    } else {
      return res.status(403).json({ message: 'User Logined Failure' })
    }
  } catch (err) {
    next(err)
  }
}


exports.isLoggedIn = async (req, res, next) => {
    try {
        
        const token = req.headers[`authorization`];
        if (!token) throw createError.BadRequest({ message: `Token not found` })
        const isVerified = await tokenService.verifyToken(res, token);
        next();
    }
    catch (err) {
        next(err);
    }
}