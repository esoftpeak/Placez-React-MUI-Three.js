import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Models
import { LayoutDesignerCallbacks } from '../../models';
import { GlobalViewState } from '../../../../models/GlobalState';
import {
  ChangeGlobalViewState,
  GlobalStateInitializing,
} from '../../../../reducers/globalState';
import { ReduxState } from '../../../../reducers';
import LayoutDesigner from '../LayoutDesigner/LayoutDesigner'

interface Props {
  globalViewState: GlobalViewState;
}

const designerCallbacks = new LayoutDesignerCallbacks();

const Designer = (props: Props) => {
  const dispatch = useDispatch();

  const globalStateInitialized = useSelector(
    (state: ReduxState) => state.globalstate.globalStateInitialized
  );

  useEffect(() => {
    dispatch(GlobalStateInitializing());
    dispatch(ChangeGlobalViewState(props.globalViewState));
  }, []);

  return (
    <>
      {globalStateInitialized && (
        <LayoutDesigner designerCallbacks={designerCallbacks} />
      )}
    </>
  );
};

export default Designer;
