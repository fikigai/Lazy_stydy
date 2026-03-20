'use strict';

const taskService = require('../services/taskService');

exports.createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.user.id, req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};