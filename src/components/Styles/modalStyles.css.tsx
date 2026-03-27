import { Theme } from '@mui/material';
import { createStyles } from '@mui/styles';

const modalStyles = (theme: Theme) =>
  createStyles({
    dialog: {},
    dialogTitle: {
      margin: 0,
      padding: theme.spacing(2),
      fontSize: '26px',
      // textAlign: 'center',
      backgroundColor: `${theme.palette.primary.main}33 !important`,
      height: '64px',
    },
    actions: {
      backgroundColor: `${theme.palette.background.paper} !important`,
      margin: 0,
      padding: theme.spacing(),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: 'none !important',
    },
    button: {
      padding: '4px 30px',
      borderRadius: theme.shape.borderRadius,
      width: '120px',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: `${theme.palette.background.default} !important`,
      border: 'none !important',
    },
    dialogContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: `${theme.palette.background.default} !important`,
      border: 'none !important',
    },
    error: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.common.white,
    },
    setting: {
      display: 'flex',
      width: '90%',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '10px 25px',
    },
    rowContainer: {
      display: 'flex',
      alignSelf: 'stretch',
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    fieldHeadingLight: {
      margin: theme.spacing(),
      fontWeight: 'bold',
      fontSize: 14,
      flex: '1',
    },
    largeButton: {
      '& svg': {
        fontSize: 100,
      },
    },
  });

export default modalStyles;
