import { Theme } from '@mui/material';
import { createStyles } from '@mui/styles';

export const invoiceTableStyle = (theme: Theme) =>
  createStyles({
    root: {
      height: 'auto',
      color: theme.palette.text.primary,
      padding: theme.spacing(3),
      overflow: 'hidden',
    },
    gridRoot: {
      ...theme.PlacezBorderStyles,
      fontFamily: theme.typography.fontFamily,
      backgroundColor: `${theme.palette.background.paper} !important`,
      color: `${theme.palette.text.primary} !important`,
      padding: '32px',
      overflow: 'hidden',
      '& .k-master-row': {
        backgroundColor: `${theme.palette.background.paper}`,
        color: `${theme.palette.text.primary}`,
      },
      '& .k-master-row:hover': {
        backgroundColor: `${theme.palette.action.hover} !important`,
        color: `${theme.palette.text.primary} !important`,
      },
      '& .k-grid-header': {
        backgroundColor: `${theme.palette.background.paper} !important`,
        borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0px 0px`,
        color: theme.palette.text.primary,
        borderBottom: 'none',
        borderRight: 'none !important',
      },
      '& .k-grid-header :hover': {
        color: `${theme.palette.text.primary} !important`,
      },
      '& .k-grid-header .k-sorted': {
        color: `${theme.palette.primary.main} !important`,
      },
      '& .k-grid-header .k-i-sort-asc-sm': {
        color: `${theme.palette.secondary.main} !important`,
      },
      '& .k-grid-header-wrap': {
        border: 'none !important',
      },
      '& .k-table-thead': {
        backgroundColor: 'transparent !important',
        border: 'none !important',
        padding: '0px !important',
      },
      '& .k-link': {
        paddingRight: '0px !important',
      },
      '& tr:hover': {
        cursor: 'pointer',
      },
      '& .k-grid-norecords': {
        width: '100% !important',
      },
      '& .k-grid-norecords-template': {
        border: 'none !important',
        backgroundColor: 'transparent !important',
      },
      '& .k-table-row td': {
        padding: '10px 0 10px 24px !important',
      },
      '& table': {
        width: '100% !important',
      },
      '& td': {
        paddingTop: 4,
        paddingBottom: 4,
        borderWidth: '0px 2px 0 0 !important',
        borderColor: '#DDDBDA !important',
        height: 'inherit',
        whiteSpace: 'nowrap',
      },
      '& tr:last-child td': {
        borderWidth: '2px 0 2px 0 !important',
        borderColor: '#DDDBDA !important',
      },
      '& tr:last-child td:first-child': {
        borderLeft: '2px solid #DDDBDA !important',
      },
      '& tr:last-child td:last-child': {
        borderRight: '2px solid #DDDBDA !important',
      },
      '& td:last-child': {
        paddingRight: '10px',
        marginRight: '10px',
        borderRight: 'none !important',
      },
      '& th:last-child': {
        borderRight: 'none !important',
      },
      '& th': {
        paddingTop: 4,
        paddingBottom: 30,
      },
      '& .subEventHeader-row td': {
        borderWidth: '0 !important',
        borderColor: 'transparent !important',
        padding: '2px 0px 2px 24px !important',
      },
      '& .k-grid-toolbar': {
        padding: '0px',
        display: 'flex',
        justifyContent: 'end',
      },
      '& .k-grid-content': {
        backgroundColor: `${theme.palette.background.paper} !important`,
        color: theme.palette.text.primary,
      },
      '& .k-sorted': {
        backgroundColor: `${theme.palette.background.paper} !important`,
      },
    },
    LinkStyle: {
      fontSize: 14,
      '&:hover': {
        textDecoration: 'underline',
        color: `${theme.palette.text.primary} !important`,
      },
    },
    toolbarButton: {
      margin: '10px',
    },
    arrow: {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.primary.main
          : theme.palette.text.primary,
      textOverflow: '',
      overflow: 'hidden',
    },
    overflowEllipsis: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    newInput: {
      marginBottom: '10px',
    },
  });
