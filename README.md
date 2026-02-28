# Tasbeeh

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.28.3.

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Deploying to Firebase (CI/CD)

Pushes to the `master` branch trigger a GitHub Action that builds and deploys to [Firebase Hosting](https://firebase.google.com/docs/hosting).

### One-time setup

1. **Create a Firebase service account key**  
   In [Firebase Console](https://console.firebase.google.com/) → your project → **Project settings** → **Service accounts** → **Generate new private key**.

2. **Add the key as a GitHub secret**  
   In your repo: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.  
   Name: `FIREBASE_SERVICE_ACCOUNT`.  
   Value: paste the entire contents of the downloaded JSON file.

After that, every push to `master` will build and deploy automatically.

## Deploying to GitHub Pages

Run `ng github-pages:deploy` to deploy to GitHub Pages.

## Further help

To get more help on the `angular-cli` use `ng help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
