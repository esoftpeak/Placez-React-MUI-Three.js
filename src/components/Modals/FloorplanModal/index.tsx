import withModalContext, { WithModalContext } from '../withModalContext';
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dialog } from '@mui/material';
import { PlacezFixturePlan } from '../../../api';
import FloorplanForm from '../../Forms/FloorplanForm';
import formModalStyles from '../../Styles/FormModal.css';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import { CreateFloorPlan, UpdateFloorPlan } from '../../../reducers/floorPlans';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { defaultFloorplan } from '../../../blue/DefaultFloorplan';

interface Props extends WithModalContext {
  floorplan: PlacezFixturePlan;
}

const handleClose = (modalProps) => (event, reason) => {
  if (reason !== 'backdropClick') {
    return;
  }
  modalProps.modalContext.hideModal();
};

const FloorplanModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;
  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);

  const dispatch = useDispatch();

  const onSubmit = () => {
    const modifiedFloorplan = getValues();
    if (modifiedFloorplan.id !== undefined) {
      dispatch(UpdateFloorPlan(modifiedFloorplan));
    } else {
      (window as any).gtag('event', 'create_floorplan');
      const newFloorPlan = {
        ...defaultFloorplan,
        ...modifiedFloorplan,
        fixtures: [],
      };
      dispatch(CreateFloorPlan(newFloorPlan, 0));
    }
    modalProps.modalContext.hideModal();
  };

  const onSave = async () => {
    handleSubmit(onSubmit)();
  };

  const floorplanHookForm = useForm<PlacezFixturePlan>({
    mode: 'onSubmit',
    defaultValues: {
      ...modalProps.floorplan,
    },
  });

  const {
    handleSubmit,
    getValues,
    formState: { isValid, isDirty },
  } = floorplanHookForm;

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
        Floorplan Details
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <FloorplanForm hookForm={floorplanHookForm} />
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

export default withModalContext(FloorplanModal);
