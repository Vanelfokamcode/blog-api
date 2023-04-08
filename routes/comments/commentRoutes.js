const express = require('express');
const commentController = require('../../controllers/comments/commentsController');
const isLogin = require('../../middleware/isLogin');
const commentRouter = express.Router();

commentRouter.post('/:id', isLogin, commentController.createComment);
commentRouter.get('/:id', commentController.getComment);
commentRouter.get('/', commentController.getAllComments);
commentRouter.delete('/:id', isLogin, commentController.deleteComment);
commentRouter.put('/:id', isLogin, commentController.updateComment);

module.exports = commentRouter;
