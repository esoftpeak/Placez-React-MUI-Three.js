import { Theme } from '@mui/material';
import { createStyles } from '@mui/styles';

const formStyles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexWrap: 'nowrap',
      width: '100%',
      margin: '0 auto',
      marginBottom: '40px',
    },

    formThreeColGrid: {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gridTemplateRows: '1fr 1fr 1fr',
      gridRowGap: '50px',
      gridColumnGap: '60px',
      padding: '50px',
      alignItems: 'center',
    },
    formTwoColGrid: {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridRowGap: '50px',
      gridColumnGap: '60px',
      padding: '50px',
      alignItems: 'center',
    },
    formData: {
      display: 'flex',
      flexAlign: 'center',
    },
    addButton: {
      borderRadius: 0,
      '&:hover': {
        background: theme.palette.primary.main,
        color: theme.palette.common.white,
      },
    },
  });

export default formStyles;
