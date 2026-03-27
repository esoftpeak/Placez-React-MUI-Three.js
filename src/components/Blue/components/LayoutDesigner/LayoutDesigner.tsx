import { useDispatch, useSelector } from 'react-redux';

import DesignerView from '../DesignerView';
import { blobToFile } from '../../../../sharing/utils/blobToFile';

import { Collapse, Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { HandlesFromBlue } from '../../models';
import { ChatPanel } from '../panels';
import { ViewState, GlobalViewState } from '../../../../models/GlobalState';
import { ReduxState } from '../../../../reducers';
import { ExportDesignComplete } from '../../../../reducers/designer';
import LayoutPanels from '../panels/LayoutPanels';
import DesignerOverlay from '../Designer/DesignerOverlay';
import DesignerHeader from '../Designer/DesignerHeader';
import { useEffect, useState } from 'react';
import { layoutConstants } from '../../../../Constants/layout';
import { useParams } from 'react-router';
import { getCurrentScene, SelectScene } from '../../../../reducers/scenes';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      height: `calc(100vh - ${layoutConstants.appBarHeight}px) !important`,
    },
    headerContainer: {
      width: '100%',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.paper,
      minHeight: '48px',
    },
    designerContainer: {
      flex: '1 0',
      display: 'flex',
      minHeight: 0,
      alignItems: 'stretch',
    },
    designerViewContainer: {
      position: 'relative',
      flex: '1 0',
    },
    designerViewLayer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: 1,
    },
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
      justifyContent: 'end',
    },
    chatpanel: {
      width: layoutConstants.chatWidth,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
    },
    displayNone: {
      display: 'none',
    },
    headerTiles: {
      overflowX: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRight: '5px solid red',
    },
    showPanelButton: {
      position: 'absolute',
      right: 0,
      margin: 0,
      padding: 0,
      minWidth: 'auto',
      justifyContent: 'flex-end',
      background: '#0e0e0e3d',
    },
    collapse: {
      width: `${layoutConstants.panelWidth}px`,
      height: `calc(100vh - ${layoutConstants.appBarHeight}px - ${layoutConstants.designerHeaderHeight}) !important`,
      '& .MuiCollapse-wrapperInner': {
        top: '104px',
        bottom: '0px',
        display: 'flex !important',
        flexDirection: 'column',
        height: `calc(100vh - ${layoutConstants.appBarHeight}px - ${layoutConstants.designerHeaderHeight}) !important`,
        width: `${layoutConstants.panelWidth}px`,
      },
    },
  })
);

interface Props {
  designerCallbacks: HandlesFromBlue;
}

const LayoutDesigner = (props: Props) => {
  const dispatch = useDispatch();

  //if refresh on designer page
  const { id, planId } = useParams();
  const scene = useSelector(getCurrentScene);
  useEffect(() => {
    const numericId = parseInt(id);
    if (scene?.id !== numericId) {
      dispatch(SelectScene(numericId));
    }
  }, [id, scene?.id, dispatch]);

  const classes = styles(props);

  const chatPanelState = useSelector(
    (state: ReduxState) => state.chat.chatPanelState
  );
  const saveBarState = useSelector(
    (state: ReduxState) => state.globalstate.saveBarState
  );
  const viewState = useSelector(
    (state: ReduxState) => state.globalstate.viewState
  );
  const globalViewState = useSelector(
    (state: ReduxState) => state.globalstate.globalViewState
  );

  const isFloorPlan =
    globalViewState === GlobalViewState.Fixtures &&
    viewState === ViewState.Floorplan;

  const { designerCallbacks } = props;

  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => {
    setFullScreen(false);
  }, []);

  return (
    <div className={classes.root}>
      <div className={classes.headerContainer}>
        <DesignerHeader
          inventory={() => designerCallbacks.getInventory()}
          onScreenshot={() => designerCallbacks.onScreenshot()}
          isFloorPlan={isFloorPlan}
          // TODO Change to redux call passed in
          generateAR={() =>
            designerCallbacks.onExport((blob: Blob) => {
              dispatch(ExportDesignComplete(blobToFile(blob, 'export.gltf')));
            })
          }
        />
      </div>
      <div className={classes.designerContainer}>
        <div className={classes.designerViewContainer}>
          <div className={classes.designerViewLayer}>
            <DesignerView
              showFloorplan={isFloorPlan}
              designerCallbacks={designerCallbacks}
            />
          </div>
          <DesignerOverlay
            globalState={GlobalViewState.Layout}
            setFullScreen={setFullScreen}
            fullScreen={fullScreen}
            designerCallbacks={designerCallbacks}
          />
        </div>
        {viewState !== ViewState.Floorplan && (
          <Collapse
            orientation="horizontal"
            className={classes.collapse}
            in={!fullScreen}
          >
            <LayoutPanels
              setFullScreen={setFullScreen}
              designerCallbacks={designerCallbacks}
            />
          </Collapse>
        )}
        {chatPanelState && (
          <div className={classes.chatpanel}>
            <ChatPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default LayoutDesigner;
