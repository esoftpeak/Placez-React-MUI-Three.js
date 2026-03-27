import { Theme } from '@mui/material';
import { createStyles } from '@mui/styles';

export const tableStyles = (theme: Theme) =>
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
      // paddingTop: '20px',
      // paddingRight: '20px',
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
        // padding: '0px !important',
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
      '& .k-detail-row .k-grid tbody tr:hover': {
        // backgroundColor: 'rgba(92, 35, 111, 0.09) !important',
      },
      '& tr:hover': {
        cursor: 'pointer',
      },
      '& .k-grid-norecords': {
        // display: 'none',
        width: '100% !important',
      },
      '& .k-grid-norecords-template': {
        border: 'none !important',
        backgroundColor: 'transparent !important',
      },
      '& td': {
        // padding: '0px 60px',
        paddingTop: 4,
        paddingBottom: 4,
        // borderWidth: '0 1px !important',
        borderWidth: '1px 0 !important',
        borderColor: '#DDDBDA !important',
        height: '56px',
        whiteSpace: 'nowrap',
        // borderRight: 'none !important',
      },
      '& td:hover': {
        //overflow: 'visible',
      },
      '& td:first-of-type': {
        // borderLeft: 'none !important',
      },
      '& td:last-child': {
        // borderLeft: 'none !important',
        paddingRight: '10px',
        marginRight: '10px',
      },
      '& th': {
        // padding: '0px 60px',
        paddingTop: 4,
        paddingBottom: 30,
        // borderWidth: '0 1px !important',
        // borderColor: '#DDDBDA !important',
        // borderLeft: 'none !important',
      },
      '& th:last-child': {
        // borderRight: 'none !important',
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
      // float: 'right',
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
