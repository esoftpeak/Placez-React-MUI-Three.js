import { Theme } from '@material-ui/core';
import { makeStyles, createStyles } from '@mui/styles';


export const useComponentStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    // Invoice Information Styles
    invoiceContainer: {
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.spacing(1),
      padding: theme.spacing(2),
      marginBottom: theme.spacing(2),
      border: `1px solid ${theme.palette.divider}`,
    },
    invoiceGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: theme.spacing(1.5),
      marginTop: theme.spacing(1),
    },
    invoiceCard: {
      padding: theme.spacing(1.5),
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.spacing(0.5),
      textAlign: 'center',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    labelText: {
      '&>p': {
        fontSize: '0.85rem !important',
        fontWeight: 'bolder !important',
        color: theme.palette.text.primary,
        textTransform: 'uppercase',
        marginBottom: theme.spacing(0.5),
        letterSpacing: '0.03rem'
      },
      display: 'flex',
      justifyContent: 'end',
      alignItems: 'center'
    },
    infoText: {
      '&>p': {
        fontSize: '0.7rem',
        fontWeight: 500,
        color: theme.palette.text.primary,
        textAlign: 'end',
      }
    },
    invoiceTitle: {
      fontSize: '1rem',
      fontWeight: 600,
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(1),
    },

    //InvoiceHeader
    invoiceHeader: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '15px 10px',
      height: '250px',
      position: 'relative',
      overflow: 'visible',
      borderRadius: '1px'
    },
    invoiceHeaderColorPicker: {
      position: 'absolute',
      top: '0.8rem',
      right: '0.8rem',
      fontSize: '28px',
      color: '#5C5C5C',
      pointerEvents: 'auto',
      cursor: 'pointer'
    },
    colorPickerPanel: {
      position: 'absolute',
      top: '35px',
      right: '0',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      borderRadius: '8px',
    },
    //InvoiceBilling
    invoiceBilling: {
      width: '40%',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    //InvoiceBillingInfo
    invoiceBillingInfo: {
      width: '30%',
      paddingRight: '30px'
    },
    // Upload Box Styles
    uploadBox: {
      width: '90%',
      border: '2px solid #5C236F',
      borderRadius: theme.spacing(1),
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      cursor: 'pointer',
      aspectRatio: '5/4',
      '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.action.hover,
      },
    },
    hiddenInput: {
      display: 'none',
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: '100%',
    },
    uploadedImage: {
      width: '100%',
      height: '100%',
      aspectRatio: '5/4'
    },
    uploadIconOverlay: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      fontSize: '28px',
      color: '#5C5C5C',
      cursor: 'pointer',
    },
    removeButton: {
      position: 'absolute',
      top: -10,
      right: -10,
      backgroundColor: theme.palette.error.main,
      color: 'white',
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
      },
      width: 24,
      height: 24,
    },
    uploadIcon: {
      fontSize: 48,
      color: theme.palette.text.secondary,
      marginBottom: theme.spacing(1),
    },
    uploadTitle: {
      marginBottom: theme.spacing(1),
      fontSize: '0.85rem !important'
    },
    uploadSubtitle: {
      color: theme.palette.text.secondary,
    },
    // Content Box Styles
    contentBox: {
      marginBottom: theme.spacing(3),
    },
    // Header Text Styles
    headerText: {
      textAlign: 'left',
    },
    // Item Description Box Styles
    itemDescriptionBox: {
      backgroundColor: theme.palette.primary.dark,
      borderRadius: theme.spacing(2),
      padding: theme.spacing(1),
      marginBottom: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemDescriptionText: {
      color: theme.palette.background.default,
      textAlign: 'center',
    },
    // Business Name Text Styles
    businessNameText: {
      fontSize: '0.85rem !important',
      padding: '0px 40px',
      textAlign: 'left',
      marginTop: theme.spacing(1),
    },
    invoiceMessage: {
      '& .MuiOutlinedInput-root': {
        border: '1px solid #5C236F !important',
        borderRadius: '8px',
        padding: '20px 40px'
      }
    },
    itemDescriptionTitle: {
      fontSize: '0.85rem !important',
      fontWeight: 'bolder !important',
      textTransform: 'uppercase',
      background: '#8080801a',
      padding: '10px 40px',
      textAlign: 'left'
    },
    itemDescriptionContent: {
      fontSize: '0.85rem !important',
      textTransform: 'uppercase',
      padding: '0px 40px',
      textAlign: 'left',
    },
    itemDescriptionUnderline: {
      width: '85%',
      margin: '12px auto',
      borderBottom: '1px solid gray',
    },
    itemDescriptionamountDueText: {
      fontSize: '0.85rem !important',
      fontWeight: 'bolder !important',
      textAlign: 'right',
      marginTop: '12px',
      paddingRight: '40px',
      letterSpacing: '0.03rem'
    }
  })
);
