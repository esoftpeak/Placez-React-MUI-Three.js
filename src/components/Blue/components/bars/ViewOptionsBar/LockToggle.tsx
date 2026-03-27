import { Theme, Tooltip, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../../../reducers';
import { SetIgnoreFixed } from '../../../../../reducers/blue';
import viewOptionsStyles from '../../../../Styles/ViewOptions.css';
import {
  GlobalViewState,
  ViewState,
} from '../../../../../models/GlobalState';

import { Lock, LockOpen } from '@mui/icons-material';
import { canEditLayout } from '../../../../../reducers/globalState';
import { ZoomIconButton } from '../DesignerBottomBar'

interface Props {}

const LockToggle = (props: Props) => {
  const ignoreFixed = useSelector(
    (state: ReduxState) => state.blue.ignoreFixed
  );
  const globalViewState = useSelector(
    (state: ReduxState) => state.globalstate.globalViewState
  );
  const viewState = useSelector(
    (state: ReduxState) => state.globalstate.viewState
  );
  const canEdit = useSelector((state: ReduxState) => canEditLayout(state));

  const styles = makeStyles<Theme>(viewOptionsStyles);
  const classes = styles(props);

  const dispatch = useDispatch();

  const floorPlanMode =
    globalViewState === GlobalViewState.Fixtures &&
    viewState === ViewState.Floorplan;

  const theme = useTheme();

  return (
    <>
      {(globalViewState === GlobalViewState.Fixtures || canEdit) &&
        !floorPlanMode && (
          // <Paper
          //   className={classNames(classes.border, classes.viewToggles)}
          //   style={{ marginBottom: '5px' }}
          // >
            <ZoomIconButton
              name="labelSelected"
              aria-label="label"
              onClick={() => dispatch(SetIgnoreFixed(!ignoreFixed))}
              style={{
                color: ignoreFixed ? theme.palette.primary.main : undefined,
              }}
            >
              {ignoreFixed && (
                <Tooltip title="Locks Enabled">
                  <Lock />
                </Tooltip>
              )}
              {!ignoreFixed && (
                <Tooltip title="Locks Disabled">
                  <LockOpen />
                </Tooltip>
              )}
            </ZoomIconButton>
          // </Paper>
        )}
    </>
  );
};

export default LockToggle;
