import React, { useEffect, useState } from 'react';
import withModalContext, { WithModalContext } from '../withModalContext';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Theme,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dialog } from '@mui/material';
import SceneForm from '../../Forms/SceneForm';
import { PlacezLayoutPlan, Scene } from '../../../api/placez/models/index';
import formModalStyles from '../../Styles/FormModal.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  CopySceneWithLayouts,
  CreateScene,
  DeleteScene,
  UpdateScene,
} from '../../../reducers/scenes';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import { useForm } from 'react-hook-form';
import SubEventTemplates from '../../Tables/SubEventTemplates';
import { ReduxState } from '../../../reducers';
import { KeyboardArrowLeft } from '@mui/icons-material';
import SubEventFormV1 from '../../Forms/SubEventFormV1';
import { CreateLayout, GetTemplates } from '../../../reducers/layouts';
import { subDays } from 'date-fns';

interface Props extends WithModalContext {
  scene: Scene;
}

const handleClose = (modalProps) => (event, reason) => {
  if (reason !== 'backdropClick') {
    return;
  }
  modalProps.modalContext.hideModal();
};

const NumberedStepIcon = (props) => {
  const { active, completed, icon } = props;
  const theme = useTheme();
  const backgroundColor = active
    ? '#e0e0e0'
    : completed
      ? theme.palette.primary.main
      : '#fff';
  const color = completed ? '#fff' : '#000';
  const activeSize = 46;
  const inactiveSize = 36;
  const iconSize = active ? activeSize : inactiveSize;
  const verticalOffset = active ? 0 : activeSize - inactiveSize;
  const style = {
    width: iconSize,
    height: iconSize,
    borderRadius: '50%',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    backgroundColor,
    border: `2px solid ${theme.palette.primary.main}`,
    color,
    marginTop: verticalOffset,
  };

  return <div style={style}>{icon}</div>;
};

const customStyles = makeStyles<Theme>((theme) => ({
  stepper: {
    padding: 0,
    display: 'flex',
    alignItems: 'flex-end',
    flexGrow: 1,
    '& .MuiStepConnector-line': {
      borderColor: '#e0e0e0',
      borderTopWidth: 2,
      marginTop: 8,
    },
    '& .MuiStepConnector-root': {
      top: 18,
      left: 'calc(-50%)',
      right: 'calc(50%)',
    },
    '& .MuiStep-root': {
      padding: 0,
    },
    '& .MuiStepper-root': {
      padding: 0,
      display: 'flex',
      alignItems: 'flex-end',
    },
    '& .MuiStepLabel-label': {
      fontSize: '1rem',
      fontWeight: 500,
      // marginTop: 8,
      // '&.Mui-active': {
      //   color: '#a388bc'
      // }
    },
  },
  dialogTitle: {
    background: `${theme.palette.primary.main}33`,
    // color: theme.palette.primary.contrastText,
    // padding: theme.spacing(1),
    padding: '8px 24px !important',
    textAlign: 'center',
  },
  modal: {
    ...theme.PlacezBorderStyles,
    overflowY: 'initial',
    textAlign: 'center',
    margin: '20px',
    height: '860px',
    gap: '30px',
  },
  dialogContent: {
    padding: '0px !important',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '600px !important',
  },
  stepperSection: {
    width: '100%',
    mt: 2,
    display: 'flex',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 18,
    display: 'flex',
    padding: '5px',
    paddingLeft: '32px',
    alignItems: 'flex-end',
    width: '100%',
    backgroundColor: '#e9e8e8',
    color: '#5C236F',
    marginTop: '10px',
  },
  sectionSubTitle: {
    fontSize: 8,
    marginLeft: 1,
    color: '#aaa8a8',
    marginBottom: '3px',
  },
  formItem: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
}));

const steps = ['General', 'Sub-Events', 'Preview'];

const SceneModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;
  const styles = makeStyles<Theme>(formModalStyles);
  const custom = customStyles();
  const classes = {
    ...styles(props),
    ...custom,
  };
  const templates = useSelector((state: ReduxState) => state.layouts.templates);
  const isFetchingTemplates = useSelector(
    (state: ReduxState) => state.layouts.isFetchingTemplates
  );
  const savedScene = useSelector((state: ReduxState) =>
    state.scenes.scenes.find((scene) => scene.id === state.scenes.selectedId)
  );
  const [selectedTemplate, setSelectedTemplate] = useState<PlacezLayoutPlan>();
  const [isSubEventError, setIsSubEventError] = useState('');
  const [isVenueError, setIsVenueError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [selectedVenue, setSelectedVenue] = useState<{
    id: number;
    name: string;
    type: string;
  }>();
  const [activeType, setActiveType] = useState<string>('');
  const sceneHookForm = useForm<Scene>({
    mode: 'onSubmit',
    defaultValues: {
      ...modalProps.scene,
    },
  });

  const subEventHookForm = useForm<PlacezLayoutPlan>({
    mode: 'onSubmit',
    defaultValues: {
      name: '',
    },
  });

  const dispatch = useDispatch();
  useEffect(() => {
    if (templates.length === 0) dispatch(GetTemplates());
  }, []);

  useEffect(() => {
    if (savedScene) {
      handleSaveSubEvent(savedScene);
    }
  }, [savedScene]);

  const { handleSubmit, getValues } = sceneHookForm;

  const onSubmit = () => {
    const modifiedScene = {
      ...modalProps.scene,
      ...getValues(),
    };
    if (modifiedScene.id !== undefined) {
      dispatch(UpdateScene(modifiedScene));
    } else {
      dispatch(CreateScene(modifiedScene));
    }
    // modalProps.modalContext.hideModal();
  };

  const onNext = () => {
    next();
  };

  const next = () => {
    setActiveStep((prevState) => prevState + 1);
  };

  const back = () => {
    setActiveStep((prevState) => prevState - 1);
  };

  const onSave = async () => {
    // Trigger validations before submitting
    if (activeStep === 2) {
      handleSubmit(onSubmit)();
      return;
    } else if (activeStep === 0) {
      handleSubmit(onNext)();
      return;
    }

    const isValid = await sceneHookForm.trigger();

    if (isValid) {
      // if (activeStep === 0 && !selectedTemplate && templates.length) {
      //   setIsSubEventError('Please select a template');
      //   return;
      // } else {
      //   setIsSubEventError('');
      // }
      if (activeStep === 1 && !selectedVenue) {
        setIsVenueError('Please select a venue.');
        return;
      } else {
        setIsVenueError('');
      }
      next();
    }
  };

  const onEdit = async () => {
    handleSubmit(onSubmit)();
    modalProps.modalContext.hideModal();
  };

  const handleSaveSubEvent = (scene) => {
    const subEvent = subEventHookForm.getValues();
    let combineEvent = {
      ...subEvent,
      setupStyle: subEvent?.setupStyle,
      endUtcDateTime: subEvent?.endUtcDateTime || subDays(new Date(), 1),
      startUtcDateTime: subEvent?.startUtcDateTime || new Date(),
    };
    if (selectedTemplate) {
      combineEvent = {
        ...combineEvent,
        ...selectedTemplate,
      };
    }

    const modifiedLayoutWithSceneID: PlacezLayoutPlan = {
      ...combineEvent,
      sceneId: scene.id,
      isCloseModalAndNavigateToScene: () => {
        modalProps.modalContext.hideModal();
      },
    };
    if (selectedVenue) {
      modifiedLayoutWithSceneID.placeId = Number(selectedVenue.id);
      modifiedLayoutWithSceneID.type = selectedVenue.type;
      modifiedLayoutWithSceneID.venue = selectedVenue.name;
    }
    dispatch(CreateLayout(modifiedLayoutWithSceneID));
  };

  const onDelete = () => {
    dispatch(DeleteScene(modalProps.scene.id));
    modalProps.modalContext.hideModal();
  };
  const onCopy = () => {
    const modifiedScene = {
      ...modalProps.scene,
      ...getValues(),
    };
    dispatch(CopySceneWithLayouts(modifiedScene));
    modalProps.modalContext.hideModal();
  };

  const handleSubEventRowClick = (row: PlacezLayoutPlan) => {
    setSelectedTemplate(row);
    subEventHookForm.reset({
      ...row,
      startUtcDateTime: new Date(row?.startUtcDateTime),
      endUtcDateTime: new Date(row?.endUtcDateTime),
    });
  };

  const handleVenueRowClick = (row) => {
    setSelectedVenue(row);
  };

  return (
    <Dialog
      classes={{
        paper: classes.modal,
      }}
      scroll="paper"
      maxWidth="md"
      maxHeight="lg"
      open={true}
      aria-labelledby="place-modal"
      fullWidth={true}
      onClose={handleClose(modalProps)}
      {...props}
    >
      <DialogTitle className={classes.dialogTitle}>Event Wizard</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box className={classes.stepperSection}>
          <Box sx={{ mr: 2, width: '10%' }}>
            {activeStep !== 0 && (
              <Button
                onClick={back}
                disabled={activeStep === 0}
                className={classes.backButton}
                startIcon={<KeyboardArrowLeft />}
                variant="text"
              >
                Back
              </Button>
            )}
          </Box>
          <Box sx={{ width: '50%', marginLeft: '15%', mt: '5px' }}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              className={classes.stepper}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconComponent={NumberedStepIcon}
                  // onClick={() => setActiveStep(index)}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Box>

        {activeStep !== 1 && (
          <>
            <div className={classes.formItem}>
              {activeStep !== 1 && (
                <Box className={classes.sectionTitle}>Event Details</Box>
              )}
              <SceneForm
                // disabled={activeStep === 2 || activeStep === 0}
                disabled={activeStep === 2}
                hookForm={sceneHookForm}
              />
            </div>
            {isSubEventError && (
              <Box sx={{ color: 'red', fontSize: 12 }}>{isSubEventError}</Box>
            )}
            {activeStep === 0 && (
              <div className={classes.formItem}>
                <Box className={classes.sectionTitle}>
                  <Box component="span" fontSize={18}>
                    Sub-Event Templates
                  </Box>
                  <Box component="span" className={classes.sectionSubTitle}>
                    Optional
                  </Box>
                </Box>
                <SubEventTemplates
                  handleRowClick={handleSubEventRowClick}
                  selectedTemplate={selectedTemplate}
                  templates={templates}
                  isLoading={isFetchingTemplates}
                  onCreateNew={async () => {
                    const isValid = await sceneHookForm.trigger();
                    if (isValid) next();
                  }}
                />
              </div>
            )}
          </>
        )}
        {activeStep !== 0 && <Box className={classes.sectionTitle}>Sub-Event</Box>}
        {activeStep !== 0 && (
          <>
            <SubEventFormV1
              selectedVenue={selectedVenue}
              handleVenueRowClick={handleVenueRowClick}
              activeType={activeType}
              setActiveType={setActiveType}
              hookForm={subEventHookForm}
              activeStep={activeStep}
              isVenueError={isVenueError}
            />
          </>
        )}
        {activeStep === 2 && (
          <>
            <Box className={classes.sectionTitle}>Notes</Box>
            <Box padding={2} width={'93%'}>
              <TextField
                id="title"
                {...subEventHookForm.register('notes')}
                autoFocus
                placeholder="Enter your notes here..."
                rows={3}
                sx={{
                  width: '100%',
                }}
                type="text"
                multiline
              />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <PlacezActionButton onClick={(e) => modalProps.modalContext.hideModal()}>
          Cancel
        </PlacezActionButton>
        <Button
          sx={{ minWidth: '160px' }}
          variant="contained"
          disabled={isFetchingTemplates}
          onClick={onSave}
        >
          {activeStep === 2 ? 'Save' : 'Next'}
        </Button>
        {activeStep === 0 && modalProps.scene && (
          <Button
            sx={{ minWidth: '160px' }}
            variant="contained"
            disabled={isFetchingTemplates}
            onClick={onEdit}
          >
            {'Save'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default withModalContext(SceneModal);
