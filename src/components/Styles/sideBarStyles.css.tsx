import { Theme } from '@mui/material';
import { createStyles } from '@mui/styles';

const iconHeight = '44px';

const sideBarStyles = (theme: Theme) =>
  createStyles({
    root: {
      margin: '0px !important',
    },
    rootSBB: {
      margin: '0px !important',
    },
    rootPSBB: {
      margin: '0px !important',
    },
    logo: {},
    link: {
      textDecoration: 'none',
      padding: '0px !important',
      // backgroundColor: `${theme.palette.background.paper} !important`,
      color: theme.palette.text.primary,
      '& div': {
        display: 'flex',
        alignItems: 'center',
        height: iconHeight,
        padding: '0 !important',
      },
    },
    listItem: {
      // backgroundColor: theme.palette.background.paper,
      height: iconHeight,
      '.MuiTouchRipple-child': {
        backgroundColor: theme.palette.secondary.main,
      },
      padding: '0px !important',
    },
    listItemText: {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.primary.main
          : theme.palette.common.white,
    },
    activeLink: {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      padding: '0px !important',
      // backgroundColor: `${theme.palette.primary.main} !important`,
      '& div': {
        color: theme.palette.primary.main,
        display: 'flex',
        alignItems: 'center',
        borderLeft: '0px',
        height: iconHeight,
        padding: '0 !important',

        '&::before': {
          ...theme.PlacezLeftSelectedIndicator,
        },
      },
      '& svg': {
        color: `${theme.palette.primary.main} !important`,
      },
    },
    icon: {
      // marginLeft: '26px',
      overflow: 'visible',
      fontSize: '26px',
      width: '80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center !important',
    },
    textIcon: {
      fontSize: '20px', // Standard size for MUI icons, adjust as needed
      lineHeight: '1', // Ensures the text is centered
      textAlign: 'center',
      color: 'inherit', // Inherits color from parent
      userSelect: 'none',

      width: '80px',

      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center !important',
    },

    label: {
      overflowX: 'hidden',
      whiteSpace: 'nowrap',
    },
  });

export default sideBarStyles;
