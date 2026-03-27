import * as React from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { ModalProvider } from '../components/Modals/ModalContext';
import ModalInjector from '../components/Modals/ModalInjector';
import { Route, Routes } from 'react-router';
import routes from '../routes';
import Dashboard from '../views/Dashboard/Dashboard';
import { useSelector } from 'react-redux';
import { ReduxState } from '../reducers';
import SideBar from '../components/SideBar/SideBar';
import { Tooltip } from '@mui/material';

/** @jsxImportSource @emotion/react */

import { getOrgTheme } from '../api/placez/models/UserSetting';
import PlacezTopBar from './PlacezTopBar';
import {
  LocalStorageKey,
  ThemeType,
  useLocalStorageState,
} from '../components/Hooks/useLocalStorageState';
import { Brightness3, Menu } from '@mui/icons-material';
import { SunnyIcon } from '../assets/icons';
import { layoutConstants } from '../Constants/layout';
import { createStyles, makeStyles } from '@mui/styles'
import GPUDiagnostics from '../components/Utils/GPUDiagnostics'
import HelpDialog from '../Context Providers/HelpProvider/HelpDialog'
import { userIsInRole, guestRole } from '../sharing/utils/userHelpers';

const openedMixin = (theme: Theme): CSSObject => ({
  width: layoutConstants.drawerOpenWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  border: 'none',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  // width: `calc(${theme.spacing(7)} + 1px)`,
  width: '80px !important',
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  border: 'none',
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: layoutConstants.drawerOpenWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const logoSize = 48;

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      padding: 0,
      flex: 1,
    },
    logoContainer: {
      color: theme.palette.primary.main,
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      padding: 0,
      marginLeft: '20px',
    },
    logo: {
      width: logoSize,
      height: logoSize,
      marginLeft: '14px',
      color: `blue !important`,
    },
    logoText: {
      overflowX: 'hidden',
      whiteSpace: 'nowrap',
      padding: 0,
    },
    listContainer: {
      height: '100vh',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    sideBarControls: {
      display: 'flex',
    },
  })
);

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  height: '100vh',
  paddingTop: layoutConstants.appBarHeight,
  backgroundColor: theme.palette.background.default,

  transition: theme.transitions.create('padding-left', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  paddingLeft: '80px',
  ...(open && {
    transition: theme.transitions.create('padding-left', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    paddingLeft: `${layoutConstants.drawerOpenWidth}px`,
  }),
}));

export default function AppShell() {
  const sagasLoaded = useSelector(
    (state: ReduxState) => state.lifecycle.sagasReady
  );
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [themeType, setThemeType] = useLocalStorageState<ThemeType>(
    LocalStorageKey.ThemeType,
    'light'
  );
  const toggleThemeType = () => {
    setThemeType(themeType === 'light' ? 'dark' : 'light');
  };

  const user = useSelector((state: ReduxState) => state.oidc.user);
  const isGuestUser = useSelector((state: ReduxState) => userIsInRole(state.oidc.user, guestRole));
  const classes = styles(theme);


  return (
    <ModalProvider>
      <Box
        sx={{
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        }}
      >
        <CssBaseline />
        <ModalInjector />
        <GPUDiagnostics/>
        <HelpDialog />
        <PlacezTopBar open={open} />
        <Drawer variant="permanent" open={open}>
          {!isGuestUser && (
            <DrawerHeader style={{ height: layoutConstants.appBarHeight }}>
              <Tooltip title="Home">
                <ListItem className={classes.logoContainer}>
                  <ListItemText className={classes.logoText}>
                    <div
                      style={{
                        fontSize: getOrgTheme(user.profile.organization_id)
                          .fontStyle,
                      }}
                    >
                      {getOrgTheme(user.profile.organization_id).name}
                    </div>
                  </ListItemText>
                </ListItem>
              </Tooltip>
            </DrawerHeader>
          )}
          <SideBar guest={isGuestUser} />
          <div
            style={{
              flexDirection: !open ? 'column' : 'row',
              justifyContent: !open ? '' : 'space-between',
              alignItems: open ? 'center' : '',
            }}
            className={classes.sideBarControls}>
            <Tooltip title={themeType === 'light' ? 'Dark Mode' : 'Light Mode'}>
              <IconButton
                style={{
                  width: '36px',
                  marginLeft: '22px',
                }}
                aria-label="mode"
                onClick={toggleThemeType}
              >
                {themeType === 'light' ? (
                  <Brightness3
                    fontSize="small"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                ) : (
                  <SunnyIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <IconButton
              style={{
                width: '36px',
                margin: '22px',
              }}
              aria-label="Toggle Drawer"
              onClick={() => (open ? setOpen(false) : setOpen(true))}
              sx={{ margin: 0 }}
            >
              <Menu fontSize="small" />
            </IconButton>
          </div>
        </Drawer>
        <Main open={open}>
          {sagasLoaded ? (
            <Routes>
              {routes.map((route, key) => {
                return (
                  <Route
                    key={key}
                    path={route.path}
                    element={<route.component />}
                  />
                );
              })}
              <Route element={<Dashboard />} />
            </Routes>
          ) : (
            <></>
          )}
        </Main>
      </Box>
    </ModalProvider>
  );
}
