import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Login from './Login';
import AutoLogin from './AutoLogin';
import Redirect from './Redirect';
import { ReduxState } from '../../reducers';
import { User } from 'oidc-client';
import { getOrgTheme, OrgTheme } from '../../api/placez/models/UserSetting';
import AppShell from '../../AppShell/AppShell';
import PlacezNavigate from '../../components/Utils/Navigate'

interface Props {}

const Authenticate = (props: Props) => {
  const user: User = useSelector((state: ReduxState) => state.oidc.user);
  const dispatch = useDispatch();

  const gtagConfig = () => {
    if (user) {
      (window as any).gtag(
        'config',
        import.meta.env.VITE_APP_GTAG_MEASUREMENT_ID,
        {
          user_id: user.profile.sub,
          organization_name: user.profile.organization_name,
          organization_id: user.profile.organization_id,
          preferred_username: user.profile.preferred_username,
          role: user.profile.role,
          custom_map: {
            dimension1: 'user_id',
            dimension2: 'organization_name',
            dimension3: 'organization_id',
            dimension4: 'preferred_username',
            dimension5: 'role',
          },
        }
      );
    }
  };

  const myDynamicManifest = {
    name: 'Your Great Site',
    short_name: 'Site',
    description: 'Something dynamic',
    start_url: 'https://placez.horizoncloud.com/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#0f4a73',
    icons: [
      {
        src: 'whatever.png',
        sizes: '256x256',
      },
    ],
  };

  const manifestConfig = (orgTheme: OrgTheme) => {
    myDynamicManifest.icons[0].src = orgTheme.icon;
    myDynamicManifest.theme_color = orgTheme.primaryColor;
    myDynamicManifest.name = orgTheme.name;

    const stringManifest = JSON.stringify(myDynamicManifest);
    const blob = new Blob([stringManifest], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);
    document
      .querySelector('#my-icon-placeholder')
      .setAttribute('href', orgTheme.icon);
    document.querySelector('#my-title-placeholder').innerHTML = orgTheme.name;
  };

  useEffect(() => {
    gtagConfig();
  }, []);

  useEffect(() => {
    if (user) {
      gtagConfig();
      manifestConfig(getOrgTheme(user.profile.organization_id));
    }
  }, [user, user?.profile?.organization_id, user?.profile?.sub]);

  return (
    <Router>
      <Routes>
        <Route path="/placez-viewer/:guestTokenId" element={<AutoLogin />} />
        <Route path="/signin-oidc" element={<Redirect />} />
        <Route
          path="/*"
          element={!user || user.expired ? <Login /> : <AppShell />}
        />
      </Routes>
      <PlacezNavigate />
    </Router>
  );
};

export default Authenticate;
