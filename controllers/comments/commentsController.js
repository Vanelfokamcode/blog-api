const Post = require('../../model/Post/Post');
const User = require('../../model/User/User');
const Comment = require('../../model/Comment/Comment');
const appError = require('../../utils/appError');

// @ desc      Create comment
// @route      POST /api/v1/comments/
// @access     Private
exports.createComment = async (req, res, next) => {
  const { description } = req.body;
  try {
    // find post
    const post = await Post.findById(req.params.id);
    // find user
    const user = await User.findById(req.userAuth);
    // create comment
    const comment = await Comment.create({
      description,
      post: post._id,
      user: req.userAuth,
    });
    // push to post
    post.comments.push(comment._id);
    // push to user
    user.comments.push(comment._id);
    // save the post and the user
    await post.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });
    res.json({
      status: 'success',
      data: comment,
    });
  } catch (err) {
    return next(appError(err.message));
  }
};
// @ desc      Get a single comment
// @route      GET /api/v1/comments/:id
// @access     Public
exports.getComment = async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'a single comment ',
    });
  } catch (err) {
    res.json(err.message);
  }
};
// @ desc      Get all comments
// @route      GET /api/v1/comments/
// @access     Public
exports.getAllComments = async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'all comments ',
    });
  } catch (err) {
    res.json(err.message);
  }
};

// @ desc      Update comment
// @route      PUT /api/v1/comments/:id
// @access     Private
exports.updateComment = async (req, res, next) => {
  const { description } = req.body;
  try {
    // find comment
    const comment = await Comment.findById(req.params.id);
    if (comment.user.toString() !== req.userAuth.toString()) {
      return next(appError('You are not the owner of the comment', 403));
    }
    await Comment.findByIdAndUpdate(
      req.params.id,
      {
        description,
      },
      { new: true, runValidators: true }
    );
    res.json({
      status: 'success',
      message: comment,
    });
  } catch (err) {
    return next(app(err.message));
  }
};

// @ desc      Delete comment
// @route      DELETE /api/v1/comments/:id
// @access     Private
exports.deleteComment = async (req, res, next) => {
  try {
    // find comment
    const comment = await Comment.findById(req.params.id);
    if (comment.user.toString() !== req.userAuth.toString()) {
      return next(appError('You are not the owner of the comment', 403));
    }
    await comment.findByIdAndDelete(req.params.id);
    res.json({
      status: 'success',
      message: 'comment delete successfully ',
    });
  } catch (err) {
    return next(appError(err.message));
  }
};
