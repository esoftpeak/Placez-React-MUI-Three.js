import { useEffect, useState } from 'react';
import Authenticate from './auth/components/Authenticate';

// Theming
import { themeGenerator } from './assets/themes/ThemeGenerator';
import '@progress/kendo-theme-material/dist/all.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'react-toastify/dist/ReactToastify.min.css';

// Redux
import { useDispatch, useSelector } from 'react-redux';

// Planner

// Logging
import { ReduxState } from './reducers';
import { getOrgTheme } from './api/placez/models/UserSetting';
import { AppToast } from './components/Blue/components/toast';
import ChromeAlertDialog from './components/Modals/ChromeAlertDialog';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import {
  LocalStorageKey,
  ThemeType,
  useLocalStorageSelector,
} from './components/Hooks/useLocalStorageState';
import { HelpProvider } from './Context Providers/HelpProvider/HelpContext';

const App = () => {
  const themeType = useLocalStorageSelector<ThemeType>(
    LocalStorageKey.ThemeType
  );

  const [appliedTheme, setAppliedTheme] = useState(
    createTheme(themeGenerator('light'))
  );

  const orgId = useSelector(
    (state: ReduxState) => state.oidc?.user?.profile?.organization_id ?? ''
  );
  const dispatch = useDispatch();

  const orgTheme = getOrgTheme(orgId);

  useEffect(() => {
    if (orgId) {
      setAppliedTheme(
        createTheme(
          themeType === 'dark'
            ? themeGenerator(
                'dark',
                orgTheme.primaryColor,
                orgTheme.darkSecondaryColor
              )
            : themeGenerator(
                'light',
                orgTheme.primaryColor,
                orgTheme.lightSecondaryColor
              )
        )
      );
    } else {
      setAppliedTheme(
        createTheme(
          themeType === 'dark'
            ? themeGenerator('dark')
            : themeGenerator('light')
        )
      );
    }
  }, [themeType, orgTheme]);

  return (
    <ThemeProvider theme={appliedTheme}>
      <CssBaseline />
      <ChromeAlertDialog />
      <HelpProvider>
        <Authenticate />
      </HelpProvider>
      <AppToast />
    </ThemeProvider>
  );
};

export default App;
