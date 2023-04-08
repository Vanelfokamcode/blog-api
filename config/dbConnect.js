const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('DB connect successfully');
  } catch (err) {
    console.log(err.message);
  }
};

dbConnect();
