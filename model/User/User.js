const mongoose = require('mongoose');
const Post = require('../../model/Post/Post');
const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, 'First Name is required'],
    },
    lastname: {
      type: String,
      required: [true, 'last Name is required'],
    },
    profilePhotos: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['Admin', 'Editor', 'Guest'],
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    blocked: [
      // list of users a user have blocked
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // plan: {
    //   type: String,
    //   enum: ['free', 'premium', 'Pro'],
    //   default: 'free',
    // },

    userAward: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold'],
      default: 'Bronze',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// hooks
// pre-hook
userSchema.pre('findOne', async function (next) {
  this.populate('posts');
  // find user id
  const userId = this._conditions._id;
  // find all the post created by user
  const posts = await Post.find({ user: userId });
  // last post
  const lastPost = posts[posts.length - 1];
  const lastPostDate = new Date(lastPost && lastPost.createdAt);
  const lastPostDateStr = lastPostDate.toDateString();
  userSchema.virtual('lastPostDate').get(function () {
    return lastPostDateStr;
  });

  // -----------------check if user inactive for 30 days ------
  // get current date
  const currentDate = new Date();
  // diff between laspost date and current date
  const diff = currentDate - lastPostDate;
  // convert in days
  const diffInDay = diff / (36000 * 60 * 24);
  if (diffInDay > 30) {
    // add virtual isInactive in schema
    userSchema.virtual('IsInactive').get(function () {
      return true;
    });
    await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
  } else {
    userSchema.virtual('IsInactive').get(function () {
      return false;
    });
    // isBlocked: false
    await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
  }

  // ------- last active --------
  const daysAgo = Math.floor(diffInDay);
  if (daysAgo <= 0) {
    return 'Today';
  }
  if (daysAgo === 1) {
    return 'Yesterday';
  }
  if (daysAgo > 1) {
    return `${daysAgo} days ago`;
  }

  const numberOfPosts = posts.length;
  // bronze
  if (numberOfPosts < 10) {
    await User.findByIdAndUpdate(
      userId,
      {
        userAward: 'Bronze',
      },
      {
        new: true,
      }
    );
  }
  // silver
  if (numberOfPosts > 10) {
    await User.findByIdAndUpdate(
      userId,
      {
        userAward: 'Silver',
      },
      {
        new: true,
      }
    );
  }
  // gold
  if (numberOfPosts > 20) {
    await User.findByIdAndUpdate(
      userId,
      {
        userAward: 'Gold',
      },
      {
        new: true,
      }
    );
  }

  next();
});

// get fullname
userSchema.virtual('fullname').get(function () {
  return `${this.firstname} ${this.lastname}`;
});
// get initials
userSchema.virtual('initials').get(function () {
  return `${this.firstname[0]}${this.lastname[0]}`;
});
// get postcount
userSchema.virtual('postCount').get(function () {
  return `${this.posts.length}`;
});
// get following count
userSchema.virtual('followingCount').get(function () {
  return `${this.following.length}`;
});
// get followers count
userSchema.virtual('followersCount').get(function () {
  return `${this.followers.length}`;
});
// get viewers count
userSchema.virtual('viewersCount').get(function () {
  return `${this.viewers.length}`;
});
// get blocked count
userSchema.virtual('blockedCount').get(function () {
  return `${this.blocked.length}`;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
