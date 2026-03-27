import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { cloneElement, PropsWithChildren, useState } from 'react';
import modalStyles from '../Styles/modalStyles.css';
import PlacezActionButton from '../PlacezUIComponents/PlacezActionButton';

interface Props {
  modalHeader: string;
  onContinue?: Function;
  onDelete?: Function;
  disabled?: boolean;
}

export const UniversalModalWrapper = (props: PropsWithChildren<Props>) => {
  const styles = makeStyles<Theme>(modalStyles);
  const [open, setOpen] = useState(false);
  const { modalHeader, onContinue, onDelete } = props;
  const classes = styles(props);
  return (
    <>
      {cloneElement(props.children[0], { onClick: (e) => setOpen(true) })}
      <Dialog
        open={open}
        keepMounted
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        {/* <DialogTitle className={classes.dialogTitle} id="alert-dialog-slide-title">{modalHeader}</DialogTitle> */}
        <DialogTitle
          id="alert-dialog-slide-title"
          style={{textAlign:'center'}}>
          {modalHeader}
        </DialogTitle>
        <DialogContent
          style={{textAlign:'center'}}>
          {props.children[1]}
        </DialogContent>
        {/* <DialogActions className={classes.actions}> */}
        <DialogActions>
          {onDelete && (
            <PlacezActionButton
              color="error"
              onClick={(e) => {
                setOpen(false);
                onDelete();
              }}
            >
              Delete
            </PlacezActionButton>
          )}
          <PlacezActionButton
            onClick={(e) => {
              if (!props.disabled) setOpen(false);
            }}
          >
            Cancel
          </PlacezActionButton>
          {onContinue && (
            <PlacezActionButton
              onClick={(e) => {
                setOpen(false);
                onContinue();
              }}
              color="primary"
            >
              Continue
            </PlacezActionButton>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
