import React from 'react';
import withModalContext, { WithModalContext } from '../withModalContext';

import { makeStyles, WithStyles, withStyles } from '@mui/styles';

import { Dialog, DialogTitle, Theme } from '@mui/material';
import AttendeeForm from './AttendeeForm';
import modalStyles from '../../Styles/modalStyles.css';
import formModalStyles from '../../Styles/FormModal.css'

interface Props extends WithModalContext, WithStyles<typeof modalStyles> {}

const GuestListModal = (modalProps: Props) => {
  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(modalProps);
  return (
    <Dialog
      classes={{
        paper: classes.modal,
      }}
      open={true}
      aria-labelledby="place-modal"
      maxWidth="lg"
      fullWidth={true}
      scroll="paper"
    >
      <DialogTitle className={classes.dialogTitle}>
        Guest List
      </DialogTitle>
      <AttendeeForm modalContext={modalProps.modalContext} />
    </Dialog>
  );
};

export default withModalContext(withStyles(modalStyles)(GuestListModal));
