import React from 'react';
import withModalContext, { WithModalContext } from './withModalContext';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dialog } from '@mui/material';
import formModalStyles from '../Styles/FormModal.css';
import PlacezLargeButton from '../PlacezUIComponents/PlacezLargeButton';
import { DownloadPDFIcon, DownloadXLSXIcon } from '../../assets/icons'

interface Props extends WithModalContext {
  onExportPDF: () => void;
  onExportExcel: () => void;
}

const handleClose = (modalProps) => (event, reason) => {
  if (reason !== 'backdropClick') {
    return;
  }
  modalProps.modalContext.hideModal();
};

const DownloadGridModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;

  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);

  return (
    <Dialog
      classes={{
        paper: classes.modal,
      }}
      scroll="paper"
      open={true}
      aria-labelledby="place-modal"
      maxWidth="md"
      fullWidth={true}
      onClose={handleClose(modalProps)}
      {...props}
    >
      <DialogTitle className={classes.dialogTitle}>
        Download Invoice
      </DialogTitle>
      <DialogContent
        className={classes.dialogContent}
        style={{
          flexDirection: 'row',
          alignContent: 'center',
          justifyContent: 'center',
          padding: '30px',
          height: '600px',
        }}
      >
        {modalProps.onExportPDF && (
          <PlacezLargeButton
            onClick={() => {
              modalProps.onExportPDF();
              modalProps.modalContext.hideModal();
            }}
          >
            <DownloadPDFIcon sx={{ fontSize: 80 }} />
          </PlacezLargeButton>
        )}
        {modalProps.onExportExcel && (
          <PlacezLargeButton
            onClick={() => {
              modalProps.onExportExcel();
              modalProps.modalContext.hideModal();
            }}
          >
            <DownloadXLSXIcon sx={{ fontSize: 80 }} />
          </PlacezLargeButton>
        )}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button
          variant="outlined"
          onClick={(e) => modalProps.modalContext.hideModal()}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withModalContext(DownloadGridModal);
