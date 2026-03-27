import React from 'react';
import withModalContext, { WithModalContext } from '../withModalContext';
import { Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Dialog } from '@mui/material';
import ModelForm from './ModelForm';
import { Sku } from '../../../api/';

interface Props extends WithModalContext {
  item: Sku;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    modal: {
      ...theme.PlacezBorderStyles,
      overflowY: 'initial',
    },
  })
);

const ModelModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;
  const classes = styles(props);
  return (
    <Dialog
      classes={{
        paper: classes.modal,
      }}
      open={true}
      aria-labelledby="place-modal"
      fullWidth={true}
      scroll="paper"
      {...props}
    >
      <ModelForm
        item={modalProps.item}
        modalContext={modalProps.modalContext}
      />
    </Dialog>
  );
};

export default withModalContext(ModelModal);
