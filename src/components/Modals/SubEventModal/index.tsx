import withModalContext, { WithModalContext } from '../withModalContext';
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dialog } from '@mui/material';
import { PlacezLayoutPlan } from '../../../api';
import SubEventForm from '../../Forms/SubEventForm';
import formModalStyles from '../../Styles/FormModal.css';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import { CreateLayout, UpdateLayout } from '../../../reducers/layouts';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import AssetModifierHelper from '../../../blue/itemModifiers/AssetModifierHelper';

interface Props extends WithModalContext {
  layout: PlacezLayoutPlan;
}

const handleClose = (modalProps) => (event, reason) => {
  if (reason !== 'backdropClick') {
    return;
  }
  modalProps.modalContext.hideModal();
};

const SubEventModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;

  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);
  const dispatch = useDispatch();

  const subEventHookForm = useForm<PlacezLayoutPlan>({
    mode: 'onSubmit',
    defaultValues: {
      startUtcDateTime: new Date(),
      endUtcDateTime: new Date(),
      ...props.layout,
    },
  });

  const {
    register,
    control,
    formState: { errors, isValid, isDirty },
    getValues,
    setValue,
    reset,
    handleSubmit,
  } = subEventHookForm;

  const onSubmit = () => {
    const modifiedLayout = getValues();
    if (modifiedLayout.id !== undefined) {
      dispatch(UpdateLayout(modifiedLayout));
    } else {
      dispatch(CreateLayout(modifiedLayout));
    }
    modalProps.modalContext.hideModal();
  };

  const onSave = () => {
    handleSubmit(onSubmit)();
  };

  const EmptyGuid = '00000000-0000-0000-0000-000000000000';

  const resetIdsForLayout = (layout: PlacezLayoutPlan): PlacezLayoutPlan => {
    return {
      ...layout,
      id: EmptyGuid,
      cameraState: layout.cameraState
        ? {
            ...layout.cameraState,
            id: 0,
            layoutId: null,
            orthographicState: layout.cameraState.orthographicState
              ? {
                  ...layout.cameraState.orthographicState,
                  id: 0,
                  cameraStateId: 0,
                }
              : undefined,
            perspectiveState: layout.cameraState.perspectiveState
              ? {
                  ...layout.cameraState.perspectiveState,
                  id: 0,
                  cameraStateId: 0,
                }
              : undefined,
          }
        : undefined,
      items: layout.items?.map((item) => ({
        ...item,
        id: 0,
        layoutId: null,
        modifiers: AssetModifierHelper.clearAllModifierFields(item.modifiers),
        materialMask: item.materialMask?.map((material) =>
          material
            ? {
                ...material,
                id: EmptyGuid,
                mediaAssetId: null,
                placedAssetId: null,
                organizationId: null,
              }
            : null
        ),
      })),
      layoutLabels: layout.layoutLabels?.map((layoutLabels) => ({
        ...layoutLabels,
        id: EmptyGuid,
        layoutId: null,
      })),
      dimensions: layout.dimensions?.map((dimensions) => ({
        ...dimensions,
        id: 0,
        layoutId: null,
      })),
      invoiceLineItems: layout.invoiceLineItems?.map((invoiceLineItems) => ({
        ...invoiceLineItems,
        id: 0,
        layoutId: null,
      })),
    };
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
      <DialogTitle className={classes.dialogTitle}>
        SubEvent Details
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <SubEventForm hookForm={subEventHookForm} />
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
