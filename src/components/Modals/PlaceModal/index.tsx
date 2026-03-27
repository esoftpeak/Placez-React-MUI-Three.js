import withModalContext, { WithModalContext } from '../withModalContext';
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dialog } from '@mui/material';
import { Place } from '../../../api';
import PlaceForm from '../../Forms/PlaceForm';
import formModalStyles from '../../Styles/FormModal.css';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import { useDispatch } from 'react-redux';
import { CreatePlace, UpdatePlace } from '../../../reducers/place';
import { useForm } from 'react-hook-form';
import { DefaultPlaceDetail } from '../../../api/placez/models/PlaceDetail';

interface Props extends WithModalContext {
  place: Place;
}

const handleClose = (modalProps) => (event, reason) => {
  if (reason !== 'backdropClick') {
    return;
  }
  modalProps.modalContext.hideModal();
};

const PlaceModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;
  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);
  const dispatch = useDispatch();

  const placeHookForm = useForm<Place>({
    mode: 'onSubmit',
    defaultValues: {
      ...DefaultPlaceDetail,
      ...modalProps.place,
    },
  });

  const {
    handleSubmit,
    formState: { errors, isValidating, isValid },
    getValues,
  } = placeHookForm;
  console.log(getValues());

  const onSubmit = () => {
    const modifiedPlace = getValues();
    if (modifiedPlace.id !== undefined) {
      dispatch(UpdatePlace(modifiedPlace));
    } else {
      dispatch(CreatePlace(modifiedPlace));
    }
    modalProps.modalContext.hideModal();
  };

  const onSave = async () => {
    // Trigger validations before submitting
    handleSubmit(onSubmit)();
  };

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
      <DialogTitle className={classes.dialogTitle}>Venue Details</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <PlaceForm hookForm={placeHookForm} />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <PlacezActionButton
          onClick={(e) => modalProps.modalContext.hideModal()}
        >
          Close
        </PlacezActionButton>
        <PlacezActionButton onClick={(e) => onSave()}>Save</PlacezActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default withModalContext(PlaceModal);
