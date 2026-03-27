import { createUserManager } from 'redux-oidc';

const userManagerConfig = {
  authority: import.meta.env.VITE_APP_PORTAL,
  client_id: import.meta.env.VITE_APP_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_APP_LOGIN_REDIRECT,
  response_type: 'id_token token',
  scope: import.meta.env.VITE_APP_SCOPE,
  post_logout_redirect_uri: import.meta.env.VITE_APP_LOGOUT_REDIRECT,
  automaticSilentRenew: true,
  silent_redirect_uri: `${window.location.origin}/silent-refresh.html`,
  silentRequestTimeout: 50000,
  clockSkew: 900, // 15 min
};

export const createUserManagerWithGuestToken = (guestTokenId?: string) => {
  return createUserManager({
    ...userManagerConfig,
    extraQueryParams: { guest_token: guestTokenId ? guestTokenId : '' },
  });
};

export default createUserManagerWithGuestToken();
