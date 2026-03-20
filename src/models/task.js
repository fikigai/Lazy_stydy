const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    unique: true, // Обмеження для Лаби №3
    trim: true 
  },
  description: String,
  status: { 
    type: String, 
    enum: ['Backlog', 'In Progress', 'Done'], 
    default: 'Backlog' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);