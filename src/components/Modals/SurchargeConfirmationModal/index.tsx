import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';
// Components
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import { formatNumber } from '../../../utils/formatNumber';

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
      padding: theme.spacing(2),
      textAlign: 'center',
    },
    dialogContent: {
      padding: '24px !important',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '300px !important',
    },
    dialogActions: {
      background: `${theme.palette.primary.main}33 !important`,
      padding: '16px !important',
      gap: '12px',
    },
    amountSection: {
      width: '100%',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    amountRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 0',
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderTop: `1px solid ${theme.palette.divider}`,
      marginTop: '8px',
      fontWeight: 600,
    },
    stepper: {
      margin: '20px',
      '& .MuiStepper-root': {
        fontSize: '160px',
      },
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
  });

interface Props {
  isShowModal: boolean;
  invoiceTotal: number;
  hPaySurchargeResponse: any;
  onClickCancel: () => void;
  onClickProceed: () => void;
}

const SurchargeModal = (modalProps: Props) => {
  const {
    isShowModal,
    invoiceTotal,
    hPaySurchargeResponse,
    onClickCancel,
    onClickProceed,
  } = modalProps;
  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(modalProps);

  return (
    <Dialog
      style={{ zIndex: 9999 }}
      scroll="paper"
      aria-labelledby="place-modal"
      open={isShowModal}
      fullWidth={true}
      maxWidth="md"
    >
      <DialogTitle className={classes.dialogTitle}>
        Payment Confirmation
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box className={classes.amountSection}>
          <div className={classes.amountRow}>
            <Typography variant="body1">
              Original Amount (including tip):
            </Typography>
            <Typography variant="body1">
              {formatNumber(invoiceTotal)}
            </Typography>
          </div>
          <div className={classes.amountRow}>
            <Typography variant="body1">Surcharge:</Typography>
            <Typography variant="body1">
              {formatNumber(hPaySurchargeResponse?.surcharge)}
            </Typography>
          </div>
          <div className={classes.totalRow}>
            <Typography variant="body1">Total Amount:</Typography>
            <Typography variant="body1">
              {formatNumber(
                invoiceTotal + (hPaySurchargeResponse?.surcharge ?? 0)
              )}
            </Typography>
          </div>
        </Box>
        <Typography variant="body1" style={{ marginTop: '16px' }}>
          Are you sure you want to make the payment?
        </Typography>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <PlacezActionButton onClick={onClickCancel}>Cancel</PlacezActionButton>
        <PlacezActionButton onClick={onClickProceed}>
          Proceed
        </PlacezActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default SurchargeModal;
