# Tasbeeh

A simple dhikr (tasbeeh) counter app built with Angular. Select a dhikr from the dropdown, tap the button to count, and manage your list of tasbeehs (add, edit, delete) from settings.

## Features

- **Count** – Tap the button to increment the count for the selected tasbeeh.
- **Reset** – Reset the count for the current tasbeeh to zero.
- **Dropdown** – Switch between tasbeehs (Kalima, Istigfar, Midad, Durood, Names of Allah, or your own).
- **Show images** – Toggle to show or hide the image for the selected tasbeeh above the tap button.
- **Settings** (gear icon) – Manage tasbeehs:
  - **Add** – Create a new tasbeeh with a name and optional image (uploaded to [Image2URL](https://www.image2url.com/) for a permanent URL).
  - **Edit** – Change the name or image of an existing tasbeeh.
  - **Delete** – Remove a tasbeeh (with confirmation).
- **Persistence** – All tasbeehs and counts are saved in the browser’s local storage and restored on refresh.

## Development

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.28.3.

### Run locally

```bash
npm install
ng serve
```

Open [http://localhost:4200/](http://localhost:4200/). The app will reload when you change source files.

### Build

```bash
ng build --prod
```

Output is in the `dist/` directory.

### Tests

- **Unit tests:** `npm test` (or `ng test`). Uses Karma + Jasmine. In CI, runs once with ChromeHeadless.
- **E2E tests:** `ng e2e` (via [Protractor](http://www.protractortest.org/)).

Unit tests cover the main component: count/reset, change group, settings modal (open/close), add tasbeeh, edit tasbeeh, delete tasbeeh, and localStorage is stubbed in tests.

## Deployment

### Firebase Hosting (CI/CD)

Pushes to the `master` branch trigger a GitHub Action that runs unit tests, builds, and deploys to [Firebase Hosting](https://firebase.google.com/docs/hosting). The pipeline fails if tests fail.

**One-time setup:**

1. In [Firebase Console](https://console.firebase.google.com/) → your project → **Project settings** → **Service accounts** → **Generate new private key**.
2. In your repo: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.  
   Name: `FIREBASE_SERVICE_ACCOUNT` (or `FIREBASE_SERVICE_ACCOUNT_TASBEEH_A4EA1` if that’s what the workflow uses).  
   Value: entire contents of the downloaded JSON file.

After that, each push to `master` will build and deploy automatically.

### GitHub Pages

Alternatively: `ng github-pages:deploy` to deploy to GitHub Pages.

## Code scaffolding

```bash
ng generate component component-name
```

You can also generate directives, pipes, services, classes, and modules. See `ng help` or the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
