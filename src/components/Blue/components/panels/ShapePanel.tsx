import { useDispatch, useSelector } from 'react-redux';

import panelStyles from '../../../Styles/panels.css';
import { HandlesFromBlue } from '../../models';
import { ReduxState } from '../../../../reducers';
import { SetControllerMode } from '../../../../reducers/blue';


import { ControllerMode } from '../../../../models/BlueState';
import {
  Theme,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import PlacezActionButton from '../../../PlacezUIComponents/PlacezActionButton'

type Props = {
  handlesFromBlue: HandlesFromBlue;
  onClosePanel: Function;
  onBack: Function;
};

const ShapePanel = (props: Props) => {
  const styles = makeStyles<Theme>(panelStyles);

  const dispatch = useDispatch();

  const controllerMode = useSelector(
    (state: ReduxState) => state.blue.controllerMode
  );
  const handleModeChange = (newControllerMode) => {
    dispatch(SetControllerMode(newControllerMode ?? ControllerMode.MOVE));
  };

  const classes = styles(props);
  return (
    <div className={classes.root}>
      <div className={classes.panelUpper}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', padding: '20px' }}>
          <Tooltip title="Move Line">
            <PlacezActionButton
              selected={controllerMode === ControllerMode.MOVE}
              onClick={() => handleModeChange(ControllerMode.MOVE)}
            >
              Move Dimension
            </PlacezActionButton>
          </Tooltip>
          <Tooltip title="Draw Line">
            <PlacezActionButton
              selected={controllerMode === ControllerMode.CREATE}
              onClick={() => handleModeChange(ControllerMode.CREATE)}
            >
              Draw Dimension
            </PlacezActionButton>
          </Tooltip>
          <Tooltip title="Delete Line">
            <PlacezActionButton
              selected={controllerMode === ControllerMode.DELETE}
              onClick={() => handleModeChange(ControllerMode.DELETE)}
            >
              Delete
            </PlacezActionButton>
          </Tooltip>
        </div>
      </div>
      <div className={classes.fieldHeading}></div>
    </div>
  );
};

export default ShapePanel;
