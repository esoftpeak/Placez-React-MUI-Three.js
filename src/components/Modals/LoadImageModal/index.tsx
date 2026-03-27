import withModalContext, { WithModalContext } from '../withModalContext';

import { Theme } from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

import { Dialog } from '@mui/material';
import ImageForm from './ImageForm';

interface Props extends WithModalContext {
  handleSetImage: (imageUrl: string, name?: string) => void;
  setName?: boolean;
  imageLabel: string;
  currentImage: string;
  imageTypes?: string;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    modal: {
      borderRadius: theme.shape.borderRadius,
    },
  })
);

const LoadImageModal = (modalProps: Props) => {
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
      maxWidth="md"
      scroll="paper"
      {...props}
    >
      <ImageForm
        imageLabel={props.imageLabel}
        setAName={props?.setName}
        handleSetImage={props.handleSetImage}
        onClose={modalProps.modalContext.hideModal}
        currentImage={modalProps.currentImage}
        imageTypes={modalProps.imageTypes}
      />
    </Dialog>
  );
};

export default withModalContext(LoadImageModal);
