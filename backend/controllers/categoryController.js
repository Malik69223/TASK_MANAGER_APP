const Category = require('../models/Category');

// Default initial categories if none exist
const DEFAULT_CATEGORIES = [
  { name: 'Personal', color: '#ec4899', icon: 'User' },
  { name: 'Work', color: '#3b82f6', icon: 'Briefcase' },
  { name: 'Study', color: '#8b5cf6', icon: 'BookOpen' },
  { name: 'Coding', color: '#10b981', icon: 'Code' },
  { name: 'Exercise', color: '#f59e0b', icon: 'Activity' },
  { name: 'University', color: '#06b6d4', icon: 'GraduationCap' },
];

// @desc    Get user categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({ userId: req.user._id }).sort({ name: 1 });

    // Seed default categories if user has none
    if (categories.length === 0) {
      const defaultDocs = DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        userId: req.user._id,
      }));
      categories = await Category.insertMany(defaultDocs);
    }

    return res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
  try {
    const { name, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const existing = await Category.findOne({ userId: req.user._id, name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    const category = await Category.create({
      userId: req.user._id,
      name: name.trim(),
      color: color || '#6366f1',
      icon: icon || 'Folder',
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or unauthorized access',
      });
    }

    const { name, color, icon } = req.body;

    if (name !== undefined) category.name = name.trim();
    if (color !== undefined) category.color = color;
    if (icon !== undefined) category.icon = icon;

    const updatedCategory = await category.save();

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or unauthorized access',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
