# HealthShared

A small social-style app built with Next.js and Firebase. Users can sign up, log in, manage their profile and picture, browse other users, and leave comments on profiles.

**Live demo:** <your-vercel-url>

## Features

- Email/password sign up and log in (dialogs on the home page)
- Google sign-in
- Password reset by email (`/forgot-password`)
- Protected dashboard: own profile, list of other users, search by name, logout
- Edit name and bio, upload or change profile picture
- View other users' profiles at `/users/[uid]` (read-only, edit is owner-only)
- Comments on profiles (extra)
- Form validation with zod, error messages under each field
- Firestore security rules (logged-in users read all profiles, each user writes only their own)

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- react-hook-form + zod
- Firebase Authentication (email/password, Google)
- Cloud Firestore
- Cloudinary (profile pictures)

## Prerequisites

- Node.js 20.9 or newer
- A Firebase project
- A Cloudinary account (free tier is enough)

## Getting started

1. Clone the repo and install dependencies:

```bash
   git clone <repo-url>
   cd <repo-folder>
   npm install
```

2. Create your env file:

```bash
   cp .env.example .env.local
```

3. Fill in `.env.local` (see [Environment variables](#environment-variables)).

4. Set up Firebase and Cloudinary (see [Service setup](#service-setup)).

5. Start the dev server:

```bash
   npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000).

## Environment variables

All variables are required. Do not wrap values in quotes. Restart the dev server after changing them.

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase console → Project settings → Your apps → Web app config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | same |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | same |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | same |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | same |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | same |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard (your account's cloud name) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Name of your **unsigned** upload preset |

## Service setup

### Firebase

1. Create a project in the [Firebase console](https://console.firebase.google.com) and register a web app.
2. **Authentication** → Get started → Sign-in method: enable **Email/Password** and **Google**.
3. **Firestore Database** → Create database.
4. Open the **Rules** tab, paste the contents of [`firestore.rules`](./firestore.rules), and publish.
5. **Authentication** → Settings → Authorized domains: make sure `localhost` is listed, and add your deployed domain (for example `your-app.vercel.app`).

### Cloudinary

1. Create a free account and copy your **cloud name**.
2. Settings → Upload → Upload presets → Add upload preset.
3. Set **Signing mode** to **Unsigned**, save, and copy the preset name.

## Firestore data model

- `users/{uid}`: `uid`, `fullName`, `email`, `bio`, `photoURL`, `createdAt`. The password is never stored in Firestore.
- `users/{uid}/comments/{commentId}`: `authorUid`, `authorName`, `authorPhotoURL`, `text`, `createdAt`.

## Project structure

```
src/
  app/            pages (home, dashboard, users/[uid], forgot-password) and layout
  components/     dialogs, comment section, avatar, header, shadcn/ui
  context/        AuthContext (current user and loading state)
  hooks/          useRequireAuth (route guard), useProfile (live profile)
  lib/            firebase config, cloudinary upload, error messages, helpers
  schemas/        zod validation schemas
  types/          TypeScript types (UserProfile, ProfileComment)
firestore.rules   Firestore security rules
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |

## Deploying to Vercel

1. Push the repo to GitHub and import it in [Vercel](https://vercel.com/new).
2. Add all the environment variables above under Project Settings → Environment Variables.
3. Deploy.
4. Add the Vercel domain to Firebase → Authentication → Settings → Authorized domains, otherwise Google sign-in and password reset links will not work in production.