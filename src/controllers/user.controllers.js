const pool = require('../config/conn')
const validator = require('../validation/user.validation')
exports.followUser = async (req, res, next) => {
  try {
    const result = await validator.followUser().validateAsync(req.body, {
      abortEarly: false
    })
    const userId = res.locals.payload.sub

    if (result.id == userId) {
      return res.status(403).json({ message: 'You cannot follow yourself' })
    } else {
      const following = await pool.query(
        'SELECT * FROM followRelation WHERE userId = $1 AND follows = $2',
        [userId, result.id]
      )
      if (following.rows.length == 0) {
        await pool.query(
          'INSERT INTO followRelation (userId, follows) VALUES ($1, $2) RETURNING *',
          [userId, result.id]
        )

        return res.status(200).send('You are now following this user')
      } else {
        return res.status(403).send('You are already following this user')
      }
    }
  } catch (err) {
    next(err)
  }
}

exports.unfollowUser = async (req, res, next) => {
  
    try {
      const userId = res.locals.payload.sub
      const result = await validator.unfollowUser().validateAsync(req.body, {
        abortEarly: false
      })

      if (result.id == userId) {
        return res.status(403).send('You cannot unfollow yourself')
      } else {
        const following = await pool.query(
          'SELECT * FROM followRelation WHERE userId = $1 AND follows = $2',
          [userId, result.id]
        )
        if (following.rows.length != 0) {
          await pool.query(
            'DELETE FROM followRelation WHERE userId = $1 AND follows = $2',
            [userId, result.id]
          )

          return res
            .status(200)
            .send('You have successfully unfollowed this user')
        } else {
          return res.status(403).send("You don't follow this user")
        }
      }
    } catch (err) {
      next(err)
    }
}

  exports.getUser = async (req, res, next) => {
    try {
      const userId = res.locals.payload.sub
      const getUsername = await pool.query(
        'SELECT * FROM profile WHERE userId = $1',
        [userId]
      )
      console.log(getUsername)

      const getFollowersCount = await pool.query(
        'SELECT COUNT(*) FROM followRelation WHERE follows = $1',
        [userId]
      )

      const getFollowingCount = await pool.query(
        'SELECT COUNT(*) FROM followRelation WHERE userId = $1',
        [userId]
      )

      res.status(200).json({
        username: getUsername.rows[0].username,
        followers: getFollowersCount.rows[0],
        following: getFollowingCount.rows[0]
      })
    } catch (err) {
      next(err)
    }
}
