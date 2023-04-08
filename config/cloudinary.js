const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// cloudinary configuration

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// instance of cloudinary storage which is an object
const storage = new CloudinaryStorage({
  cloudinary,
  allowedformats: ['jpg', 'png'],
  params: {
    folder: 'blog-api',
    transformation: [{ with: 500, heigth: 500, crop: 'limit' }],
  },
});

module.exports = storage;
