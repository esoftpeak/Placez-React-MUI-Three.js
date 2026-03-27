import { useSelector } from 'react-redux';

import { IconButton, Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { HandlesFromBlue, ControlsType } from '../../models';
import { DesignerBottomBar, FPVBar } from '../bars';
import { ViewState, GlobalViewState } from '../../../../models/GlobalState';
import { ReduxState } from '../../../../reducers';
import FloorPlanUI from '../PlaceDesigner/PlaceDesignerView/FloorPlanUI';
import {
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
} from '@mui/icons-material';
import TogglePhotosphereBar from '../bars/TogglePhotosphereBar';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    overlayContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      pointerEvents: 'none',
      // '& > *': {
      //   pointerEvents: 'auto',
      // },
    },
    middleUI: {
      pointerEvents: 'none',
      '& > *': {
        pointerEvents: 'auto',
      },
      display: 'flex',
      flex: 1,
      justifyContent: 'end',
    },
    upperUI: {
      height: '60px',
      pointerEvents: 'none',
      '& > *': {
        pointerEvents: 'auto',
      },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  })
);

interface Props {
  designerCallbacks: HandlesFromBlue;
  globalState: GlobalViewState;
  setFullScreen: (fullScreen: boolean) => void;
  fullScreen: boolean;
}

const DesignerOverlay = (props: Props) => {
  const classes = styles(props);

  const blueControlsType = useSelector(
    (state: ReduxState) => state.blue.controlsType
  );
  const blueReady = useSelector(
    (state: ReduxState) => state.blue.blueInitialized
  );
  const viewState = useSelector(
    (state: ReduxState) => state.globalstate.viewState
  );
  const globalViewState = useSelector(
    (state: ReduxState) => state.globalstate.globalViewState
  );

  const isFloorPlan = (): boolean => {
    return (
      globalViewState === GlobalViewState.Fixtures &&
      viewState === ViewState.Floorplan
    );
  };

  const { designerCallbacks } = props;

  return (
    <div className={classes.overlayContainer}>
      <div className={classes.upperUI}>
        {viewState === ViewState.PhotosphereEdit && <TogglePhotosphereBar />}
        <div></div>
        {!isFloorPlan() && viewState === ViewState.PhotosphereView && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignContent: 'center',
              width: '60px',
              padding: '10px',
            }}
          >
            {!props.fullScreen && (
              <IconButton onClick={() => props.setFullScreen(true)}>
                <KeyboardDoubleArrowRight />
              </IconButton>
            )}
            {props.fullScreen && (
              <IconButton onClick={() => props.setFullScreen(false)}>
                <KeyboardDoubleArrowLeft />
              </IconButton>
            )}
          </div>
        )}
      </div>
      <div className={classes.middleUI}>
        {isFloorPlan() && <FloorPlanUI designerCallbacks={designerCallbacks} />}
      </div>
      {blueReady &&
        blueControlsType !== ControlsType.Photosphere &&
        blueControlsType !== ControlsType.PointerLock && (
          <DesignerBottomBar
            // fullScreen={fullScreen && !chatPanelState}
            globalState={props.globalState}
          />
        )}
      {blueControlsType === ControlsType.PointerLock && (
        <FPVBar
          onRotate={designerCallbacks.rotatePointerLockCamera}
          onMove={designerCallbacks.movePointerLockCamera}
        />
      )}
    </div>
  );
};

export default DesignerOverlay;
