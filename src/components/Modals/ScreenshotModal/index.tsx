import { Dialog } from '@mui/material';
import ScreenshotOptions from './ScreenshotOptions';
import { SimpleModalProps } from '../SimpleModal';

const ScreenshotModal = (modalProps: SimpleModalProps) => {
  return (
    <Dialog
      open={modalProps.open}
      maxWidth="md"
      keepMounted
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <ScreenshotOptions hideModal={() => modalProps.setOpen(false)} />
    </Dialog>
  );
};

export default ScreenshotModal;
