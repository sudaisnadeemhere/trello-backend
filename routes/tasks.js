const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const { users: usersFallback, tasks: tasksFallback } = require('../data/fallback');

const router = express.Router();
const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.json(users);
  } catch (err) {
    console.error('DB users error:', err.message);
    return res.json(usersFallback.map((u) => ({ _id: u.id, id: u.id, name: u.name, email: u.email })));
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'name email');
    return res.json(tasks);
  } catch (err) {
    console.error('DB tasks error:', err.message);
    return res.json(tasksFallback);
  }
});

router.post('/', auth, async (req, res) => {
  const { title, description, assignedTo, status, dueDate, priority } = req.body;
  if (!title || !assignedTo) return res.status(400).json({ message: 'Title and assigned user required' });

  try {
    const task = new Task({
      title,
      description,
      assignedTo,
      createdBy: req.user.id,
      status: status || 'To Do',
      dueDate,
      priority: priority || 'Medium',
    });
    await task.save();
    const populated = await task.populate('assignedTo', 'name email');
    return res.json(populated);
  } catch (err) {
    console.error('DB create task error:', err.message);
    const assignedUser = usersFallback.find((u) => u.id === assignedTo) || { id: assignedTo, name: 'Unknown', email: '' };
    const newTask = {
      _id: generateId(),
      title,
      description,
      assignedTo: assignedUser,
      createdBy: req.user.id,
      status: status || 'To Do',
      dueDate,
      priority: priority || 'Medium',
    };
    tasksFallback.push(newTask);
    return res.json(newTask);
  }
});

router.put('/:id', auth, async (req, res) => {
  const { title, description, assignedTo, status, dueDate, priority } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.assignedTo = assignedTo ?? task.assignedTo;
    task.status = status ?? task.status;
    task.dueDate = dueDate ?? task.dueDate;
    task.priority = priority ?? task.priority;

    await task.save();
    const populated = await task.populate('assignedTo', 'name email');
    return res.json(populated);
  } catch (err) {
    console.error('DB update task error:', err.message);
    const index = tasksFallback.findIndex((task) => task._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Task not found' });
    tasksFallback[index] = {
      ...tasksFallback[index],
      title: title ?? tasksFallback[index].title,
      description: description ?? tasksFallback[index].description,
      assignedTo: assignedTo ? usersFallback.find((u) => u.id === assignedTo) || { id: assignedTo, name: 'Unknown', email: '' } : tasksFallback[index].assignedTo,
      status: status ?? tasksFallback[index].status,
      dueDate: dueDate ?? tasksFallback[index].dueDate,
      priority: priority ?? tasksFallback[index].priority,
    };
    return res.json(tasksFallback[index]);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.remove();
    return res.json({ message: 'Task removed' });
  } catch (err) {
    console.error('DB delete task error:', err.message);
    const index = tasksFallback.findIndex((task) => task._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Task not found' });
    tasksFallback.splice(index, 1);
    return res.json({ message: 'Task removed' });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!['To Do', 'In Progress', 'Done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    task.status = status;
    await task.save();
    const populated = await task.populate('assignedTo', 'name email');
    return res.json(populated);
  } catch (err) {
    console.error('DB patch task status error:', err.message);
    const task = tasksFallback.find((item) => item._id === req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!['To Do', 'In Progress', 'Done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    task.status = status;
    return res.json(task);
  }
});

module.exports = router;
