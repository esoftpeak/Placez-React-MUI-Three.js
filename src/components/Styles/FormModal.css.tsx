import { Theme } from '@mui/material';
import { createStyles } from '@mui/styles';

const formModalStyles = (theme: Theme) =>
  createStyles({
    root: { margin: '0px' },
    modal: {
      ...theme.PlacezBorderStyles,
      overflowY: 'initial',
      textAlign: 'center',
      margin: '20px',
    },
    dialogTitle: {
      background: `${theme.palette.primary.main}33`,
      // color: theme.palette.primary.contrastText,
      padding: theme.spacing(2),
      textAlign: 'center',
    },
    dialogContent: {
      padding: '0px !important',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '600px',
    },
    dialogActions: {
      // backgroundColor: 'rgba(0, 0, 0, 0) !important',
      background: `${theme.palette.primary.main}33 !important`,
    },
    stepper: {
      margin: '20px',
      // color: 'yellow !important',
      '& .MuiStepLabel-root': {
        display: 'block',
        // color: 'blue !important',
      },
      '& .MuiStepLabel-iconContainer': {
        display: 'flex',
        justifyContent: 'center',
        paddingRight: '0'
      },
      '& .MuiSvgIcon-root': {
        fontSize: '1.8rem !important',
        color: 'white',
        border: '1px solid purple',
        borderRadius: '50%'
      },
      '& .MuiStepIcon-text': {
        fill: 'black',
        fontSize: '15px'
      },
      '& .MuiStep-root': {
        minWidth: '100px'
      },
      '& .Mui-active': {
        color: '#EEE9F0'
      }
    },
    formColumn: {
      margin: '30px',
    },
    formTwoColGrid: {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridRowGap: '30px',
      gridColumnGap: '60px',
      padding: '50px',
      alignItems: 'center',
    },
    columnListItem: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '225px',
      border: '1px solid',
      borderRadius: '5px',
      borderColor: '#EEE9F1',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '12px',
      padding: '10px',
      width: '100%',
      maxHeight: '600px',
      overflowY: 'auto',
    },
    gridItem: {
      boxSizing: 'border-box',
    },
    columnBox: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '1px 1px',
      backgroundColor: '#fff',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    columnInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexGrow: 1,
      overflow: 'hidden',
    },
    checkboxItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(1),
    },
  });

export default formModalStyles;
