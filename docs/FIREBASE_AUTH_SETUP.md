# Firebase Auth setup

FinTrack now uses Firebase Authentication and stores your account's data in:

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

Use rules like this so only your Google account can read the old shared document and its private FinTrack document:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner() {
      return request.auth != null
        && request.auth.token.email == "kudohieu1209@gmail.com";
    }

    match /fintrack/hiewu {
      allow read: if isOwner();
      allow write: if false;
    }

    match /fintrackUsers/{userId} {
      allow read, write: if isOwner() && request.auth.uid == userId;
    }
  }
}
```

## Existing data migration

The app keeps the existing shared document untouched at:

```txt
fintrack/hiewu
```

On the first login with `kudohieu1209@gmail.com`, if the private document does not exist yet, the app copies data in this order:

1. Existing Firestore data from `fintrack/hiewu`.
2. Existing browser backup from `fintrack-local-data-v1`.
3. Built-in sample data, only when neither source exists.

The migration writes a new private copy to `fintrackUsers/{uid}` and marks it with `migratedFrom`, but it does not delete or overwrite the old shared document.

Other accounts are blocked by the app and by these rules. If another account was used before this fix, delete that account's copied document under `fintrackUsers` in Firestore, or keep these owner-only rules published so it cannot read it.
