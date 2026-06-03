# HabitSync

HabitSync is a React Native / Expo habit tracker app. It is built around a local-first setup, so habits are saved on the device first and can be synced to a backend later if cloud backup is enabled.

## What it does

- Add and remove habits
- Tick habits off for the day
- Track current and longest streaks
- Show daily completion progress
- Show weekly progress in a small graph
- Switch between dark and light mode
- Store habit data locally with AsyncStorage
- Includes a basic Express/MongoDB backend for syncing

## Running the app

From the project root:

```bash
npm install
npx expo start --tunnel
```

Then scan the QR code with Expo Go.

If the app gets stuck with old cached code:

```bash
npx expo start --tunnel --clear
```

## Running the backend

The backend lives in the `backend` folder.

```bash
cd backend
npm install
npm run dev
```

The backend uses `MONGO_URI` from `backend/.env` and exposes:

```text
GET /health
POST /api/sync
```

## Notes

This project is currently set up for local development. The cloud sync endpoint in the mobile app should be changed to the real deployed backend URL before using sync outside your local machine.

Secrets should stay in `.env` files and should not be committed.

## Android release

The app is configured for Google Play with:

```text
android.package: com.gulzey.habitsync
android.versionCode: 1
```

Build a Play Store app bundle:

```bash
npx eas-cli build --platform android --profile production
```

Submit the latest Android build to the internal testing track:

```bash
npx eas-cli submit --platform android --profile production --latest
```

The first Play Console release usually goes through internal testing before production. You will still need to complete the Play Console listing, content rating, data safety, screenshots, and privacy policy fields.
