const express = require('express');
const isLogin = require('../../middleware/isLogin');
const isAdmin = require('../../middleware/isAdmin');
const categoriesController = require('../../controllers/categories/categoriesController');
const categoryRouter = express.Router();

// POST /api/v1/posts
categoryRouter.post('/', isLogin, categoriesController.createCategory);

// GET /api/v1/posts/:id
categoryRouter.get('/:id', categoriesController.getCategory);
// GET /api/v1/users
categoryRouter.get('/', categoriesController.getAllCategories);
// DELETE /api/v1/posts/:id
categoryRouter.delete('/:id', isLogin, categoriesController.deleteCategory);

// Update /api/v1/posts/:id
categoryRouter.put('/:id', isLogin, categoriesController.updateCategory);

module.exports = categoryRouter;
