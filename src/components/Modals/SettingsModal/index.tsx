import withModalContext, { WithModalContext } from '../withModalContext';
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dialog } from '@mui/material';
import { Client } from '../../../api';
import formModalStyles from '../../Styles/FormModal.css';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import Settings from '../../../views/Settings/Settings';

interface Props extends WithModalContext {
  client?: Client;
  onClose: () => void;
}

const handleClose = (modalProps) => (event, reason) => {
  if (reason !== 'backdropClick') {
    return;
  }
  modalProps.modalContext.hideModal();
};

const SettingsModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;
  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);

  return (
    <Dialog
      classes={{
        paper: classes.modal,
      }}
      maxWidth="md"
      open={true}
      aria-labelledby="place-modal"
      fullWidth={true}
      scroll="paper"
      onClose={handleClose(modalProps)}
      {...props}
    >
      <DialogTitle className={classes.dialogTitle}>Settings</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Settings />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <PlacezActionButton
          onClick={(e) => modalProps.modalContext.hideModal()}
        >
          Close
        </PlacezActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default withModalContext(SettingsModal);
