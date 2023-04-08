const appError = (message, statusCode) => {
  let error = new Error(message);
  error.statusCode = error.statusCode ? error.statusCode : 500;
  stack = error.stack;
  return error;
};

module.exports = appError;
