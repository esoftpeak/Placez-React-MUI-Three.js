import withModalContext, { WithModalContext } from './withModalContext';
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dialog } from '@mui/material';
import { PlacezLayoutPlan } from '../../api';
import formModalStyles from '../Styles/FormModal.css';
import PlacezActionButton from '../PlacezUIComponents/PlacezActionButton';
import { Children, ReactElement, cloneElement, useState } from 'react';

interface Props extends WithModalContext {
  placezObject: any;
  layout: PlacezLayoutPlan;
  onCreate: (any) => void;
  onUpdate: (any) => void;
  title: string;
  children?: React.ReactNode;
}

const handleClose = (modalProps) => (event, reason) => {
  console.log('reason', reason);
  if (reason !== 'backdropClick') {
    return;
  }
  modalProps.modalContext.hideModal();
};

const SubEventModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;

  const [modifiedObject, setModifiedObject] =
    useState<PlacezLayoutPlan>(undefined);
  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);

  const onSave = () => {
    if (modifiedObject.id !== undefined) {
      modalProps.onUpdate(modifiedObject);
    } else {
      modalProps.onCreate(modifiedObject);
    }
    modalProps.modalContext.hideModal();
  };

  const enhancedChildren = Children.map(modalProps.children, (child) => {
    // Here you can add or override props that you want to pass to the children
    return cloneElement(child as ReactElement, {
      onChange: setModifiedObject, // Example prop
      // Add any other props you need to pass to each child
    });
  });

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
      <DialogTitle className={classes.dialogTitle}>
        {modalProps.title}
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {enhancedChildren}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <PlacezActionButton
          onClick={(e) => modalProps.modalContext.hideModal()}
        >
          Cancel
        </PlacezActionButton>
        <PlacezActionButton onClick={(e) => onSave()}>Save</PlacezActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default withModalContext(SubEventModal);
