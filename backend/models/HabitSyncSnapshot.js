const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    completedDates: { type: [String], default: [] },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
  },
  { _id: false }
);

const HabitSyncSnapshotSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    habits: { type: [HabitSchema], default: [] },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HabitSyncSnapshot', HabitSyncSnapshotSchema);
