import { Snackbar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Subscription } from 'rxjs';
import { ToastStateService } from './ToastStateService';
import { useEffect, useRef, useState } from 'react';

interface Props {}

const AppToast = (props: Props) => {
  const messageSubscription = useRef<Subscription>(null);
  const toastService = useRef<ToastStateService>(null);

  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(3000);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    toastService.current = ToastStateService.getInstance();
    messageSubscription.current = toastService.current.message$.subscribe(
      (toast) => {
        if (toast && toast.message !== '') {
          setMessage(toast.message);
          setDuration(toast.duration);
          setIsOpen(true);
        }
      }
    );
    return () => {
      messageSubscription.current.unsubscribe();
    };
  }, []);

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      open={isOpen}
      autoHideDuration={duration}
      onClose={() => setIsOpen(false)}
      ContentProps={{
        'aria-describedby': 'message-id',
      }}
      message={<span id="message-id">{message}</span>}
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          onClick={() => setIsOpen(false)}
        >
          <CloseIcon />
        </IconButton>,
      ]}
    />
  );
};

export default AppToast;
