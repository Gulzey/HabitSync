const express = require('express');
const HabitSyncSnapshot = require('../models/HabitSyncSnapshot');

const router = express.Router();

router.post('/sync', async (req, res) => {
  const { userId, habits, syncedAt } = req.body;

  if (!userId || !Array.isArray(habits)) {
    return res.status(400).json({
      ok: false,
      message: 'userId and habits array are required.',
    });
  }

  try {
    const snapshot = await HabitSyncSnapshot.findOneAndUpdate(
      { userId },
      {
        $set: {
          habits,
          lastSyncedAt: syncedAt ? new Date(syncedAt) : new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      ok: true,
      snapshotId: snapshot._id,
      lastSyncedAt: snapshot.lastSyncedAt,
    });
  } catch (error) {
    console.error('Sync failed:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Failed to sync habit data.',
    });
  }
});

module.exports = router;
