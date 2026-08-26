# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

# Northstar IT Help Desk

Vite + React + TypeScript prototype for a category-scoped internal help desk.

## Category sessions

Employee users must choose one `categoryId` during signup. Managers and technical agents are not category-bound and can view the full workspace. The data-access function `getTicketsForSession` applies the appropriate role scope before tickets reach the UI.

The employee demo session is assigned to Network so it can track its own Network requests. Staff demo sessions can view all categories.

## PostgreSQL

The production-oriented schema and category seed data are in [db/schema.sql](db/schema.sql). It includes:

- `users.category_id` as a required foreign key to `categories`
- password hashes rather than plain-text passwords
- separate comments and internal notes tables
- indexes for category-scoped ticket and user queries

After authenticating a user, the backend should put the trusted category assignment in the server-side session or signed token and use it as the query parameter for every ticket list/detail query. Never accept category scope from the browser as an authorization decision.

## Run locally

```bash
npm install
npm run dev
```

The current app uses in-memory mock data. Authentication, persistence, notifications, attachments, and API authorization still need a backend implementation.
