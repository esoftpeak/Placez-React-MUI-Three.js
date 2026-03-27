import dns from "dns";

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";

import { dependencies } from "./package.json";
import path from "path"

/**
 * Manually breaks out external dependencies into JS chunks during build. Required (at least for now) because Vite
 * doesn't seem to want to auto chunk our code.
 *
 * @param deps - A record of dependencies extracted from `package.json`
 *
 * @returns
 */
function renderChunks(deps: Record<string, string>): Record<string, string[]> {
  let chunks: Record<string, string[]> = {};

  Object.keys(deps).forEach((key) => {
    if (["react", "react-router-dom", "react-dom"].includes(key)) {
      return;
    }
    chunks[key] = [key];
  });

  return chunks;
}

// If this is not set, Vite servers may open on a local IP URL instead of a "localhost" URL, which Auth0 will flag as
// an invalid origin
dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {

  return {
    plugins: [react(), viteTsConfigPaths()],
    server: {
      port: 4002, // Required for Auth0 origin validation
      open: true,
    },
    preview: {
      port: 3002, // Required for Auth0 origin validation
      open: true,
    },
    optimizeDeps: {
      exclude: ['fsevents'],
      include: ['react', 'react-dom', 'react-router-dom']
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        external: ['fsevents']
      },
      outDir: 'build',
      minify: false,
    },
    resolve: {
      // alias: {
      //   "@app/constants": path.resolve(__dirname, "./src/global/constants"),
      //   "@app/helpers": path.resolve(__dirname, "./src/global/helpers"),
      //   "@app/hooks": path.resolve(__dirname, "./src/global/hooks"),
      //   "@app/schemas": path.resolve(__dirname, "./src/global/schemas"),
      //   "@app/api": path.resolve(__dirname, "./src/services/api"),
      //   "@app": path.resolve(__dirname, "./src"),
      //   "@tests": path.resolve(__dirname, "./tests"),
      // },
      alias: [{
        find: /@mui\/material/,
        replacement: path.resolve(__dirname, 'node_modules', '@mui', 'material')
      }],
      exclude: ['@types/*']
    },
    define: {
      // "ENV.ENV_APP_ENVIRONMENT": JSON.stringify(env.ENV_APP_ENVIRONMENT),
      // "ENV.NODE_ENV": JSON.stringify(env.NODE_ENV),
      // "ENV.ENV_APP_DRIFT_ENABLED": env.ENV_APP_DRIFT_ENABLED,
      // "ENV.ENV_APP_CLIENT_ID": JSON.stringify(env.ENV_APP_CLIENT_ID),
      // "ENV.ENV_APP_SCOPE": JSON.stringify(env.ENV_APP_SCOPE),
      // "ENV.ENV_APP_PLACEZ_API_URL": JSON.stringify(env.ENV_APP_PLACEZ_API_URL),
      // "ENV.ENV_APP_PORTAL": JSON.stringify(env.ENV_APP_PORTAL),
      // "ENV.ENV_APP_LOGIN_REDIRECT": JSON.stringify(env.ENV_APP_LOGIN_REDIRECT),
      // "ENV.ENV_APP_LOGOUT_REDIRECT": JSON.stringify(env.ENV_APP_LOGOUT_REDIRECT),
      // "ENV.ENV_APP_INSIGHTS_ENABLED": env.ENV_APP_INSIGHTS_ENABLED,
      // "ENV.ENV_APP_INSIGHTS_KEY": JSON.stringify(env.ENV_APP_INSIGHTS_KEY),
      // "ENV.ENV_APP_GTAG_MEASUREMENT_ID": JSON.stringify(env.ENV_APP_GTAG_MEASUREMENT_ID),
      // "ENV.ENV_APP_PAYMENTS_API_URL": JSON.stringify(env.ENV_APP_PAYMENTS_API_URL),
      // "ENV.ENV_APP_GOOGLE_API_KEY": JSON.stringify(env.ENV_APP_GOOGLE_API_KEY),
    },
  };
});
