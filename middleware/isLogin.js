const getTokenFromHeader = require('./../utils/getTokenFromHeader');
const verifyToken = require('./../utils/verifyToken');
const appError = require('./../utils/appError');
const isLogin = (req, res, next) => {
  // get token from header
  const token = getTokenFromHeader(req);

  //   verify token
  const decodedUser = verifyToken(token);
  //   console.log(decodedUser);
  // { id: '64272cd60214f649816987dc', iat: 1680291458, exp: 1682883458 }
  // save the user in req obj
  req.userAuth = decodedUser.id;

  if (!decodedUser) {
    return next(appError('Invalid/Expired token. Please login back', 500));
  } else {
    return next();
  }
};

module.exports = isLogin;
