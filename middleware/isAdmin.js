const getTokenFromHeader = require('./../utils/getTokenFromHeader');
const verifyToken = require('./../utils/verifyToken');
const User = require('./../model/User/User');
const appError = require('./../utils/appError');

const isAdmin = async (req, res, next) => {
  // get token from header
  const token = getTokenFromHeader(req);
  //   verify token
  const decodedUser = verifyToken(token);
  //   console.log(decodedUser);
  // { id: '64272cd60214f649816987dc', iat: 1680291458, exp: 1682883458 }
  // save the user in req obj
  req.userAuth = decodedUser.id;
  //   find user by id in DB
  const user = await User.findById(decodedUser.id);
  if (user.isAdmin) {
    return next();
  } else {
    return next(appError('Access Denied. You are not ADMIN', 403));
  }
};

module.exports = isAdmin;
