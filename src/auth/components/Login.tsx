import { useLocation } from 'react-router';

import { createStyles } from '@mui/styles';

import userManager from '../userManager';
import { CssBaseline, Button, useTheme, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ArrowForward as RightIcon } from '@mui/icons-material';
import classnames from 'classnames';

import { useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import { createSelector } from 'reselect';
import { getOrgTheme } from '../../api/placez/models/UserSetting';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundBlendMode: 'overlay',
      background: `linear-gradient(to top right, ${getOrgTheme().primaryColor}, white), url(${getOrgTheme().splash})`,
    },
    leftPanel: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      background: theme.palette.grey[100],
      boxShadow: theme.shadows[2],
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: theme.spacing(6),
    },
    button: {
      width: '75%',
      minWidth: 220,
      maxWidth: 380,
      fontSize: 18,
      letterSpacing: 3,
      fontWeight: 200,
      backgroundColor: `${getOrgTheme().primaryColor}`,
      color: 'white',
    },
    rightIcon: {
      marginLeft: theme.spacing(3),
    },
    iconSmall: {
      fontSize: 20,
    },
  })
);

interface Props {}

const LoginPage = (props: Props) => {
  const user = useSelector((state: ReduxState) => getUser(state));
  const classes = styles(props);
  const location = useLocation();
  const theme: Theme = useTheme();

  const onLoginButtonClick = (event: any) => {
    event.preventDefault();
    const pathname = location ? location.pathname : '';
    localStorage.removeItem('placez-layoutId');
    localStorage.setItem('redirectPathname', pathname);
    userManager.removeUser().then(() => {
      userManager.signinRedirect();
    });
  };

  const orgTheme = getOrgTheme();
  return (
    <div className={classes.root}>
      <CssBaseline />
      <div className={classes.leftPanel}>
        <div
          style={{
            width: '50%',
            minWidth: '180px',
            maxWidth: '320',
            minHeight: '100px',
            margin: theme.spacing(2),
            background: `url(${orgTheme.textLogo}), ${theme.palette.primary.main}`,
            backgroundBlendMode: 'multiply',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            WebkitMaskImage: `url(${orgTheme.textLogo})`,
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
          }}
        />
        <Button
          className={classes.button}
          variant="contained"
          onClick={onLoginButtonClick}
        >
          Sign In
          <RightIcon
            className={classnames(classes.rightIcon, classes.iconSmall)}
          />
        </Button>
      </div>
      <div
        style={{
          display: 'flex',
          flex: 2,
          flexDirection: 'column',
          alignContent: 'center',
          justifyContent: 'space-around',
          background: theme.palette.primary.main,
          WebkitMaskImage: `url(${orgTheme.icon})`,
          WebkitMaskPosition: 'center',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskSize: '200px, 200px',
        }}
      ></div>
    </div>
  );
};

const getUserState = (state) => {
  return state.oidc.user;
};

const getUser = createSelector([getUserState], (user) => user);

export default LoginPage;
