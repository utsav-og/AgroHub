const mongoose = require('mongoose');

// Schema definition for Agricultural Labor and Farm Workers
const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide worker or crew leader name'],
      trim: true,
    },
    skills: {
      type: [String],
      required: [true, 'Please provide at least one agricultural skill'],
      default: [],
    },
    experienceYears: {
      type: Number,
      required: [true, 'Please provide years of agricultural experience'],
      min: [0, 'Experience cannot be negative'],
      default: 1,
    },
    dailyWage: {
      type: Number,
      required: [true, 'Please provide expected daily wage in INR'],
      min: [0, 'Daily wage cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Please provide worker location or working district'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Worker profile must have an associated owner'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Worker', workerSchema);
