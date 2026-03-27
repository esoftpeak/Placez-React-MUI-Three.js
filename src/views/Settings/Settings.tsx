import {
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Theme,
  Typography,
} from '@mui/material';
import { useLocation } from 'react-router';
import { SettingsRoute } from '../../routes/settings';
import CollisionSettings from './CollisionSettings';
import QuickPickSettings from './QuickPickSettings';
import { useState } from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import GeneralSettings from './GeneralSettings';
import PaymentSetup from './PaymentSetup';
import PaymentLinkSettings from './PaymentLinkSettings';
import PaymentSettings from './PaymentSettings';
import InvoicesSettings from './InvoicesSettings';
import BusinessInfoSettings from './BusinessInfoSettings';

interface Props {}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      alignSelf: 'stretch',
      overflow: 'hidden',
    },
    pageTools: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      minHeight: '80px !important',
      '&:last-child': {
        marginRight: '0px !important',
        color: 'blue',
      },
    },
    settings: {
      height: '100%',
      display: 'grid',
      gridGap: '8px',
      gridTemplateColumns: '300px 1fr',
      gridTemplateRows: '1fr',
      padding: '30px',
    },
    placezBorder: {
      ...theme.PlacezBorderStyles,
      backgroundColor: theme.palette.background.paper,
      padding: '20px',
      height: '100%',
      overflow: 'scroll',
    },
    listItem: {
      // backgroundColor: theme.palette.background.paper,
      height: '50px',
      '.MuiTouchRipple-child': {
        backgroundColor: theme.palette.secondary.main,
      },
      padding: '0px !important',
      backgroundColor: 'rgba(0, 0, 0, 0) !important',
    },
    activeLink: {
      height: '50px',
      color: theme.palette.primary.main,
      textDecoration: 'none',
      padding: '0px !important',
      // backgroundColor: `${theme.palette.primary.main} !important`,
      '& div': {
        color: theme.palette.primary.main,
        display: 'flex',
        alignItems: 'center',
        borderLeft: '0px',
        padding: '0 !important',

        '&::before': {
          ...theme.PlacezLeftSelectedIndicator,
        },
      },
      '& svg': {
        color: `${theme.palette.primary.main} !important`,
      },
    },
    settingsHeader: {
      textAlign: 'start',
      paddingTop: '20px',
    },
  })
);

const Settings = (props: Props) => {
  const classes = styles(props);

  const { pathname } = useLocation();
  // const subpath = pathname.split('/').pop(); // Get the last segment of the URL
  const [subpath, setSubpath] = useState<SettingsRoute>(SettingsRoute.General);

  // const navigate = useNavigate();

  const [selectedPicklist, setSelectedPicklist] =
    useState<string>('SetupStyle');

  return (
    <div className={classes.root}>
      <div className={classes.settings}>
        <div className={classes.placezBorder}>
          <List>
            <div className={classes.settingsHeader}>
              <Typography variant="titleMedium">General</Typography>
            </div>
            <Divider />
            <ListItemButton
              selected={subpath === SettingsRoute.General}
              className={classes.listItem}
              classes={{ selected: classes.activeLink }}
              // onClick={(e) => navigate(settings.general.path)}>
              onClick={(e) => setSubpath(SettingsRoute.General)}
            >
              <ListItemText style={{ margin: '10px' }} primary="Appearance" />
            </ListItemButton>
            <ListItemButton
              selected={subpath === SettingsRoute.Business}
              className={classes.listItem}
              classes={{ selected: classes.activeLink }}
              // onClick={(e) => navigate(settings.general.path)}>
              onClick={(e) => setSubpath(SettingsRoute.Business)}
            >
              <ListItemText
                style={{ margin: '10px' }}
                primary="Business Information"
              />
            </ListItemButton>
            <ListItemButton
              selected={subpath === SettingsRoute.Setup}
              className={classes.listItem}
              classes={{ selected: classes.activeLink }}
              // onClick={(e) => navigate(settings.general.path)}>
              onClick={(e) => setSubpath(SettingsRoute.Setup)}
            >
              <ListItemText
                style={{ margin: '10px' }}
                primary="Payment Setup"
              />
            </ListItemButton>

            <div className={classes.settingsHeader}>
              <Typography variant="titleMedium">Financial Formats</Typography>
            </div>
            <Divider />
            <ListItemButton
              selected={subpath === SettingsRoute.Settings}
              className={classes.listItem}
              classes={{ selected: classes.activeLink }}
              // onClick={(e) => navigate(settings.general.path)}>
              onClick={(e) => setSubpath(SettingsRoute.Settings)}
            >
              <ListItemText
                style={{ margin: '10px' }}
                primary="Payment Link Settings"
              />
            </ListItemButton>
            <ListItemButton
              selected={subpath === SettingsRoute.Payments}
              className={classes.listItem}
              classes={{ selected: classes.activeLink }}
              // onClick={(e) => navigate(settings.general.path)}>
              onClick={(e) => setSubpath(SettingsRoute.Payments)}
            >
              <ListItemText
                style={{ margin: '10px' }}
                primary="Payments Links"
              />
            </ListItemButton>
            <ListItemButton
              selected={subpath === SettingsRoute.Invoices}
              className={classes.listItem}
              classes={{ selected: classes.activeLink }}
              // onClick={(e) => navigate(settings.general.path)}>
              onClick={(e) => setSubpath(SettingsRoute.Invoices)}
            >
              <ListItemText style={{ margin: '10px' }} primary="Invoices" />
            </ListItemButton>

            <div className={classes.settingsHeader}>
              <Typography variant="titleMedium">Designer</Typography>
            </div>
            <Divider />
            <ListItemButton
              selected={subpath === SettingsRoute.Collision}
              className={classes.listItem}
              classes={{ selected: classes.activeLink }}
              // onClick={(e) => navigate(settings.collision.path)}>
              onClick={(e) => setSubpath(SettingsRoute.Collision)}
            >
              <ListItemText style={{ margin: '10px' }} primary="Collision" />
            </ListItemButton>

            <div className={classes.settingsHeader}>
              <Typography variant="titleMedium">Quickpicks</Typography>
            </div>
            <Divider />
            {[
              'SetupStyle',
              'Status',
              'SceneType',
              'Client Type',
              'PlaceType',
            ].map((subcategory: any, index) => (
              <ListItemButton
                key={subcategory}
                selected={
                  subcategory === selectedPicklist &&
                  subpath === SettingsRoute.Quickpicks
                }
                className={classes.listItem}
                classes={{ selected: classes.activeLink }}
                onClick={(event) => {
                  setSelectedPicklist(subcategory);
                  // navigate(settings.quickpicks.path)
                  setSubpath(SettingsRoute.Quickpicks);
                }}
              >
                <ListItemText
                  style={{ margin: '10px' }}
                  primary={subcategory}
                />
              </ListItemButton>
            ))}
          </List>
        </div>
        <div className={classes.placezBorder}>
          {subpath === SettingsRoute.Collision && <CollisionSettings />}
          {subpath === SettingsRoute.Quickpicks && (
            <QuickPickSettings selectedPicklist={selectedPicklist} />
          )}
          {subpath === SettingsRoute.General && <GeneralSettings />}
          {subpath === SettingsRoute.Setup && <PaymentSetup />}
          {subpath === SettingsRoute.Settings && <PaymentLinkSettings />}
          {subpath === SettingsRoute.Payments && <PaymentSettings />}
          {subpath === SettingsRoute.Invoices && <InvoicesSettings />}
          {subpath === SettingsRoute.Business && <BusinessInfoSettings />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
