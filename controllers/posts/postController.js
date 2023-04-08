const User = require('../../model/User/User');
const Post = require('../../model/Post/Post');
const appError = require('../../utils/appError');
// @ desc      Create post
// @route      POST /api/v1/posts/
// @access     Private
exports.createPost = async (req, res, next) => {
  const { title, description, category } = req.body;
  try {
    // find user id
    const author = await User.findById(req.userAuth);
    //  check if author is blocked
    if (author.isBlocked) {
      return next(appError('You have been blocked', 403));
    }
    // create post
    const postCreated = await Post.create({
      title,
      description,
      user: author._id,
      category,
      // if user make request and there is a file grab the req.file.path
      // and assigned it to the photo
      photo: req && req.file && req.file.path,
    });
    // push the post in the posts array for that user
    author.posts.push(postCreated);
    // save
    await author.save();
    res.json({
      status: 'success',
      data: postCreated,
    });
  } catch (err) {
    return next(appError(err.message));
  }
};
// @ desc      Login user
// @route      POST /api/v1/users/login
// @access     Public
exports.userLogin = async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'User login',
    });
  } catch (err) {
    return next(appError(err.message));
  }
};
// @ desc      Get a single post
// @route      GET /api/v1/posts/:id
// @access     Public
// exports.getPost = async (req, res) => {
//   try {
//     res.json({
//       status: 'success',
//       message: 'post route',
//     });
//   } catch (err) {
//     return next(appError(err.message));
//   }
// };

// @ desc      like a post
// @route      GET /api/v1/posts/like/:id
// @access     Public
exports.getPostToLike = async (req, res) => {
  try {
    // get a post id to like
    const post = await Post.findById(req.params.id);
    // check user already like the post
    const isLiked = post.likes.includes(req.userAuth);
    if (isLiked) {
      // reassigned the array to return all the likes except
      // equal to the user id already liked
      post.likes = post.likes.filter(
        (like) => like.toString() !== req.userAuth.toString()
      );
      await post.save();
    } else {
      // if user has not liked the post before push to likes array
      post.likes.push(req.userAuth);
      // save
      await post.save();
    }
    res.json({
      status: 'success',
      message: 'You have successfully like this post',
    });
  } catch (err) {
    return next(appError(err.message));
  }
};

// @ desc      dislike a post
// @route      GET /api/v1/posts/dislike/:id
// @access     Public
exports.getPostToDisLike = async (req, res, next) => {
  try {
    // get a post id to dislike
    const post = await Post.findById(req.params.id);
    // check user already unlike the post
    const isUnLiked = post.likes.includes(req.userAuth);
    if (!isUnLiked) {
      return next(appError('You have not like this post'));
    } else {
      // filter remove the like in the likes array
      post.dislikes = post.dislikes.filter(
        (dislike) => dislike.toString !== req.userAuth.toString()
      );
      // if user has not liked the post before push to likes array
      post.dislikes.push(req.userAuth);

      // save
      await post.save();
    }
    res.json({
      status: 'success',
      message: 'You have successfully dislike this post',
    });
  } catch (err) {
    return next(appError(err.message));
  }
};

// @ desc      Get all posts
// @route      GET /api/v1/posts/
// @access     Public
exports.getAllPosts = async (req, res, next) => {
  try {
    // find all posts
    const posts = await Post.find({})
      .populate('user')
      .populate('category', 'title');

    // check if user is blocked by post owner
    const filteredPosts = posts.filter((post) => {
      // get all blocked users
      const blockedUsers = post.user?.blocked;
      const isBlocked = blockedUsers?.includes(req.userAuth);
      return isBlocked ? null : post;
    });
    res.json({
      status: 'success',
      data: filteredPosts,
    });
  } catch (err) {
    return next(appError(err.message));
  }
};

// @ desc      Get post details
// @route      GET /api/v1/posts/:id
// @access     Public
exports.getPostDetails = async (req, res, next) => {
  try {
    // find post by id
    const post = await Post.findById(req.params.id);
    // check if user have view already
    const isViewed = post.numViews.includes(req.userAuth);
    if (isViewed) {
      post.views = post.numViews.filter(
        (view) => view.toString() !== req.userAuth
      );
    } else {
      post.numViews.push(req.userAuth);
    }
    await post.save();
    res.json({
      status: 'success',
      data: post,
    });
  } catch (err) {
    return next(appError(err.message));
  }
};

// @ desc      Delete post
// @route      DELETE /api/v1/posts/:id
// @access     Private
exports.deletePost = async (req, res, next) => {
  try {
    // find and check if post belong to the deleter
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.userAuth.toString()) {
      return next(appError('You are not the owner of the post', 403));
    }
    // delete
    await Post.findByIdAndDelete(req.params.id);
    res.json({
      status: 'success',
      message: 'You have successfully delete the post',
    });
  } catch (err) {
    return next(appError(err.message));
  }
};

// @ desc      Update post
// @route      PUT /api/v1/posts/:id
// @access     Private
exports.updatePost = async (req, res, next) => {
  const { title, category, description } = req.body;
  try {
    // find and check if post belong to the deleter
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.userAuth.toString()) {
      return next(appError('You are not the owner of the post', 403));
    }
    // delete
    await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        category,
        description,
        photo: req && req.file && req.file.path,
      },
      { new: true }
    );
    res.json({
      status: 'success',
      data: post,
    });
  } catch (err) {
    return next(appError(err.message));
  }
};
