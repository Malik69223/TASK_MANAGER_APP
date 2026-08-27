const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// Helper to log user activity
const logActivity = async (userId, taskId, action, details) => {
  try {
    await ActivityLog.create({
      userId,
      taskId,
      action,
      details,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Failed to save activity log:', err.message);
  }
};

// @desc    Get all tasks for logged in user with filters, search, sorting
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, category, search, sortBy, sortOrder, page = 1, limit = 50 } = req.query;

    const query = { userId: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOptions = { dueDate: 1 }; // Default due date ascending
    if (sortBy) {
      const order = sortOrder === 'desc' || sortOrder === '-1' ? -1 : 1;
      sortOptions = { [sortBy]: order };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, category, priority, dueDate, isRecurring, recurrenceType } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }


    const task = await Task.create({
      userId: req.user._id,
      title,
      description: description || '',
      category: category || 'General',
      priority: priority || 'Medium',
      dueDate,
      isRecurring: Boolean(isRecurring),
      recurrenceType: isRecurring ? (recurrenceType || 'Daily') : 'None',
      status: 'Pending',
    });

    await logActivity(req.user._id, task._id, 'create', `Created task "${task.title}"`);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized access',
      });
    }

    const { title, description, category, priority, dueDate, status, isRecurring, recurrenceType } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (category !== undefined) task.category = category;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (isRecurring !== undefined) task.isRecurring = isRecurring;
    if (recurrenceType !== undefined) task.recurrenceType = recurrenceType;

    if (status !== undefined) {
      task.status = status;
      if (status === 'Completed') {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
    }

    const updatedTask = await task.save();

    await logActivity(req.user._id, updatedTask._id, 'update', `Updated task "${updatedTask.title}"`);

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized access',
      });
    }

    await logActivity(req.user._id, task._id, 'delete', `Deleted task "${task.title}"`);

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark task as complete
// @route   PATCH /api/tasks/:id/complete
// @access  Private
const completeTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized access',
      });
    }

    task.status = 'Completed';
    task.completedAt = new Date();

    const updatedTask = await task.save();

    await logActivity(req.user._id, updatedTask._id, 'complete', `Completed task "${updatedTask.title}"`);

    return res.status(200).json({
      success: true,
      message: 'Task marked as completed',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark task as uncomplete (pending)
// @route   PATCH /api/tasks/:id/uncomplete
// @access  Private
const uncompleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized access',
      });
    }

    task.status = 'Pending';
    task.completedAt = null;

    const updatedTask = await task.save();

    await logActivity(req.user._id, updatedTask._id, 'uncomplete', `Marked task "${updatedTask.title}" as pending`);

    return res.status(200).json({
      success: true,
      message: 'Task marked as pending',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  uncompleteTask,
};
