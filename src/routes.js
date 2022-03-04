const router = require(`express`).Router()
const authController = require('./controllers/auth.controllers');
const userController = require('./controllers/user.controllers')
const postController = require('./controllers/post.controllers');



router.post('/api/authenticate', authController.authenticate);


router.post('/api/follow', authController.isLoggedIn, userController.followUser)
router.post('/api/unfollow', authController.isLoggedIn, userController.unfollowUser)
router.get('/api/user-details', authController.isLoggedIn, userController.getUser);


router.post('/api/create-post', authController.isLoggedIn, postController.createPost)
router.delete('/api/delete-post',authController.isLoggedIn, postController.deletePost)

router.post('/api/like', authController.isLoggedIn, postController.likePost)
router.post('/api/unlike', authController.isLoggedIn, postController.unlikePost)

router.post('/api/comment', authController.isLoggedIn, postController.insertComment);
router.get('/api/posts/:id', authController.isLoggedIn, postController.getCount);

router.get('/api/all_posts', authController.isLoggedIn, postController.getAllPosts);

module.exports = router
