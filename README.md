# MicLoop 🎙️

רשת חברתית לשיחות קוליות חיות — צור לופ, ארח דיון, ודבר עם העולם.

A Hebrew-first social audio platform (like Clubhouse). Create live "loops", host discussions, and connect through voice.

---

## Features

- 🔴 **Live Loops** — Start and join live audio rooms in real time
- 🎧 **Listener & Speaker modes** — Raise hand to join the conversation
- 💬 **Live Chat** — Text chat alongside the audio
- ⭐ **Ratings** — Rate loops after listening
- 📚 **Library** — Save liked loops for later
- 📅 **Schedule** — Plan future loops
- 🌐 **Bilingual** — Hebrew (default, RTL) + English

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile app | Expo SDK 52 + React Native |
| Navigation | Expo Router (file-based) |
| Auth | Firebase Phone Auth (SMS) |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Real-time audio | LiveKit Cloud |
| Server logic | Firebase Cloud Functions |
| State | Zustand |
| Language | TypeScript |

---

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [EAS CLI](https://docs.expo.dev/eas/): `npm install -g eas-cli` (for app store builds)
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- [Expo Go](https://expo.dev/go) app on your phone (for local testing)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/micloop.git
cd micloop
npm install
cd functions && npm install && cd ..
```

### 2. Configure environment

Copy the example env file:
```bash
cp .env.example .env
```

Fill in your values in `.env` (Firebase keys from Firebase Console → Project Settings → Your apps):
```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_LIVEKIT_URL=wss://...
```

Create `functions/.env.local` with server-side secrets (**never commit this**):
```
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_HOST=https://...
```

### 3. Deploy Firestore rules and indexes

```bash
firebase login
firebase deploy --only firestore
```

### 4. Deploy Cloud Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

---

## Running Locally

```bash
npx expo start
```

- Scan the QR code with **Expo Go** on your phone
- Press `i` to open iOS Simulator (requires Xcode on Mac)
- Press `a` to open Android Emulator (requires Android Studio)

> **Important:** The live room feature requires the Cloud Functions to be deployed (Step 4 above). Local emulator also works: `firebase emulators:start --only functions`

---

## Building for App Stores

### First time setup

```bash
eas login
eas build:configure
```

### iOS (requires Apple Developer Program — $99/year)

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Android (requires Google Play Console — $25 one-time)

```bash
eas build --platform android --profile production
eas submit --platform android
```

### What you need before submitting

- [ ] Apple Developer Program account (developer.apple.com)
- [ ] Google Play Console account (play.google.com/console)
- [ ] App icon: 1024×1024 PNG (no transparency) → `assets/images/icon.png`
- [ ] Splash screen image → `assets/images/splash.png`
- [ ] Privacy policy URL (can be a simple web page)
- [ ] App description in Hebrew and English
- [ ] Screenshots for iPhone 6.7" and Android phone

---

## Project Structure

```
micloop/
├── app/                    # Screens (Expo Router)
│   ├── (auth)/welcome.tsx  # Phone auth + SMS OTP
│   ├── (tabs)/             # Main 4-tab navigation
│   └── room/[id].tsx       # Live room
├── components/
│   ├── feed/               # Home feed cards
│   ├── room/               # Live room UI
│   └── shared/             # Reusable components
├── hooks/                  # Custom React hooks
├── lib/                    # Firebase + LiveKit helpers
├── store/                  # Zustand global state
├── i18n/                   # Translations (he + en)
├── constants/              # Colors, fonts, layout tokens
├── types/                  # TypeScript interfaces
├── functions/              # Firebase Cloud Functions (server)
└── web-preview/            # Original HTML prototype (reference)
```

---

## Architecture Notes

**Why Cloud Functions for LiveKit tokens?**  
LiveKit tokens require a secret API key to sign. This key must never be in the mobile app bundle (anyone could extract it). Cloud Functions generate tokens server-side using the secret, then return only the signed token to the app.

**Why Firebase Phone Auth?**  
Social audio apps work best with phone-based identity (no password to forget, real identity signal). Firebase Phone Auth handles SMS delivery globally.

**Bilingual RTL/LTR:**  
The app detects the device language. Hebrew → RTL layout. English → LTR layout. All strings are in `i18n/he.ts` and `i18n/en.ts`.

---

## Contributing

This project is built for iteration with Claude Code (AI-assisted development). See `CLAUDE.md` for development guidelines.

---

## License

Private — all rights reserved.
