const express = require('express');
const storage = require('../../config/cloudinary');
const userController = require('../../controllers/users/userController');
const isLogin = require('../../middleware/isLogin');
const isAdmin = require('../../middleware/isAdmin');
const multer = require('multer');
const userRouter = express.Router();

// instance of multer
const upload = multer({ storage });

userRouter.post('/register', userController.userRegister);
userRouter.post('/login', userController.userLogin);
userRouter.get('/', userController.getAllUsers);
userRouter.get('/:id', userController.getUser);

userRouter.post(
  '/profile-photo-upload',
  isLogin,
  upload.single('profile'),
  userController.uploadProfilePhoto
);
userRouter.get(
  '/profile-viewers/:id',
  isLogin,
  userController.whoViewedMyProfile
);
userRouter.get('/unfollow/:id', isLogin, userController.getUnfollow);
userRouter.get('/block/:id', isLogin, userController.blockUser);
userRouter.get('/unblock/:id', isLogin, userController.unBlockUser);
userRouter.put(
  '/admin-block/:id',
  isLogin,
  isAdmin,
  userController.adminBlockUser
);
userRouter.put(
  '/admin-unblock/:id',
  isLogin,
  isAdmin,
  userController.adminUnBlockUser
);
userRouter.get('/following/:id', isLogin, userController.getFollowing);
userRouter.get('/profile/', isLogin, userController.getUserProfile);
userRouter.delete('/delete-account/', isLogin, userController.deleteAccount);
userRouter.put('/', isLogin, userController.updateUser);
userRouter.put('/update-password/', isLogin, userController.updatePassword);

module.exports = userRouter;
