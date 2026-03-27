import withModalContext, { WithModalContext } from '../withModalContext';
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
  Tooltip,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Dialog } from '@mui/material';
import { Attendee } from '../../../api';
import formModalStyles from '../../Styles/FormModal.css';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';


import { useDispatch } from 'react-redux';
import { UniversalModalWrapper } from '../UniversalModalWrapper';
import { AreYouSureDelete } from '../UniversalModal';
import { useForm } from 'react-hook-form';
import { CreateAttendee, DeleteAttendee, UpdateAttendee } from '../../../reducers/attendee'
import AttendeeForm from '../../Forms/AttendeeForm'

interface Props extends WithModalContext {
  attendee: Attendee;
}

const handleClose = (modalProps) => (event, reason) => {
  if (reason !== 'backdropClick') {
    return;
  }
  modalProps.modalContext.hideModal();
};

const customStyles = makeStyles<Theme>((theme: Theme) => createStyles({
  dialogContent: {
    padding: '0px !important',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // height: '600px !important'
  },
}));

const AttendeeModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;
  const styles = makeStyles<Theme>(formModalStyles);
  const customClasses = customStyles(props);
  const classes = {
    ...styles(props),
    ...customClasses
  };

  const dispatch = useDispatch();

  const onSubmit = () => {
    const modifiedAttendee = getValues();
    if (modifiedAttendee.id !== undefined) {
      dispatch(UpdateAttendee(modifiedAttendee));
    } else {
      dispatch(CreateAttendee(modifiedAttendee));
    }
    modalProps.modalContext.hideModal();
  };

  const onSave = async () => {
    console.log(getValues());
    handleSubmit(onSubmit)();
  };

  const onCopy = (attendee) => {
    const attendeeCopy = {
      ...attendee,
      lastName: `${attendee.lastName} - Copy`,
    };
    attendeeCopy.id = null;
    dispatch(CreateAttendee(attendeeCopy));
    modalProps.modalContext.hideModal();
  };

  const onDelete = () => {
    dispatch(DeleteAttendee(modalProps.attendee));
    modalProps.modalContext.hideModal();
  };

  const attendeeHookForm = useForm<Attendee>({
    mode: 'onSubmit',
    defaultValues: {
      ...modalProps.attendee,
    },
  });

  const { handleSubmit, getValues, formState: {isValid, isDirty} } = attendeeHookForm;

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
        Attendee
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <AttendeeForm hookForm={attendeeHookForm} />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        {getValues('id') && (
          <UniversalModalWrapper
            onDelete={() => onDelete()}
            modalHeader="Are you sure?"
          >
            <Tooltip title="Delete Floorplan">
              <PlacezActionButton color="error" style={{ marginRight: '10px' }}>
                Delete
              </PlacezActionButton>
            </Tooltip>
            {AreYouSureDelete('a Floorplan')}
          </UniversalModalWrapper>
        )}
        <PlacezActionButton
          onClick={(e) => modalProps.modalContext.hideModal()}
        >
          Cancel
        </PlacezActionButton>
        {getValues('id') &&
          <PlacezActionButton
            onClick={(e) => onCopy(getValues())}
            disabled={isDirty || !isValid}
          >
            Clone
          </PlacezActionButton>
        }
        <PlacezActionButton onClick={(e) => onSave()}>Save</PlacezActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default withModalContext(AttendeeModal);
