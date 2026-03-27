import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  createStyles,
  Theme,
  IconButton,
  Typography,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import {
  Print as PrintIcon,
  Share as ShareIcon,
  PhotoCameraRounded as ScreenshotIcon,
} from '@mui/icons-material';

// Loading
import { LoadingProgressService } from '../../../../blue/model/loading_progress';
import { Subscription } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';

import { ReduxState } from '../../../../reducers';
import { guestRole, userIsInRole } from '../../../../sharing/utils/userHelpers';
import { SimpleModal } from '../../../Modals/SimpleModal';
import ShareModal from '../../../Modals/ShareModal/ShareModal';
import PrintModal from '../../../Modals/PrintModal';
import { countTablesAndChairs } from '../../../../blue/model/scene';
import ScreenshotModal from '../../../Modals/ScreenshotModal';
import CameraLayerPopover from '../select/CameraLayerPopover';
import { UndoRedo } from '../bars';
import CameraTypeSelect from '../select/CameraTypeSelect';
import BlackWhiteShaderToggle from '../utility/BlackWhiteShaderToggle';
import { layoutConstants } from '../../../../Constants/layout';
import { getCurrentScene } from '../../../../reducers/scenes';
import { LicenseType } from '../../../../reducers/globalState';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontSize: 10,
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.secondary.main,
      minHeight: '48px',
    },
    container: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      height: `${layoutConstants.designerHeaderHeight}px) !important`,
      width: '100%',
    },
    header: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flex: 1,
    },
    buttons: {
      // width: PanelWidth,
      width: '160px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    sceneInfo: {
      // color: theme.palette.text.primary,
      display: 'flex',
      flex: 2,
      paddingLeft: 5,
      fontSize: 14,
    },

    plan: {
      display: 'flex',
      flex: 2,
      fontWeight: 'bold',
      paddingLeft: 5,
      fontSize: 14,
      position: 'relative',
    },
    button: {
      margin: '5px',
      width: '100%',
      borderColor: 'purple',
    },
    field: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      minWidth: 120,
    },
    guestLabel: {
      paddingRight: 5,
      fontSize: 14,
    },
    textField: {
      margin: '4px 0px',
      width: '40px',
      background: theme.palette.background.paper,
      '& input': {
        padding: '6px',
      },
    },
    layoutTitleInput: {
      position: 'absolute',
      top: '40px',
      padding: '5px',
      width: '300px',
      display: 'grid',
      gridTemplateColumns: '10fr 1fr 1fr',
    },
    layoutTitleInputField: {
      background: theme.palette.background.paper,
      border: '1px white',
    },
    dropDown: {
      padding: 0,
    },
    iconButton: {
      padding: 4,
      color: theme.palette.text.primary,
    },
    iconSaveTitle: {
      padding: 2,
      color:
        theme.palette.mode === 'light'
          ? theme.palette.primary.main
          : theme.palette.common.white,
      margin: `0px ${theme.spacing(2)}`,
      alignSelf: 'center',
      cursor: 'pointer',
    },
    iconCancelTitle: {
      padding: 2,
      color: theme.palette.error.main,
      margin: `0px ${theme.spacing(2)}`,
      alignSelf: 'center',
      cursor: 'pointer',
    },
    iconData: {
      alignSelf: 'flex-start',
      fontSize: '11px',
      marginLeft: '-6px',
      borderRadius: '50%',
      padding: 1,
    },
    loadingBarWrapper: {
      minHeight: '6px',
      background: theme.palette.background.paper,
    },
  })
);

interface Props {
  inventory?: any;
  generateAR?: () => void;
  onScreenshot?: any;
  isFloorPlan: boolean;
}

