const User = require('../../model/User/User');
const Post = require('../../model/Post/Post');
const Comment = require('../../model/Comment/Comment');
const Category = require('../../model/Category/Category');

const bcrypt = require('bcryptjs');
const generateToken = require('../../utils/generateToken');
const getTokenFromHeader = require('../../utils/getTokenFromHeader');
const appError = require('../../utils/appError');

// @ desc      Register user
// @route      POST /api/v1/users/register
// @access     Public
exports.userRegister = async (req, res, next) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const userFound = await User.findOne({ email });
    if (userFound) {
      return next(appError('User already exists', 500));
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // create user
    const user = await User.create({
      firstname,
      lastname,
      // profilephoto,
      email,
      password: hashedPassword,
    });

    res.json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(appError(err.message));
  }
};

// @desc      Login user
// @route      POST /api/v1/users/login
// @access     Public
exports.userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // check if email exists
    // validity of the password
    const userFound = await User.findOne({ email });
    if (!userFound) {
      res.json({
        message: 'Wrong credentials',
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, userFound.password);

    if (!isPasswordMatch) {
      res.json({
        message: 'Wrong credentials',
      });
    }
    res.json({
      status: 'success',
      data: {
        firtname: userFound.firstname,
        lastname: userFound.lastname,
        email: userFound.email,
        isAdmin: userFound.isAdmin,
        token: generateToken(userFound._id),
      },
    });
  } catch (err) {
    return next(appError(err.message));
  }
};

// @ desc      Get who viewed my profile
// @route      GET /api/v1/users/profile-viewers/:id
// @access     Private
exports.whoViewedMyProfile = async (req, res, next) => {
  try {
    // find the original user who is profile is being viewed
    const user = await User.findById(req.params.id);

    // find user who is viewing the original user
    const userWhoViewed = await User.findById(req.userAuth);

    // check if user and userWhoViewed are found
    if (user && userWhoViewed) {
      // check if userWhoViewed have already viewed and is in
      // the viewers array
      const isUserAlreadyViewed = user.viewers.find(
        (viewer) => viewer.toString() === userWhoViewed._id.toString()
      );

      if (isUserAlreadyViewed) {
        return next(appError('You have already viewed this user', 404));
      } else {
        // pushh the user who viewed in the viewers array
        user.viewers.push(userWhoViewed);
      }

      // save the user
      await user.save();

      res.json({
        status: 'success',
        message: 'You have successfully viewed this profile',
      });
    }
  } catch (err) {
    return next(appError(err.message));
  }
};

// @ desc      Get all users
// @route      GET /api/v1/users/
// @access     Private
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({
      status: 'success',
      data: users,
    });
  } catch (err) {
    return next(appError(err.message));
  }
};

// @ desc      Get single user
// @route      GET /api/v1/users/:id
// @access     Private
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    return next(appError(err.message));
  }
};

// @ desc      Get user profile
// @route      GET /api/v1/users/profile/
// @access     Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userAuth);
    res.json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    return next(appError(err.message));
  }
};

