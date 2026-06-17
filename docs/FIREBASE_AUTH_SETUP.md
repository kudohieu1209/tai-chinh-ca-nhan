# Firebase Auth setup

FinTrack now uses Firebase Authentication and stores each user's data in:

```txt
fintrackUsers/{uid}
```

## Enable sign-in methods

In Firebase Console:

1. Open **Authentication**.
2. Go to **Sign-in method**.
3. Enable **Email/Password**.
4. Enable **Google** if you want the Google button to work.

## Firestore rules

Use rules like this so each signed-in user can only read and write their own FinTrack document:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /fintrack/hiewu {
      allow read: if request.auth != null;
      allow write: if false;
    }

    match /fintrackUsers/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Existing data migration

The app keeps the existing shared document untouched at:

```txt
fintrack/hiewu
```

On the first login, if the signed-in user's private document does not exist yet, the app copies data in this order:

1. Existing Firestore data from `fintrack/hiewu`.
2. Existing browser backup from `fintrack-local-data-v1`.
3. Built-in sample data, only when neither source exists.

The migration writes a new private copy to `fintrackUsers/{uid}` and marks it with `migratedFrom`, but it does not delete or overwrite the old shared document.
