# NexusMedia

A small social-style app built with Next.js and Firebase. Users can sign up, log in, manage their profile and picture, browse other users, and leave comments on profiles.

**Live demo:** https://social-app-trial.vercel.app

## Features

- Email/password sign up and log in (dialogs on the home page)
- Google sign-in
- Password reset by email (`/forgot-password`)
- Protected dashboard: own profile, list of other users, search by name, logout
- Edit name and bio, upload or change profile picture
- View other users' profiles at `/users/[uid]` (read-only, edit is owner-only)
- Comments on profiles (extra)
- Form validation with zod on the client and again on the server
- Firestore security rules (logged-in users read all profiles, each user writes only their own)

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- react-hook-form + zod
- Firebase Authentication (email/password, Google)
- Cloud Firestore
- Firebase Admin SDK (server side)
- Cloudinary (profile pictures)

## Architecture

- **Server Actions** handle all Firestore writes: creating the profile after sign up, updating the profile, and creating and deleting comments. Each action verifies the user on the server with the Firebase Admin SDK, takes the uid from the verified session (never from the client), and validates input with zod.
- **Server Components** load the dashboard and `/users/[uid]` data on the server. Client components are used only where interactivity is needed (dialogs, forms, search, buttons).
- **Sessions:** after signing in with Firebase Auth in the browser, the ID token is sent to a server action that verifies it and sets an httpOnly session cookie.
- **Route protection:** `/dashboard` and `/users/*` are protected on the server. A proxy checks for the session cookie, and each page verifies it with the Admin SDK.
- **Comments** store only the author's uid. Author names and pictures are resolved when comments are loaded, so they stay current when a profile changes.
- **Images** are uploaded from the browser to Cloudinary (unsigned preset). Only the resulting URL is sent to the server, which checks that it points at Cloudinary before saving it.

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

All variables are required. Restart the dev server after changing them.

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
| `FIREBASE_ADMIN_PROJECT_ID` | Service account key (`project_id`) |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service account key (`client_email`) |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Service account key (`private_key`) |

The `FIREBASE_ADMIN_*` variables are server-only secrets and are never exposed to the browser. In `.env.local`, wrap the private key in double quotes and keep its `\n` sequences. In Vercel, paste it without the surrounding quotes.

## Service setup

### Firebase

1. Create a project in the [Firebase console](https://console.firebase.google.com) and register a web app.
2. **Authentication** → Get started → Sign-in method: enable **Email/Password** and **Google**.
3. **Firestore Database** → Create database.
4. Open the **Rules** tab, paste the contents of [`firestore.rules`](./firestore.rules), and publish.
5. **Project settings** → **Service accounts** → **Generate new private key**. Copy `project_id`, `client_email` and `private_key` into the `FIREBASE_ADMIN_*` variables. Never commit the downloaded JSON file.
6. **Authentication** → Settings → Authorized domains: make sure `localhost` is listed, and add your deployed domain (for example `social-app-trial.vercel.app`).

### Cloudinary

1. Create a free account and copy your **cloud name**.
2. Settings → Upload → Upload presets → Add upload preset.
3. Set **Signing mode** to **Unsigned**, save, and copy the preset name.

## Firestore data model

- `users/{uid}`: `uid`, `fullName`, `email`, `bio`, `photoURL`, `createdAt`. The password is never stored in Firestore.
- `users/{uid}/comments/{commentId}`: `authorUid`, `text`, `createdAt`.

## Project structure

```
src/
  app/            pages (home, dashboard, users/[uid], forgot-password), server actions, layout
  components/     dialogs, forms, comment section, avatar, header, shadcn/ui
  lib/            Firebase client and Admin config, session helpers, data loaders, helpers
  schemas/        zod validation schemas (shared by client and server)
  types/          TypeScript types
  proxy.ts        route protection (session cookie check)
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

## Notes

- `firebase-admin` is pinned to v13. Version 14 pulls in a `jwks-rsa`/`jose` combination that fails with `ERR_REQUIRE_ESM` on Vercel's runtime.
