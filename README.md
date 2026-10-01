# KTGbibliotek

A library web app built with Next.js, React, and TypeScript, backed by Firebase (Firestore + Auth). This document covers running the app locally, the CI/CD pipeline, and the Terraform-managed infrastructure.

## Repository structure

```
KTGbibliotek/
├── .github/
│   └── workflows/
│       ├── ci.yml          # lint + test, runs on PRs and pushes to main
│       └── cd.yml          # deploy, runs after CI succeeds on main
├── client/                 # the application
├── terraform/              # IaC
├── firebase.json           # Firebase Hosting config
└── .firebaserc              
```

## Prerequisites

- Node.js 20+
- npm
- A Firebase project with Firestore and Authentication enabled
- Terraform CLI
- `gcloud` CLI (only needed for Terraform authentication)

## Running the app locally

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:3000`. It connects directly to Firebase from the browser using the config in `client/lib/firebase/firebaseConfig.ts` — no local backend or emulator is required.

## Running tests

```bash
cd client
npm test
```

Tests cover the controller logic in `lib/controllers/` (ISBN lookup, login error handling), with Firebase calls mocked so no live credentials are needed to run them.

## Linting

```bash
cd client
npm run lint
```

## Building 

```bash
cd client
npm run build
```
This is the same build step the CD pipeline runs before deploying.

## CI/CD pipeline

**CI (`.github/workflows/ci.yml`)** runs on every pull request targeting `main` and every push to `main`. It has two independent jobs:
- `lint` — runs ESLint
- `test` — runs the Jest test suite


**CD (`.github/workflows/cd.yml`)** is triggered via `workflow_run` once the CI workflow completes on `main`, and only proceeds if CI's conclusion was `success`. It builds the static export and deploys it to Firebase Hosting using the official `FirebaseExtended/action-hosting-deploy` action.

### Required GitHub secret

CD needs a Firebase service account key stored as a repository secret

## Infrastructure (Terraform)

The `terraform/` folder manages three Firebase resources as code:
- **The Firestore database** (`google_firestore_database`), is the primary data store, imported from its existing configuration
- **Firestore security rules** (`firestore.rules`) — access control for the `users` and `Books` collections
- **The Firebase Hosting site** — the deployment target CD pushes builds to

### Running Terraform

```bash
# Authenticate (one-time per machine)
gcloud auth application-default login
```

When running Terraform from a machine that doesn't have the existing `terraform.tfstate`, import the states before applying:

> ⚠️ **Important: always import before applying.** This project uses local Terraform state (not a shared remote backend, see the report for limitations). This means anyone running Terraform for the first time on a new machine starts with an empty state file, even though the real resources already exist in Firebase.

```bash
terraform import google_firestore_database.default projects/ktgbibliotek/databases/'(default)'
terraform import google_firebaserules_release.firestore projects/ktgbibliotek/releases/cloud.firestore
terraform import google_firebase_hosting_site.default projects/ktgbibliotek/sites/ktgbibliotek
```

```bash
cd terraform
terraform init
terraform plan   # preview changes
terraform apply  # apply changes
```

## Quality and security automation

- **ESLint** (static analysis) runs in CI on every PR
- **Dependabot security updates** automatically open PRs patching dependencies with known vulnerabilities
- **GitHub secret scanning and push protection** are enabled on the repository
