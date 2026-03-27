import { Theme } from '@mui/material';
import { createStyles } from '@mui/styles';

const TablePageStyles = (theme: Theme) =>
  createStyles({
    root: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      overflow: 'hidden',
      padding: '0px 80px',
    },
    tables: {
      flex: 1,
      overflow: 'auto',
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
    dateSelector: {
      width: '140px',
    },
    form: {
      overflowY: 'scroll',
    },
  });

export default TablePageStyles;
