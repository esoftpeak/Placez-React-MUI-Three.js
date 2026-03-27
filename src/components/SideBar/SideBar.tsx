import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import DefaultSidebar from './DefaultSidebar';
import PlannerSidebar from './PlannerSidebar/PlannerSidebar';
import { List, Theme } from '@mui/material';
import { createStyles, makeStyles, useTheme } from '@mui/styles';
import { sceneRoutes, placeRoutes } from '../../routes';

/** @jsxImportSource @emotion/react */

interface Props {
  guest?: boolean;
}

const logoSize = 52;

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      paddingTop: '42px',
      flex: 1,
      borderTop: `2px solid ${theme.palette.secondary.main}`,
    },
  })
);

const SideBar = (props: Props) => {
  const location = useLocation();

  useEffect(() => {
    window.dispatchEvent(new Event('navigationToAnInScopePage'));
    (window as any).gtag('event', 'navigate', {
      path: location.pathname,
    });
  }, [location]);

  const { guest } = props;

  const theme = useTheme();
  const classes = styles(theme);
  return (
    <List className={classes.root}>
      {guest ? (
        <PlannerSidebar guest={guest} />
      ) : (
        <Routes>
          <Route
            path={sceneRoutes.planner.path}
            element={<PlannerSidebar guest={guest} />}
          />
          <Route
            path={placeRoutes.editFloorPlan.path}
            element={<PlannerSidebar guest={guest} />}
          />
          <Route
            path={placeRoutes.newFloorPlan.path}
            element={<PlannerSidebar guest={guest} />}
          />
          <Route path={'/*'} element={<DefaultSidebar />} />
        </Routes>
      )}
    </List>
  );
};

export default SideBar;
