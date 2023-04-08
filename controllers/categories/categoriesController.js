const Category = require('../../model/Category/Category');
const User = require('../../model/User/User');
const appError = require('../../utils/appError');

// @ desc      Create category
// @route      POST /api/v1/categories/
// @access     Private
exports.createCategory = async (req, res, next) => {
  const { title } = req.body;
  try {
    const category = await Category.create({
      title,
      user: req.userAuth,
    });
    res.json({
      status: 'success',
      data: category,
    });
  } catch (err) {
    return next(appError(err.message));
  }
};
// @ desc      Get a single category
// @route      GET /api/v1/categories/:id
// @access     Public
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    res.json({
      status: 'success',
      message: category,
    });
  } catch (err) {
    return next(appError(err.message));
  }
};
// @ desc      Get all categories
// @route      GET /api/v1/categories/
// @access     Public
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json({
      status: 'success',
      data: categories,
    });
  } catch (err) {
    return next(appError(err.message));
  }
};

// @ desc      Update category
// @route      PUT /api/v1/categories/:id
// @access     Private
exports.updateCategory = async (req, res) => {
  const { title } = req.body;
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        title,
      },
      { new: true, runValidators: true }
    );
    res.json({
      status: 'success',
      message: category,
    });
  } catch (err) {
    res.json(err.message);
  }
};

// @ desc      Delete category
// @route      DELETE /api/v1/categories/:id
// @access     Private
exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({
      status: 'success',
      data: {},
    });
  } catch (err) {
    return next(appError(err.message));
  }
};
