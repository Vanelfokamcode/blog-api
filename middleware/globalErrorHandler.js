const globalErrorHandler = (err, req, res, next) => {
  const stack = err.stack;
  const status = err.status ? err.status : 'failed';
  const message = err.message;
  const statusCode = err.statusCode ? err.statusCode : 500;
  // send response
  res.status(statusCode).json({
    message,
    stack,
    status,
  });
};

module.exports = globalErrorHandler;
