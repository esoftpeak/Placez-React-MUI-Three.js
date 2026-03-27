import { useDispatch, useSelector } from 'react-redux';
import { HandlesFromBlue } from '../../models';
import { useEffect } from 'react';
import { ReduxState } from '../../../../reducers';
import { ViewState, ToolState } from '../../../../models/GlobalState';
import EditItemPanel from './EditItemPanel/EditItemPanel';
import BatchPanel from './BatchPanel/BatchPanel';
import NewBatchPanel from './NewBatchPanel';
import { AddItemPanel } from './AddItemPanel';
import PhotospherePanel from './PhotospherePanel/PhotospherePanel';
import {
  ChangeViewState,
  ChangeToolState,
} from '../../../../reducers/globalState';
import { CatalogType } from '../../../../models';
import AttendeePanel from './AttendeePanel/AttendeePanel';
import AnnotationsPanel from './AnnotationsPanel';
import EditSurfacePanel from './EditSurfacePanel/EditSurfacePanel';

interface Props {
  designerCallbacks: HandlesFromBlue;
  setFullScreen: (fullScreen: boolean) => void;
}

export const PanelWidth = '400px';

const LayoutPanels = (props: Props) => {
  const toolState = useSelector(
    (state: ReduxState) => state.globalstate.toolState
  );
  const dispatch = useDispatch();

  const resetToolToDefault = () => {
    dispatch(ChangeToolState(ToolState.Default));
  };

  const viewState = useSelector(
    (state: ReduxState) => state.globalstate.viewState
  );

  const closePanel = () => {
    dispatch(ChangeViewState(ViewState.ThreeDView, viewState));
  };

  const { designerCallbacks, setFullScreen } = props;

  const selectedItems = useSelector(
    (state: ReduxState) => state.blue.selectedItems
  );

  useEffect(() => {
    switch (viewState) {
      case ViewState.TwoDView:
      case ViewState.ThreeDView:
      case ViewState.AttendeeView:
      case ViewState.LabelView:
      case ViewState.NumberView:
      case ViewState.ShapeView:
      case ViewState.PhotosphereEdit:
      case ViewState.PhotosphereView:
        setFullScreen(false);
        break;
      default:
        setFullScreen(true);
        break;
    }
  }, [viewState]);

  const renderPanels = () => {
    switch (viewState) {
      case ViewState.TwoDView:
      case ViewState.ThreeDView:
        switch (toolState) {
          case ToolState.AddBatch:
            return (
              <>
                <AddItemPanel
                  catalogType={CatalogType.GeneralPurpose}
                  addAssetControls={designerCallbacks}
                />
                <BatchPanel onBack={resetToolToDefault} />
              </>
            );
          case ToolState.NewBatch:
            return <NewBatchPanel onBack={resetToolToDefault} />;
          case ToolState.Default:
            return (
              <>
                <AddItemPanel
                  catalogType={CatalogType.GeneralPurpose}
                  addAssetControls={designerCallbacks}
                />
                {selectedItems.length > 0 && (
                  <EditItemPanel
                    handlesFromBlue={designerCallbacks}
                    onBack={resetToolToDefault}
                  />
                )}
              </>
            );
          default:
            return <></>;
        }
      case ViewState.PhotosphereEdit:
      case ViewState.PhotosphereView:
        return (
          <PhotospherePanel
            handlesFromBlue={designerCallbacks}
            setFullScreen={setFullScreen}
          />
        );
      case ViewState.AttendeeView:
        return (
          <AttendeePanel
            handlesFromBlue={designerCallbacks}
            exitAttendees={closePanel}
            onBack={() => {}}
          />
        );
      case ViewState.LabelView:
      case ViewState.NumberView:
      case ViewState.ShapeView:
        return <AnnotationsPanel handlesFromBlue={designerCallbacks} />;
      case ViewState.TextureView:
        return (
          <EditSurfacePanel
            handlesFromBlue={designerCallbacks}
            setFullScreen={setFullScreen}
          />
        );
      default:
        return <></>;
    }
  };

  return renderPanels();
};

export default LayoutPanels;
