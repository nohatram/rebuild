# Rebuild

A conversational fitness logging app. Terminal aesthetic. AI-powered.

## Stack

- **App**: Expo (React Native) — iOS + Android
- **Server**: Express + TypeScript
- **DB**: PostgreSQL via Prisma
- **AI**: Anthropic Claude (claude-sonnet-4-6)
- **Auth**: Twilio Verify (phone + OTP)
- **Photos**: AWS S3

## Setup

### 1. Clone and install

```sh
git clone <repo>
cd rebuild
yarn install
```

### 2. Configure environment

```sh
cp .env.example .env
# fill in your keys
```

### 3. Database

```sh
cd server
yarn db:migrate    # runs prisma migrate dev
yarn db:generate   # generates prisma client
```

### 4. Run

```sh
# from root
yarn server   # starts Express on :3000
yarn app      # starts Expo
```

Or both at once:

```sh
yarn dev
```

## Project structure

```
rebuild/
├── app/                  # Expo React Native
│   └── src/
│       ├── components/   # MouseLogo, WorkoutBlock, InputBar, LineChart, ...
│       ├── screens/      # Auth, OTP, Chat, Dashboard
│       ├── navigation/   # Horizontal slide nav
│       ├── services/     # API client
│       ├── constants/    # Theme (colors, fonts)
│       └── types/        # Shared TS types
└── server/               # Express API
    ├── prisma/           # Schema + migrations
    └── src/
        ├── routes/       # auth, chat, sessions, user, photos, stats
        ├── services/     # claude.ts, twilio.ts
        └── middleware/   # JWT auth
```

## API endpoints

```
POST  /auth/send-code     # send OTP via Twilio
POST  /auth/verify        # verify OTP, return JWT
GET   /auth/refresh       # refresh token

GET   /user/profile       # get profile
PUT   /user/profile       # update profile
POST  /user/weight        # log weight entry
GET   /user/weight        # weight history

POST  /chat               # send message → Claude response
GET   /chat/history       # paginated chat history

GET   /sessions           # list past sessions
GET   /sessions/:id       # session detail
POST  /sessions           # create/log session
PUT   /sessions/:id       # edit session
DELETE /sessions/:id      # delete session

POST  /photos             # upload progress photo
GET   /photos             # photo gallery (signed URLs)

GET   /stats/volume       # weekly sets per muscle group
GET   /stats/prs          # personal records per exercise
```

## Design

Terminal aesthetic — `#131212` bg, `#e8e8e2` text, `#73fc00` accent.
Fira Code throughout. No gradients, no bubbles, no rounded cards.

Two views accessible via vertical edge tab:
- **Chat**: scrolling feed, editable workout block, full-width input
- **Dashboard**: muscle volume bars, weight trend chart, past sessions, progress photos
