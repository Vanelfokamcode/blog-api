var express = require('express');
const userRouter = require('./routes/users/userRoutes');
const postRouter = require('./routes/posts/postRoute');
const categoryRouter = require('./routes/categories/categoryRoutes');
const commentRouter = require('./routes/comments/commentRoutes');
const globalErrorHandler = require('./middleware/globalErrorHandler');
require('dotenv').config();
require('./config/dbConnect');

const app = express();

// body parser
app.use(express.json());

// middlewares

// users routes
app.use('/api/v1/users/', userRouter);
app.use('/api/v1/posts/', postRouter);
app.use('/api/v1/comments/', commentRouter);
app.use('/api/v1/categories/', categoryRouter);

// Error handlers middleware
app.use(globalErrorHandler);

// 404 error NOT FOUND
app.use('*', (req, res) => {
  res.status(404).json({
    message: `${req.originalUrl} - Route Not Found`,
  });
});

// Listen to server

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`App running... on port ${PORT}`);
});