const DesignerHeader = (props: Props) => {
  const dispatch = useDispatch();

  const guest = useSelector((state: ReduxState) =>
    userIsInRole(state.oidc.user, guestRole)
  );
  const layoutLoading = useSelector(
    (state: ReduxState) => state.blue.layoutLoading
  );
  const chairs = useSelector((state: ReduxState) => state.blue.stats.chairs);
  const tables = useSelector((state: ReduxState) => state.blue.stats.tables);
  const price = useSelector((state: ReduxState) => state.blue.stats.price);
  const scene = useSelector(getCurrentScene);
  const selectedItems = useSelector(
    (state: ReduxState) => state.blue.selectedItems
  );

  const [selectedChairs, setSelectedChairs] = useState<number>(0);
  const [selectedTables, setSelectedTables] = useState<number>(0);

  const license = useSelector(
    (state: ReduxState) => state.globalstate.licenseState
  );

  useEffect(() => {
    if (selectedItems.length < 1) {
      setSelectedChairs(0);
      setSelectedTables(0);
    } else {
      const tablesAndChairs = countTablesAndChairs(selectedItems);
      setSelectedChairs(tablesAndChairs.chairs);
      setSelectedTables(tablesAndChairs.tables);
    }
  }, [selectedItems]);

  let progressSubscription: Subscription;
  let isLoadingSubscription: Subscription;

  const loadingProgressService = LoadingProgressService.getInstance();

  const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const blueReady = useSelector(
    (state: ReduxState) => state.blue.blueInitialized
  );

  const subscribe = () => {
    progressSubscription = loadingProgressService.progress$
      .pipe(withLatestFrom(loadingProgressService.simpleProgress$))
      .subscribe(([progress, simpleProgress]: [number, number]) => {
        if (simpleProgress) {
          setProgress(simpleProgress);
        } else {
          setProgress(progress);
        }
      });

    isLoadingSubscription = loadingProgressService.isLoading$
      .pipe(withLatestFrom(loadingProgressService.isLoadingSimple$))
      .subscribe(([isLoading, isLoadingSimple]: [boolean, boolean]) => {
        // this.setState({ isLoading: isLoading || isLoadingSimple });
        setIsLoading(isLoading);
      });
    return () => {
      progressSubscription?.unsubscribe();
      isLoadingSubscription?.unsubscribe();
    };
  };

  useEffect(() => {
    // subscribe();
  }, []);

  const formatDate = (dateStr: Date): string => {
    if (!dateStr) {
      return '';
    }
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };

    return date.toLocaleDateString('en-US', options);
  };

  const classes = styles(props);
  const layout = useSelector((state: ReduxState) => state.designer.layout);

  return (
    <div className={classes.root}>
      {blueReady && (
        <div className={classes.container}>
          <div className={classes.header}>
            <UndoRedo />
            <Typography variant="h6" color="primary">
              {layout?.name}
            </Typography>
            {layout && selectedItems.length > 0 && (
              <div className={classes.field}>
                {selectedItems.length > 0 && (
                  <Typography className={classes.guestLabel}>
                    Selected:{' '}
                  </Typography>
                )}
                {scene?.estimatedGuestCount > 0 && (
                  <Typography className={classes.guestLabel}>
                    Guests {scene.estimatedGuestCount}
                  </Typography>
                )}
                <Typography className={classes.guestLabel}>
                  Tables {selectedItems.length > 0 ? selectedTables : tables}
                </Typography>
                <Typography
                  className={classes.guestLabel}
                  style={
                    chairs > (scene ? scene.estimatedGuestCount : 0)
                      ? {
                          color: 'red',
                        }
                      : {}
                  }
                >
                  Chairs {selectedItems.length > 0 ? selectedChairs : chairs}
                </Typography>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '48px',
              }}
            >
              {!props.isFloorPlan &&
                (license === LicenseType.PlacezPlus ||
                  license === LicenseType.PlacezPro) && <CameraTypeSelect />}
              {!props.isFloorPlan && <CameraLayerPopover />}
            </div>
          </div>
          <div className={classes.buttons}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {!props.isFloorPlan && <BlackWhiteShaderToggle />}
              {!props.isFloorPlan && (
                <SimpleModal>
                  <IconButton>
                    <ScreenshotIcon className={classes.icon} />
                  </IconButton>
                  <ScreenshotModal />
                </SimpleModal>
              )}
              {!guest && layout && (
                <SimpleModal>
                  <IconButton
                    disabled={layoutLoading}
                    className={classes.iconButton}
                  >
                    <Tooltip title="Share Layout">
                      <ShareIcon />
                    </Tooltip>
                  </IconButton>
                  <ShareModal
                    title={layout.name}
                    layoutId={layout.id}
                    generateAR={props.generateAR}
                  />
                </SimpleModal>
              )}
              {!guest &&
                layout &&
                props.onScreenshot &&
                typeof props.inventory === 'function' && (
                  <SimpleModal>
                    <IconButton
                      disabled={layoutLoading}
                      className={classes.iconButton}
                    >
                      <Tooltip title="Print Layout">
                        <PrintIcon />
                      </Tooltip>
                    </IconButton>
                    <PrintModal
                      layout={layout}
                      scene={scene}
                      getInventory={props.inventory}
                      onScreenshot={props.onScreenshot}
                    />
                  </SimpleModal>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerHeader;
