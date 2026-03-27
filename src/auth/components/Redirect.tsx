//@ts-nocheck
// OIDC issues
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';

import { Theme } from '@mui/material';

import { createStyles } from '@mui/styles';

import { useNavigate } from 'react-router';
import { CallbackComponent } from 'redux-oidc';
import userManager from '../userManager';
import { User } from 'oidc-client';
import { CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { placezApi } from '../../api';
import { sceneRoutes } from '../../routes';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      zIndex: 1000,
      background: theme.palette.grey[100],
      width: '100vw',
      height: '100vh',
    },
    loading: {
      ...theme.typography.h4,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    progress: {
      margin: theme.spacing(),
    },
  })
);

interface Props {}

const Redirect = (props: Props) => {
  const navigate = useNavigate();
  const classes = styles(props);

  const userProfile = useSelector(
    (state: ReduxState) => state?.oidc?.user?.profile
  );

  useEffect(() => {
    const userLayoutId = userProfile?.['placez-layoutId'];
    if (userLayoutId) {
      localStorage.setItem('placez-layoutId', userLayoutId);
      successCallback();
    }
  }, [userProfile]);

  const successCallback = async (user: User = null): Promise<void> => {
    if (user) {
      (window as any).gtag('event', 'login');
    }

    const layoutId = localStorage.getItem('placez-layoutId');

    if (layoutId) {
      try {
        const response = await placezApi.getLayout(layoutId);
        const layout = response.parsedBody;

        if (layout && layout.sceneId) {
          const plannerPath = sceneRoutes.planner.path
            .replace(':id', layout.sceneId.toString())
            .replace(':planId', layoutId);

          navigate(plannerPath);
          localStorage.removeItem('placez-layoutId');
          return;
        }
      } catch (error) {
        console.error('Error fetching layout details:', error);
      }
    }

    const redirectPathname = localStorage.getItem('redirectPathname');
    navigate(
      redirectPathname && redirectPathname !== '' ? redirectPathname : '/'
    );

    localStorage.setItem('redirectPathname', '/');
  };

  return (
    <CallbackComponent
      userManager={userManager}
      successCallback={successCallback}
      errorCallback={(error) => {
        if (!!error && !!error.message) {
          const clockIsBehind = error.message.includes('iat is in the future');
          const clockIsAhead = error.message.includes('exp is in the past');

          if (clockIsAhead || clockIsBehind) {
            alert(
              'Your computer clock does not match the time on our servers. Please set your computer clock to the correct time and retry your connection.'
            );
          }
        }

        console.error(error);
        navigate('/');
      }}
    >
      <div className={classes.root}>
        <div className={classes.loading}>
          <CircularProgress className={classes.progress} />
          Redirecting...
        </div>
      </div>
    </CallbackComponent>
  );
};

export default Redirect;
