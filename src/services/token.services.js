const jwt = require(`jsonwebtoken`)
const createError = require(`http-errors`)
const fs = require('fs')
const path = require('path')
const logger = require('../config/logger')
const pathToPubKey = path.join(__dirname, '..', 'config/key/id_rsa_pub.pem')
const PUB_KEY = fs.readFileSync(pathToPubKey, 'utf8')


const pathToPrivKey = path.join(__dirname, '..', '/config/key/id_rsa_priv.pem')
const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8')

exports.signToken = userId => {
  return new Promise((resolve, reject) => {
    const _id = userId
    const issuer = `reunion`

    const payload = {
      sub: _id,
      iat: Date.now(),
      iss: issuer,
      type: `at`
    }

    const options = {
      expiresIn: `1d`,
      algorithm: `RS256`
    }

    jwt.sign(payload, PRIV_KEY, options, (err, token) => {
      if (err) {
        console.error(err.message)
        return reject(
          createError(500, { code: 'ISE', message: 'internal server error' })
        )
      }
      return resolve(token)
    })
  })
}

exports.verifyToken = async (res, token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, PUB_KEY, (err, payload) => {
      if (err) {
        if (err.name == 'JsonWebTokenError') reject(createError.BadRequest());
        reject(reateError.InternalServerError());
      } else {
        res.locals.authenticated = true
        res.locals.payload = payload
        resolve();
      }
    })
  })
}
