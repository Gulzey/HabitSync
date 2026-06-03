# HabitSync

HabitSync is a mobile habit tracker I built with React Native and Expo.

The idea is simple: add habits, tick them off each day, and see your progress without needing an account or internet connection. Right now the app is local-first, so everything is saved on the phone first using AsyncStorage.

Cloud backup is planned, but it is not switched on in the release build yet.

## What is in the app right now

- Add habits
- Delete habits by swiping the card
- Confirm before deleting
- Tick off habits for today
- Current streak and longest streak tracking
- Daily completion percentage
- Weekly progress graph
- Flick back and forward through weeks
- Editable username on the home screen
- Dark and light theme button on the home screen
- FAQ page
- Settings page
- Cloud backup shown as coming soon
- Local-first storage with AsyncStorage

## How storage works

The app saves habit data on the device first.

That means:

- the app works offline
- habits do not need a login yet
- the phone data is the source of truth
- cloud backup will be added later as an optional extra

There is a backend folder in the project for MongoDB sync work, but the Play Store version is not using cloud sync yet.

## Running the app locally

From the project root:

```bash
npm install
npx expo start --tunnel
```

If Expo is showing old code, clear the cache:

```bash
npx expo start --tunnel --clear
```

## Android release

The Android package name is:

```text
com.gulzey.habitsync
```

The app is configured for EAS Build. To make a Play Store build:

```bash
npx eas-cli build --platform android --profile production
```

That creates an Android App Bundle file for Google Play.

For Google Play Console, upload the `.aab` to internal testing first. After that, fill in the store listing, screenshots, content rating, data safety, and privacy policy sections.

## Backend

The backend is in the `backend` folder.

```bash
cd backend
npm install
npm run dev
```

It has a basic Express and MongoDB setup with:

```text
GET /health
POST /api/sync
```

This is here for the cloud backup work later. It should not be treated as production-ready until auth and proper user accounts are added.

## What is planned next

- Optional cloud backup
- User accounts or device-based auth
- Safer sync rules on the backend
- Real settings persistence across the app
- Habit editing instead of delete and re-add
- Better stats over months
- Reminders and notifications
- A proper privacy policy before public release

## Notes

Secrets live in `.env` files and should not be committed.

The app icon is in `assets/`, and the Play Store version should be built again whenever the icon or app config changes.
