const express = require('express');

const multer = require('multer');
const postController = require('../../controllers/posts/postController');
const isLogin = require('../../middleware/isLogin');
const storage = require('../../config/cloudinary');

const postRouter = express.Router();

// upload photo
const upload = multer({ storage });

postRouter.post(
  '/',
  isLogin,
  upload.single('image'),
  postController.createPost
);
// postRouter.get('/:id', postController.getPost);
postRouter.get('/', isLogin, postController.getAllPosts);
postRouter.delete('/:id', isLogin, postController.deletePost);

postRouter.get('/like/:id', isLogin, postController.getPostToLike);
postRouter.get('/dislike/:id', isLogin, postController.getPostToDisLike);
postRouter.get('/:id', isLogin, postController.getPostDetails);
postRouter.put(
  '/:id',
  isLogin,
  upload.single('image'),
  postController.updatePost
);

module.exports = postRouter;
