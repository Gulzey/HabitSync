require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const HabitSyncSnapshot = require('./models/HabitSyncSnapshot');

const app = express();
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'HabitSync API' });
});

app.post('/api/sync', async (req, res) => {
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

if (!mongoUri) {
  console.error('MONGO_URI is missing from the backend environment.');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`HabitSync API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start HabitSync API:', error.message);
    process.exit(1);
  });
