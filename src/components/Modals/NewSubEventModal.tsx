import withModalContext, { WithModalContext } from './withModalContext';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
  Theme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dialog } from '@mui/material';
import { PlacezLayoutPlan } from '../../api';
import SubEventForm from '../Forms/SubEventForm';
import formModalStyles from '../Styles/FormModal.css';
import PlacezActionButton from '../PlacezUIComponents/PlacezActionButton';
import { CreateLayout } from '../../reducers/layouts';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import ChoseTemplate from '../Forms/ChoseTemplate';
import ChoseFloorplan from '../Forms/ChoseFloorplan';
import PlacezLargeButton from '../PlacezUIComponents/PlacezLargeButton';
import { useForm } from 'react-hook-form';

interface Props extends WithModalContext {
  sceneId: number;
}

const handleClose = (modalProps) => (event, reason) => {
  if (reason !== 'backdropClick') {
    return;
  }
  modalProps.modalContext.hideModal();
};

const defaultLayout: PlacezLayoutPlan = {
  name: '',
};

const NewSubEventModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;

  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);
  const dispatch = useDispatch();
  const [templateSelected, setTemplateSelected] = useState<PlacezLayoutPlan>();

  const steps = ['Create SubEvent', 'Use Template', 'Create New', 'Details'];

  const [activeStep, setActiveStep] = useState(0);

  const subEventHookForm = useForm<PlacezLayoutPlan>({
    mode: 'onSubmit',
    defaultValues: {
      hideInInvoice: false,
      startUtcDateTime: new Date(),
      endUtcDateTime: new Date(),
      ...props.layout,
    },
  });

  const { getValues, reset, handleSubmit } = subEventHookForm;

  const onSubmit = () => {
    const modifiedLayoutWithSceneID: PlacezLayoutPlan= {
      ...getValues(),
      startUtcDateTime: getValues('startUtcDateTime') ?? new Date(),
      endUtcDateTime: getValues('endUtcDateTime') ?? new Date(),
      sceneId: modalProps.sceneId,
      id: undefined,
      hideInInvoice: false,
    };
    console.log('modifiedLayoutWithSceneID', modifiedLayoutWithSceneID);
    dispatch(CreateLayout(modifiedLayoutWithSceneID));
    modalProps.modalContext.hideModal();
  };

  const onSave = () => {
    handleSubmit(onSubmit)();
  };

  const renderStepActions = (steps) => {
    switch (activeStep) {
      case 0: // First step
        return (
          <PlacezActionButton
            onClick={(e) => modalProps.modalContext.hideModal()}
          >
            Cancel
          </PlacezActionButton>
        );
      case 1: // Template Step
      case 2: // Create New Step
        return (
          <>
            <PlacezActionButton
              onClick={() => setActiveStep(0)}
              className={classes.backButton}
            >
              Back
            </PlacezActionButton>
            <PlacezActionButton
              disabled={getValues('floorPlanId') === undefined}
              onClick={() => setActiveStep(3)}
            >
              Next
            </PlacezActionButton>
          </>
        );
      case 3: // Last step
        return (
          <>
            <PlacezActionButton
              onClick={() => setActiveStep(0)}
              className={classes.backButton}
            >
              Back
            </PlacezActionButton>
            <PlacezActionButton
              onClick={(e) => modalProps.modalContext.hideModal()}
            >
              Cancel
            </PlacezActionButton>
            <PlacezActionButton onClick={(e) => onSave()}>
              Save
            </PlacezActionButton>
          </>
        );
      default:
        // Assuming you want to render Cancel at every step, but different logic could be applied
        return (
          <Button
            onClick={(e) => modalProps.modalContext.hideModal()}
            className={classes.dialogActionsButton}
          >
            Cancel
          </Button>
        );
    }
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
      <DialogTitle className={classes.dialogTitle}>New SubEvent</DialogTitle>
      <DialogContent
        className={classes.dialogContent}
        style={{ height: '600px' }}
      >
        <Stepper activeStep={activeStep} className={classes.stepper}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: {
              optional?: React.ReactNode;
            } = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === 0 && (
          <div>
            <PlacezLargeButton onClick={() => setActiveStep(1)}>
              Use Template
            </PlacezLargeButton>
            <PlacezLargeButton
              variant="outlined"
              onClick={() => {
                reset(defaultLayout);
                setActiveStep(2);
              }}
            >
              Create New
            </PlacezLargeButton>
          </div>
        )}
        {activeStep === 1 && (
          <ChoseTemplate
            layout={getValues()}
            onChange={(layout: PlacezLayoutPlan) => {
              setTemplateSelected(layout);
              reset(layout);
            }}
            selected={templateSelected}
          />
        )}
        {activeStep === 2 && (
          <ChoseFloorplan
            layout={getValues()}
            onChange={(layout) => reset(layout)}
          />
        )}
        {activeStep === 3 && <SubEventForm hookForm={subEventHookForm} />}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        {renderStepActions(steps)}
      </DialogActions>
    </Dialog>
  );
};

export default withModalContext(NewSubEventModal);