// @ desc      Update user
// @route      PUT /api/v1/users/update-user
// @access     Private
exports.updateUser = async (req, res, next) => {
  const { email, firstname, lastname } = req.body;
  try {
    if (email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return next(appError('email already taken', 400));
      }
    }
    const user = await User.findByIdAndUpdate(
      req.userAuth,
      {
        firstname,
        lastname,
        email,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json({
      status: 'success',
      message: user,
    });
  } catch (err) {
    return next(appError(err.message));
  }
};

// @ desc      Update password
// @route      PUT /api/v1/users/update-password
// @access     Private
exports.updatePassword = async (req, res, next) => {
  const { password } = req.body;
  try {
    // find if want to update password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await User.findByIdAndUpdate(
        req.userAuth,
        {
          password: hashedPassword,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      res.json({
        status: 'success',
        message: 'Password update successfully',
      });
    } else {
      return next(appError('Please provide a password', 400));
    }
  } catch (err) {
    return next(appError(err.message));
  }
};

// @ desc      Delete account
// @route      PUT /api/v1/users/
// @access     Private
exports.deleteAccount = async (req, res, next) => {
  try {
    // find user to be deleted
    const userToBeDeleted = await User.findById(req.userAuth);
    if (!userToBeDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
    // delete post
    await Post.deleteMany({ user: req.userAuth });
    // delete comment
    await Comment.deleteMany({ user: req.userAuth });
    // delete category
    await Category.deleteMany({ user: req.userAuth });
    // delete user
    await User.deleteOne({ _id: userToBeDeleted._id });
    res.json({
      status: 'success',
      message: 'You have successfully delete your account',
    });
  } catch (err) {
    return next(appError(err.message));
  }
};

// @ desc      following
// @route      GET /api/v1/users/following/:id
// @access     Private
exports.getFollowing = async (req, res, next) => {
  try {
    // find user to follow
    const userToFollow = await User.findById(req.params.id);
    // find user who followed
    const userWhoFollowed = await User.findById(req.userAuth);
    // check the 2 users
    if (userToFollow && userWhoFollowed) {
      // check user who followed is already following is in the
      // userToFollow array already
      const isUserAlreadyFollowing = userToFollow.following.find(
        (follower) => follower.toString() === userWhoFollowed._id.toString()
      );

      if (isUserAlreadyFollowing) {
        return next(appError('You follow him already', 404));
      } else {
        // push user who Follow into user to follow array
        userToFollow.followers.push(userWhoFollowed._id);
        // push userWhoFollowed in the userTofollow following array
        userWhoFollowed.following.push(userToFollow._id);

        // save the 2
        await userToFollow.save();
        await userWhoFollowed.save();

        res.json({
          status: 'success',
          message: 'You have successfully followed this user',
        });
      }
    }
  } catch (err) {
    res.json(err.message);
  }
};

// @ desc      Update user
// @route      PUT /api/v1/users/:id
// @access     Private
exports.getUnfollow = async (req, res, next) => {
  try {
    // find user to unfollow
    const userToBeUnfollowed = await User.findById(req.params.id);
    // find user who unfollowed
    const userWhoUnfollowed = await User.findById(req.userAuth);
    // check the 2 users exists
    if (userToBeUnfollowed && userWhoUnfollowed) {
      // check user who unfollowed where initially following
      const isUserFollowInitially = userWhoUnfollowed.following.find(
        (follower) => follower.toString() === userToBeUnfollowed._id.toString()
      );
      if (!isUserFollowInitially) {
        return next(appError('You have not followed this user initially', 404));
      } else {
        // remove userToBeUnfollowed in the UserWhoUnfollowed following array
        userWhoUnfollowed.following = userWhoUnfollowed.following.find(
          (following) =>
            following.toString() !== userToBeUnfollowed._id.toString()
        );
        await userWhoUnfollowed.save();
        // remove userWhoUnfollowed in the UserToBeUnfollowed followers array
        userToBeUnfollowed.followers = userToBeUnfollowed.followers.filter(
          (followers) =>
            followers.toString() !== userWhoUnfollowed._id.toString()
        );
        await userToBeUnfollowed.save();
      }
      res.json({
        status: 'success',
        message: 'You have successfully unfollow this user',
      });
    }
  } catch (err) {
    res.json(err.message);
  }
};

// @ desc      Block user
// @route      PUT /api/v1/users/block/:id
// @access     Private
exports.blockUser = async (req, res, next) => {
  try {
    // find user to block
    const userToBeBlocked = await User.findById(req.params.id);
    // find user who unfollowed
    const userWhoIsBlocking = await User.findById(req.userAuth);
    // check the 2 users exists
    if (userToBeBlocked && userWhoIsBlocking) {
      // check user who unfollowed where initially following
      const isUserBlockedAlready = userWhoIsBlocking.blocked.find(
        (blocked) => blocked.toString() === userToBeBlocked._id.toString()
      );
      if (isUserBlockedAlready) {
        return next(appError('You have already block this user', 404));
      } else {
        // push userToBlocked id in the userWhoBlocked array
        userWhoIsBlocking.blocked.push(userToBeBlocked._id);
        // save
        userWhoIsBlocking.save();
        res.json({
          status: 'success',
          message: 'You have successfully blocked this user',
        });
      }
    }
  } catch (err) {
    res.json(err.message);
  }
};

// @ desc      Unblock user
// @route      PUT /api/v1/users/unblock/:id
// @access     Private
exports.unBlockUser = async (req, res, next) => {
  try {
    // find user to be unblock
    const userToBeUnBlocked = await User.findById(req.params.id);
    // find user who is unblocking
    const userWhoIsUnBlocking = await User.findById(req.userAuth);
    // check the 2 users exists
    if (userToBeUnBlocked && userWhoIsUnBlocking) {
      // check user who unfollowed where initially following
      const isUserBlockedAlready = userWhoIsUnBlocking.blocked.find(
        (blocked) => blocked.toString() === userToBeUnBlocked._id.toString()
      );
      if (!isUserBlockedAlready) {
        return next(appError('You have not block this user'));
      } else {
        // remove unblocked user in blocked array
        userWhoIsUnBlocking.blocked = userWhoIsUnBlocking.blocked.filter(
          (blocked) => blocked.toString() !== userToBeUnBlocked._id.toString()
        );
        // save
        await userWhoIsUnBlocking.save();
        res.json({
          status: 'success',
          message: 'You have successfully unblocked this user',
        });
      }
    }
  } catch (err) {
    res.json(err.message);
  }
};

// @ desc      Admin block a user
// @route      PUT /api/v1/users/admin-block/:id
// @access     Private
exports.adminBlockUser = async (req, res, next) => {
  try {
    const userToBeBlocked = await User.findById(req.params.id);
    // if user to blocked doesn't exist error
    if (!userToBeBlocked) {
      return next(appError('user to be block not found'));
    }
    userToBeBlocked.isBlocked = true;
    await userToBeBlocked.save();

    res.json({
      status: 'success',
      message: 'You have successfully block user',
    });
  } catch (err) {
    res.json(err.message);
  }
};

// @ desc      Admin unblock a user
// @route      PUT /api/v1/users/admin-unblock/:id
// @access     Private
exports.adminUnBlockUser = async (req, res, next) => {
  try {
    const userToBeUnBlocked = await User.findById(req.params.id);
    // if user to blocked doesn't exist error
    if (!userToBeUnBlocked) {
      return next(appError('user to be unblock not found'));
    }
    userToBeUnBlocked.isBlocked = false;
    await userToBeUnBlocked.save();

    res.json({
      status: 'success',
      message: 'You have successfully unblock user',
    });
  } catch (err) {
    res.json(err.message);
  }
};

// @ desc      Update user
// @route      PUT /api/v1/users/profile-photo-upload
// @access     Private
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    // 1 find user to be update
    const userToUpdate = await User.findById(req.userAuth);
    // 2) check if user is found
    if (!userToUpdate) {
      return next(appError('User not found', 403));
    }
    // 3) check is user is blocked
    if (userToUpdate.isBlocked) {
      return next(appError('Action not allowed. You have been blocked', 401));
    }
    // 4) check if user updated photo
    if (req.file) {
      // 5) updated the photo field for user
      await User.findByIdAndUpdate(
        req.userAuth,
        {
          $set: {
            profilePhotos: req.file.path,
          },
        },
        {
          new: true,
        }
      );

      res.json({
        status: 'success',
        message: 'You have successfully updated your profile photo',
      });
    }
  } catch (err) {
    return next(appError(err.message, 500));
  }
};
