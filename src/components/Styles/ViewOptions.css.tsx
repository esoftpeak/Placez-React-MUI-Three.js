import { Theme, createStyles } from '@mui/material';

const viewOptionsStyles = (theme: Theme) =>
  createStyles({
    root: {
      position: 'absolute',
      bottom: 8,
      margin: theme.spacing(),
      left: 0,
    },
    popup: {
      position: 'absolute',
      bottom: 60,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      alignContent: 'center',
      maxWidth: '52px',
    },
    horizontal: {
      display: 'flex',
    },
    clipboard: {
      position: 'absolute',
      right: 264,
      top: 114,
    },
    viewToggles: {
      display: 'flex',
      flexDirection: 'column',
    },
    valueLabel: {
      width: '20px',
    },
    border: {
      margin: `0px ${theme.spacing()}px`,
      border: '2px solid #000000',
    },
    divider: {
      alignSelf: 'stretch',
      height: 'auto',
      margin: theme.spacing(1, 0.5),
    },
    reset: {
      padding: theme.spacing(),
    },
    selected: {
      backgroundColor: `${theme.palette.primary.main} !important`,
      color: `${theme.palette.common.white} !important`,
    },
    button: {
      border: 'none',
      borderRadius: 0,
      '&:hover': {
        background: theme.palette.secondary.main,
        color: theme.palette.common.white,
      },
      maxHeight: '40px',
    },
    streetViewButton: {
      cursor: 'grab',
      border: 'none',
    },
    streetViewSelected: {
      cursor: 'pointer',
    },
    tooltipButton: {
      padding: 0,
    },
    iconButton: {
      '&:hover': {
        background: theme.palette.secondary.main,
      },
      margin: `0px ${theme.spacing()}px`,
      padding: theme.spacing(),
      border: `2px solid ${theme.palette.common.black}`,
      borderRadius: 4,
    },
    moreSettings: {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      left: '60px',
      width: '100px',
      padding: '0px 8px',
      border: '2px solid #000000',
      backgroundColor: `${theme.palette.background.paper} !important`,
      borderRadius: 4,
    },
  });

export default viewOptionsStyles;
