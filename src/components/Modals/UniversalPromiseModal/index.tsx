import { useState } from 'react';
import withModalContext, { WithModalContext } from '../withModalContext';

import { Theme } from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
} from '@mui/material';
interface Props extends WithModalContext {
  onContinue: Function;
  modalHeader: string;
  modalBody: any;
  okButtonLabel?: string;
  cancelButtonLabel?: string;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    spinner: {
      position: 'absolute',
      top: '50px',
      left: '45%',
    },
  })
);

const UniversalPromiseModal = (props: Props) => {
  const [showSpinner, setShowSpinner] = useState(false);

  const handleContinue = (event) => {
    event.preventDefault();
    setShowSpinner(true);
    props
      .onContinue()
      .then((response) => console.log(response))
      .catch((error) => console.log(error))
      .finally(() => hideModal());
  };

  const handleCancel = (event) => {
    event.preventDefault();
    hideModal();
  };

  const hideModal = () => {
    setShowSpinner(false);

    props.modalContext.hideModal();
  };

  const { modalHeader, modalBody, okButtonLabel, cancelButtonLabel } = props;
  const classes = styles(props);

  return (
    <Dialog
      open={true}
      keepMounted
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle id="alert-dialog-slide-title">{modalHeader}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {modalBody}
        </DialogContentText>
      </DialogContent>
      {showSpinner && <CircularProgress className={classes.spinner} />}
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          {cancelButtonLabel || 'Cancel'}
        </Button>
        <Button onClick={handleContinue} color="primary">
          {okButtonLabel || 'OK'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withModalContext(UniversalPromiseModal);
