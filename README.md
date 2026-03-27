# Placez

Placez is a planning platform for catering and event teams. It combines business workflows (events, clients, payments, scheduling, settings) with a 2D/3D layout designer powered by Three.js.

## 🎥 Project Demo Video

<video src="https://github.com/user-attachments/assets/6f3c84af-b4c8-4158-8ed7-851fe72bb4bb"
  controls
  muted
  playsinline
  style="max-height:640px; width:100%; border-radius:10px;">
</video>

<p>
  <a href="./3D%20Placez%20Project.mp4"><strong>📁 Watch Repo Video</strong></a>
</p>

## ✨ What the Application Includes

- **Dashboard and metrics** for event and revenue visibility
- **Event management** with event list, details, and layout planning
- **Venue library** with venue management and floorplan planning
- **Calendar views** (month/week/day) with event drawer and filters
- **Client management** for contact and organization workflows
- **Model libraries/assets** with catalog, subcategory, hide/show, and delete flows
- **Payments module** for payment records, payment requests, export, and link actions (resend/cancel/extend)
- **Settings module** for appearance, business info, payment setup, payment link settings, invoices, quick picks, and designer collision settings
- **OIDC authentication** through Customer Portal with silent renew
- **Environment-specific tools** for media/catalog management in non-production

## 🛠️ Tech Stack

- React + TypeScript + Vite
- Redux + Redux Saga
- Material UI + Kendo UI components
- Three.js for planner/designer experiences
- OIDC (`redux-oidc`) for authentication
- ESLint + Prettier + Husky

## Requirements

- Node.js 18+ (recommended)
- Yarn

## Getting Started

1. Install dependencies:

```bash
yarn
```

2. Create or update your environment file (`.env`, `.env.development`, or local override).

3. Start the app:

```bash
yarn start
```

By default, the app runs on:

- [http://localhost:3002](http://localhost:3002)

## Environment Variables

The app uses Vite environment variables (`VITE_APP_*`). At minimum, configure:

- `VITE_APP_PLACEZ_API_URL` - Placez API base URL
- `VITE_APP_PORTAL` - Customer Portal/OIDC authority URL
- `VITE_APP_SCOPE` - OIDC scopes
- `VITE_APP_CLIENT_ID` - OIDC client ID
- `VITE_APP_LOGIN_REDIRECT` - login callback URL
- `VITE_APP_LOGOUT_REDIRECT` - logout callback URL
- `VITE_APP_ENVIRONMENT` - `development`, `staging`, or `production`

Optional commonly used values:

- `VITE_APP_PAYMENTS_API_URL`
- `VITE_APP_GOOGLE_API_KEY`
- `VITE_APP_INSIGHTS_ENABLED`
- `VITE_APP_INSIGHTS_KEY`
- `VITE_APP_GTAG_MEASUREMENT_ID`

Example local override:

```env
VITE_APP_LOGIN_REDIRECT=http://localhost:3002/signin-oidc/
VITE_APP_LOGOUT_REDIRECT=http://localhost:3002/
```

## Scripts

- `yarn dev` - run locally on port `3002`
- `yarn start` - same as dev run
- `yarn start:staging` - copy staging env and run locally
- `yarn start:production` - copy production env and run locally
- `yarn build` - type-check and create production build
- `yarn preview` - preview the production build
- `yarn lint:check` - run ESLint checks
- `yarn lint:fix` / `yarn lint` - fix lint issues
- `yarn format:check` - verify Prettier formatting
- `yarn format:fix` / `yarn format` - apply formatting
- `yarn lint-format` - run lint and format fixers
- `yarn knip` - find unused files/exports/dependencies

## Related Services

- [Placez API Swagger](http://spacez-api-staging.azurewebsites.net/swagger/index.html)
- [Customer Portal (Staging)](https://customer-portal-staging.azurewebsites.net/)
- [Placez API Repository](https://github.com/Caterease/spacez-api)

## DevOps

Azure DevOps is used for boards and pipelines:

- [Placez Azure DevOps](https://dev.azure.com/OnSkyLink/Placez)
