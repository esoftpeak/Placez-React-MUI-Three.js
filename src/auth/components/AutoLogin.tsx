import { useEffect } from 'react';
import { createUserManagerWithGuestToken } from '../userManager';
import { useParams } from 'react-router-dom';

const AutoLogin = () => {
  const params = useParams();
  const { guestTokenId } = params;

  async function updateGuestToken() {
    localStorage.removeItem('placez-layoutId');
    const userManagerWithGuestToken =
      createUserManagerWithGuestToken(guestTokenId);
    await userManagerWithGuestToken.removeUser();
    await userManagerWithGuestToken.signinRedirect();
  }

  useEffect(() => {
    if (!guestTokenId) return;
    updateGuestToken();
  }, [guestTokenId]);

  return <div></div>;
};

export default AutoLogin;
