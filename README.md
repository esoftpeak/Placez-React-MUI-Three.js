# Placez

## Introduction

[Placez (formerly Spacez)](https://getplacez.com/) is a website to manage catering business while providing access to 3D design places.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) using Redux Sagas which includes a ThreeJS 3D Component. The codebase uses Typescript over Javascript and includes tslint for linting and an `.editorconfig` for code editor consistency.

This project utilizes Caterease integrations such as an API provided by the [Placez API (formerly Spacez API)](http://spacez-api-staging.azurewebsites.net/swagger/index.html) and the [Customer Portal](https://customer-portal-staging.azurewebsites.net/).

- [Placez API Github](https://github.com/Caterease/spacez-api)
- [Customer Portal Github](https://github.com/Caterease/spacez-api)

## Environment Variables

Any of these settings can be found in `.env`. These are not environment specific since they can be overrode in commands. Any of the settings in the repo are for local work against staging.

These settings define the urls for the API and Customer Portal.

- `ENV_APP_PLACEZ_API_URL` - Placez Api Url
- `ENV_APP_PORTAL` - Customer Portal Url

For authorization, the project uses OIDC in conjuction with Customer Portal.
These **must line up** with settings in Customer Portal or the app will not work.

- `ENV_APP_SCOPE` - Scope for OIDC
- `ENV_APP_CLIENT_ID` - Identifier for client
- `ENV_APP_LOGIN_REDIRECT` - Redirect after login from portal
- `ENV_APP_LOGOUT_REDIRECT` - Redirect after logout from portal

## Available Scripts

In the project directory, you can run:

### `yarn`

Install packages. This project does not use **npm** as a package manager so ensure only `yarn.lock` is comitted and no other `.lock` files.

### `yarn lint`

Uses `tslint` to lint packages. The current rulest is a modified version of AirBnB.

### `yarn start`

⚠️ **IMPORTANT**: Runs the app in the development mode. This will defaultly uses `.env` and `.env.development` to start the application. If you want to use a local setup, use `.env.development.local` to override just the properties you need. This file should NEVER be pushed up.

**Example:** `.env.development.local` file

```
ENV_APP_LOGIN_REDIRECT=http://localhost:3001/signin-oidc/
ENV_APP_LOGOUT_REDIRECT=http://localhost:3001/
```

<br>
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) and [environment variables](https://create-react-app.dev/docs/adding-custom-environment-variables) for more information. This [resource](https://dev.to/jam3/managing-env-variables-for-provisional-builds-h37) can also be helpful for how our specific environments are setup.

- `yarn build` - Uses `.env` and `.env.production`. This is default behavior of Create React App.

- `yarn build:development` - Uses `.env` and `.env.development`
- `yarn build:staging` - Uses `.env` and `.env.staging`

## Devops

Devops is currently being handled with [Azure Devops](https://dev.azure.com/OnSkyLink/Placez). This is where the boards and backlog can be found.
